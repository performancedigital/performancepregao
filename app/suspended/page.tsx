import Link from 'next/link'
import { AlertTriangle, ArrowLeft, Mail } from 'lucide-react'

export default function SuspendedPage() {
  return (
    <div className="min-h-screen bg-black grid-bg flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-md w-full">
        <div className="backdrop-blur-md bg-white/5 border border-red-500/20 rounded-2xl p-10 text-center shadow-[0_0_60px_rgba(239,68,68,0.08)]">
          {/* Warning icon */}
          <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle size={36} className="text-red-400" />
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-full px-4 py-1.5 mb-5">
            <div className="w-2 h-2 bg-red-400 rounded-full" />
            <span className="text-red-400 text-xs font-bold tracking-wider uppercase">
              Conta Suspensa
            </span>
          </div>

          <h1 className="text-2xl font-black text-white mb-4">Sua conta foi suspensa</h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-8">
            Sua conta foi temporariamente suspensa por nossa equipe de moderação. Isso pode ter
            ocorrido por uma violação dos nossos termos de uso ou um problema no seu método de
            pagamento.
          </p>

          {/* What to do */}
          <div className="bg-white/5 rounded-xl p-4 mb-8 text-left space-y-3">
            <p className="text-white font-semibold text-sm">O que fazer agora?</p>
            <ul className="space-y-2">
              {[
                'Verifique se seu pagamento está em dia',
                'Leia nossos Termos de Uso',
                'Entre em contato com o suporte',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-slate-400 text-xs">
                  <span className="text-red-400 mt-0.5">→</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* CTAs */}
          <div className="space-y-3">
            <a
              href="mailto:suporte@performancepregao.online?subject=Conta%20Suspensa%20%E2%80%94%20Solicitar%20Revisão"
              className="flex items-center justify-center gap-2 w-full bg-red-500 text-white font-semibold py-3 rounded-xl hover:bg-red-400 transition-colors text-sm"
            >
              <Mail size={16} />
              Contatar Suporte
            </a>
            <Link
              href="/"
              className="flex items-center justify-center gap-2 w-full border border-white/10 text-slate-400 hover:text-white hover:border-white/20 font-medium py-3 rounded-xl transition-all text-sm"
            >
              <ArrowLeft size={16} />
              Voltar ao início
            </Link>
          </div>

          <p className="text-slate-600 text-xs mt-6">
            suporte@performancepregao.online &bull; Resposta em até 24h úteis
          </p>
        </div>
      </div>
    </div>
  )
}
