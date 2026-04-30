import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateAge(dateOfBirth: string): number {
  const birth = new Date(dateOfBirth)
  const now = new Date()
  let age = now.getFullYear() - birth.getFullYear()
  const m = now.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--
  return age
}

export function formatCNS(cns: string): string {
  if (!cns) return '—'
  const cleaned = cns.replace(/\D/g, '')
  if (cleaned.length !== 15) return cns
  return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 7)} ${cleaned.slice(7, 11)} ${cleaned.slice(11)}`
}

export function formatCPF(cpf: string): string {
  if (!cpf) return '—'
  const cleaned = cpf.replace(/\D/g, '')
  if (cleaned.length !== 11) return cpf
  return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`
}

export function maskCPF(cpf: string): string {
  if (!cpf) return '—'
  const cleaned = cpf.replace(/\D/g, '')
  if (cleaned.length !== 11) return cpf
  return `${cleaned.slice(0, 3)}.***.***-${cleaned.slice(9)}`
}

export function formatDateShort(date: string): string {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('pt-BR')
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export function getVulnerabilityColor(category: string): string {
  const map: Record<string, string> = {
    baixo: 'text-emerald-600',
    moderado: 'text-amber-600',
    moderado_alto: 'text-orange-600',
    alto: 'text-red-600',
    critico: 'text-red-700',
  }
  return map[category] ?? 'text-slate-500'
}

export function getVulnerabilityBadgeClass(category: string): string {
  const map: Record<string, string> = {
    baixo: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    moderado: 'bg-amber-100 text-amber-700 border-amber-200',
    moderado_alto: 'bg-orange-100 text-orange-700 border-orange-200',
    alto: 'bg-red-100 text-red-700 border-red-200',
    critico: 'bg-red-200 text-red-800 border-red-300',
  }
  return map[category] ?? 'bg-slate-100 text-slate-600 border-slate-200'
}

export function getVulnerabilityCategoryLabel(category: string): string {
  const map: Record<string, string> = {
    baixo: 'Risco Baixo',
    moderado: 'Risco Médio',
    moderado_alto: 'Risco Médio-Alto',
    alto: 'Risco Alto',
    critico: 'Risco Crítico',
  }
  return map[category] ?? category
}

export function getSeverityColor(severity: string): string {
  const map: Record<string, string> = {
    baixo: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    medio: 'bg-amber-100 text-amber-700 border-amber-200',
    alto: 'bg-orange-100 text-orange-700 border-orange-200',
    critico: 'bg-red-100 text-red-700 border-red-200',
    // aliases
    moderado: 'bg-amber-100 text-amber-700 border-amber-200',
    moderado_alto: 'bg-orange-100 text-orange-700 border-orange-200',
  }
  return map[severity] ?? 'bg-slate-100 text-slate-600 border-slate-200'
}
