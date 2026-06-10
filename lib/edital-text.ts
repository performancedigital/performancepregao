import AdmZip from 'adm-zip'
import { prisma } from './prisma'

/**
 * Extracao do TEXTO COMPLETO do edital a partir dos documentos do PNCP.
 *
 * O PNCP expoe os arquivos de uma contratacao em:
 *   GET /api/pncp/v1/orgaos/{cnpj}/compras/{ano}/{sequencial}/arquivos
 * Os documentos costumam vir como PDF OU como ZIP (as vezes ZIP aninhado)
 * contendo o(s) PDF(s). Baixamos, descompactamos recursivamente, extraimos o
 * texto com pdf-parse e salvamos em Bidding.rawText para a IA do chat usar
 * (objeto, habilitacao, exigencias, anexos etc.).
 */

const PNCP_API = 'https://pncp.gov.br/api/pncp/v1'
// User-Agent de navegador ajuda a passar pelo WAF (F5) do PNCP.
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
// Limite de caracteres salvos em rawText (o texto completo do edital).
const MAX_STORE_CHARS = Number(process.env.EDITAL_MAX_CHARS) || 100000
const FETCH_TIMEOUT = 15000
const MAX_ARQUIVOS = 6 // quantos documentos tentar por contratacao
const MAX_PDFS = 12 // teto de PDFs a extrair (zips podem ter varios)

interface PncpArquivo {
  uri?: string
  url?: string
  titulo?: string
  tipoDocumentoNome?: string
  statusAtivo?: boolean
}

function parsePncpId(externalId: string | null | undefined) {
  const m = externalId?.match(/^(\d{14})-\d+-(\d+)\/(\d{4})$/)
  if (!m) return null
  return { cnpj: m[1], seq: Number(m[2]), ano: m[3] }
}

async function getJson(url: string): Promise<unknown | null> {
  const res = await fetch(url, {
    headers: { Accept: 'application/json', 'User-Agent': UA },
    signal: AbortSignal.timeout(FETCH_TIMEOUT),
  })
  if (!res.ok) return null
  const text = await res.text()
  if (text.trimStart().startsWith('<')) return null // pagina HTML do WAF
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

async function listArquivos(cnpj: string, ano: string, seq: number): Promise<PncpArquivo[]> {
  const url = `${PNCP_API}/orgaos/${cnpj}/compras/${ano}/${seq}/arquivos`
  const data = await getJson(url)
  return Array.isArray(data) ? (data as PncpArquivo[]) : []
}

async function downloadBuffer(url: string): Promise<Buffer | null> {
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: '*/*' },
    signal: AbortSignal.timeout(FETCH_TIMEOUT),
    redirect: 'follow',
  })
  if (!res.ok) return null
  return Buffer.from(await res.arrayBuffer())
}

function isPdf(buf: Buffer): boolean {
  return buf.subarray(0, 5).toString('latin1') === '%PDF-'
}
function isZip(buf: Buffer): boolean {
  return buf.subarray(0, 2).toString('latin1') === 'PK'
}

async function pdfToText(buf: Buffer): Promise<string> {
  // Importa o arquivo interno para evitar o bloco de debug do index.js do pdf-parse
  // @ts-expect-error - o caminho interno do pdf-parse nao possui tipos
  const mod = await import('pdf-parse/lib/pdf-parse.js')
  const pdfParse = (mod as unknown as { default: (b: Buffer) => Promise<{ text: string }> }).default
  const parsed = await pdfParse(buf)
  return (parsed.text || '').trim()
}

/** Coleta recursivamente os buffers de PDF dentro de um ZIP (inclui zips aninhados). */
function collectPdfBuffers(buf: Buffer, depth: number, out: Buffer[]): void {
  if (depth > 4 || out.length >= MAX_PDFS) return
  let zip: AdmZip
  try {
    zip = new AdmZip(buf)
  } catch {
    return
  }
  for (const e of zip.getEntries()) {
    if (out.length >= MAX_PDFS) break
    if (e.isDirectory) continue
    let data: Buffer
    try {
      data = e.getData()
    } catch {
      continue
    }
    const name = e.entryName.toLowerCase()
    if (name.endsWith('.pdf') || isPdf(data)) {
      out.push(data)
    } else if (name.endsWith('.zip') || isZip(data)) {
      collectPdfBuffers(data, depth + 1, out)
    }
  }
}

/** Converte um documento baixado (PDF ou ZIP) em texto. */
async function documentToText(buf: Buffer): Promise<string | null> {
  if (isPdf(buf)) {
    try {
      const t = await pdfToText(buf)
      return t.length > 0 ? t : null
    } catch {
      return null
    }
  }
  if (isZip(buf)) {
    const pdfs: Buffer[] = []
    collectPdfBuffers(buf, 0, pdfs)
    if (pdfs.length === 0) return null
    const parts: string[] = []
    let total = 0
    for (const p of pdfs) {
      if (total >= MAX_STORE_CHARS) break
      try {
        const t = await pdfToText(p)
        if (t) {
          parts.push(t)
          total += t.length
        }
      } catch {
        /* ignora pdf problematico */
      }
    }
    const joined = parts.join('\n\n').trim()
    return joined.length > 0 ? joined : null
  }
  return null
}

function clean(text: string): string {
  return text
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, MAX_STORE_CHARS)
}

/** Prioriza editais/termos de referencia na ordem de tentativa. */
function score(a: PncpArquivo): number {
  const s = `${a.titulo || ''} ${a.tipoDocumentoNome || ''}`.toLowerCase()
  if (s.includes('edital')) return 3
  if (s.includes('termo') || s.includes('referência') || s.includes('referencia')) return 2
  return 1
}

/**
 * Baixa e extrai o texto do edital de um externalId do PNCP.
 * Retorna null se nao for PNCP, nao houver arquivo ou a extracao falhar.
 */
export async function extractEditalText(externalId: string | null | undefined): Promise<string | null> {
  const ids = parsePncpId(externalId)
  if (!ids) return null

  let arquivos: PncpArquivo[]
  try {
    arquivos = await listArquivos(ids.cnpj, ids.ano, ids.seq)
  } catch {
    return null
  }
  if (arquivos.length === 0) return null

  const ordered = arquivos
    .filter((a) => a.statusAtivo !== false)
    .sort((a, b) => score(b) - score(a))
    .slice(0, MAX_ARQUIVOS)

  for (const a of ordered) {
    const dl = a.url || a.uri
    if (!dl) continue
    let buf: Buffer | null = null
    try {
      buf = await downloadBuffer(dl)
    } catch {
      buf = null
    }
    if (!buf) continue
    const text = await documentToText(buf)
    if (text && text.length > 200) return clean(text)
  }
  return null
}

/**
 * Garante que o edital tenha rawText salvo. Se ja houver, retorna o existente
 * (sem rebaixar). Caso contrario, tenta extrair do PDF/ZIP do PNCP e persiste.
 */
export async function ensureBiddingRawText(biddingId: string): Promise<string | null> {
  const b = await prisma.bidding.findUnique({
    where: { id: biddingId },
    select: { rawText: true, externalId: true },
  })
  if (!b) return null
  if (b.rawText && b.rawText.length > 200) return b.rawText

  const text = await extractEditalText(b.externalId)
  if (text) {
    await prisma.bidding.update({ where: { id: biddingId }, data: { rawText: text } }).catch(() => {})
  }
  return text
}
