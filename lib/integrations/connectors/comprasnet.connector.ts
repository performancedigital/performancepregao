import { IConnector, FetchResult, NormalizedBidding, ConnectorHealth } from '../core/connector.interface'

const BASE_URL = 'https://dadosabertos.compras.gov.br'
const PAGE_SIZE = 50

// Interface para resposta da API Compras.gov.br (módulo legado - pregões)
interface ComprasGovPregao {
  numero: string
  objeto: string
  orgao?: { nome?: string; cnpj?: string }
  unidadeGestora?: { nome?: string; uf?: string; municipio?: string }
  modalidade?: string
  valorEstimado?: number
  dataAberturaProposta?: string
  situacao?: string
  linkSistema?: string
  codigoUasg?: string
}

// Interface para resposta da API Compras.gov.br (módulo legado - licitações)
interface ComprasGovLicitacao {
  numero: string
  objeto: string
  orgao?: { nome?: string }
  unidadeGestora?: { nome?: string; uf?: string; municipio?: string }
  modalidade?: string
  valorEstimado?: number
  dataAbertura?: string
  situacao?: string
  linkSistema?: string
}

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0] // YYYY-MM-DD
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

    // Buscar pregões (mais comuns)
    const pregoes = await this.fetchPregoes(dataInicial, dataFinal)
    allRecords.push(...pregoes)

    // Buscar licitações
    const licitacoes = await this.fetchLicitacoes(dataInicial, dataFinal)
    allRecords.push(...licitacoes)

    return {
      records: allRecords,
      nextCursor: null,
      total: allRecords.length,
    }
  }

  private async fetchPregoes(dataInicial: string, dataFinal: string): Promise<ComprasGovPregao[]> {
    const records: ComprasGovPregao[] = []
    let pagina = 1
    let hasMore = true

    while (hasMore && pagina <= 10) {
      try {
        const url = `${BASE_URL}/modulo-legado/3_consultarPregoes?dataInicial=${dataInicial}&dataFinal=${dataFinal}&pagina=${pagina}`
        const res = await fetch(url, {
          headers: { 'Accept': 'application/json', 'User-Agent': 'PerformancePregao/1.0' },
          signal: AbortSignal.timeout(20000),
        })

        if (!res.ok) {
          if (res.status === 404) break
          console.error(`ComprasNet pregões pag ${pagina}: HTTP ${res.status}`)
          break
        }

        const data = await res.json()
        const items: ComprasGovPregao[] = data.resultado || data.data || data.content || []

        if (items.length === 0) {
          hasMore = false
          break
        }

        records.push(...items)
        pagina++

        await new Promise((r) => setTimeout(r, 300))
      } catch (err) {
        console.error(`ComprasNet pregões erro pag ${pagina}:`, err)
        break
      }
    }

    return records
  }

  private async fetchLicitacoes(dataInicial: string, dataFinal: string): Promise<ComprasGovLicitacao[]> {
    const records: ComprasGovLicitacao[] = []
    let pagina = 1
    let hasMore = true

    while (hasMore && pagina <= 10) {
      try {
        const url = `${BASE_URL}/modulo-legado/1_consultarLicitacao?dataInicial=${dataInicial}&dataFinal=${dataFinal}&pagina=${pagina}`
        const res = await fetch(url, {
          headers: { 'Accept': 'application/json', 'User-Agent': 'PerformancePregao/1.0' },
          signal: AbortSignal.timeout(20000),
        })

        if (!res.ok) {
          if (res.status === 404) break
          console.error(`ComprasNet licitações pag ${pagina}: HTTP ${res.status}`)
          break
        }

        const data = await res.json()
        const items: ComprasGovLicitacao[] = data.resultado || data.data || data.content || []

        if (items.length === 0) {
          hasMore = false
          break
        }

        records.push(...items)
        pagina++

        await new Promise((r) => setTimeout(r, 300))
      } catch (err) {
        console.error(`ComprasNet licitações erro pag ${pagina}:`, err)
        break
      }
    }

    return records
  }

  normalize(record: unknown): NormalizedBidding | null {
    // Tenta normalizar como pregão primeiro
    const pregao = record as ComprasGovPregao
    if (pregao.numero && pregao.objeto) {
      const situacao = (pregao.situacao || '').toLowerCase()
      const status: 'OPEN' | 'CLOSED' =
        situacao.includes('encerr') || situacao.includes('cancel') || situacao.includes('revog') || situacao.includes('concluíd')
          ? 'CLOSED'
          : 'OPEN'

      return {
        externalId: `COMPRASNET-PREGAO-${pregao.numero}-${pregao.codigoUasg || 'UNKNOWN'}`,
        portalCode: 'COMPRAS_GOV',
        title: pregao.objeto || 'Sem titulo',
        organ: pregao.orgao?.nome || pregao.unidadeGestora?.nome || 'Nao informado',
        state: pregao.unidadeGestora?.uf ?? null,
        city: pregao.unidadeGestora?.municipio ?? null,
        modality: pregao.modalidade || 'Pregao',
        estimatedValue: pregao.valorEstimado || null,
        openingDate: pregao.dataAberturaProposta || null,
        pdfUrl: pregao.linkSistema || null,
        status,
        rawPayload: record,
      }
    }

    // Tenta normalizar como licitação
    const licitacao = record as ComprasGovLicitacao
    if (licitacao.numero && licitacao.objeto) {
      const situacao = (licitacao.situacao || '').toLowerCase()
      const status: 'OPEN' | 'CLOSED' =
        situacao.includes('encerr') || situacao.includes('cancel') || situacao.includes('revog') || situacao.includes('concluíd')
          ? 'CLOSED'
          : 'OPEN'

      return {
        externalId: `COMPRASNET-LIC-${licitacao.numero}`,
        portalCode: 'COMPRAS_GOV',
        title: licitacao.objeto || 'Sem titulo',
        organ: licitacao.orgao?.nome || licitacao.unidadeGestora?.nome || 'Nao informado',
        state: licitacao.unidadeGestora?.uf ?? null,
        city: licitacao.unidadeGestora?.municipio ?? null,
        modality: licitacao.modalidade || 'Licitacao',
        estimatedValue: licitacao.valorEstimado || null,
        openingDate: licitacao.dataAbertura || null,
        pdfUrl: licitacao.linkSistema || null,
        status,
        rawPayload: record,
      }
    }

    return null
  }

  validate(n: NormalizedBidding): boolean {
    return Boolean(n.externalId && n.title && n.organ && n.portalCode)
  }

  async healthCheck(): Promise<ConnectorHealth> {
    const start = Date.now()
    try {
      const today = formatDate(new Date())
      const res = await fetch(
        `${BASE_URL}/modulo-legado/3_consultarPregoes?dataInicial=${today}&dataFinal=${today}&pagina=1`,
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
