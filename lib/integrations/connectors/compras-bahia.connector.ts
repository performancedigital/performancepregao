import { IConnector, FetchResult, NormalizedBidding, ConnectorHealth } from '../core/connector.interface'

const BASE_URL = 'https://compras.ba.gov.br/api/v2'
const PAGE_SIZE = 50

interface BahiaLicitacao {
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

interface AuthResponse {
  token: string
  tipo: string
  expiraEm: string
}

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0] // YYYY-MM-DD
}

function getCredentials(): { user: string; pass: string } {
  return {
    user: process.env.COMPRAS_BA_USER || '',
    pass: process.env.COMPRAS_BA_PASS || ''
  }
}

export class ComprasBahiaConnector implements IConnector {
  readonly sourceCode = 'compras-bahia'
  private token: string | null = null
  private tokenExpiry: Date | null = null

  private async authenticate(): Promise<string | null> {
    // Retorna token existente se ainda for válido
    if (this.token && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return this.token
    }

    const creds = getCredentials()
    if (!creds.user || !creds.pass) {
      console.error('Compras BA: Credenciais nao configuradas (COMPRAS_BA_USER / COMPRAS_BA_PASS)')
      return null
    }

    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario: creds.user,
          senha: creds.pass
        }),
        signal: AbortSignal.timeout(15000)
      })

      if (!res.ok) {
        console.error('Compras BA: Falha na autenticacao:', res.status)
        return null
      }

      const data: AuthResponse = await res.json()
      this.token = data.token
      this.tokenExpiry = new Date(data.expiraEm)
      return this.token
    } catch (err) {
      console.error('Compras BA: Erro na autenticacao:', err)
      return null
    }
  }

  async fetchIncremental(
    cursor: string | null,
    windowStart: Date,
    windowEnd: Date
  ): Promise<FetchResult> {
    const token = await this.authenticate()
    if (!token) {
      return { records: [], nextCursor: null, total: 0 }
    }

    const dataInicio = formatDate(windowStart)
    const dataFim = formatDate(windowEnd)
    const allRecords: unknown[] = []
    let pagina = 1
    let hasMore = true

    while (hasMore && pagina <= 20) {
      try {
        const url = `${BASE_URL}/pregoes?data_inicio=${dataInicio}&data_fim=${dataFim}&pagina=${pagina}&limite=${PAGE_SIZE}`
        const res = await fetch(url, {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
            'User-Agent': 'PerformancePregao/1.0'
          },
          signal: AbortSignal.timeout(20000),
        })

        if (!res.ok) {
          if (res.status === 401) {
            // Token expirado, tenta reautenticar
            this.token = null
            const newToken = await this.authenticate()
            if (!newToken) break
            continue
          }
          if (res.status === 404) break
          console.error(`Compras BA pag ${pagina}: HTTP ${res.status}`)
          break
        }

        const data = await res.json()
        const items: BahiaLicitacao[] = data.pregoes || data.licitacoes || data.data || data.content || []

        if (items.length === 0) {
          hasMore = false
          break
        }

        allRecords.push(...items)
        hasMore = items.length === PAGE_SIZE
        pagina++

        await new Promise((r) => setTimeout(r, 300))
      } catch (err) {
        console.error(`Compras BA erro pag ${pagina}:`, err)
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
    const lic = record as BahiaLicitacao
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
      externalId: `BA-${lic.id}`,
      portalCode: 'COMPRAS_BAHIA',
      title: lic.objeto || 'Sem titulo',
      organ: lic.orgao?.nome || 'Nao informado',
      state: 'BA',
      city: null,
      modality: lic.modalidade || 'PREGAO',
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
    const token = await this.authenticate()

    if (!token) {
      return { ok: false, latencyMs: 0, message: 'Falha na autenticacao' }
    }

    try {
      const today = formatDate(new Date())
      const res = await fetch(
        `${BASE_URL}/pregoes?data_inicio=${today}&data_fim=${today}&pagina=1&limite=1`,
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
        return { ok: false, latencyMs: Date.now() - start, message: 'Token invalido ou expirado' }
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
