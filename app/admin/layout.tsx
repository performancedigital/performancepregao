import { ReactNode } from 'react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role

  if (!session || !['ADMIN', 'SUPERADMIN'].includes(role)) {
    redirect('/dashboard/opportunities')
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Admin top bar */}
      <div className="border-b border-yellow-400/20 bg-yellow-400/5 px-6 py-2.5 flex items-center gap-3">
        <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" />
        <span className="text-yellow-400 text-xs font-bold tracking-wider uppercase">
          Painel Administrativo
        </span>
        <span className="text-slate-500 text-xs">•</span>
        <a href="/dashboard/opportunities" className="text-slate-500 text-xs hover:text-white transition-colors">
          ← Voltar ao Dashboard
        </a>
        <div className="ml-auto">
          <span className="text-slate-500 text-xs">{(session.user as any)?.email}</span>
        </div>
      </div>

      {/* Admin sidebar + content */}
      <div className="flex min-h-[calc(100vh-44px)]">
        {/* Admin sidebar */}
        <aside className="w-52 border-r border-white/10 bg-dark-800 flex flex-col py-6 px-3 gap-1">
          {[
            { href: '/admin', label: 'Visão Geral' },
            { href: '/admin/users', label: 'Usuários' },
            { href: '/admin/portals', label: 'Portais' },
          ].map(item => (
            <a key={item.href} href={item.href}
              className="px-3 py-2 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all">
              {item.label}
            </a>
          ))}
        </aside>

        {/* Content */}
        <main className="flex-1 p-8 overflow-x-hidden">{children}</main>
      </div>
    </div>
  )
}
