import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: { id: string }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = params
  const userId = (session.user as any).id as string

  try {
    const bidding = await prisma.bidding.findUnique({
      where: { id },
      include: {
        portal: {
          select: { name: true, type: true },
        },
        items: true,
        savedBy: {
          where: { userId },
          select: { id: true, stage: true, notes: true, alertAt: true },
        },
      },
    })

    if (!bidding) {
      return NextResponse.json({ error: 'Bidding not found' }, { status: 404 })
    }

    const isSaved = bidding.savedBy.length > 0

    return NextResponse.json({ bidding, isSaved })
  } catch (error) {
    console.error('[GET /api/biddings/[id]]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
