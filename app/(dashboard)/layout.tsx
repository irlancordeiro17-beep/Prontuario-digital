'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Search,
  AlertTriangle,
  ClipboardList,
  BarChart3,
  LogOut,
  ShieldCheck,
  Bell,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Role } from '@/types'

const navItems = [
  { href: '/search', label: 'Busca', icon: Search, roles: ['admin', 'gestor', 'agente_saude'] },
  { href: '/risk', label: 'Risco', icon: AlertTriangle, roles: ['admin', 'gestor', 'agente_saude'] },
  { href: '/interventions', label: 'Intervenção', icon: ClipboardList, roles: ['admin', 'gestor', 'agente_saude'] },
  { href: '/analytics', label: 'Gestão', icon: BarChart3, roles: ['admin', 'gestor'] },
]

const roleLabels: Record<Role, string> = {
  admin: 'Administrador',
  gestor: 'Gestor',
  agente_saude: 'Agente de Saúde',
}

const IS_DEV = process.env.NEXT_PUBLIC_DEV_AUTH_BYPASS === 'true'

// Demo fallback user — used when no session and no real DB configured
const DEMO_USER = {
  name: 'Ana Silva',
  email: 'ana.silva@ubs.gov.br',
  role: 'gestor' as Role,
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const pathname = usePathname()

  // Use demo user when: no real session exists (demo/dev mode)
  const useDemoUser = !session?.user
  const userName = session?.user?.name ?? DEMO_USER.name
  const role = ((session?.user as any)?.role ?? DEMO_USER.role) as Role | undefined
  const visibleNav = navItems.filter((item) => !role || item.roles.includes(role))

  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* ============ SIDEBAR — Desktop ============ */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#0f2444] fixed inset-y-0 left-0 z-40">
        {/* Brand */}
        <div className="px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-none tracking-tight">Prontuário Social</p>
              <p className="text-xs text-white/40 mt-0.5">CEPEDI · v1.2.0</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin" aria-label="Navegação principal">
          {visibleNav.map((item) => {
            const active = pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn('sidebar-nav-item', active && 'active')}
                aria-current={active ? 'page' : undefined}
              >
                <item.icon className="w-4.5 h-4.5 flex-shrink-0" style={{ width: 18, height: 18 }} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-white/10 space-y-1">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl mb-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{userName}</p>
              <p className="text-xs text-white/40 truncate">{role ? roleLabels[role] : ''}</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="sidebar-nav-item w-full text-left hover:text-red-300"
          >
            <LogOut style={{ width: 16, height: 16 }} />
            Sair
          </button>
        </div>
      </aside>

      {/* ============ MOBILE TOP BAR ============ */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#0f2444] flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-bold text-[#0f2444]">Prontuário Social</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center relative">
            <Bell className="w-4.5 h-4.5 text-slate-600" style={{ width: 18, height: 18 }} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
            <span className="text-white text-xs font-bold">{initials}</span>
          </div>
        </div>
      </header>

      {/* ============ MAIN CONTENT ============ */}
      <main className="flex-1 lg:pl-64">
        {/* spacer for mobile top bar */}
        <div className="pt-[57px] lg:pt-0 pb-20 lg:pb-0 min-h-screen">
          {children}
        </div>
      </main>

      {/* ============ BOTTOM NAV — Mobile ============ */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bottom-nav"
        aria-label="Navegação mobile"
      >
        <div className="flex">
          {visibleNav.map((item) => {
            const active = pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex-1 flex flex-col items-center justify-center gap-0.5 py-3 text-xs font-medium transition-colors',
                  active ? 'text-[#1e3a5f]' : 'text-slate-400'
                )}
                aria-current={active ? 'page' : undefined}
              >
                <item.icon
                  className={cn('mb-0.5', active ? 'text-[#1e3a5f]' : 'text-slate-400')}
                  style={{ width: 22, height: 22 }}
                />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
