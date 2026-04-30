'use client'

import { useState } from 'react'
import {
  Target, CheckSquare, Calendar, FileText, Upload, Check,
  Clock, ChevronRight, Plus, Home, Briefcase
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Mock data                                                           */
/* ------------------------------------------------------------------ */

const ACTIVE_GOALS = [
  {
    id: 'g1',
    category: 'SAÚDE FAMILIAR',
    color: '#16a34a',
    text: 'Regularização da carteira de vacinação das 3 crianças.',
    deadline: 'Prazo: 15Dez',
    progress: 60,
  },
  {
    id: 'g2',
    category: 'EMPREGABILIDADE',
    color: '#0891b2',
    text: 'Inclusão do responsável no curso de capacitação do CRAS.',
    deadline: 'Prazo: 20 Jan',
    progress: 30,
  },
]

const TASKS = [
  { id: 't1', label: 'Ligar para Unidade Básica de Saúde', done: false },
  { id: 't2', label: 'Verificar frequência escolar (Novembro)', done: false },
  { id: 't3', label: 'Solicitar segunda via de RG (Marta)', done: true },
  { id: 't4', label: 'Encaminhar para Benefício Eventual', done: false },
]

const HISTORY = [
  {
    id: 'h1',
    type: 'AGENDADO',
    typeColor: '#0891b2',
    title: 'Retorno e Avaliação de Metas',
    date: '02 Dez 2023 · 14:00',
  },
  {
    id: 'h2',
    type: 'CONCLUÍDO',
    typeColor: '#16a34a',
    title: 'Visita de Acompanhamento',
    date: '10 Nov 2023 · 14:00',
    note: '"Família receptiva, metas de saúde em andamento."',
  },
  {
    id: 'h3',
    type: 'CONCLUÍDO',
    typeColor: '#16a34a',
    title: 'Triagem Inicial e Cadastro',
    date: '25 Out 2023 · 11:00',
  },
]

/* ------------------------------------------------------------------ */
/*  Sub-components                                                      */
/* ------------------------------------------------------------------ */

function ProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mt-2">
      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${value}%`, background: color }} />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */

export default function InterventionsPage() {
  const [tasks, setTasks] = useState(TASKS)
  const [status, setStatus] = useState<'aberta' | 'progresso' | 'resolvida'>('aberta')
  const [visitDate] = useState('11/24/2023')

  function toggleTask(id: string) {
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, done: !t.done } : t))
  }

  return (
    <div className="p-4 lg:p-6 max-w-2xl mx-auto lg:max-w-3xl fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-4">
        <span>Intervenções</span>
        <ChevronRight style={{ width: 12, height: 12 }} />
        <span className="text-slate-600 font-medium">Nova Visita e Planejamento</span>
      </div>

      {/* Page header */}
      <div className="flex items-start justify-between mb-5">
        <h1 className="page-title">Gestão de Intervenção:<br />Família Souza</h1>
        <div className="flex gap-2">
          <button className="px-3 py-2 text-xs border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-1.5 font-medium">
            <FileText style={{ width: 14, height: 14 }} />
            Relatório
          </button>
          <button className="px-3 py-2 text-xs bg-[#1e3a5f] text-white rounded-xl hover:bg-[#163059] transition-colors flex items-center gap-1.5 font-semibold">
            <FileText style={{ width: 14, height: 14 }} />
            Salvar Alterações
          </button>
        </div>
      </div>

      {/* Step 1: Registrar Nova Visita */}
      <div className="glass-card p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#1e3a5f] rounded-xl flex items-center justify-center">
              <Home className="text-white" style={{ width: 18, height: 18 }} />
            </div>
            <div>
              <p className="font-bold text-sm text-[#0f172a]">Registrar Nova Visita Domiciliar</p>
            </div>
          </div>
          <div className="bg-[#1e3a5f] text-white text-[10px] font-bold px-2 py-1 rounded-lg">
            PASSO 1 DE 3
          </div>
        </div>

        <div className="space-y-4">
          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Data da Visita</label>
            <input
              type="date"
              defaultValue="2023-11-24"
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-[#1e3a5f] transition-colors"
            />
          </div>

          {/* Worker */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Técnico Responsável</label>
            <select className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-[#1e3a5f] transition-colors appearance-none">
              <option>Ana Silva (Assistente Social)</option>
              <option>Marcos Lima (Agente de Saúde)</option>
            </select>
          </div>

          {/* Objective */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Objetivo da Intervenção</label>
            <textarea
              rows={3}
              placeholder="Descreva o propósito principal desta visita..."
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#1e3a5f] transition-colors resize-none"
            />
          </div>

          {/* Upload */}
          <div className="border-2 border-dashed border-slate-200 rounded-xl px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <Upload style={{ width: 16, height: 16 }} />
              <span>Anexar evidências (fotos, documentos, assinaturas)</span>
            </div>
            <button className="text-xs font-semibold text-[#1e3a5f] border border-[#1e3a5f] px-3 py-1.5 rounded-lg hover:bg-[#1e3a5f]/5 transition-colors">
              Upload
            </button>
          </div>
        </div>
      </div>

      {/* Active Goals */}
      <div className="glass-card p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="flex items-center gap-2 font-bold text-sm text-[#0f172a]">
            <Target style={{ width: 18, height: 18, color: '#0891b2' }} />
            Metas Ativas
          </h2>
          <button className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-colors">
            <Plus style={{ width: 16, height: 16 }} />
          </button>
        </div>

        <div className="space-y-4">
          {ACTIVE_GOALS.map((g) => (
            <div key={g.id}>
              <div className="flex items-center justify-between mb-1">
                <span
                  className="text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: g.color }}
                >
                  {g.category}
                </span>
                <span className="text-[10px] text-slate-400">{g.deadline}</span>
              </div>
              <p className="text-sm text-slate-600 leading-snug">{g.text}</p>
              <ProgressBar value={g.progress} color={g.color} />
            </div>
          ))}
        </div>
      </div>

      {/* Tasks */}
      <div className="glass-card p-5 mb-4">
        <h2 className="flex items-center gap-2 font-bold text-sm text-[#0f172a] mb-4">
          <CheckSquare style={{ width: 18, height: 18, color: '#0891b2' }} />
          Próximas Tarefas
        </h2>

        <div className="space-y-2.5">
          {tasks.map((task) => (
            <button
              key={task.id}
              onClick={() => toggleTask(task.id)}
              className="w-full flex items-center gap-3 text-left hover:bg-slate-50 rounded-lg p-1.5 transition-colors"
            >
              <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border-2 transition-colors ${
                task.done
                  ? 'bg-[#1e3a5f] border-[#1e3a5f]'
                  : 'border-slate-300'
              }`}>
                {task.done && <Check style={{ width: 12, height: 12, color: 'white' }} />}
              </div>
              <span className={`text-sm ${task.done ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                {task.label}
              </span>
            </button>
          ))}
        </div>

        <button className="mt-3 text-xs text-[#1e3a5f] font-medium hover:underline">
          + Adicionar tarefa rápida...
        </button>
      </div>

      {/* Status */}
      <div className="glass-card p-5 mb-4">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">STATUS DA INTERVENÇÃO</p>
        <div className="space-y-2">
          {([ 
            { key: 'aberta', label: 'Aberta', Icon: Calendar },
            { key: 'progresso', label: 'Em Progresso', Icon: ChevronRight },
            { key: 'resolvida', label: 'Resolvida', Icon: Check },
          ] as const).map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => setStatus(key)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-sm font-medium ${
                status === key
                  ? 'border-[#1e3a5f] bg-[#1e3a5f]/5 text-[#1e3a5f]'
                  : 'border-slate-200 text-slate-500 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon style={{ width: 16, height: 16 }} />
                {label}
              </div>
              {status === key && (
                <div className="w-5 h-5 rounded-full bg-[#1e3a5f] flex items-center justify-center">
                  <Check style={{ width: 12, height: 12, color: 'white' }} />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* History */}
      <div className="glass-card p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-sm text-[#0f172a]">Histórico de Acompanhamento</h2>
          <button className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
              <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
              <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {HISTORY.map((h) => (
            <div key={h.id} className="flex gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: h.typeColor + '20' }}
              >
                {h.type === 'AGENDADO'
                  ? <Calendar style={{ width: 14, height: 14, color: h.typeColor }} />
                  : <Check style={{ width: 14, height: 14, color: h.typeColor }} />}
              </div>
              <div>
                <p
                  className="text-[10px] font-bold uppercase tracking-widest mb-0.5"
                  style={{ color: h.typeColor }}
                >
                  {h.type}
                </p>
                <p className="text-sm font-semibold text-[#0f172a]">{h.title}</p>
                <p className="text-xs text-slate-400 mt-0.5">{h.date}</p>
                {h.note && <p className="text-xs text-slate-500 italic mt-1">{h.note}</p>}
              </div>
            </div>
          ))}
        </div>

        <button className="mt-4 text-xs text-[#1e3a5f] font-semibold hover:underline">
          Ver histórico completo
        </button>
      </div>

      {/* Progress bar */}
      <div className="glass-card p-5 mb-6" style={{ borderLeft: '3px solid #16a34a' }}>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">PROGRESSO DO CASO</p>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-[#0f172a]">Estágio: Monitoramento</p>
          <span className="text-sm font-bold text-[#16a34a]">75%</span>
        </div>
        <ProgressBar value={75} color="#16a34a" />
        <p className="text-xs text-slate-500 mt-3 leading-relaxed">
          Próxima revisão obrigatória em 12 dias. Mantenha os registros de visita atualizados para a métrica de risco.
        </p>
      </div>
    </div>
  )
}
