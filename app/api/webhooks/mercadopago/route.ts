import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PlanType } from '@prisma/client'
import { createHmac } from 'crypto'

function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.MP_WEBHOOK_SECRET

  if (!webhookSecret) {
    console.error('[MP Webhook] MP_WEBHOOK_SECRET is not set')
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  const signature = request.headers.get('x-signature')
  const rawBody = await request.text()

  if (signature) {
    const expectedSignature = createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex')

    if (signature !== expectedSignature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }
  }

  let event: { type: string; data: { id: string; status: string; metadata?: Record<string, string> } }
  try {
    event = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  try {
    if (event.type === 'payment' && event.data?.status === 'approved') {
      const paymentId = event.data.id

      // Fetch payment from Mercado Pago to get metadata
      const mpAccessToken = process.env.MP_ACCESS_TOKEN
      if (!mpAccessToken) {
        console.error('[MP Webhook] MP_ACCESS_TOKEN is not set')
        return NextResponse.json({ error: 'MP access token not configured' }, { status: 500 })
      }

      const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: { Authorization: `Bearer ${mpAccessToken}` },
      })

      if (!mpResponse.ok) {
        console.error('[MP Webhook] Failed to fetch payment from MP', await mpResponse.text())
        return NextResponse.json({ error: 'Failed to fetch payment details' }, { status: 502 })
      }

      const payment = await mpResponse.json()
      const metadata: Record<string, string> = payment.metadata ?? {}

      const userId = metadata.user_id
      const planType = metadata.plan_type as PlanType | undefined

      if (!userId || !planType) {
        console.error('[MP Webhook] Missing userId or planType in payment metadata', metadata)
        return NextResponse.json({ error: 'Missing metadata in payment' }, { status: 400 })
      }

      const validPlanTypes: PlanType[] = [PlanType.FREE, PlanType.PRO, PlanType.INFINITY_PLUS]
      if (!validPlanTypes.includes(planType)) {
        return NextResponse.json({ error: 'Invalid planType in metadata' }, { status: 400 })
      }

      await prisma.user.update({
        where: { id: userId },
        data: {
          planType,
          planExpiresAt: addDays(new Date(), 30),
        },
      })

      console.log(`[MP Webhook] Updated user ${userId} to plan ${planType}`)
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error) {
    console.error('[POST /api/webhooks/mercadopago]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
