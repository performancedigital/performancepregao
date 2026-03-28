import { GlassCard } from '@/components/ui/GlassCard'
import { Clock, FileCheck, Scale, ShieldCheck, Sparkles } from 'lucide-react'

const upcomingFeatures = [
  {
    icon: FileCheck,
    title: 'Checklist de Habilitação',
    description:
      'Gere automaticamente um checklist de documentos de habilitação com base nos requisitos do edital.',
  },
  {
    icon: ShieldCheck,
    title: 'Validação de Certidões',
    description:
      'Alertas automáticos sobre vencimento de certidões fiscais, trabalhistas e previdenciárias.',
  },
  {
    icon: Scale,
    title: 'Análise de Cláusulas',
    description:
      'IA identifica cláusulas restritivas, abusivas ou que exijam atenção especial da área jurídica.',
  },
  {
    icon: Sparkles,
    title: 'Geração de Impugnações',
    description:
      'Assistente para redigir impugnações de edital com base nas cláusulas identificadas como problemáticas.',
  },
]

export default function JuridicoPage() {
  return (
    <div className="space-y-6">
      {/* Main coming soon card */}
      <GlassCard className="p-12 text-center border border-neon-purple/20">
        <div className="relative inline-block mb-6">
          <div className="w-20 h-20 rounded-2xl bg-neon-purple/10 border border-neon-purple/20 flex items-center justify-center mx-auto">
            <Scale size={36} className="text-neon-purple" />
          </div>
          <div className="absolute -top-2 -right-2 bg-neon-purple text-white text-[10px] font-black px-2 py-1 rounded-full">
            EM BREVE
          </div>
        </div>

        <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full px-4 py-2 mb-5">
          <Clock size={14} className="text-yellow-400" />
          <span className="text-yellow-400 text-xs font-semibold">Lançamento previsto para Q2 2025</span>
        </div>

        <h2 className="text-3xl font-black text-white mb-4">
          Módulo <span className="text-neon-purple">Jurídico</span>
        </h2>
        <p className="text-slate-400 text-base leading-relaxed max-w-2xl mx-auto mb-8">
          Um módulo completo de conformidade e assessoria jurídica powered by IA para garantir que
          sua empresa esteja sempre apta a participar de qualquer disputa, sem surpresas de última hora.
        </p>

        {/* Progress indicator */}
        <div className="max-w-sm mx-auto mb-2">
          <div className="flex justify-between text-xs text-slate-500 mb-2">
            <span>Desenvolvimento</span>
            <span>72% concluído</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-neon-purple to-neon rounded-full"
              style={{ width: '72%' }}
            />
          </div>
        </div>
      </GlassCard>

      {/* Upcoming features */}
      <div>
        <h3 className="text-white font-bold text-base mb-4 flex items-center gap-2">
          <Sparkles size={16} className="text-neon-purple" />
          O que está chegando
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          {upcomingFeatures.map((feat) => (
            <GlassCard key={feat.title} className="p-5 border border-white/10 hover:border-neon-purple/20 transition-all">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-neon-purple/10 border border-neon-purple/20 flex items-center justify-center flex-shrink-0">
                  <feat.icon size={18} className="text-neon-purple" />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-sm mb-2">{feat.title}</h4>
                  <p className="text-slate-400 text-xs leading-relaxed">{feat.description}</p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Notify me CTA */}
      <GlassCard className="p-6 border border-white/10 text-center">
        <p className="text-slate-400 text-sm mb-4">
          Quer ser notificado quando o módulo Jurídico for lançado?
        </p>
        <button className="bg-neon-purple text-white font-semibold px-6 py-2.5 rounded-xl hover:opacity-90 transition-opacity text-sm">
          Me notificar quando lançar
        </button>
      </GlassCard>
    </div>
  )
}
