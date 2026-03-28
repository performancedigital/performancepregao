import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Role, Status, PlanType } from '@prisma/client'

const ADMIN_ROLES: Role[] = [Role.ADMIN, Role.SUPERADMIN]

interface RouteParams {
  params: { id: string }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userRole = (session.user as any).role as Role
  if (!ADMIN_ROLES.includes(userRole)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = params

  let body: { status?: Status; planType?: PlanType; planExpiresAt?: string | null }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { status, planType, planExpiresAt } = body

  if (status === undefined && planType === undefined && planExpiresAt === undefined) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
  }

  const validStatuses: Status[] = [Status.ACTIVE, Status.INACTIVE, Status.SUSPENDED]
  if (status !== undefined && !validStatuses.includes(status)) {
    return NextResponse.json({ error: 'Invalid status value' }, { status: 400 })
  }

  const validPlanTypes: PlanType[] = [PlanType.FREE, PlanType.PRO, PlanType.INFINITY_PLUS]
  if (planType !== undefined && !validPlanTypes.includes(planType)) {
    return NextResponse.json({ error: 'Invalid planType value' }, { status: 400 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(status !== undefined && { status }),
        ...(planType !== undefined && { planType }),
        ...(planExpiresAt !== undefined && {
          planExpiresAt: planExpiresAt ? new Date(planExpiresAt) : null,
        }),
      },
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
    })

    return NextResponse.json({ data: updated })
  } catch (error) {
    console.error('[PATCH /api/admin/users/[id]]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
