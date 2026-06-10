import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { streamText, type CoreMessage } from 'ai'
import { googleAI, AI_MODEL, isAiConfigured } from '@/lib/ai'
import { withAuth, trackTokenUsage } from '@/lib/api-security'

// Estimativa de tokens por mensagem
const TOKENS_PER_MESSAGE = 500
const MAX_MESSAGES = 20

export async function POST(request: NextRequest) {
  return withAuth(request, async (ctx) => {
    if (!isAiConfigured()) {
      return NextResponse.json(
        { error: 'IA não configurada. Adicione GEMINI_API_KEY nas variáveis de ambiente.' },
        { status: 503 }
      )
    }

    let body: { biddingId: string; messages: CoreMessage[] }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      )
    }

    const { biddingId, messages } = body

    if (!biddingId) {
      return NextResponse.json(
        { error: 'biddingId is required' },
        { status: 400 }
      )
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'messages array is required' },
        { status: 400 }
      )
    }

    if (messages.length > MAX_MESSAGES) {
      return NextResponse.json(
        { error: `Maximum ${MAX_MESSAGES} messages allowed` },
        { status: 400 }
      )
    }

    // Verificar rate limiting de tokens
    const estimatedTokens = messages.length * TOKENS_PER_MESSAGE
    const tokenCheck = await trackTokenUsage(ctx.userId, ctx.planType, estimatedTokens)
    
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

    const biddingContext = bidding.rawText
      ? `Texto completo do edital:\n\n${bidding.rawText}`
      : `Título: ${bidding.title}\nÓrgão: ${bidding.organ}`

    const systemPrompt = `Você é um especialista em licitações públicas brasileiras. Você está auxiliando um usuário a entender e analisar uma licitação específica.

Contexto da licitação:
${biddingContext}

Responda às perguntas do usuário de forma direta, objetiva e em português. Baseie suas respostas nas informações do edital fornecido.`

    const result = await streamText({
      model: googleAI(AI_MODEL),
      system: systemPrompt,
      messages,
    })

    const response = result.toDataStreamResponse()
    
    // Adicionar headers de token usage
    response.headers.set('X-Token-Limit', String(tokenCheck.tokensLimit))
    response.headers.set('X-Token-Remaining', String(tokenCheck.tokensRemaining))
    
    return response
  })
}
