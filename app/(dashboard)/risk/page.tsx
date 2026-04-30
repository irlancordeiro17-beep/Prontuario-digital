'use client'

import { AlertTriangle, Users, Activity, CheckSquare, MapPin, TrendingUp, Clock, Eye } from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Mock data                                                           */
/* ------------------------------------------------------------------ */

const METRICS = {
  altoRisco: 142,
  altoRiscoChange: '+12% este mês',
  familias: 3840,
  familiasCoverage: '85% cobertas',
  idhLabel: 'Médio-Baixo',
  intervencoes: 218,
  intervStatus: 'Normal',
}

const TERRITORY_TABLE = [
  { name: 'Vila Nova - Unidade II', inseguranca: '42.4%', desemprego: '18.2%' },
  { name: 'Centro - Unidade I',     inseguranca: '12.8%', desemprego: '8.4%' },
  { name: 'Jardim das Flores',       inseguranca: '28.9%', desemprego: '14.1%' },
]

const URGENT_ALERTS = [
  {
    id: 'a1',
    tag: 'VIOLÊNCIA DOMÉSTICA SUSPEITA',
    tagColor: '#dc2626',
    time: 'Há 25 min',
    family: 'Família Oliveira (ID: 8842)',
    desc: 'Notificação automática via rede de ensino: ausência escolar prolongada e marcas de...',
    btnLabel: 'Designar Equipe',
    btnColor: '#dc2626',
  },
  {
    id: 'a2',
    tag: 'DESPEJO IMINENTE',
    tagColor: '#ea580c',
    time: 'Há 2 horas',
    family: 'Família Santos (ID: 1029)',
    desc: 'Ação judicial de reintegração de posse em área de risco geológico.',
    btnLabel: 'Ver Detalhes',
    btnColor: '#1e3a5f',
  },
  {
    id: 'a3',
    tag: 'ACOMPANHAMENTO NUTRICIONAL',
    tagColor: '#d97706',
    time: 'Há 3 horas',
    family: 'Priscila Albuquerque (ID: 5521)',
    desc: 'Déficit de adequação alimentar abaixo do limiar crítico...',
    btnLabel: null,
    btnColor: '',
  },
]

/* ------------------------------------------------------------------ */
/*  Sub-components                                                      */
/* ------------------------------------------------------------------ */

function StatCard({
  label, value, sub, Icon, iconBg,
}: {
  label: string
  value: string | number
  sub?: string
  Icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  iconBg: string
}) {
  return (
    <div className="stat-card fade-in">
      <div className="flex items-start justify-between mb-3">
        <p className="stat-label">{label}</p>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: iconBg }}>
          <Icon style={{ width: 16, height: 16, color: 'white' }} />
        </div>
      </div>
      <p className="stat-value">{value}</p>
      {sub && <p className="stat-change-badge mt-1">{sub}</p>}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */

