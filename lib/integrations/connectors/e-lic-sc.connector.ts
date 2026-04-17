import { IConnector, FetchResult, NormalizedBidding, ConnectorHealth } from '../core/connector.interface'

const BASE_URL = 'https://e-lic.sc.gov.br/api/v1'
const PAGE_SIZE = 50

interface SCLicitacao {
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

function getToken(): string {
  return process.env.ELIC_SC_TOKEN || ''
}

export class ELicScConnector implements IConnector {
  readonly sourceCode = 'e-lic-sc'

  async fetchIncremental(
    cursor: string | null,
    windowStart: Date,
    windowEnd: Date
  ): Promise<FetchResult> {
    const token = getToken()
    if (!token) {
      console.error('E-Lic SC: Token nao configurado (ELIC_SC_TOKEN)')
      return { records: [], nextCursor: null, total: 0 }
    }

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
            'Authorization': `Bearer ${token}`,
            'User-Agent': 'PerformancePregao/1.0'
          },
          signal: AbortSignal.timeout(20000),
        })

        if (!res.ok) {
          if (res.status === 404) break
          if (res.status === 401) {
            console.error('E-Lic SC: Token invalido ou expirado')
            break
          }
          console.error(`E-Lic SC pag ${pagina}: HTTP ${res.status}`)
          break
        }

        const data = await res.json()
        const items: SCLicitacao[] = data.licitacoes || data.data || data.content || []

        if (items.length === 0) {
          hasMore = false
          break
        }

        allRecords.push(...items)
        hasMore = items.length === PAGE_SIZE
        pagina++

        await new Promise((r) => setTimeout(r, 300))
      } catch (err) {
        console.error(`E-Lic SC erro pag ${pagina}:`, err)
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
    const lic = record as SCLicitacao
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
      externalId: `SC-${lic.id}`,
      portalCode: 'E_LIC_SC',
      title: lic.objeto || 'Sem titulo',
      organ: lic.orgao?.nome || 'Nao informado',
      state: 'SC',
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
    const token = getToken()

    if (!token) {
      return { ok: false, latencyMs: 0, message: 'Token nao configurado' }
    }

    try {
      const today = formatDate(new Date())
      const res = await fetch(
        `${BASE_URL}/licitacoes?data_inicio=${today}&data_fim=${today}&pagina=1&limite=1`,
        {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
            'User-Agent': 'PerformancePregao/1.0'
          },
          signal: AbortSignal.timeout(15000)
        }
      )

      if (res.status === 401) {
        return { ok: false, latencyMs: Date.now() - start, message: 'Token invalido' }
      }

      if (res.status === 404) {
        return { ok: true, latencyMs: Date.now() - start, message: 'API OK (sem dados)' }
      }

      return { ok: res.ok, latencyMs: Date.now() - start, message: `HTTP ${res.status}` }
    } catch (err) {
      return { ok: false, latencyMs: Date.now() - start, message: String(err) }
    }
  }
}
