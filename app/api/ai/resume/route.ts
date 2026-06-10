import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { streamText } from 'ai'
import { googleAI, AI_MODEL, isAiConfigured } from '@/lib/ai'
import { withAuth, trackTokenUsage } from '@/lib/api-security'

// Estimativa de tokens para resumo
const RESUME_TOKENS = 2000

export async function POST(request: NextRequest) {
  return withAuth(request, async (ctx) => {
    if (!isAiConfigured()) {
      return NextResponse.json(
        { error: 'IA não configurada. Adicione GEMINI_API_KEY nas variáveis de ambiente.' },
        { status: 503 }
      )
    }

    let body: { biddingId: string }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      )
    }

    const { biddingId } = body

    if (!biddingId) {
      return NextResponse.json(
        { error: 'biddingId is required' },
        { status: 400 }
      )
    }

    // Verificar rate limiting de tokens
    const tokenCheck = await trackTokenUsage(ctx.userId, ctx.planType, RESUME_TOKENS)
    
    if (!tokenCheck.allowed) {
      return NextResponse.json(
        {
          error: 'Token limit exceeded',
          message: `Limite de tokens excedido. Restante: ${tokenCheck.tokensRemaining}`,
          tokensRemaining: tokenCheck.tokensRemaining,
          tokensLimit: tokenCheck.tokensLimit,
        },
        { status: 429 }
      )
    }

    const bidding = await prisma.bidding.findUnique({
      where: { id: biddingId },
      select: { rawText: true, title: true, organ: true },
    })

    if (!bidding) {
      return NextResponse.json(
        { error: 'Bidding not found' },
        { status: 404 }
      )
    }

    const userMessage = bidding.rawText ?? `Edital: ${bidding.title} - ${bidding.organ}`

    const result = await streamText({
      model: googleAI(AI_MODEL),
      system:
        'Você é um especialista em licitações públicas brasileiras. Analise o edital e forneça um resumo estruturado em português com: 1) Objeto principal, 2) Valor estimado, 3) Requisitos de habilitação mais importantes, 4) Prazos críticos, 5) Pontos de atenção. Seja direto e objetivo.',
      messages: [{ role: 'user', content: userMessage }],
    })

    const response = result.toDataStreamResponse()
    
    // Adicionar headers de token usage
    response.headers.set('X-Token-Limit', String(tokenCheck.tokensLimit))
    response.headers.set('X-Token-Remaining', String(tokenCheck.tokensRemaining))
    
    return response
  })
}
