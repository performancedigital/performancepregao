import { IConnector, FetchResult, NormalizedBidding, ConnectorHealth } from '../core/connector.interface'

const BASE_URL = 'https://pncp.gov.br/api/consulta/v1'
const PAGE_SIZE = 50
// Teto de paginas por modalidade. Default seguro para Vercel Hobby (~60s).
// Para backfills grandes (local / worker / Vercel Pro) defina PNCP_MAX_PAGES=20+.
const MAX_PAGES_PER_MODALITY = Number(process.env.PNCP_MAX_PAGES) || 5
const PAGE_DELAY_MS = 700      // ritmo gentil entre paginas (WAF do PNCP rejeita rajadas)
const MAX_PAGE_RETRIES = 4     // tentativas por pagina em caso de rejeicao/timeout

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

interface PncpPage {
  items: PncpItem[]
  totalPaginas: number
  /** true quando a API confirmou que nao ha (mais) dados (404 / pagina vazia) */
  done: boolean
}

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
  dataEncerramentoProposta?: string | null
  linkSistemaOrigem?: string | null
  situacaoCompraNome?: string
}

function formatDate(d: Date): string {
  // PNCP espera formato: YYYYMMDD
  return d.toISOString().split('T')[0].replace(/-/g, '')
}

export class PncpConnector implements IConnector {
  readonly sourceCode = 'pncp'

  /**
   * Busca uma pagina com resiliencia ao WAF do PNCP.
   * O PNCP fica atras de um F5 que rejeita rajadas devolvendo uma pagina HTML
   * ("Request Rejected") com status 200. Detectamos isso e fazemos backoff/retry
   * em vez de abortar a modalidade inteira.
   * Retorna null quando deve abortar a modalidade (400 / falhas persistentes).
   */
  private async fetchPage(url: string, modCodigo: number, pagina: number): Promise<PncpPage | null> {
    for (let attempt = 0; attempt <= MAX_PAGE_RETRIES; attempt++) {
      try {
        const res = await fetch(url, {
          headers: { Accept: 'application/json', 'User-Agent': 'PerformancePregao/1.0' },
          signal: AbortSignal.timeout(30000),
        })

        if (res.status === 404) return { items: [], totalPaginas: 0, done: true }
        if (res.status === 400) {
          console.error(`PNCP mod ${modCodigo}: HTTP 400 (parametros) - abortando modalidade`)
          return null
        }

        const text = await res.text()
        const looksRejected = !res.ok || text.trimStart().startsWith('<')

        if (looksRejected) {
          // WAF/erro transitorio: backoff exponencial e tenta de novo
          if (attempt < MAX_PAGE_RETRIES) {
            await sleep(1500 * Math.pow(2, attempt))
            continue
          }
          console.error(`PNCP mod ${modCodigo} pag ${pagina}: rejeitado apos ${MAX_PAGE_RETRIES} tentativas`)
          return null
        }

        const data = JSON.parse(text)
        return {
          items: (data.data as PncpItem[]) || [],
          totalPaginas: data.totalPaginas ?? 1,
          done: false,
        }
      } catch (err) {
        // timeout / rede / JSON invalido: backoff e retry
        if (attempt < MAX_PAGE_RETRIES) {
          await sleep(1500 * Math.pow(2, attempt))
          continue
        }
        console.error(`PNCP mod ${modCodigo} pag ${pagina} erro persistente:`, err)
        return null
      }
    }
    return null
  }

  async fetchIncremental(
    _cursor: string | null,
    windowStart: Date,
    windowEnd: Date
  ): Promise<FetchResult> {
    // PNCP exige período mínimo de 10 dias — usamos 15 como margem
    const minPeriodDays = 15
    let startDate = new Date(windowStart)
    const endDate = new Date(windowEnd)

    const diffDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    if (diffDays < minPeriodDays) {
      startDate = new Date(endDate.getTime() - minPeriodDays * 24 * 60 * 60 * 1000)
    }

    const dataInicial = formatDate(startDate)
    const dataFinal = formatDate(endDate)
    const allRecords: unknown[] = []

    for (const mod of MODALIDADES) {
      let pagina = 1
      let totalPaginas = 1

      while (pagina <= Math.min(totalPaginas, MAX_PAGES_PER_MODALITY)) {
        const url = `${BASE_URL}/contratacoes/publicacao?dataInicial=${dataInicial}&dataFinal=${dataFinal}&codigoModalidadeContratacao=${mod.codigo}&pagina=${pagina}&tamanhoPagina=${PAGE_SIZE}`

        const page = await this.fetchPage(url, mod.codigo, pagina)
        if (page === null) break          // aborta modalidade (400 ou falha persistente)
        if (page.done || page.items.length === 0) break

        allRecords.push(...page.items)
        totalPaginas = page.totalPaginas
        pagina++

        if (pagina <= Math.min(totalPaginas, MAX_PAGES_PER_MODALITY)) {
          await sleep(PAGE_DELAY_MS)
        }
      }
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
    const closingDate = item.dataEncerramentoProposta ?? null
    // Encerrada por situacao OU porque o prazo de proposta ja passou
    const expiredByDate = closingDate ? new Date(closingDate).getTime() < Date.now() : false
    const status: 'OPEN' | 'CLOSED' =
      situacao.includes('encerr') || situacao.includes('cancel') || situacao.includes('revog') || expiredByDate
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
      closingDate,
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
      // Healthcheck simples: testa se o dominio responde
      // O endpoint de publicacao exige periodo minimo e pode ser lento,
      // entao usamos uma chamada leve para verificar conectividade
      const res = await fetch(`${BASE_URL}/contratacoes/publicacao?dataInicial=20260101&dataFinal=20260116&codigoModalidadeContratacao=6&pagina=1&tamanhoPagina=10`, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'PerformancePregao/1.0',
        },
        signal: AbortSignal.timeout(15000),
      })

      // 200 = OK, 404 = sem dados mas API viva, 400 = API respondeu (periodo pode ser invalido)
      if (res.ok || res.status === 404 || res.status === 400) {
        return { ok: true, latencyMs: Date.now() - start, message: 'API acessivel' }
      }

      return { ok: false, latencyMs: Date.now() - start, message: `HTTP ${res.status}` }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      // Timeout nao significa que a API esta fora — pode ser latencia
      if (msg.includes('timeout') || msg.includes('abort')) {
        return { ok: true, latencyMs: Date.now() - start, message: 'API lenta (timeout)' }
      }
      return { ok: false, latencyMs: Date.now() - start, message: msg }
    }
  }
}
