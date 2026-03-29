import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { BiddingStatus, Prisma, PortalType } from '@prisma/client'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search')
  const portal = searchParams.get('portal')
  const state = searchParams.get('state')
  const modality = searchParams.get('modality')
  const minValue = searchParams.get('minValue')
  const onlyActive = searchParams.get('onlyActive') !== 'false'
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '12', 10)))

  const where: Prisma.BiddingWhereInput = {
    status: BiddingStatus.OPEN,
    ...(onlyActive
      ? {
          OR: [
            { openingDate: null },
            { openingDate: { gte: new Date() } },
          ],
        }
      : {}),
  }

  if (search) {
    const searchFilter: Prisma.BiddingWhereInput = {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { organ: { contains: search, mode: 'insensitive' } },
      ],
    }

    if (where.AND) {
      ;(where.AND as Prisma.BiddingWhereInput[]).push(searchFilter)
    } else {
      where.AND = [searchFilter]
    }
  }

  if (portal) {
    const validPortals = Object.values(PortalType)
    if (validPortals.includes(portal as PortalType)) {
      where.portal = { type: portal as PortalType }
    }
  }

  if (state) {
    where.state = state
  }

  if (modality) {
    where.modality = { contains: modality, mode: 'insensitive' }
  }

  if (minValue && !isNaN(Number(minValue))) {
    where.estimatedValue = { gte: new Prisma.Decimal(Number(minValue)) }
  }

  try {
    const [biddings, total] = await Promise.all([
      prisma.bidding.findMany({
        where,
        include: {
          portal: {
            select: { name: true, type: true },
          },
        },
        orderBy: [{ openingDate: 'asc' }, { createdAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.bidding.count({ where }),
    ])

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({ data: biddings, total, page, limit, totalPages })
  } catch (error) {
    console.error('[GET /api/biddings]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
