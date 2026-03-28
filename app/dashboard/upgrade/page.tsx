'use client'

import { useState } from 'react'
import { GlassCard } from '@/components/ui/GlassCard'
import { NeonButton } from '@/components/ui/NeonButton'
import { Check, Zap, Crown, Star } from 'lucide-react'
import { useSession } from 'next-auth/react'

const PLANS = [
  {
    key: 'FREE',
    name: 'Free',
    price: 0,
    description: 'Para explorar a plataforma',
    badge: null,
    features: [
      '5 editais por dia',
      '1 portal (PNCP)',
      'Busca básica',
      'Sem IA',
      'Sem alertas',
    ],
    cta: 'Plano Atual',
    ctaDisabled: true,
  },
  {
    key: 'PRO',
    name: 'Pro',
    price: 97,
    description: 'Para licitantes ativos',
    badge: null,
    features: [
      '100 editais por dia',
      '5 portais monitorados',
      'Resumo IA dos editais',
      'Kanban de disputas',
      'Alertas por email',
    ],
    cta: 'Assinar Pro',
    ctaDisabled: false,
  },
  {
    key: 'INFINITY_PLUS',
    name: 'Infinity Plus',
    price: 243,
    description: 'Para empresas sérias',
    badge: 'MAIS POPULAR',
    features: [
      'Editais ilimitados',
      '19 portais monitorados',
      'Chat IA com o edital',
      'Kanban avançado + alertas',
      'Módulo jurídico (em breve)',
      'Suporte prioritário',
    ],
    cta: 'Assinar Infinity',
    ctaDisabled: false,
  },
]

export default function UpgradePage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState<string | null>(null)

  async function handleCheckout(planKey: string) {
    if (planKey === 'FREE') return
    setLoading(planKey)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planType: planKey }),
      })
      const json = await res.json()
      if (json.initPoint) {
        window.location.href = json.initPoint
      }
    } catch {
      alert('Erro ao criar preferência de pagamento.')
    }
    setLoading(null)
  }

  const currentPlan = (session?.user as any)?.planType ?? 'FREE'

  return (
    <div className="max-w-5xl mx-auto space-y-10 py-8">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-neon/10 border border-neon/20 rounded-full px-4 py-1.5 mb-4">
          <Crown size={14} className="text-neon" />
          <span className="text-neon text-xs font-semibold">Faça upgrade do seu plano</span>
        </div>
        <h1 className="text-4xl font-black text-white mb-3">
          Escolha o plano <span className="gradient-text">certo para você</span>
        </h1>
        <p className="text-slate-400 text-base max-w-xl mx-auto">
          Cada real investido aqui pode se converter em contratos de dezenas de milhares.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {PLANS.map(plan => {
          const isCurrent = plan.key === currentPlan
          const isPopular = plan.key === 'INFINITY_PLUS'
          return (
            <GlassCard
              key={plan.key}
              neon={isPopular}
              className={`p-6 relative flex flex-col ${isPopular ? 'scale-105 z-10' : ''}`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-neon text-black text-[10px] font-black px-3 py-1 rounded-full tracking-widest">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  {plan.key === 'FREE' && <Star size={16} className="text-slate-400" />}
                  {plan.key === 'PRO' && <Zap size={16} className="text-blue-400" />}
                  {plan.key === 'INFINITY_PLUS' && <Crown size={16} className="text-neon" />}
                  <span className={`text-sm font-bold ${isPopular ? 'text-neon' : 'text-slate-300'}`}>
                    {plan.name}
                  </span>
                </div>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-4xl font-black text-white">
                    {plan.price === 0 ? 'Grátis' : `R$\u00a0${plan.price}`}
                  </span>
                  {plan.price > 0 && <span className="text-slate-500 text-sm mb-1">/mês</span>}
                </div>
                <p className="text-slate-500 text-xs">{plan.description}</p>
              </div>

              <ul className="space-y-2.5 flex-1 mb-6">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-slate-300">
                    <Check size={13} className={isPopular ? 'text-neon flex-shrink-0' : 'text-green-400 flex-shrink-0'} />
                    {f}
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                <div className="text-center text-xs text-slate-500 border border-white/10 rounded-xl py-2.5 font-semibold">
                  Plano atual
                </div>
              ) : (
                <NeonButton
                  variant={isPopular ? 'filled' : 'outline'}
                  className="w-full"
                  loading={loading === plan.key}
                  disabled={plan.ctaDisabled || !!loading}
                  onClick={() => handleCheckout(plan.key)}
                >
                  {plan.cta}
                </NeonButton>
              )}
            </GlassCard>
          )
        })}
      </div>

      <p className="text-center text-xs text-slate-600">
        Pagamento processado com segurança pelo Mercado Pago. Cancele quando quiser.
      </p>
    </div>
  )
}
