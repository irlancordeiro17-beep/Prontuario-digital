'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { Search, X, MapPin, Clock, MoreVertical, UserPlus, History, Loader2, AlertCircle } from 'lucide-react'
import Link from 'next/link'

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

interface CitizenResult {
  id: string
  name: string
  cpf?: string | null
  cns: string
  age: number
  sex: 'M' | 'F'
  territory?: string
  ubs: string
  lastVisit?: string
  vulnerabilityScore?: {
    score: number
    category: string
  }
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

function maskCpf(cpf?: string | null): string {
  if (!cpf) return '—'
  const d = cpf.replace(/\D/g, '')
  if (d.length !== 11) return '***.***.***-**'
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-**`
}

const RISK_CONFIG = {
  critico:      { label: ['RISCO', 'CRÍTICO'],  bg: '#7c0000', text: '#fff' },
  moderado_alto:{ label: ['RISCO', 'ALTO'],     bg: '#dc2626', text: '#fff' },
  medio:        { label: ['RISCO', 'MÉDIO'],    bg: '#1e3a5f', text: '#fff' },
  baixo:        { label: ['RISCO', 'BAIXO'],    bg: '#16a34a', text: '#fff' },
} as const

const AVATAR_PALLETE = ['#8b5cf6', '#0891b2', '#ec4899', '#1e3a5f', '#0d9488', '#f59e0b']

function getAvatarColor(name: string): string {
  let hash = 0
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) & 0xffffffff
  return AVATAR_PALLETE[Math.abs(hash) % AVATAR_PALLETE.length]
}

function RiskBadge({ category }: { category: string }) {
  const cfg = RISK_CONFIG[category as keyof typeof RISK_CONFIG] ?? RISK_CONFIG.baixo
  return (
    <div
      className="flex-shrink-0 rounded-lg px-2 py-1 text-center"
      style={{ background: cfg.bg, minWidth: 60 }}
    >
      {cfg.label.map((line, i) => (
        <p key={i} className="text-white font-bold leading-tight" style={{ fontSize: '0.6rem', letterSpacing: '0.05em' }}>
          {line}
        </p>
      ))}
    </div>
  )
}

function CitizenCard({ c }: { c: CitizenResult }) {
  const initials = c.name.split(' ').slice(0, 2).map((w) => w[0]).join('')
  const lastVisitLabel = c.lastVisit
    ? new Date(c.lastVisit).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'Sem visita registrada'

  return (
    <div className="glass-card card-surface-hover p-4 fade-in">
      <div className="flex items-start gap-3 mb-3">
        <div
          className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-base"
          style={{ background: getAvatarColor(c.name) }}
          aria-hidden
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-[#0f172a] text-sm leading-snug">{c.name}</p>
          <p className="text-xs text-slate-500 mt-0.5">CPF: {maskCpf(c.cpf)}</p>
          <p className="text-xs text-slate-500">{c.age} anos · {c.sex === 'F' ? 'Feminino' : 'Masculino'}</p>
        </div>
        {c.vulnerabilityScore && <RiskBadge category={c.vulnerabilityScore.category} />}
      </div>

      <div className="space-y-1.5 mb-4">
        {c.territory && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <MapPin style={{ width: 12, height: 12, flexShrink: 0 }} />
            <span>Território: {c.territory}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Clock style={{ width: 12, height: 12, flexShrink: 0 }} />
          <span>Última Visita: {lastVisitLabel}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href={`/citizen/${c.id}`}
          className="flex-1 py-2 text-center text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors uppercase tracking-wide"
        >
          VER PRONTUÁRIO
        </Link>
        <button
          className="w-9 h-9 flex items-center justify-center border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-400"
          aria-label="Mais opções"
        >
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
  const [filterRisk, setFilterRisk] = useState<string | null>(null)
  const [results, setResults] = useState<CitizenResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchResults = useCallback(async (q: string, risk: string | null) => {
    if (!q && !risk) {
      setResults([])
      setSearched(false)
      return
    }

    setLoading(true)
    setError(null)
    setSearched(true)

    try {
      const params = new URLSearchParams()
      if (q) params.set('q', q)
      if (risk) params.set('risk', risk)

      const res = await fetch(`/api/citizens?${params.toString()}`)
      if (!res.ok) throw new Error('Erro ao buscar cidadãos')
      const data: CitizenResult[] = await res.json()
      setResults(data)
    } catch (err) {
      setError('Não foi possível buscar os dados. Tente novamente.')
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Debounced auto-search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      fetchResults(query, filterRisk)
    }, 400)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, filterRisk, fetchResults])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (debounceRef.current) clearTimeout(debounceRef.current)
    fetchResults(query.trim(), filterRisk)
  }

  function clearSearch() {
    setQuery('')
    setFilterRisk(null)
    setResults([])
    setSearched(false)
    setError(null)
  }

  const RISK_FILTERS = [
    { id: 'critico', label: '🔴 Crítico' },
    { id: 'moderado_alto', label: '🟠 Risco Alto' },
    { id: 'medio', label: '🔵 Médio' },
    { id: 'baixo', label: '🟢 Baixo' },
  ]

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
              className="w-full pl-10 pr-10 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 text-sm focus:outline-none focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/12 transition-all shadow-sm"
              aria-label="Busca por nome, CPF ou CNS"
              autoComplete="off"
            />
            {query && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label="Limpar busca"
              >
                <X style={{ width: 16, height: 16 }} />
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-[#1e3a5f] text-white text-sm font-bold rounded-xl hover:bg-[#163059] transition-colors shadow-sm disabled:opacity-60"
          >
            {loading ? <Loader2 className="animate-spin" style={{ width: 18, height: 18 }} /> : 'BUSCAR'}
          </button>
        </div>
      </form>

      {/* Filter chips */}
      <div className="flex items-center gap-2 flex-wrap mb-5">
        {RISK_FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilterRisk(filterRisk === f.id ? null : f.id)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              filterRisk === f.id
                ? 'bg-[#1e3a5f] text-white border-[#1e3a5f]'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {f.label}
          </button>
        ))}
        {(query || filterRisk) && (
          <button
            onClick={clearSearch}
            className="text-xs px-3 py-1.5 rounded-full border border-slate-200 text-slate-400 hover:bg-slate-50 transition-colors"
          >
            Limpar Filtros
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-100 rounded-xl p-4 mb-4">
          <AlertCircle style={{ width: 16, height: 16, flexShrink: 0 }} />
          {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-4 mb-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card p-4 animate-pulse">
              <div className="flex gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-48" />
                  <div className="h-3 bg-slate-200 rounded w-36" />
                  <div className="h-3 bg-slate-200 rounded w-28" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {!loading && searched && (
        <div className="space-y-4 mb-6">
          {results.map((c) => <CitizenCard key={c.id} c={c} />)}
          {results.length === 0 && !error && (
            <div className="glass-card p-12 text-center">
              <Search className="mx-auto mb-3 text-slate-300" style={{ width: 36, height: 36 }} />
              <p className="text-slate-500 font-medium">Nenhum cidadão encontrado</p>
              <p className="text-slate-400 text-sm mt-1">Verifique o nome, CPF ou CNS e tente novamente.</p>
            </div>
          )}
        </div>
      )}

      {/* Empty state (initial) */}
      {!searched && !loading && (
        <div className="glass-card p-6 fade-in">
          <div className="flex items-center gap-2 text-slate-500 mb-3">
            <Search style={{ width: 18, height: 18 }} />
            <span className="text-sm font-semibold">Digite para buscar</span>
          </div>
          <p className="text-sm text-slate-400">
            A busca é realizada em tempo real. Digite o nome completo ou parcial, CPF ou CNS do cidadão.
          </p>
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
