'use client'

import { useState } from 'react'
import { Search, X, MapPin, Clock, MoreVertical, UserPlus, History } from 'lucide-react'
import Link from 'next/link'
import { getVulnerabilityCategoryLabel } from '@/lib/utils'

/* ------------------------------------------------------------------ */
/*  Mock data                                                           */
/* ------------------------------------------------------------------ */

const MOCK_CITIZENS = [
  {
    id: '1',
    name: 'Maria das Graças Silva',
    cpf: '012.345.678-00',
    age: 68,
    sex: 'F' as const,
    territory: 'Vila Nova, Setor 04',
    lastVisit: '12 Out 2023',
    risk: 'alto' as const,
    avatarSeed: 'F1',
  },
  {
    id: '2',
    name: 'João Paulo Rodrigues',
    cpf: '987.654.321-11',
    age: 42,
    sex: 'M' as const,
    territory: 'Jardim América',
    lastVisit: '05 Jan 2024',
    risk: 'baixo' as const,
    avatarSeed: 'M1',
  },
  {
    id: '3',
    name: 'Luciana Pereira Gomes',
    cpf: '445.667.123-45',
    age: 29,
    sex: 'F' as const,
    territory: 'Vila Esperança',
    lastVisit: '18 Fev 2024',
    risk: 'medio' as const,
    avatarSeed: 'F2',
  },
]

const RECENT_SEARCHES = ['Carlos Eduardo Mendes', 'Família Santos (Setor 04)', 'Bolsa Família Ativos']

const RISK_CONFIG = {
  alto:   { label: 'RISCO\nALTO',   bg: '#dc2626', text: '#fff' },
  medio:  { label: 'RISCO\nMÉDIO',  bg: '#1e3a5f', text: '#fff' },
  baixo:  { label: 'RISCO\nBAIXO',  bg: '#16a34a', text: '#fff' },
  critico:{ label: 'RISCO\nCRÍTICO', bg: '#7c0000', text: '#fff' },
} as const

// Simple avatar placeholder colors per seed
const AVATAR_COLORS: Record<string, string> = {
  F1: '#8b5cf6', M1: '#0891b2', F2: '#ec4899',
}

function RiskBadge({ risk }: { risk: keyof typeof RISK_CONFIG }) {
  const cfg = RISK_CONFIG[risk]
  return (
    <div
      className="flex-shrink-0 rounded-lg px-2 py-1 text-center"
      style={{ background: cfg.bg, minWidth: 60 }}
    >
      {cfg.label.split('\n').map((line, i) => (
        <p key={i} className="text-white font-bold leading-tight" style={{ fontSize: '0.6rem', letterSpacing: '0.05em' }}>
          {line}
        </p>
      ))}
    </div>
  )
}

