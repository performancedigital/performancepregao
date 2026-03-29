import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { streamText } from 'ai'
import { google } from '@ai-sdk/google'

export async function POST(request: NextRequest) {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return NextResponse.json({ error: 'IA não configurada. Adicione GOOGLE_GENERATIVE_AI_API_KEY nas variáveis de ambiente.' }, { status: 503 })
  }

  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { biddingId: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { biddingId } = body

  if (!biddingId) {
    return NextResponse.json({ error: 'biddingId is required' }, { status: 400 })
  }

  try {
    const bidding = await prisma.bidding.findUnique({
      where: { id: biddingId },
      select: { rawText: true, title: true, organ: true },
    })

    if (!bidding) {
      return NextResponse.json({ error: 'Bidding not found' }, { status: 404 })
    }

    const userMessage = bidding.rawText ?? `Edital: ${bidding.title} - ${bidding.organ}`

    const result = await streamText({
      model: google('gemini-1.5-flash'),
      system:
        'Você é um especialista em licitações públicas brasileiras. Analise o edital e forneça um resumo estruturado em português com: 1) Objeto principal, 2) Valor estimado, 3) Requisitos de habilitação mais importantes, 4) Prazos críticos, 5) Pontos de atenção. Seja direto e objetivo.',
      messages: [{ role: 'user', content: userMessage }],
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error('[POST /api/ai/resume]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
