import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Role, PortalType } from '@prisma/client'

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
    const portals = await prisma.portal.findMany({
      select: {
        id: true,
        name: true,
        url: true,
        type: true,
        isActive: true,
        createdAt: true,
        _count: { select: { biddings: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ data: portals })
  } catch (error) {
    console.error('[GET /api/admin/portals]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userRole = (session.user as any).role as Role
  if (!ADMIN_ROLES.includes(userRole)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let body: { name: string; url: string; type: PortalType; isActive?: boolean }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { name, url, type, isActive = true } = body

  if (!name || !url || !type) {
    return NextResponse.json({ error: 'name, url and type are required' }, { status: 400 })
  }

  const validPortalTypes: PortalType[] = [
    PortalType.PNCP,
    PortalType.COMPRAS_GOV,
    PortalType.BLL,
    PortalType.MUNICIPAL,
  ]
  if (!validPortalTypes.includes(type)) {
    return NextResponse.json({ error: 'Invalid portal type' }, { status: 400 })
  }

  try {
    const portal = await prisma.portal.create({
      data: { name, url, type, isActive },
    })

    return NextResponse.json({ data: portal }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/admin/portals]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
