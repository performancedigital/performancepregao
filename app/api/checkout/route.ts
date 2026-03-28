import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createPreference } from '@/lib/mercadopago'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { planType } = await req.json()
  if (!planType || planType === 'FREE') {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
  }

  try {
    const preference = await createPreference(
      planType,
      (session.user as any).id,
      session.user.email!,
    )
    return NextResponse.json({ preferenceId: preference.id, initPoint: preference.init_point })
  } catch (err) {
    console.error('[POST /api/checkout]', err)
    return NextResponse.json({ error: 'Failed to create payment preference' }, { status: 500 })
  }
}
