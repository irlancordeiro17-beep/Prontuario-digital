'use client'

import { useQuery } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  User,
  Heart,
  Pill,
  Home,
  ClipboardList,
  AlertTriangle,
  Calendar,
  Shield,
  Activity,
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  calculateAge,
  formatCNS,
  formatDateShort,
  maskCPF,
  getVulnerabilityColor,
  getVulnerabilityCategoryLabel,
  getSeverityColor,
  formatCurrency,
} from '@/lib/utils'
import type { CitizenSummary, ClinicalEntry, Prescription, SocialRecord, VulnerabilityScore, Intervention } from '@/types'

interface CitizenDetail extends CitizenSummary {
  clinicalHistory: ClinicalEntry[]
  prescriptions: Prescription[]
  socialRecord?: SocialRecord
  interventions: Intervention[]
}

const MOCK_CITIZEN: CitizenDetail = {
  id: '1',
  cns: '7074032856498810',
  cpf: '04583276104',
  name: 'Maria das Graças Oliveira',
  sex: 'F',
  dateOfBirth: '1967-03-14',
  age: 57,
  ubs: 'UBS Periperi',
  territory: 'Subúrbio Ferroviário',
  active: true,
  createdAt: '2023-01-10',
  updatedAt: '2024-11-25',
  lastVisit: '2024-11-20',
  consultationsPerYear: 8,
  vulnerabilityScore: {
    id: 'vs1',
    citizenId: '1',
    score: 71,
    category: 'moderado_alto',
    factors: {
      housingQuality: 45,
      incomeNormalized: 82,
      sanitationNormalized: 60,
      foodSecurityNormalized: 65,
    },
    calculatedAt: '2024-11-25',
  },
  clinicalHistory: [
    { id: 'c1', citizenId: '1', cid10: 'I10', diagnosis: 'Hipertensão Arterial Sistêmica', diagnosedAt: '2015-06-01', status: 'em_acompanhamento' },
    { id: 'c2', citizenId: '1', cid10: 'E11', diagnosis: 'Diabetes Mellitus tipo 2', diagnosedAt: '2018-02-01', status: 'em_acompanhamento' },
    { id: 'c3', citizenId: '1', cid10: 'F41.1', diagnosis: 'Transtorno de Ansiedade Generalizada', diagnosedAt: '2021-09-01', status: 'psicossocial' },
  ],
  prescriptions: [
    { id: 'p1', citizenId: '1', medication: 'Losartana Potássica', dosage: '50mg', frequency: '1x/dia', route: 'Oral', status: 'ativo' },
    { id: 'p2', citizenId: '1', medication: 'Metformina', dosage: '850mg', frequency: '2x/dia', route: 'Oral', status: 'ativo' },
    { id: 'p3', citizenId: '1', medication: 'Escitalopram', dosage: '10mg', frequency: '1x/dia', route: 'Oral', status: 'ativo' },
  ],
  socialRecord: {
    id: 'sr1',
    citizenId: '1',
    housingQuality: 45,
    monthlyIncome: 1412,
    sanitationLevel: 3,
    foodSecurity: 2,
    educationLevel: 'fundamental',
    employmentStatus: 'informal',
    updatedAt: '2024-10-15',
  },
  interventions: [],
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    em_acompanhamento: 'bg-blue-100 text-blue-700 border-blue-200',
    controlado: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    psicossocial: 'bg-purple-100 text-purple-700 border-purple-200',
    inativo: 'bg-slate-100 text-slate-500 border-slate-200',
    ativo: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    suspenso: 'bg-orange-100 text-orange-700 border-orange-200',
    concluido: 'bg-slate-100 text-slate-500 border-slate-200',
  }
  const labels: Record<string, string> = {
    em_acompanhamento: 'Em Acompanhamento',
    controlado: 'Controlado',
    psicossocial: 'Psicossocial',
    inativo: 'Inativo',
    ativo: 'Ativo',
    suspenso: 'Suspenso',
    concluido: 'Concluído',
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border ${map[status] ?? 'bg-slate-100 text-slate-600 border-slate-200'}`}>
      {labels[status] ?? status}
    </span>
  )
}

export default function CitizenDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  // In production, replace MOCK_CITIZEN with real API call
  const { data: citizen, isLoading } = useQuery<CitizenDetail>({
    queryKey: ['citizen', id],
    queryFn: async () => {
      const res = await fetch(`/api/citizens/${id}`)
      if (!res.ok) throw new Error('Cidadão não encontrado')
      return res.json()
    },
    // Fallback to mock during development
    placeholderData: MOCK_CITIZEN,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-[#1e3a5f] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!citizen) return <div className="p-8 text-slate-500">Prontuário não encontrado.</div>

  const age = calculateAge(citizen.dateOfBirth)
  const cat = citizen.vulnerabilityScore?.category ?? 'baixo'
  const score = citizen.vulnerabilityScore?.score ?? 0

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto fade-in">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-slate-400 hover:text-[#1e3a5f] text-sm mb-5 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar à busca
      </button>

      {/* Hero card */}
      <div className="glass-card p-5 mb-5">
        <div className="flex flex-col md:flex-row md:items-start gap-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 border border-blue-200 flex items-center justify-center flex-shrink-0">
            <User className="w-7 h-7 text-[#1e3a5f]" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <h1 className="text-xl font-bold text-[#0f172a]">{citizen.name}</h1>
              <Badge className={`border ${getSeverityColor(cat)} text-xs`}>
                {getVulnerabilityCategoryLabel(cat)}
              </Badge>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div>
                <p className="text-slate-400 text-xs">Idade</p>
                <p className="text-slate-700 font-medium">{age} anos</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">Sexo</p>
                <p className="text-slate-700 font-medium">{citizen.sex === 'F' ? 'Feminino' : 'Masculino'}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">CNS</p>
                <p className="text-slate-700 font-mono text-xs">{formatCNS(citizen.cns)}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">CPF</p>
                <p className="text-slate-700 font-mono text-xs">{maskCPF(citizen.cpf)}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">UBS</p>
                <p className="text-slate-700 font-medium">{citizen.ubs}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">Território</p>
                <p className="text-slate-700 font-medium">{citizen.territory ?? '—'}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">Nascimento</p>
                <p className="text-slate-700 font-medium">{formatDateShort(citizen.dateOfBirth)}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">Consultas/ano</p>
                <p className="text-slate-700 font-medium">{citizen.consultationsPerYear ?? '—'}</p>
              </div>
            </div>
          </div>

          {/* Score */}
          <div className="flex-shrink-0 min-w-[150px]">
            <p className="text-slate-400 text-xs mb-2 text-right">Score de Vulnerabilidade</p>
            <div className="text-right mb-2">
              <span className={`text-3xl font-bold ${getVulnerabilityColor(cat)}`}>{score}</span>
              <span className="text-slate-400 text-lg">/100</span>
            </div>
            <Progress
              value={score}
              className="h-2 bg-slate-100"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="clinical">
        <TabsList className="bg-white border border-slate-200 rounded-xl p-1 w-full mb-5 shadow-sm">
          <TabsTrigger value="clinical" className="flex-1 text-xs data-[state=active]:bg-[#1e3a5f] data-[state=active]:text-white rounded-lg">
            <Heart className="w-3.5 h-3.5 mr-1.5" /> Clínico
          </TabsTrigger>
          <TabsTrigger value="prescriptions" className="flex-1 text-xs data-[state=active]:bg-[#1e3a5f] data-[state=active]:text-white rounded-lg">
            <Pill className="w-3.5 h-3.5 mr-1.5" /> Prescrições
          </TabsTrigger>
          <TabsTrigger value="social" className="flex-1 text-xs data-[state=active]:bg-[#1e3a5f] data-[state=active]:text-white rounded-lg">
            <Home className="w-3.5 h-3.5 mr-1.5" /> DSS
          </TabsTrigger>
          <TabsTrigger value="interventions" className="flex-1 text-xs data-[state=active]:bg-[#1e3a5f] data-[state=active]:text-white rounded-lg">
            <ClipboardList className="w-3.5 h-3.5 mr-1.5" /> Intervenções
          </TabsTrigger>
        </TabsList>

        {/* Clinical History */}
        <TabsContent value="clinical">
          <div className="glass-card p-5">
            <h2 className="text-sm font-bold text-[#0f172a] mb-4 flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-500" /> Histórico Clínico
            </h2>
            {citizen.clinicalHistory.length === 0 ? (
              <p className="text-slate-500 text-sm">Nenhum registro clínico.</p>
            ) : (
              <div className="space-y-3">
                {citizen.clinicalHistory.map((entry) => (
                  <div key={entry.id} className="flex items-start justify-between py-3 border-b border-slate-100 last:border-0">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <code className="cid-code">{entry.cid10}</code>
                        <span className="text-[#0f172a] text-sm font-medium">{entry.diagnosis}</span>
                      </div>
                      <p className="text-slate-400 text-xs">
                        Diagnóstico: {formatDateShort(entry.diagnosedAt)}
                      </p>
                      {entry.notes && <p className="text-slate-500 text-xs mt-1 italic">"{entry.notes}"</p>}
                    </div>
                    <StatusBadge status={entry.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Prescriptions */}
        <TabsContent value="prescriptions">
          <div className="glass-card p-5">
            <h2 className="text-sm font-bold text-[#0f172a] mb-4 flex items-center gap-2">
              <Pill className="w-4 h-4 text-blue-600" /> Prescrições Ativas
            </h2>
            {citizen.prescriptions.length === 0 ? (
              <p className="text-slate-500 text-sm">Nenhuma prescrição registrada.</p>
            ) : (
              <div className="space-y-3">
                {citizen.prescriptions.map((rx) => (
                  <div key={rx.id} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                    <div>
                      <p className="text-[#0f172a] text-sm font-semibold">{rx.medication}</p>
                      <p className="text-slate-400 text-xs mt-0.5">
                        {rx.dosage} · {rx.frequency} · Via {rx.route}
                      </p>
                    </div>
                    <StatusBadge status={rx.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* DSS */}
        <TabsContent value="social">
          <div className="glass-card p-5">
            <h2 className="text-sm font-bold text-[#0f172a] mb-4 flex items-center gap-2">
              <Home className="w-4 h-4 text-emerald-600" /> Determinantes Sociais da Saúde
            </h2>
            {!citizen.socialRecord ? (
              <p className="text-slate-500 text-sm">Nenhum registro social disponível.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[
                  { label: 'Qualidade da Moradia', value: citizen.socialRecord.housingQuality, max: 100, unit: 'pts' },
                  { label: 'Renda Mensal', value: citizen.socialRecord.monthlyIncome, max: null, unit: 'R$', currency: true },
                  { label: 'Saneamento Básico', value: citizen.socialRecord.sanitationLevel, max: 5, unit: '/5' },
                  { label: 'Segurança Alimentar', value: citizen.socialRecord.foodSecurity, max: 5, unit: '/5' },
                ].map(({ label, value, max, unit, currency }) => (
                  <div key={label}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-500">{label}</span>
                      <span className="text-[#0f172a] font-semibold">
                        {currency ? formatCurrency(value) : `${value} ${unit}`}
                      </span>
                    </div>
                    {max && (
                      <Progress
                        value={(value / max) * 100}
                        className="h-1.5 bg-slate-100"
                      />
                    )}
                  </div>
                ))}
                <div>
                  <p className="text-slate-500 text-sm mb-1">Escolaridade</p>
                  <p className="text-[#0f172a] text-sm font-medium capitalize">{citizen.socialRecord.educationLevel ?? '—'}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-sm mb-1">Situação de Emprego</p>
                  <p className="text-[#0f172a] text-sm font-medium capitalize">{citizen.socialRecord.employmentStatus ?? '—'}</p>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Interventions */}
        <TabsContent value="interventions">
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-[#0f172a] flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-[#1e3a5f]" /> Histórico de Intervenções
              </h2>
              <Button
                size="sm"
                className="bg-[#1e3a5f] text-white hover:bg-[#163059] text-xs h-8"
              >
                + Nova Intervenção
              </Button>
            </div>
            {citizen.interventions.length === 0 ? (
              <p className="text-slate-500 text-sm">Nenhuma intervenção registrada ainda.</p>
            ) : (
              <p className="text-slate-600 text-sm">Intervenções listadas aqui.</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
