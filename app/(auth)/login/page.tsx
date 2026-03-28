'use client'

import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'
import { AlertCircle, Eye, EyeOff, Loader2, Zap } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('E-mail ou senha inválidos. Verifique seus dados e tente novamente.')
      } else if (result?.ok) {
        router.push('/dashboard/opportunities')
        router.refresh()
      }
    } catch {
      setError('Erro inesperado. Tente novamente em alguns instantes.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-2rem)]">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="glass rounded-2xl border border-white/10 p-8 shadow-[0_0_60px_rgba(0,229,255,0.05)]">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-neon flex items-center justify-center">
              <Zap size={20} className="text-black" />
            </div>
            <div className="text-left">
              <span className="font-bold text-white text-xl tracking-tight block leading-none">
                Performance <span className="text-neon">Pregão</span>
              </span>
              <span className="text-slate-500 text-xs">Inteligência em Licitações</span>
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">Bem-vindo de volta</h1>
            <p className="text-slate-400 text-sm">
              Entre na sua conta para acessar as oportunidades
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-6">
              <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com.br"
                className="input-neon w-full rounded-xl px-4 py-3 text-sm"
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Sua senha"
                  className="input-neon w-full rounded-xl px-4 py-3 pr-12 text-sm"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Forgot password */}
            <div className="flex justify-end">
              <a href="#" className="text-neon text-sm hover:text-neon/80 transition-colors">
                Esqueceu a senha?
              </a>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full bg-neon text-black font-bold py-3.5 rounded-xl hover:shadow-neon hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar na Plataforma'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-slate-600 text-xs">ou</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Register CTA */}
          <p className="text-center text-slate-500 text-sm">
            Não tem uma conta?{' '}
            <Link href="/" className="text-neon font-semibold hover:text-neon/80 transition-colors">
              Criar conta grátis
            </Link>
          </p>
        </div>

        {/* Back to landing */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-slate-600 hover:text-slate-400 text-sm transition-colors inline-flex items-center gap-1"
          >
            ← Voltar para a página inicial
          </Link>
        </div>
      </div>
    </div>
  )
}
