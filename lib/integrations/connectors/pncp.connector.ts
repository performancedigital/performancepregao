import { IConnector, FetchResult, NormalizedBidding, ConnectorHealth } from '../core/connector.interface'

const BASE_URL = 'https://pncp.gov.br/api/consulta/v1'
const PAGE_SIZE = 50

// Codigos de modalidade PNCP
const MODALIDADES = [
  { codigo: 6, nome: 'Pregao - Eletronico' },
  { codigo: 7, nome: 'Pregao - Presencial' },
  { codigo: 4, nome: 'Concorrencia - Eletronica' },
  { codigo: 8, nome: 'Dispensa' },
  { codigo: 9, nome: 'Inexigibilidade' },
  { codigo: 12, nome: 'Credenciamento' },
]

interface PncpItem {
  numeroControlePNCP: string
  objetoCompra: string
  orgaoEntidade?: { razaoSocial?: string }
  unidadeOrgao?: { ufSigla?: string; municipioNome?: string }
  modalidadeNome?: string
  valorTotalEstimado?: string | number | null
  dataAberturaProposta?: string | null
  linkSistemaOrigem?: string | null
  situacaoCompraNome?: string
}

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0].replace(/-/g, '')
}

export class PncpConnector implements IConnector {
  readonly sourceCode = 'pncp'

  async fetchIncremental(
    cursor: string | null,
    windowStart: Date,
    windowEnd: Date
  ): Promise<FetchResult> {
    const dataInicial = formatDate(windowStart)
    const dataFinal = formatDate(windowEnd)
    const allRecords: unknown[] = []

    for (const mod of MODALIDADES) {
      let pagina = 1
      let totalPaginas = 1

      do {
        const url = `${BASE_URL}/contratacoes/publicacao?dataInicial=${dataInicial}&dataFinal=${dataFinal}&codigoModalidadeContratacao=${mod.codigo}&pagina=${pagina}&tamanhoPagina=${PAGE_SIZE}`
        
        try {
          const res = await fetch(url, {
            headers: { 'Accept': 'application/json', 'User-Agent': 'PerformancePregao/1.0' },
            signal: AbortSignal.timeout(20000),
          })

          if (!res.ok) {
            if (res.status === 404) break
            // Se uma modalidade falhar, continua com as outras
            console.error(`PNCP modalidade ${mod.codigo} pag ${pagina}: HTTP ${res.status}`)
            break
          }

          const data = await res.json()
          const items: PncpItem[] = data.data || data.content || (Array.isArray(data) ? data : [])
          allRecords.push(...items)

          totalPaginas = data.totalPaginas ?? data.totalPages ?? 1
          pagina++

          if (pagina > totalPaginas || items.length === 0) break

          await new Promise((r) => setTimeout(r, 300))
        } catch (err) {
          // Timeout ou erro de rede, continua com proxima modalidade
          console.error(`PNCP modalidade ${mod.codigo} erro:`, err)
          break
        }
      } while (pagina <= Math.min(totalPaginas, 10)) // max 10 paginas por modalidade
    }

    return {
      records: allRecords,
      nextCursor: null,
      total: allRecords.length,
    }
  }

  normalize(record: unknown): NormalizedBidding | null {
    const item = record as PncpItem
    if (!item.numeroControlePNCP) return null

    const situacao = (item.situacaoCompraNome || '').toLowerCase()
    const status: 'OPEN' | 'CLOSED' =
      situacao.includes('encerr') || situacao.includes('cancel') || situacao.includes('revog')
        ? 'CLOSED'
        : 'OPEN'

    return {
      externalId: item.numeroControlePNCP,
      portalCode: 'PNCP',
      title: item.objetoCompra || 'Sem titulo',
      organ: item.orgaoEntidade?.razaoSocial || 'Nao informado',
      state: item.unidadeOrgao?.ufSigla ?? null,
      city: item.unidadeOrgao?.municipioNome ?? null,
      modality: item.modalidadeNome || 'Nao informado',
      estimatedValue: item.valorTotalEstimado ? parseFloat(String(item.valorTotalEstimado)) : null,
      openingDate: item.dataAberturaProposta ?? null,
      pdfUrl: item.linkSistemaOrigem ?? null,
      status,
      rawPayload: record,
    }
  }

  validate(n: NormalizedBidding): boolean {
    return Boolean(n.externalId && n.title && n.organ && n.portalCode)
  }

  async healthCheck(): Promise<ConnectorHealth> {
    const start = Date.now()
    try {
      const today = formatDate(new Date())
      // Usa Pregão Eletrônico (6) - modalidade mais comum
      const res = await fetch(
        `${BASE_URL}/contratacoes/publicacao?dataInicial=${today}&dataFinal=${today}&codigoModalidadeContratacao=6&pagina=1&tamanhoPagina=1`,
        {
          headers: { 'Accept': 'application/json', 'User-Agent': 'PerformancePregao/1.0' },
          signal: AbortSignal.timeout(15000)
        }
      )

      // 404 significa que não há dados, mas a API está funcionando
      if (res.status === 404) {
        return { ok: true, latencyMs: Date.now() - start, message: 'API OK (sem dados)' }
      }

      return { ok: res.ok, latencyMs: Date.now() - start, message: `HTTP ${res.status}` }
    } catch (err) {
      return { ok: false, latencyMs: Date.now() - start, message: String(err) }
    }
  }
}
