import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined || value === 0) return 'Não informado'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return 'Não informado'
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function getTimeUntil(date: Date | string | null | undefined): string {
  if (!date) return 'Data não informada'
  const now = new Date()
  const target = new Date(date)
  const diff = target.getTime() - now.getTime()

  if (diff < 0) return 'Encerrado'

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (days > 0) return `Faltam ${days}d ${hours}h`
  if (hours > 0) return `Faltam ${hours}h ${minutes}min`
  return `Faltam ${minutes}min`
}

/**
 * Monta a URL publica do edital no portal PNCP a partir do numeroControlePNCP.
 * Ex.: "13170790000103-1-000014/2026" -> https://pncp.gov.br/app/editais/13170790000103/2026/14
 * Retorna null se o formato nao casar.
 */
export function pncpEditalUrl(externalId: string | null | undefined): string | null {
  if (!externalId) return null
  const m = externalId.match(/^(\d{14})-\d+-(\d+)\/(\d{4})$/)
  if (!m) return null
  const [, cnpj, seq, ano] = m
  return `https://pncp.gov.br/app/editais/${cnpj}/${ano}/${Number(seq)}`
}

/**
 * Resolve o melhor link para ver o edital.
 * Para PNCP, prioriza a pagina PUBLICA do PNCP (sem login, com os documentos) —
 * o linkSistemaOrigem costuma apontar para sistemas do orgao com tela de login.
 * Para outros portais, usa o link de origem.
 */
export function resolveEditalUrl(
  pdfUrl: string | null | undefined,
  externalId: string | null | undefined,
  portalType?: string | null
): string | null {
  if (portalType === 'PNCP' || !portalType) {
    return pncpEditalUrl(externalId) ?? pdfUrl ?? null
  }
  return pdfUrl ?? null
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trimEnd() + '...'
}

export function getPlanLabel(planType: string): string {
  const labels: Record<string, string> = {
    FREE: 'Grátis',
    PRO: 'Pro',
    INFINITY_PLUS: 'Infinity+',
  }
  return labels[planType] ?? planType
}

export function getPlanColor(planType: string): string {
  const colors: Record<string, string> = {
    FREE: 'text-slate-400 border-slate-400/30 bg-slate-400/10',
    PRO: 'text-neon border-neon/30 bg-neon/10',
    INFINITY_PLUS: 'text-neon-purple border-neon-purple/30 bg-neon-purple/10',
  }
  return colors[planType] ?? 'text-slate-400'
}