export default function RiskDashboardPage() {
  return (
    <div className="p-4 lg:p-6 max-w-2xl mx-auto lg:max-w-5xl fade-in">
      {/* Header */}
      <div className="page-header mb-6">
        <h1 className="page-title">Painel de Vigilância Territorial</h1>
        <p className="page-subtitle">Monitoramento de vulnerabilidades e alertas críticos em tempo real.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard
          label="ALTO RISCO"
          value={METRICS.altoRisco}
          sub={`↗ ${METRICS.altoRiscoChange}`}
          Icon={AlertTriangle}
          iconBg="#dc2626"
        />
        <StatCard
          label="FAMÍLIAS MONITORADAS"
          value={METRICS.familias.toLocaleString('pt-BR')}
          sub={`✓ ${METRICS.familiasCoverage}`}
          Icon={Users}
          iconBg="#0891b2"
        />
        <StatCard
          label="VULNERABILIDADE IDH"
          value={METRICS.idhLabel}
          Icon={Activity}
          iconBg="#7c3aed"
        />
        <StatCard
          label="INTERVENÇÕES ATIVAS"
          value={METRICS.intervencoes}
          sub={`Status: ${METRICS.intervStatus}`}
          Icon={CheckSquare}
          iconBg="#16a34a"
        />
      </div>

      {/* Heatmap */}
      <div className="glass-card p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-[#0f172a]">Mapa de Calor Territorial</h2>
          <button className="text-xs px-3 py-1.5 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
            Filtrar por Distrito
          </button>
        </div>

        {/* Heatmap visual placeholder */}
        <div className="relative rounded-xl overflow-hidden bg-[#1a1a2e]" style={{ height: 220 }}>
          {/* Gradient blobs simulating heat */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="absolute w-32 h-32 rounded-full bg-red-500/50 blur-3xl" style={{ left: '40%', top: '25%' }} />
            <div className="absolute w-24 h-24 rounded-full bg-orange-400/40 blur-2xl" style={{ left: '25%', top: '40%' }} />
            <div className="absolute w-20 h-20 rounded-full bg-yellow-400/30 blur-xl" style={{ left: '60%', top: '50%' }} />
            <div className="absolute w-16 h-16 rounded-full bg-green-500/20 blur-xl" style={{ left: '15%', top: '20%' }} />
            {/* Grid lines */}
            {[...Array(6)].map((_, i) => (
              <div key={`h${i}`} className="absolute w-full border-t border-white/5" style={{ top: `${(i + 1) * 16}%` }} />
            ))}
            {[...Array(8)].map((_, i) => (
              <div key={`v${i}`} className="absolute h-full border-l border-white/5" style={{ left: `${(i + 1) * 12}%` }} />
            ))}
            {/* Critical label */}
            <div className="absolute bg-red-600/90 text-white text-xs font-bold px-2 py-1 rounded"
                 style={{ left: '42%', top: '28%' }}>
              ▏ SETOR CRÍTICO: NORTE 04
            </div>
          </div>

          {/* Legend */}
          <div className="absolute bottom-3 right-3 bg-white/90 rounded-lg px-3 py-2 space-y-1">
            {[
              { label: 'Risco Extremo', color: '#dc2626' },
              { label: 'Risco Moderado', color: '#f97316' },
              { label: 'Estável', color: '#16a34a' },
            ].map(({ label, color }) => (
              <div key={label} className="flex items-center gap-2 text-xs text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Vulnerability Indicators Table */}
      <div className="glass-card p-5 mb-6">
        <h2 className="text-base font-bold text-[#0f172a] mb-4">Indicadores de Vulnerabilidade</h2>
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th className="text-left rounded-tl-lg">TERRITÓRIO / CRAS</th>
                <th className="text-right">INSEGURANÇA ALIMENTAR</th>
                <th className="text-right rounded-tr-lg">DESEMPREGO ESTRUTURAL</th>
              </tr>
            </thead>
            <tbody>
              {TERRITORY_TABLE.map((row) => (
                <tr key={row.name} className="cursor-pointer">
                  <td className="font-medium text-[#0f172a]">{row.name}</td>
                  <td className="text-right">
                    <span className={`font-semibold ${parseFloat(row.inseguranca) > 30 ? 'text-red-600' : 'text-slate-700'}`}>
                      {row.inseguranca}
                    </span>
                  </td>
                  <td className="text-right">
                    <span className={`font-semibold ${parseFloat(row.desemprego) > 15 ? 'text-orange-600' : 'text-slate-700'}`}>
                      {row.desemprego}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Priority Alerts */}
      <div className="glass-card p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="flex items-center gap-2 text-base font-bold text-[#0f172a]">
            <span className="text-yellow-500">⚡</span>
            Prioridade Urgente
          </h2>
          <span className="bg-red-100 text-red-700 text-xs font-bold px-2.5 py-1 rounded-full border border-red-200">
            8 ALERTAS
          </span>
        </div>

        <div className="space-y-4">
          {URGENT_ALERTS.map((alert) => (
            <div
              key={alert.id}
              className="border border-slate-100 rounded-xl p-4"
              style={{ borderLeftWidth: 3, borderLeftColor: alert.tagColor }}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className="text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: alert.tagColor }}
                >
                  {alert.tag}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock style={{ width: 12, height: 12 }} />
                  {alert.time}
                </span>
              </div>
              <p className="text-sm font-semibold text-[#0f172a] mb-1">{alert.family}</p>
              <p className="text-xs text-slate-500 leading-relaxed mb-3">{alert.desc}</p>
              {alert.btnLabel && (
                <div className="flex items-center gap-2">
                  <button
                    className="text-xs text-white font-semibold px-4 py-2 rounded-lg transition-opacity hover:opacity-90"
                    style={{ background: alert.btnColor }}
                  >
                    {alert.btnLabel}
                  </button>
                  <button className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-colors">
                    <Eye style={{ width: 14, height: 14 }} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <button className="w-full mt-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
          VER TODOS OS ALERTAS HISTÓRICOS
        </button>
      </div>
    </div>
  )
}
