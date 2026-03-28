import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { KanbanStage } from '@prisma/client'

interface RouteParams {
  params: { id: string }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = params
  const userId = (session.user as any).id as string

  let body: { stage?: KanbanStage; notes?: string; alertAt?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { stage, notes, alertAt } = body

  if (!stage && notes === undefined && alertAt === undefined) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
  }

  try {
    const saved = await prisma.savedBidding.findFirst({
      where: { id, userId },
    })

    if (!saved) {
      return NextResponse.json({ error: 'Saved bidding not found' }, { status: 404 })
    }

    const updated = await prisma.savedBidding.update({
      where: { id },
      data: {
        ...(stage !== undefined && { stage }),
        ...(notes !== undefined && { notes }),
        ...(alertAt !== undefined && { alertAt: alertAt ? new Date(alertAt) : null }),
      },
    })

    return NextResponse.json({ data: updated })
  } catch (error) {
    console.error('[PATCH /api/saved/[id]]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = params
  const userId = (session.user as any).id as string

  try {
    const saved = await prisma.savedBidding.findFirst({
      where: { id, userId },
    })

    if (!saved) {
      return NextResponse.json({ error: 'Saved bidding not found' }, { status: 404 })
    }

    await prisma.savedBidding.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[DELETE /api/saved/[id]]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
