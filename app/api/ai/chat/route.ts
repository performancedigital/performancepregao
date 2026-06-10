import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { streamText, type CoreMessage } from 'ai'
import { getChatModel, isAiConfigured } from '@/lib/ai'
import { withAuth, trackTokenUsage } from '@/lib/api-security'
import { pncpEditalUrl, formatCurrency } from '@/lib/utils'

// Estimativa de tokens por mensagem
const TOKENS_PER_MESSAGE = 500
const MAX_MESSAGES = 20

type BiddingForChat = {
  rawText: string | null
  title: string
  organ: string
  modality: string
  state: string | null
  city: string | null
  estimatedValue: { toString(): string } | null
  openingDate: Date | null
  closingDate: Date | null
  status: string
  externalId: string
}

function fmtDate(d: Date | null): string {
  return d ? new Date(d).toLocaleString('pt-BR') : 'não informado'
}

type BiddingItemForChat = { description: string; quantity: { toString(): string } | null; unit: string | null }

/**
 * Monta um contexto estruturado e RICO do edital especifico para a IA.
 * Usa todos os metadados disponiveis + itens. Se houver rawText (texto completo),
 * ele e anexado ao final.
 */
function buildBiddingContext(
  b: BiddingForChat & { aiSummary?: string | null; pdfUrl?: string | null; items?: BiddingItemForChat[] }
): string {
  const valor = formatCurrency(b.estimatedValue ? Number(b.estimatedValue) : null)
  const local = [b.city, b.state].filter(Boolean).join(' / ') || 'não informado'
  const prazoPassou = !!b.closingDate && new Date(b.closingDate).getTime() < Date.now()
  const situacao = b.status === 'OPEN' && !prazoPassou ? 'Aberto para propostas' : 'Encerrado'
  const url = pncpEditalUrl(b.externalId) || b.pdfUrl || null

  const linhas: string[] = [
    `Objeto/Título: ${b.title}`,
    `Órgão comprador: ${b.organ}`,
    `Modalidade: ${b.modality}`,
    `Local: ${local}`,
    `Valor estimado: ${valor}`,
    `Abertura das propostas: ${fmtDate(b.openingDate)}`,
    `Prazo final (encerramento): ${fmtDate(b.closingDate)}`,
    `Situação atual: ${situacao}`,
    `Identificador: ${b.externalId}`,
  ]
  if (url) linhas.push(`Link do edital completo no portal oficial: ${url}`)

  if (b.aiSummary) {
    linhas.push('', 'Resumo do edital:', b.aiSummary)
  }

  if (b.items && b.items.length > 0) {
    linhas.push('', `Itens da licitação (${b.items.length}):`)
    for (const it of b.items) {
      const qty = it.quantity != null ? ` — qtd: ${it.quantity}${it.unit ? ' ' + it.unit : ''}` : ''
      linhas.push(`- ${it.description}${qty}`)
    }
  }

  if (b.rawText) {
    linhas.push('', 'Texto completo do edital:', b.rawText)
  }

  return linhas.join('\n')
}

/** Codifica texto no protocolo de data-stream do Vercel AI SDK (consumido pelo ChatModal). */
function toDataStream(text: string): string {
  return `0:${JSON.stringify(text)}\n`
}

/**
 * Resposta "por enquanto" sem IA: usa apenas os dados REAIS do edital (sem inventar).
 * Vira IA completa assim que GEMINI_API_KEY for configurada.
 */
