import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PortalType } from '@prisma/client'
import { withAuth } from '@/lib/api-security'

export async function GET(request: NextRequest) {
  return withAuth(
    request,
    async () => {
      const allPortals = await prisma.portal.findMany({
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

      // Deduplicar por type, mantendo o mais recente
      const seen = new Set<string>()
      const portals = allPortals.filter((p) => {
        if (seen.has(p.type)) return false
        seen.add(p.type)
        return true
      })

      return NextResponse.json({ data: portals })
    },
    { requireAdmin: true, skipRateLimit: true }
  )
}

export async function POST(request: NextRequest) {
  return withAuth(
    request,
    async () => {
      let body: { name: string; url: string; type: PortalType; isActive?: boolean }
      
      try {
        body = await request.json()
      } catch {
        return NextResponse.json(
          { error: 'Invalid JSON body' },
          { status: 400 }
        )
      }

      const { name, url, type, isActive = true } = body

      if (!name || !url || !type) {
        return NextResponse.json(
          { error: 'name, url and type are required' },
          { status: 400 }
        )
      }

      const validPortalTypes: PortalType[] = [
        PortalType.PNCP,
      ]
      
      if (!validPortalTypes.includes(type)) {
        return NextResponse.json(
          { error: 'Invalid portal type' },
          { status: 400 }
        )
      }

      const portal = await prisma.portal.create({
        data: { name, url, type, isActive },
      })

      return NextResponse.json({ data: portal }, { status: 201 })
    },
    { requireAdmin: true, skipRateLimit: true }
  )
}
