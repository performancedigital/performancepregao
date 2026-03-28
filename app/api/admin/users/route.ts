import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Role, Status, PlanType, Prisma } from '@prisma/client'

const ADMIN_ROLES: Role[] = [Role.ADMIN, Role.SUPERADMIN]

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userRole = (session.user as any).role as Role
  if (!ADMIN_ROLES.includes(userRole)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search')
  const statusFilter = searchParams.get('status') as Status | null
  const planTypeFilter = searchParams.get('planType') as PlanType | null
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)))

  const where: Prisma.UserWhereInput = {}

  if (search) {
    where.OR = [
      { email: { contains: search, mode: 'insensitive' } },
      { name: { contains: search, mode: 'insensitive' } },
    ]
  }

  const validStatuses: Status[] = [Status.ACTIVE, Status.INACTIVE, Status.SUSPENDED]
  if (statusFilter && validStatuses.includes(statusFilter)) {
    where.status = statusFilter
  }

  const validPlanTypes: PlanType[] = [PlanType.FREE, PlanType.PRO, PlanType.INFINITY_PLUS]
  if (planTypeFilter && validPlanTypes.includes(planTypeFilter)) {
    where.planType = planTypeFilter
  }

  try {
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          status: true,
          planType: true,
          planExpiresAt: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ])

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({ data: users, total, page, limit, totalPages })
  } catch (error) {
    console.error('[GET /api/admin/users]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
