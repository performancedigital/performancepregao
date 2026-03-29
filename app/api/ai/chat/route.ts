import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { streamText, type CoreMessage } from 'ai'
import { google } from '@ai-sdk/google'

export async function POST(request: NextRequest) {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return NextResponse.json({ error: 'IA não configurada. Adicione GOOGLE_GENERATIVE_AI_API_KEY nas variáveis de ambiente.' }, { status: 503 })
  }

  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { biddingId: string; messages: CoreMessage[] }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { biddingId, messages } = body

  if (!biddingId) {
    return NextResponse.json({ error: 'biddingId is required' }, { status: 400 })
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: 'messages array is required' }, { status: 400 })
  }

  try {
    const bidding = await prisma.bidding.findUnique({
      where: { id: biddingId },
      select: { rawText: true, title: true, organ: true },
    })

    if (!bidding) {
      return NextResponse.json({ error: 'Bidding not found' }, { status: 404 })
    }

    const biddingContext = bidding.rawText
      ? `Texto completo do edital:\n\n${bidding.rawText}`
      : `Título: ${bidding.title}\nÓrgão: ${bidding.organ}`

    const systemPrompt = `Você é um especialista em licitações públicas brasileiras. Você está auxiliando um usuário a entender e analisar uma licitação específica.

Contexto da licitação:
${biddingContext}

Responda às perguntas do usuário de forma direta, objetiva e em português. Baseie suas respostas nas informações do edital fornecido.`

    const result = await streamText({
      model: google('gemini-1.5-flash'),
      system: systemPrompt,
      messages,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error('[POST /api/ai/chat]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
