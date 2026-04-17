import { IConnector, FetchResult, NormalizedBidding, ConnectorHealth } from '../core/connector.interface'

const BASE_URL = 'https://www.peintegrado.pe.gov.br/api/v1'
const PAGE_SIZE = 100

interface PELicitacao {
  id: number | string
  numero?: string
  objeto?: string
  modalidade?: string
  situacao?: string
  dataPublicacao?: string
  data_abertura?: string
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

function getApiKey(): string {
  return process.env.PE_INTEGRADO_KEY || ''
}

export class PeIntegradoConnector implements IConnector {
  readonly sourceCode = 'pe-integrado'

  async fetchIncremental(
    cursor: string | null,
    windowStart: Date,
    windowEnd: Date
  ): Promise<FetchResult> {
    const apiKey = getApiKey()
    if (!apiKey) {
      console.error('PE Integrado: API Key nao configurada (PE_INTEGRADO_KEY)')
      return { records: [], nextCursor: null, total: 0 }
    }

    const dataInicio = formatDate(windowStart)
    const dataFim = formatDate(windowEnd)
    const allRecords: unknown[] = []
    let pagina = 1
    let hasMore = true

    while (hasMore && pagina <= 20) {
      try {
        const url = `${BASE_URL}/licitacoes?data_inicio=${dataInicio}&data_fim=${dataFim}&pagina=${pagina}&por_pagina=${PAGE_SIZE}`
        const res = await fetch(url, {
          headers: {
            'Accept': 'application/json',
            'X-API-Key': apiKey,
            'User-Agent': 'PerformancePregao/1.0'
          },
          signal: AbortSignal.timeout(20000),
        })

        if (!res.ok) {
          if (res.status === 404) break
          if (res.status === 401) {
            console.error('PE Integrado: API Key invalida ou expirada')
            break
          }
          console.error(`PE Integrado pag ${pagina}: HTTP ${res.status}`)
          break
        }

        const data = await res.json()
        const items: PELicitacao[] = data.licitacoes || data.dados || data.data || data.content || []

        if (items.length === 0) {
          hasMore = false
          break
        }

        allRecords.push(...items)
        hasMore = items.length === PAGE_SIZE
        pagina++

        await new Promise((r) => setTimeout(r, 300))
      } catch (err) {
        console.error(`PE Integrado erro pag ${pagina}:`, err)
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
    const lic = record as PELicitacao
    if (!lic.id) return null

    const situacao = (lic.situacao || '').toLowerCase()
    const status: 'OPEN' | 'CLOSED' =
      situacao.includes('encerr') || situacao.includes('cancel') || situacao.includes('concluíd') || situacao.includes('finaliz')
        ? 'CLOSED'
        : 'OPEN'

    const valor = lic.valor_estimado || lic.valorEstimado
      ? parseFloat(String(lic.valor_estimado || lic.valorEstimado))
      : null

    return {
      externalId: `PE-${lic.id}`,
      portalCode: 'PE_INTEGRADO',
      title: lic.objeto || 'Sem titulo',
      organ: lic.orgao?.nome || 'Nao informado',
      state: 'PE',
      city: null,
      modality: lic.modalidade || 'Nao informado',
      estimatedValue: valor,
      openingDate: lic.data_abertura || null,
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
    const apiKey = getApiKey()

    if (!apiKey) {
      return { ok: false, latencyMs: 0, message: 'API Key nao configurada' }
    }

    try {
      const today = formatDate(new Date())
      const res = await fetch(
        `${BASE_URL}/licitacoes?data_inicio=${today}&data_fim=${today}&pagina=1&por_pagina=1`,
        {
          headers: {
            'Accept': 'application/json',
            'X-API-Key': apiKey,
            'User-Agent': 'PerformancePregao/1.0'
          },
          signal: AbortSignal.timeout(15000)
        }
      )

      if (res.status === 401) {
        return { ok: false, latencyMs: Date.now() - start, message: 'API Key invalida' }
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
