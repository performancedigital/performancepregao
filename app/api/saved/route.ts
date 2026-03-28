import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = (session.user as any).id as string

  try {
    const savedBiddings = await prisma.savedBidding.findMany({
      where: { userId },
      include: {
        bidding: {
          include: {
            portal: {
              select: { name: true, type: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ data: savedBiddings })
  } catch (error) {
    console.error('[GET /api/saved]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
