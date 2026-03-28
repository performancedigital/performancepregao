import MercadoPago from 'mercadopago'

export const mp = new MercadoPago({
  accessToken: process.env.MP_ACCESS_TOKEN!,
})

export const PLANS = {
  FREE: { name: 'Free', price: 0, mpPlanId: null },
  PRO: { name: 'Pro', price: 97, mpPlanId: process.env.MP_PLAN_PRO_ID ?? null },
  INFINITY_PLUS: { name: 'Infinity Plus', price: 243, mpPlanId: process.env.MP_PLAN_INFINITY_ID ?? null },
} as const

export type PlanKey = keyof typeof PLANS

export async function createPreference(
  planKey: Exclude<PlanKey, 'FREE'>,
  userId: string,
  userEmail: string,
) {
  const plan = PLANS[planKey]

  const preferenceData = {
    items: [
      {
        id: planKey,
        title: `Performance Pregão — Plano ${plan.name}`,
        description: `Assinatura mensal do plano ${plan.name}`,
        quantity: 1,
        unit_price: plan.price,
        currency_id: 'BRL',
      },
    ],
    payer: { email: userEmail },
    metadata: { userId, planType: planKey },
    back_urls: {
      success: `${process.env.NEXTAUTH_URL}/dashboard/opportunities?payment=success`,
      failure: `${process.env.NEXTAUTH_URL}/dashboard/upgrade?payment=error`,
      pending: `${process.env.NEXTAUTH_URL}/dashboard/upgrade?payment=pending`,
    },
    auto_return: 'approved' as const,
    notification_url: `${process.env.NEXTAUTH_URL}/api/webhooks/mercadopago`,
    external_reference: userId,
  }

  const { Preference } = await import('mercadopago')
  const preference = new Preference(mp)
  const response = await preference.create({ body: preferenceData })
  return response
}
