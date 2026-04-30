// lib/services/interventions.ts — Prontuário Social

import { prisma } from '@/lib/prisma'
import type { InterventionFormData, FollowUpFormData } from '@/types'

export async function listInterventions(filters: {
  workerId?: string
  citizenId?: string
  status?: string
  take?: number
}) {
  const { workerId, citizenId, status, take = 30 } = filters

  const where: any = {}
  if (workerId) where.workerId = workerId
  if (citizenId) where.citizenId = citizenId
  if (status) where.status = status

  const rows = await prisma.intervention.findMany({
    where,
    take,
    orderBy: { updatedAt: 'desc' },
    include: {
      citizen: { select: { name: true, territory: true } },
      worker: { select: { name: true } },
    },
  })

  return rows.map((i) => ({
    id: i.id,
    citizenId: i.citizenId,
    citizenName: i.citizen.name,
    citizenTerritory: i.citizen.territory,
    workerId: i.workerId,
    workerName: i.worker.name,
    title: i.title,
    plan: i.plan,
    status: i.status as any,
    followUps: (i.followUps as any[]) ?? [],
    createdAt: i.createdAt.toISOString(),
    updatedAt: i.updatedAt.toISOString(),
  }))
}

export async function getIntervention(id: string) {
  const row = await prisma.intervention.findUnique({
    where: { id },
    include: {
      citizen: { select: { name: true, territory: true, ubs: true } },
      worker: { select: { name: true } },
    },
  })
  if (!row) return null
  return {
    id: row.id,
    citizenId: row.citizenId,
    citizenName: row.citizen.name,
    workerId: row.workerId,
    workerName: row.worker.name,
    title: row.title,
    plan: row.plan,
    status: row.status as any,
    followUps: (row.followUps as any[]) ?? [],
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

export async function createIntervention(data: InterventionFormData & { workerId: string }) {
  const row = await prisma.intervention.create({
    data: {
      citizenId: data.citizenId,
      workerId: data.workerId,
      title: data.title,
      plan: data.plan,
      status: 'aberto',
      followUps: [],
    },
  })
  return row.id
}

export async function addFollowUp(data: FollowUpFormData & { workerId: string; workerName: string }) {
  const intervention = await prisma.intervention.findUnique({
    where: { id: data.interventionId },
    select: { followUps: true },
  })
  if (!intervention) throw new Error('Intervenção não encontrada')

  const current = (intervention.followUps as any[]) ?? []
  const newFollowUp = {
    date: data.date,
    note: data.note,
    workerId: data.workerId,
    workerName: data.workerName,
  }

  await prisma.intervention.update({
    where: { id: data.interventionId },
    data: {
      followUps: [...current, newFollowUp],
      status: 'em_andamento',
    },
  })
}

export async function updateInterventionStatus(
  id: string,
  status: 'aberto' | 'em_andamento' | 'suspenso' | 'concluido'
) {
  await prisma.intervention.update({ where: { id }, data: { status } })
}
