import { IConnector, FetchResult, NormalizedBidding, ConnectorHealth } from '../core/connector.interface'

const BASE_URL = 'https://licitacoes-e.com.br/api'
const PAGE_SIZE = 50

interface BBLicitacao {
  id: number | string
  numero?: string
  objeto?: string
  modalidade?: string
  situacao?: string
  dataPublicacao?: string
  data_abertura?: string
  dataAbertura?: string
  valorEstimado?: number | string
  valor_estimado?: number | string
  orgao?: {
    nome?: string
    cnpj?: string
  }
  linkSistema?: string
}

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0] // YYYY-MM-DD
}

export class LicitacoesEConnector implements IConnector {
  readonly sourceCode = 'licitacoes-e'

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
        const url = `${BASE_URL}/licitacoes?data_inicio=${dataInicio}&data_fim=${dataFim}&pagina=${pagina}&limite=${PAGE_SIZE}`
        const res = await fetch(url, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'PerformancePregao/1.0'
          },
          signal: AbortSignal.timeout(20000),
        })

        if (!res.ok) {
          if (res.status === 404) break
          console.error(`Licitacoes-e pag ${pagina}: HTTP ${res.status}`)
          break
        }

        const data = await res.json()
        const items: BBLicitacao[] = data.licitacoes || data.data || data.content || []

        if (items.length === 0) {
          hasMore = false
          break
        }

        allRecords.push(...items)
        hasMore = items.length === PAGE_SIZE
        pagina++

        await new Promise((r) => setTimeout(r, 300))
      } catch (err) {
        console.error(`Licitacoes-e erro pag ${pagina}:`, err)
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
    const lic = record as BBLicitacao
    if (!lic.id) return null

    const situacao = (lic.situacao || '').toLowerCase()
    const status: 'OPEN' | 'CLOSED' =
      situacao.includes('public') || situacao.includes('abert')
        ? 'OPEN'
        : 'CLOSED'

    const valor = lic.valor_estimado || lic.valorEstimado
      ? parseFloat(String(lic.valor_estimado || lic.valorEstimado))
      : null

    return {
      externalId: `BB-${lic.id}`,
      portalCode: 'LICITACOES_E',
      title: lic.objeto || 'Sem titulo',
      organ: lic.orgao?.nome || 'Banco do Brasil',
      state: null,
      city: null,
      modality: lic.modalidade || 'Nao informado',
      estimatedValue: valor,
      openingDate: lic.data_abertura || lic.dataAbertura || null,
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
        `${BASE_URL}/licitacoes?data_inicio=${today}&data_fim=${today}&pagina=1&limite=1`,
        {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'PerformancePregao/1.0'
          },
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
