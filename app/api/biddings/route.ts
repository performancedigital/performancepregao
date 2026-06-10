import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { BiddingStatus, Prisma, PortalType } from '@prisma/client'
import { withAuth, sanitizeSearchInput, parsePagination } from '@/lib/api-security'

export async function GET(request: NextRequest) {
  return withAuth(request, async (ctx) => {
    const { searchParams } = new URL(request.url)
    const search = sanitizeSearchInput(searchParams.get('search'))
    const portal = searchParams.get('portal')
    const state = sanitizeSearchInput(searchParams.get('state'))
    const modality = sanitizeSearchInput(searchParams.get('modality'))
    const minValue = searchParams.get('minValue')
    const onlyActive = searchParams.get('onlyActive') !== 'false'
    
    const { page, limit, skip } = parsePagination(searchParams)

    const where: Prisma.BiddingWhereInput = {
      status: BiddingStatus.OPEN,
      ...(onlyActive
        ? {
            // "Ativo" = ainda aberto para proposta (prazo de encerramento no futuro)
            OR: [{ closingDate: null }, { closingDate: { gte: new Date() } }],
          }
        : {}),
    }

    const andFilters: Prisma.BiddingWhereInput[] = []

    if (search) {
      andFilters.push({
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { organ: { contains: search, mode: 'insensitive' } },
          { city: { contains: search, mode: 'insensitive' } },
          { state: { contains: search, mode: 'insensitive' } },
        ],
      })
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
      const firstToken = modality.trim().split(/\s+/)[0]
      andFilters.push({
        OR: [
          { modality: { contains: modality, mode: 'insensitive' } },
          { modality: { contains: firstToken, mode: 'insensitive' } },
        ],
      })
    }

    if (minValue && !isNaN(Number(minValue))) {
      where.estimatedValue = { gte: new Prisma.Decimal(Number(minValue)) }
    }

    if (andFilters.length > 0) {
      where.AND = andFilters
    }

    const [biddings, total] = await Promise.all([
      prisma.bidding.findMany({
        where,
        include: {
          portal: {
            select: { name: true, type: true },
          },
          // Incluir info se usuário salvou esta licitação
          savedBy: {
            where: { userId: ctx.userId },
            select: { id: true, stage: true },
          },
        },
        orderBy: [{ createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      prisma.bidding.count({ where }),
    ])

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      data: biddings,
      total,
      page,
      limit,
      totalPages,
    })
  })
}
