// lib/services/analytics.ts — Prontuário Social

import { prisma } from '@/lib/prisma'
import { startOfMonth, subMonths, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export async function getAnalyticsMetrics(ubs?: string) {
  const citizenWhere: any = { active: true }
  if (ubs) citizenWhere.ubs = ubs

  const now = new Date()
  const monthStart = startOfMonth(now)

  const [
    totalCitizens,
    activeInterventions,
    openAlerts,
    criticalCitizens,
    visitsThisMonth,
    avgScore,
  ] = await Promise.all([
    prisma.citizen.count({ where: citizenWhere }),
    prisma.intervention.count({ where: { status: { in: ['aberto', 'em_andamento'] } } }),
    prisma.riskAlert.count({ where: { resolvedAt: null } }),
    prisma.vulnerabilityScore.count({ where: { category: 'critico', citizen: citizenWhere } }),
    prisma.visitRecord.count({ where: { date: { gte: monthStart } } }),
    prisma.vulnerabilityScore.aggregate({
      _avg: { score: true },
      where: { citizen: citizenWhere },
    }),
  ])

  // Vulnerability distribution
  const vulnGroups = await prisma.vulnerabilityScore.groupBy({
    by: ['category'],
    _count: { category: true },
    where: { citizen: citizenWhere },
  })

  const distribution: Record<string, number> = { baixo: 0, medio: 0, moderado_alto: 0, critico: 0 }
  for (const g of vulnGroups) {
    if (g.category in distribution) distribution[g.category] = g._count.category
  }

  // Visits per month — last 6 months
  const visitsByMonth: { month: string; visitas: number }[] = []
  for (let i = 5; i >= 0; i--) {
    const start = startOfMonth(subMonths(now, i))
    const end = i === 0 ? now : startOfMonth(subMonths(now, i - 1))
    const count = await prisma.visitRecord.count({
      where: { date: { gte: start, lt: end } },
    })
    visitsByMonth.push({
      month: format(start, 'MMM', { locale: ptBR }),
      visitas: count,
    })
  }

  // Top CID-10 diagnoses
  const topCid = await prisma.clinicalEntry.groupBy({
    by: ['cid10', 'diagnosis'],
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 5,
  })

  // DSS averages
  const socialAgg = await prisma.socialRecord.aggregate({
    _avg: {
      housingQuality: true,
      sanitationLevel: true,
      foodSecurity: true,
      monthlyIncome: true,
    },
  })

  return {
    population: {
      totalCitizens,
      activeInterventions,
      openAlerts,
      criticalCitizens,
      visitsThisMonth,
      avgVulnerabilityScore: Math.round(avgScore._avg.score ?? 0),
    },
    distribution: [
      { name: 'Baixo', value: distribution.baixo, color: '#10b981' },
      { name: 'Médio', value: distribution.medio, color: '#f59e0b' },
      { name: 'Mod.-Alto', value: distribution.moderado_alto, color: '#f97316' },
      { name: 'Crítico', value: distribution.critico, color: '#ef4444' },
    ],
    visitsByMonth,
    topCid: topCid.map((c) => ({
      cid: c.cid10,
      diagnosis: c.diagnosis,
      count: c._count.id,
    })),
    dssAverages: {
      housingQuality: Math.round(socialAgg._avg.housingQuality ?? 0),
      sanitationLevel: Math.round((socialAgg._avg.sanitationLevel ?? 0) * 20), // normalize 1-5 → 0-100
      foodSecurity: Math.round((socialAgg._avg.foodSecurity ?? 0) * 20),
      monthlyIncome: Math.round(socialAgg._avg.monthlyIncome ?? 0),
    },
  }
}
