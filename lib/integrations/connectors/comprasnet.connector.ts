import { IConnector, FetchResult, NormalizedBidding, ConnectorHealth } from '../core/connector.interface'

const BASE_URL = 'https://pncp.gov.br/api/consulta/v1'
const PAGE_SIZE = 50

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

export class ComprasnetConnector implements IConnector {
  readonly sourceCode = 'comprasnet'

  async fetchIncremental(
    cursor: string | null,
    windowStart: Date,
    windowEnd: Date
  ): Promise<FetchResult> {
    const dataInicial = formatDate(windowStart)
    const dataFinal = formatDate(windowEnd)
    const allRecords: unknown[] = []
    let pagina = 1
    let totalPaginas = 1

    do {
      const url = `${BASE_URL}/contratacoes/proposta?dataInicial=${dataInicial}&dataFinal=${dataFinal}&pagina=${pagina}&tamanhoPagina=${PAGE_SIZE}`
      const res = await fetch(url, {
        headers: { 'Accept': 'application/json', 'User-Agent': 'PerformancePregao/1.0' },
        signal: AbortSignal.timeout(15000),
      })

      if (!res.ok) {
        if (res.status === 404) break
        throw new Error(`ComprasNet HTTP ${res.status} pagina ${pagina}`)
      }

      const data = await res.json()
      const items: PncpItem[] = data.data || data.content || (Array.isArray(data) ? data : [])
      allRecords.push(...items)

      totalPaginas = data.totalPaginas ?? data.totalPages ?? 1
      pagina++

      if (pagina > totalPaginas || items.length === 0) break

      await new Promise((r) => setTimeout(r, 300))
    } while (pagina <= totalPaginas)

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
      portalCode: 'COMPRAS_GOV',
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
      const res = await fetch(
        `${BASE_URL}/contratacoes/proposta?dataInicial=${today}&dataFinal=${today}&pagina=1&tamanhoPagina=1`,
        { signal: AbortSignal.timeout(8000) }
      )
      return { ok: res.ok, latencyMs: Date.now() - start, message: `HTTP ${res.status}` }
    } catch (err) {
      return { ok: false, latencyMs: Date.now() - start, message: String(err) }
    }
  }
}
