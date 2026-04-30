'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts'
import { TrendingUp, Users, Activity, AlertTriangle, ArrowUpRight } from 'lucide-react'

const VULN_DISTRIBUTION = [
  { name: 'Baixo', value: 612, color: '#10b981' },
  { name: 'Médio', value: 583, color: '#f59e0b' },
  { name: 'Mod.-Alto', value: 282, color: '#f97316' },
  { name: 'Crítico', value: 117, color: '#ef4444' },
]

const DSS_TRENDS = [
  { month: 'Jun', moradia: 52, renda: 68, saneamento: 41, alimentacao: 38 },
  { month: 'Jul', moradia: 51, renda: 65, saneamento: 43, alimentacao: 40 },
  { month: 'Ago', moradia: 53, renda: 64, saneamento: 44, alimentacao: 42 },
  { month: 'Set', moradia: 50, renda: 62, saneamento: 46, alimentacao: 41 },
  { month: 'Out', moradia: 48, renda: 61, saneamento: 47, alimentacao: 43 },
  { month: 'Nov', moradia: 47, renda: 59, saneamento: 48, alimentacao: 45 },
]

const VISITS_BY_MONTH = [
  { month: 'Jun', visitas: 187 },
  { month: 'Jul', visitas: 203 },
  { month: 'Ago', visitas: 198 },
  { month: 'Set', visitas: 224 },
  { month: 'Out', visitas: 241 },
  { month: 'Nov', visitas: 267 },
]

const TOP_CID = [
  { cid: 'I10', diagnosis: 'Hipertensão', count: 489 },
  { cid: 'E11', diagnosis: 'Diabetes Mellitus', count: 312 },
  { cid: 'F41', diagnosis: 'Transt. Ansiedade', count: 198 },
  { cid: 'J45', diagnosis: 'Asma', count: 124 },
  { cid: 'K21', diagnosis: 'Doença do Refluxo', count: 98 },
]

function MetricCard({ label, value, sub, icon: Icon, trend }: { label: string; value: string; sub?: string; icon: any; trend?: string }) {
  return (
    <div className="glass-card rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-slate-400 text-sm">{label}</p>
        <Icon className="w-4 h-4 text-cyan-400" />
      </div>
      <p className="text-2xl font-bold text-white mb-0.5">{value}</p>
      {sub && <p className="text-slate-500 text-xs">{sub}</p>}
      {trend && (
        <div className="flex items-center gap-1 mt-2 text-emerald-400 text-xs">
          <ArrowUpRight className="w-3 h-3" />
          {trend}
        </div>
      )}
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-card rounded-lg px-3 py-2 text-xs">
      <p className="text-slate-300 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  )
}

export default function AnalyticsPage() {
  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Analytics & Inteligência em Saúde</h1>
        <p className="text-slate-400 text-sm">
          Painel gerencial — Salvador-BA · Atualizado em {new Date().toLocaleDateString('pt-BR')}
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard label="Cidadãos Ativos" value="1.594" sub="Base total monitorada" icon={Users} trend="+4,2% vs. mês anterior" />
        <MetricCard label="Score Médio Vuln." value="49,3" sub="0–100 (maior = mais vuln.)" icon={Activity} />
        <MetricCard label="Visitas no Mês" value="267" sub="Novembro 2024" icon={TrendingUp} trend="+11% vs. outubro" />
        <MetricCard label="Alertas Abertos" value="89" sub="Requerem intervenção" icon={AlertTriangle} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Vulnerability distribution */}
        <div className="glass-card rounded-xl p-6">
          <h2 className="text-sm font-semibold text-white mb-4">Distribuição de Vulnerabilidade</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={VULN_DISTRIBUTION}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {VULN_DISTRIBUTION.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {VULN_DISTRIBUTION.map((d) => (
              <div key={d.name} className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                <span className="text-slate-400">{d.name}</span>
                <span className="text-slate-300 ml-auto">{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Visits trend */}
        <div className="lg:col-span-2 glass-card rounded-xl p-6">
          <h2 className="text-sm font-semibold text-white mb-4">Visitas Domiciliares — Últimos 6 Meses</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={VISITS_BY_MONTH} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="visitas" name="Visitas" fill="url(#barGrad)" radius={[4, 4, 0, 0]} />
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0ea5e9" />
                    <stop offset="100%" stopColor="#14b8a6" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* DSS Trends */}
      <div className="glass-card rounded-xl p-6 mb-6">
        <h2 className="text-sm font-semibold text-white mb-4">Tendência dos Determinantes Sociais (% vulnerabilidade por fator)</h2>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={DSS_TRENDS}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} domain={[30, 80]} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
              <Line type="monotone" dataKey="moradia" name="Moradia" stroke="#0ea5e9" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="renda" name="Renda" stroke="#f59e0b" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="saneamento" name="Saneamento" stroke="#10b981" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="alimentacao" name="Alimentação" stroke="#f97316" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top CID-10 */}
      <div className="glass-card rounded-xl p-6">
        <h2 className="text-sm font-semibold text-white mb-4">Top 5 CID-10 — Prevalência</h2>
        <div className="space-y-3">
          {TOP_CID.map((item, i) => (
            <div key={item.cid} className="flex items-center gap-4">
              <span className="text-slate-600 text-sm w-5 text-center">{i + 1}</span>
              <code className="text-xs bg-slate-800 px-2 py-0.5 rounded text-cyan-400 flex-shrink-0">{item.cid}</code>
              <span className="text-slate-300 text-sm flex-1">{item.diagnosis}</span>
              <div className="flex items-center gap-3">
                <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full"
                    style={{ width: `${(item.count / 489) * 100}%` }}
                  />
                </div>
                <span className="text-slate-400 text-xs w-8 text-right">{item.count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
