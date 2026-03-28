import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-n8n-secret')
  if (secret !== process.env.N8N_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const biddings = Array.isArray(body) ? body : [body]
  let upserted = 0

  for (const b of biddings) {
    if (!b.externalId || !b.title || !b.portalId) continue
    try {
      await prisma.bidding.upsert({
        where: { externalId: b.externalId },
        update: {
          title: b.title,
          organ: b.organ,
          state: b.state,
          city: b.city,
          modality: b.modality ?? 'Não informado',
          estimatedValue: b.estimatedValue ?? null,
          openingDate: b.openingDate ? new Date(b.openingDate) : null,
          pdfUrl: b.pdfUrl ?? null,
          rawText: b.rawText ?? null,
          status: 'OPEN',
        },
        create: {
          externalId: b.externalId,
          portalId: b.portalId,
          title: b.title,
          organ: b.organ ?? 'Não informado',
          state: b.state ?? null,
          city: b.city ?? null,
          modality: b.modality ?? 'Não informado',
          estimatedValue: b.estimatedValue ?? null,
          openingDate: b.openingDate ? new Date(b.openingDate) : null,
          pdfUrl: b.pdfUrl ?? null,
          rawText: b.rawText ?? null,
          status: 'OPEN',
        },
      })
      upserted++
    } catch (err) {
      console.error('[n8n-receiver] upsert error:', err)
    }
  }

  return NextResponse.json({ received: biddings.length, upserted })
}
