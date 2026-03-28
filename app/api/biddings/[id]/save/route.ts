import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { KanbanStage } from '@prisma/client'

interface RouteParams {
  params: { id: string }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id: biddingId } = params
  const userId = (session.user as any).id as string

  try {
    const existing = await prisma.savedBidding.findUnique({
      where: { userId_biddingId: { userId, biddingId } },
    })

    if (existing) {
      await prisma.savedBidding.delete({
        where: { userId_biddingId: { userId, biddingId } },
      })
      return NextResponse.json({ saved: false })
    }

    // Verify bidding exists
    const biddingExists = await prisma.bidding.findUnique({
      where: { id: biddingId },
      select: { id: true },
    })

    if (!biddingExists) {
      return NextResponse.json({ error: 'Bidding not found' }, { status: 404 })
    }

    const savedBidding = await prisma.savedBidding.create({
      data: {
        userId,
        biddingId,
        stage: KanbanStage.LEAD,
      },
    })

    return NextResponse.json({ saved: true, savedBidding }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/biddings/[id]/save]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