function buildGroundedAnswer(b: BiddingForChat, question: string): string {
  const q = (question || '').toLowerCase()
  const url = pncpEditalUrl(b.externalId)
  const valor = formatCurrency(b.estimatedValue ? Number(b.estimatedValue) : null)
  const local = [b.city, b.state].filter(Boolean).join(' / ') || 'não informado'
  const wants = (terms: string[]) => terms.some((t) => q.includes(t))
  const linhas: string[] = []
  let answered = false

  if (wants(['prazo', 'encerr', 'quando', 'data', 'fecha', 'limite'])) {
    linhas.push(`📅 **Abertura das propostas:** ${fmtDate(b.openingDate)}`)
    linhas.push(`⏰ **Prazo final (encerramento):** ${fmtDate(b.closingDate)}`)
    answered = true
  }
  if (wants(['valor', 'preço', 'preco', 'estimad', 'quanto'])) {
    linhas.push(`💰 **Valor estimado:** ${valor}`)
    answered = true
  }
  if (wants(['órgão', 'orgao', 'quem', 'comprador', 'contratante'])) {
    linhas.push(`🏛️ **Órgão:** ${b.organ}`)
    answered = true
  }
  if (wants(['modalidade', 'pregão', 'pregao', 'dispensa'])) {
    linhas.push(`📋 **Modalidade:** ${b.modality}`)
    answered = true
  }
  if (wants(['onde', 'estado', 'cidade', 'local', ' uf'])) {
    linhas.push(`📍 **Local:** ${local}`)
    answered = true
  }
  if (wants(['aberto', 'status', 'situação', 'situacao', 'vigente', 'ativo'])) {
    const prazoPassou = !!b.closingDate && new Date(b.closingDate).getTime() < Date.now()
    const aberto = b.status === 'OPEN' && !prazoPassou
    linhas.push(`📌 **Situação:** ${aberto ? 'Aberto para propostas' : 'Encerrado'}`)
    answered = true
  }

  if (!answered) {
    linhas.push('Resumo do que sei sobre este edital:')
    linhas.push('')
    linhas.push(`• **Objeto:** ${b.title}`)
    linhas.push(`• **Órgão:** ${b.organ}`)
    linhas.push(`• **Modalidade:** ${b.modality}`)
    linhas.push(`• **Local:** ${local}`)
    linhas.push(`• **Valor estimado:** ${valor}`)
    linhas.push(`• **Abertura:** ${fmtDate(b.openingDate)}`)
    linhas.push(`• **Prazo final:** ${fmtDate(b.closingDate)}`)
  }

  linhas.push('')
  if (url) linhas.push(`📄 Edital completo (habilitação, exigências, itens) no portal: ${url}`)
  linhas.push('_Para análise jurídica detalhada do documento por IA, o administrador pode ativar a IA (chave Groq/OpenAI)._')
  return linhas.join('\n')
}

export async function POST(request: NextRequest) {
  return withAuth(request, async (ctx) => {
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

    const bidding = await prisma.bidding.findUnique({
      where: { id: biddingId },
      select: {
        rawText: true, title: true, organ: true, modality: true,
        state: true, city: true, estimatedValue: true,
        openingDate: true, closingDate: true, status: true, externalId: true,
        pdfUrl: true, aiSummary: true,
        items: { select: { description: true, quantity: true, unit: true }, take: 80 },
      },
    })

    if (!bidding) {
      return NextResponse.json(
        { error: 'Bidding not found' },
        { status: 404 }
      )
    }

    // "Por enquanto": sem chave de IA, responde com os dados reais do edital
    if (!isAiConfigured()) {
      const lastUser = [...messages].reverse().find((m) => m.role === 'user')
      const question = typeof lastUser?.content === 'string' ? lastUser.content : ''
      const answer = buildGroundedAnswer(bidding as BiddingForChat, question)
      return new NextResponse(toDataStream(answer), {
        status: 200,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      })
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

    const biddingContext = buildBiddingContext(bidding)

    const systemPrompt = `Você é um especialista em licitações públicas brasileiras, atuando como assistente da Brasília Consultoria em Licitações. Você está ajudando o usuário a entender e analisar UM edital específico — aquele descrito abaixo.

=== DADOS DESTE EDITAL ===
${biddingContext}
=== FIM DOS DADOS ===

Regras importantes:
- Responda SEMPRE e SOMENTE com base nos dados deste edital acima. Não fale de outras licitações.
- Seja direto, objetivo e responda em português do Brasil.
- Se o usuário perguntar algo que NÃO está nos dados acima (ex.: exigências detalhadas de habilitação, atestados, anexos), seja honesto: diga que essa informação não consta nos dados resumidos disponíveis e oriente a consultar o edital completo no portal oficial${pncpEditalUrl(bidding.externalId) || bidding.pdfUrl ? ` (link: ${pncpEditalUrl(bidding.externalId) || bidding.pdfUrl})` : ''}.
- NUNCA invente prazos, valores, exigências ou números que não estejam nos dados fornecidos.`

    const result = await streamText({
      model: getChatModel()!,
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
