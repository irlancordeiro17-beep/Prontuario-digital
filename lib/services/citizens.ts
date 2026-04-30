// lib/services/citizens.ts — Prontuário Social
// Server-side data access — wraps Prisma, never imported in client components

import { prisma } from '@/lib/prisma'
import { calculateAge } from '@/lib/utils'
import type { CitizenSummary } from '@/types'

export interface CitizenSearchParams {
  q?: string
  ubs?: string
  territory?: string
  take?: number
  skip?: number
}

export async function searchCitizens(params: CitizenSearchParams): Promise<CitizenSummary[]> {
  const { q, ubs, territory, take = 20, skip = 0 } = params

  const where: any = { active: true }

  if (q) {
    const digits = q.replace(/\D/g, '')
    const orConditions: any[] = [{ name: { contains: q, mode: 'insensitive' } }]
    if (digits.length >= 3) {
      orConditions.push({ cns: { contains: digits } })
      orConditions.push({ cpf: { contains: digits } })
    }
    where.OR = orConditions
  }

  if (ubs) {
    where.ubs = { contains: ubs, mode: 'insensitive' }
  }

  if (territory) {
    where.territory = { contains: territory, mode: 'insensitive' }
  }

  const citizens = await prisma.citizen.findMany({
    where,
    take,
    skip,
    orderBy: [
      { vulnerabilityScore: { score: 'desc' } },
      { name: 'asc' },
    ],
    include: {
      vulnerabilityScore: true,
      visits: {
        orderBy: { date: 'desc' },
        take: 1,
        select: { date: true },
      },
    },
  })

  return citizens.map((c) => ({
    id: c.id,
    cns: c.cns,
    cpf: c.cpf,
    name: c.name,
    sex: c.sex as 'M' | 'F',
    dateOfBirth: c.dateOfBirth.toISOString(),
    age: calculateAge(c.dateOfBirth.toISOString()),
    ubs: c.ubs,
    territory: c.territory ?? undefined,
    active: c.active,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
    lastVisit: c.visits[0]?.date?.toISOString(),
    vulnerabilityScore: c.vulnerabilityScore
      ? {
          id: c.vulnerabilityScore.id,
          citizenId: c.vulnerabilityScore.citizenId,
          score: c.vulnerabilityScore.score,
          category: c.vulnerabilityScore.category as any,
          factors: c.vulnerabilityScore.factors as any,
          calculatedAt: c.vulnerabilityScore.calculatedAt.toISOString(),
        }
      : undefined,
  }))
}

export async function getCitizenById(id: string) {
  const citizen = await prisma.citizen.findUnique({
    where: { id, active: true },
    include: {
      clinicalHistory: {
        orderBy: { diagnosedAt: 'desc' },
      },
      prescriptions: {
        where: { status: { not: 'concluido' } },
        orderBy: { createdAt: 'desc' },
      },
      socialRecord: true,
      vulnerabilityScore: true,
      visits: {
        orderBy: { date: 'desc' },
        take: 10,
        include: {
          worker: { select: { name: true } },
        },
      },
      interventions: {
        orderBy: { updatedAt: 'desc' },
        include: {
          worker: { select: { name: true } },
        },
      },
      riskAlerts: {
        where: { resolvedAt: null },
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  })

  if (!citizen) return null

  return {
    citizen: {
      id: citizen.id,
      cns: citizen.cns,
      cpf: citizen.cpf,
      name: citizen.name,
      sex: citizen.sex as 'M' | 'F',
      dateOfBirth: citizen.dateOfBirth.toISOString(),
      age: calculateAge(citizen.dateOfBirth.toISOString()),
      ubs: citizen.ubs,
      territory: citizen.territory ?? undefined,
      active: citizen.active,
      createdAt: citizen.createdAt.toISOString(),
      updatedAt: citizen.updatedAt.toISOString(),
    },
    clinicalHistory: citizen.clinicalHistory.map((c) => ({
      id: c.id,
      citizenId: c.citizenId,
      cid10: c.cid10,
      diagnosis: c.diagnosis,
      diagnosedAt: c.diagnosedAt.toISOString(),
      status: c.status as any,
      notes: c.notes ?? undefined,
    })),
    prescriptions: citizen.prescriptions.map((p) => ({
      id: p.id,
      citizenId: p.citizenId,
      medication: p.medication,
      dosage: p.dosage,
      frequency: p.frequency,
      route: p.route,
      status: p.status as any,
    })),
    socialRecord: citizen.socialRecord
      ? {
          id: citizen.socialRecord.id,
          citizenId: citizen.socialRecord.citizenId,
          housingQuality: citizen.socialRecord.housingQuality,
          monthlyIncome: citizen.socialRecord.monthlyIncome,
          sanitationLevel: citizen.socialRecord.sanitationLevel,
          foodSecurity: citizen.socialRecord.foodSecurity,
          educationLevel: citizen.socialRecord.educationLevel ?? undefined,
          employmentStatus: citizen.socialRecord.employmentStatus ?? undefined,
          notes: citizen.socialRecord.notes ?? undefined,
          updatedAt: citizen.socialRecord.updatedAt.toISOString(),
        }
      : null,
    vulnerabilityScore: citizen.vulnerabilityScore
      ? {
          id: citizen.vulnerabilityScore.id,
          citizenId: citizen.vulnerabilityScore.citizenId,
          score: citizen.vulnerabilityScore.score,
          category: citizen.vulnerabilityScore.category as any,
          factors: citizen.vulnerabilityScore.factors as any,
          calculatedAt: citizen.vulnerabilityScore.calculatedAt.toISOString(),
        }
      : null,
    visits: citizen.visits.map((v) => ({
      id: v.id,
      citizenId: v.citizenId,
      workerId: v.workerId,
      workerName: v.worker.name,
      type: v.type as any,
      date: v.date.toISOString(),
      notes: v.notes ?? undefined,
    })),
    interventions: citizen.interventions.map((i) => ({
      id: i.id,
      citizenId: i.citizenId,
      workerId: i.workerId,
      workerName: i.worker.name,
      title: i.title,
      plan: i.plan,
      status: i.status as any,
      followUps: (i.followUps as any[]) ?? [],
      createdAt: i.createdAt.toISOString(),
      updatedAt: i.updatedAt.toISOString(),
    })),
    riskAlerts: citizen.riskAlerts.map((a) => ({
      id: a.id,
      citizenId: a.citizenId,
      severity: a.severity as any,
      category: a.category as any,
      description: a.description,
      resolvedAt: a.resolvedAt?.toISOString(),
      createdAt: a.createdAt.toISOString(),
    })),
  }
}
