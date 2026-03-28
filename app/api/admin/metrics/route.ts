import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Role, Status, BiddingStatus } from '@prisma/client'

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

  try {
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)

    const [
      totalUsers,
      activeUsers,
      totalBiddings,
      openBiddings,
      newBiddingsToday,
      totalSaved,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: Status.ACTIVE } }),
      prisma.bidding.count(),
      prisma.bidding.count({ where: { status: BiddingStatus.OPEN } }),
      prisma.bidding.count({ where: { createdAt: { gte: startOfToday } } }),
      prisma.savedBidding.count(),
    ])

    return NextResponse.json({
      totalUsers,
      activeUsers,
      totalBiddings,
      openBiddings,
      newBiddingsToday,
      totalSaved,
    })
  } catch (error) {
    console.error('[GET /api/admin/metrics]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
