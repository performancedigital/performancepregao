import { IConnector, FetchResult, NormalizedBidding, ConnectorHealth } from '../core/connector.interface'

const BASE_URL = 'https://licitacoes.banpara.b.br/api/v1'
const PAGE_SIZE = 50

interface BanparaLicitacao {
  id: number | string
  numero?: string
  objeto?: string
  modalidade?: string
  situacao?: string
  dataPublicacao?: string
  dataAbertura?: string
  valorEstimado?: number | string
  linkSistema?: string
}

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0] // YYYY-MM-DD
}

export class BanparaConnector implements IConnector {
  readonly sourceCode = 'banpara'

  async fetchIncremental(
    cursor: string | null,
    windowStart: Date,
    windowEnd: Date
  ): Promise<FetchResult> {
    const dataInicio = formatDate(windowStart)
    const dataFim = formatDate(windowEnd)
    const allRecords: unknown[] = []
    let pagina = 1
    let hasMore = true

    while (hasMore && pagina <= 20) {
      try {
        const url = `${BASE_URL}/licitacoes?data_inicio=${dataInicio}&data_fim=${dataFim}&pagina=${pagina}&itens=${PAGE_SIZE}`
        const res = await fetch(url, {
          headers: { 'Accept': 'application/json', 'User-Agent': 'PerformancePregao/1.0' },
          signal: AbortSignal.timeout(20000),
        })

        if (!res.ok) {
          if (res.status === 404) break
          console.error(`Banpara pag ${pagina}: HTTP ${res.status}`)
          break
        }

        const data = await res.json()
        const items: BanparaLicitacao[] = data.licitacoes || data.data || data.content || []

        if (items.length === 0) {
          hasMore = false
          break
        }

        allRecords.push(...items)
        hasMore = items.length === PAGE_SIZE
        pagina++

        await new Promise((r) => setTimeout(r, 300))
      } catch (err) {
        console.error(`Banpara erro pag ${pagina}:`, err)
        break
      }
    }

    return {
      records: allRecords,
      nextCursor: null,
      total: allRecords.length,
    }
  }

  normalize(record: unknown): NormalizedBidding | null {
    const lic = record as BanparaLicitacao
    if (!lic.id) return null

    const situacao = (lic.situacao || '').toLowerCase()
    const status: 'OPEN' | 'CLOSED' =
      situacao.includes('abert') || situacao.includes('public')
        ? 'OPEN'
        : 'CLOSED'

    const valor = lic.valorEstimado ? parseFloat(String(lic.valorEstimado)) : null

    return {
      externalId: `BAN-${lic.id}`,
      portalCode: 'BANPARA',
      title: lic.objeto || 'Sem titulo',
      organ: 'BANPARA - Banco do Estado do Para',
      state: 'PA',
      city: null,
      modality: lic.modalidade || 'Nao informado',
      estimatedValue: valor,
      openingDate: lic.dataAbertura || null,
      pdfUrl: lic.linkSistema || null,
      status,
      rawPayload: record,
    }
  }

  validate(n: NormalizedBidding): boolean {
    return Boolean(n.externalId && n.title && n.portalCode)
  }

  async healthCheck(): Promise<ConnectorHealth> {
    const start = Date.now()
    try {
      const today = formatDate(new Date())
      const res = await fetch(
        `${BASE_URL}/licitacoes?data_inicio=${today}&data_fim=${today}&pagina=1&itens=1`,
        {
          headers: { 'Accept': 'application/json', 'User-Agent': 'PerformancePregao/1.0' },
          signal: AbortSignal.timeout(15000)
        }
      )

      if (res.status === 404) {
        return { ok: true, latencyMs: Date.now() - start, message: 'API OK (sem dados)' }
      }

      return { ok: res.ok, latencyMs: Date.now() - start, message: `HTTP ${res.status}` }
    } catch (err) {
      return { ok: false, latencyMs: Date.now() - start, message: String(err) }
    }
  }
}
