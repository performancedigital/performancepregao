import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/api-security'
import { ensureBiddingRawText } from '@/lib/edital-text'

export const runtime = 'nodejs'
export const maxDuration = 60

interface RouteParams {
  params: { id: string }
}

/**
 * Baixa o PDF do edital no PNCP e extrai o texto completo para Bidding.rawText.
 * Idempotente: se o texto ja existir, apenas confirma. Usado de forma lazy
 * (em segundo plano ao abrir o edital e como fallback no chat da IA).
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  return withAuth(request, async () => {
    const text = await ensureBiddingRawText(params.id)
    return NextResponse.json({ ok: Boolean(text), chars: text?.length ?? 0 })
  })
}
