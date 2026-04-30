'use client'

import { useState, useEffect } from 'react'
import {
  Target, Check, Clock, ChevronRight, Plus, AlertCircle, Loader2, Calendar,
  CheckSquare, Users,
} from 'lucide-react'
import Link from 'next/link'

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

interface Intervention {
  id: string
  citizenId: string
  citizenName: string
  citizenTerritory?: string | null
  workerName: string
  title: string
  plan: string
  status: 'aberto' | 'em_andamento' | 'suspenso' | 'concluido'
  followUps: Array<{ date: string; note: string; workerName: string }>
  createdAt: string
  updatedAt: string
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

const STATUS_CONFIG = {
  aberto:       { label: 'Aberto',       bg: '#dbeafe', text: '#1d4ed8', dot: '#3b82f6' },
  em_andamento: { label: 'Em Andamento', bg: '#dcfce7', text: '#15803d', dot: '#22c55e' },
  suspenso:     { label: 'Suspenso',     bg: '#fef3c7', text: '#b45309', dot: '#f59e0b' },
  concluido:    { label: 'Concluído',    bg: '#f0fdf4', text: '#166534', dot: '#16a34a' },
} as const

function StatusBadge({ status }: { status: keyof typeof STATUS_CONFIG }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
      style={{ background: cfg.bg, color: cfg.text }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />
      {cfg.label}
    </span>
  )
}

function InterventionCard({ item, onStatusChange }: {
  item: Intervention
  onStatusChange: (id: string, status: Intervention['status']) => void
}) {
  const [changing, setChanging] = useState(false)

  async function handleConclude() {
    if (!confirm('Marcar intervenção como concluída?')) return
    setChanging(true)
    try {
      await fetch(`/api/interventions/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'concluido' }),
      })
      onStatusChange(item.id, 'concluido')
    } finally {
      setChanging(false)
    }
  }

  return (
    <div className="glass-card card-surface-hover p-5 fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <p className="font-bold text-[#0f172a] text-sm leading-snug mb-0.5">{item.title}</p>
          <p className="text-xs text-slate-500">
            Cidadão:{' '}
            <Link href={`/citizen/${item.citizenId}`} className="text-[#1e3a5f] hover:underline font-medium">
              {item.citizenName}
            </Link>
            {item.citizenTerritory && ` · ${item.citizenTerritory}`}
          </p>
        </div>
        <StatusBadge status={item.status} />
      </div>

      {/* Plan excerpt */}
      <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 mb-3">{item.plan}</p>

      {/* Meta */}
      <div className="flex items-center gap-4 text-xs text-slate-400 mb-4">
        <span className="flex items-center gap-1">
          <Users style={{ width: 12, height: 12 }} />
          {item.workerName}
        </span>
        <span className="flex items-center gap-1">
          <Calendar style={{ width: 12, height: 12 }} />
          {new Date(item.createdAt).toLocaleDateString('pt-BR')}
        </span>
        {item.followUps.length > 0 && (
          <span className="flex items-center gap-1">
            <CheckSquare style={{ width: 12, height: 12 }} />
            {item.followUps.length} acompan.
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Link
          href={`/citizen/${item.citizenId}`}
          className="flex-1 text-center py-2 text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors uppercase tracking-wide"
        >
          VER PRONTUÁRIO
        </Link>
        {item.status !== 'concluido' && (
          <button
            onClick={handleConclude}
            disabled={changing}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#16a34a] border border-[#16a34a] rounded-lg hover:bg-green-50 transition-colors disabled:opacity-50"
          >
            {changing ? <Loader2 className="animate-spin" style={{ width: 12, height: 12 }} /> : <Check style={{ width: 12, height: 12 }} />}
            Concluir
          </button>
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */

export default function InterventionsPage() {
  const [interventions, setInterventions] = useState<Intervention[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('ativas')

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams()
        if (statusFilter === 'ativas') params.set('status', 'em_andamento')
        else if (statusFilter === 'abertas') params.set('status', 'aberto')
        else if (statusFilter === 'concluidas') params.set('status', 'concluido')

        const res = await fetch(`/api/interventions?${params}`)
        if (!res.ok) throw new Error('Erro ao carregar intervenções')
        const json = await res.json()
        // API returns { data: [...], error: null } — unwrap if needed
        const data = Array.isArray(json) ? json : (json.data ?? [])
        setInterventions(data)
      } catch {
        setError('Não foi possível carregar as intervenções.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [statusFilter])

  function handleStatusChange(id: string, status: Intervention['status']) {
    setInterventions((prev) => prev.map((i) => i.id === id ? { ...i, status } : i))
  }

  const FILTERS = [
    { key: 'ativas', label: 'Em Andamento' },
    { key: 'abertas', label: 'Abertas' },
    { key: 'concluidas', label: 'Concluídas' },
    { key: 'todas', label: 'Todas' },
  ]

  const stats = {
    total: interventions.length,
    ativas: interventions.filter((i) => i.status === 'em_andamento').length,
    abertas: interventions.filter((i) => i.status === 'aberto').length,
  }

  return (
    <div className="p-4 lg:p-6 max-w-2xl mx-auto lg:max-w-4xl fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="page-title">Gestão de Intervenções</h1>
          <p className="page-subtitle">Acompanhamento de planos de intervenção social ativos.</p>
        </div>
        <Link
          href="/citizen/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1e3a5f] text-white text-xs font-semibold rounded-xl hover:bg-[#163059] transition-colors shadow-sm"
        >
          <Plus style={{ width: 14, height: 14 }} />
          Nova
        </Link>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: 'Total', value: stats.total, color: '#1e3a5f', icon: Target },
          { label: 'Em Andamento', value: stats.ativas, color: '#16a34a', icon: Clock },
          { label: 'Abertas', value: stats.abertas, color: '#0891b2', icon: AlertCircle },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="stat-card fade-in">
            <div className="flex items-center justify-between mb-2">
              <p className="stat-label">{label}</p>
              <Icon style={{ width: 14, height: 14, color }} />
            </div>
            <p className="stat-value" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Status filter */}
      <div className="flex gap-2 flex-wrap mb-5">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setStatusFilter(f.key)}
            className={`text-xs px-4 py-2 rounded-full border transition-colors font-medium ${
              statusFilter === f.key
                ? 'bg-[#1e3a5f] text-white border-[#1e3a5f]'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card p-5 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-slate-200 rounded w-1/2 mb-4" />
              <div className="h-3 bg-slate-200 rounded w-full mb-1" />
              <div className="h-3 bg-slate-200 rounded w-2/3" />
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-100 rounded-xl p-4">
          <AlertCircle style={{ width: 16, height: 16 }} />
          {error}
        </div>
      )}

      {/* Results */}
      {!loading && !error && (
        <div className="space-y-4">
          {interventions.map((item) => (
            <InterventionCard key={item.id} item={item} onStatusChange={handleStatusChange} />
          ))}
          {interventions.length === 0 && (
            <div className="glass-card p-12 text-center">
              <ChevronRight className="mx-auto mb-3 text-slate-300" style={{ width: 36, height: 36 }} />
              <p className="text-slate-500 font-medium">Nenhuma intervenção encontrada</p>
              <p className="text-slate-400 text-sm mt-1">
                {statusFilter === 'ativas' ? 'Nenhuma intervenção em andamento.' : 'Sem registros para o filtro selecionado.'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
