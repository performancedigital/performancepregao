import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [savedBiddings, totalBiddings] = await Promise.all([
    prisma.savedBidding.findMany({
      where: { userId: session.user.id },
      include: { bidding: { include: { portal: true } } },
    }),
    prisma.bidding.count(),
  ])

  const byStage = {
    LEAD: savedBiddings.filter(s => s.stage === 'LEAD').length,
    AVALIANDO: savedBiddings.filter(s => s.stage === 'AVALIANDO').length,
    ENCAMINHADO: savedBiddings.filter(s => s.stage === 'ENCAMINHADO').length,
    VENCIDO: savedBiddings.filter(s => s.stage === 'VENCIDO').length,
  }

  const byPortal = savedBiddings.reduce((acc: Record<string, number>, s) => {
    const name = s.bidding.portal?.name || 'Outro'
    acc[name] = (acc[name] || 0) + 1
    return acc
  }, {})

  const totalValue = savedBiddings.reduce((sum, s) => {
    return sum + (Number(s.bidding.estimatedValue) || 0)
  }, 0)

  // Monthly saved (last 6 months)
  const now = new Date()
  const monthly = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    const next = new Date(d.getFullYear(), d.getMonth() + 1, 1)
    return {
      month: d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
      count: savedBiddings.filter(s => {
        const c = new Date(s.createdAt)
        return c >= d && c < next
      }).length,
    }
  })

  return NextResponse.json({
    savedTotal: savedBiddings.length,
    totalBiddings,
    totalValue,
    byStage,
    byPortal,
    monthly,
  })
}