function CitizenCard({ c }: { c: typeof MOCK_CITIZENS[0] }) {
  return (
    <div className="glass-card card-surface-hover p-4 fade-in">
      {/* Header row */}
      <div className="flex items-start gap-3 mb-3">
        {/* Avatar */}
        <div
          className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-base"
          style={{ background: AVATAR_COLORS[c.avatarSeed] ?? '#64748b' }}
          aria-hidden
        >
          {c.name.split(' ').slice(0, 2).map(w => w[0]).join('')}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-[#0f172a] text-sm leading-snug">{c.name}</p>
          <p className="text-xs text-slate-500 mt-0.5">CPF: {c.cpf}</p>
          <p className="text-xs text-slate-500">{c.age} anos · {c.sex === 'F' ? 'Feminino' : 'Masculino'}</p>
        </div>

        {/* Risk badge */}
        <RiskBadge risk={c.risk} />
      </div>

      {/* Meta */}
      <div className="space-y-1.5 mb-4">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <MapPin style={{ width: 12, height: 12, flexShrink: 0 }} />
          <span>Território: {c.territory}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Clock style={{ width: 12, height: 12, flexShrink: 0 }} />
          <span>Última Visita: {c.lastVisit}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Link
          href={`/citizen/${c.id}`}
          className="flex-1 py-2 text-center text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors uppercase tracking-wide"
        >
          VER PRONTUÁRIO
        </Link>
        <button className="w-9 h-9 flex items-center justify-center border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-400">
          <MoreVertical style={{ width: 16, height: 16 }} />
        </button>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [submitted, setSubmitted] = useState('')
  const [filterRisk, setFilterRisk] = useState<string | null>(null)

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(query.trim())
  }

  function clearSearch() {
    setQuery('')
    setSubmitted('')
    setFilterRisk(null)
  }

  const filtered = MOCK_CITIZENS.filter((c) => {
    const matchQuery = !submitted
      || c.name.toLowerCase().includes(submitted.toLowerCase())
      || c.cpf.includes(submitted)
    const matchRisk = !filterRisk || c.risk === filterRisk
    return matchQuery && matchRisk
  })

  const showResults = submitted !== '' || filterRisk !== null

  return (
    <div className="p-4 lg:p-6 max-w-2xl mx-auto lg:max-w-4xl fade-in">
      {/* Header */}
      <div className="page-header mb-5">
        <h1 className="page-title">Busca Unificada de Cidadãos</h1>
        <p className="page-subtitle">Consulte registros por Nome, CPF ou Cartão Nacional de Saúde (CNS).</p>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="mb-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              style={{ width: 18, height: 18 }}
            />
            <input
              id="citizen-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ex: Maria Oliveira ou 123.4..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 text-sm focus:outline-none focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/12 transition-all shadow-sm"
              aria-label="Busca por nome, CPF ou CNS"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-[#1e3a5f] text-white text-sm font-bold rounded-xl hover:bg-[#163059] transition-colors shadow-sm"
          >
            BUSCAR
          </button>
        </div>
      </form>

      {/* Filter chips */}
      <div className="flex items-center gap-2 flex-wrap mb-5">
        {[
          { id: null, label: 'Limpar Filtros' },
          { id: 'territory', label: '📍 Território' },
          { id: 'alto', label: '⚠ Risco' },
        ].map((f) => (
          <button
            key={f.id ?? 'clear'}
            onClick={() => {
              if (f.id === null) clearSearch()
              else setFilterRisk(f.id === filterRisk ? null : f.id)
            }}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              (f.id && filterRisk === f.id)
                ? 'bg-[#1e3a5f] text-white border-[#1e3a5f]'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Results */}
      {showResults && (
        <div className="space-y-4 mb-6">
          {filtered.map((c) => <CitizenCard key={c.id} c={c} />)}
          {filtered.length === 0 && (
            <div className="glass-card p-12 text-center">
              <Search className="mx-auto mb-3 text-slate-300" style={{ width: 36, height: 36 }} />
              <p className="text-slate-500 font-medium">Nenhum cidadão encontrado</p>
              <p className="text-slate-400 text-sm mt-1">Verifique o nome, CPF ou CNS e tente novamente.</p>
            </div>
          )}
        </div>
      )}

      {/* Recent searches + empty state */}
      {!showResults && (
        <div className="glass-card p-6 fade-in">
          <div className="flex items-center gap-2 text-slate-500 mb-4">
            <History style={{ width: 18, height: 18 }} />
            <span className="text-sm font-semibold">Buscas Recentes</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {RECENT_SEARCHES.map((s) => (
              <button
                key={s}
                onClick={() => { setQuery(s); setSubmitted(s) }}
                className="text-sm px-3 py-1.5 border border-slate-200 rounded-full text-slate-600 hover:bg-slate-50 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* FAB */}
      <Link
        href="/citizen/new"
        aria-label="Cadastrar novo cidadão"
        className="fixed bottom-20 lg:bottom-6 right-4 lg:right-6 w-14 h-14 bg-[#1e3a5f] rounded-full flex items-center justify-center shadow-xl hover:bg-[#163059] transition-colors z-30"
      >
        <UserPlus className="text-white" style={{ width: 22, height: 22 }} />
      </Link>
    </div>
  )
}
