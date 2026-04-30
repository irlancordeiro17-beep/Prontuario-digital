// lib/services/risk.ts — Prontuário Social

import { prisma } from '@/lib/prisma'

export async function getRiskAlerts(filters: { ubs?: string; severity?: string; take?: number }) {
  const { ubs, severity, take = 30 } = filters

  const where: any = { resolvedAt: null }
  if (severity) where.severity = severity

  // Filter by UBS via citizen join
  const rows = await prisma.riskAlert.findMany({
    where,
    take,
    orderBy: [
      { severity: 'desc' },
      { createdAt: 'desc' },
    ],
    include: {
      citizen: {
        select: { name: true, ubs: true, territory: true },
      },
    },
  })

  const filtered = ubs ? rows.filter((r) => r.citizen.ubs === ubs) : rows

  return filtered.map((a) => ({
    id: a.id,
    citizenId: a.citizenId,
    citizenName: a.citizen.name,
    citizenTerritory: a.citizen.territory,
    severity: a.severity as any,
    category: a.category as any,
    description: a.description,
    resolvedAt: a.resolvedAt?.toISOString(),
    createdAt: a.createdAt.toISOString(),
  }))
}

export async function getRiskMetrics(ubs?: string) {
  const citizenWhere: any = { active: true }
  if (ubs) citizenWhere.ubs = ubs

  const [
    totalCritical,
    totalHigh,
    totalCitizens,
    activeInterventions,
    openAlerts,
  ] = await Promise.all([
    prisma.vulnerabilityScore.count({ where: { category: 'critico', citizen: citizenWhere } }),
    prisma.vulnerabilityScore.count({ where: { category: 'moderado_alto', citizen: citizenWhere } }),
    prisma.citizen.count({ where: citizenWhere }),
    prisma.intervention.count({ where: { status: { in: ['aberto', 'em_andamento'] } } }),
    prisma.riskAlert.count({ where: { resolvedAt: null } }),
  ])

  // Vulnerability distribution
  const vulnCounts = await prisma.vulnerabilityScore.groupBy({
    by: ['category'],
    _count: { category: true },
    where: { citizen: citizenWhere },
  })

  const distribution = { baixo: 0, medio: 0, moderado_alto: 0, critico: 0 }
  for (const row of vulnCounts) {
    const key = row.category as keyof typeof distribution
    if (key in distribution) distribution[key] = row._count.category
  }

  // Territory vulnerability table
  const territories = await prisma.citizen.groupBy({
    by: ['territory'],
    _count: { id: true },
    where: { ...citizenWhere, territory: { not: null } },
    orderBy: { _count: { id: 'desc' } },
    take: 5,
  })

  return {
    totalCritical,
    totalHigh,
    totalCitizens,
    activeInterventions,
    openAlerts,
    distribution,
    territories: territories.map((t) => ({
      name: t.territory ?? 'Sem território',
      count: t._count.id,
    })),
  }
}

export async function resolveAlert(id: string) {
  await prisma.riskAlert.update({
    where: { id },
    data: { resolvedAt: new Date() },
  })
}
