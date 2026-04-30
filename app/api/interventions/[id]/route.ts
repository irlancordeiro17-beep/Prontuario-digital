// app/api/interventions/[id]/route.ts — Prontuário Social
import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { z } from 'zod'
import { addFollowUp, updateInterventionStatus, getIntervention } from '@/lib/services/interventions'
import { prisma } from '@/lib/prisma'

const followUpSchema = z.object({
  note: z.string().min(5).max(1000),
  date: z.string().datetime({ offset: true }).or(z.string().date()),
})

const statusSchema = z.object({
  status: z.enum(['aberto', 'em_andamento', 'suspenso', 'concluido']),
})

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET })
  if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params
  const data = await getIntervention(id)
  if (!data) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET })
  if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params
  const body = await req.json()

  try {
    // Follow-up addition
    if ('note' in body) {
      const parsed = followUpSchema.safeParse(body)
      if (!parsed.success) {
        return NextResponse.json({ error: 'Dados inválidos', details: parsed.error.flatten() }, { status: 422 })
      }

      const user = await prisma.user.findUnique({
        where: { id: token.id as string },
        select: { name: true },
      })

      await addFollowUp({
        interventionId: id,
        note: parsed.data.note,
        date: parsed.data.date,
        workerId: token.id as string,
        workerName: user?.name ?? 'Desconhecido',
      })

      await prisma.auditLog.create({
        data: {
          userId: token.id as string,
          action: 'UPDATE',
          resource: 'intervention',
          resourceId: id,
          metadata: { action: 'follow_up' },
        },
      }).catch(() => {})

      return NextResponse.json({ ok: true })
    }

    // Status update
    if ('status' in body) {
      const parsed = statusSchema.safeParse(body)
      if (!parsed.success) {
        return NextResponse.json({ error: 'Status inválido' }, { status: 422 })
      }
      await updateInterventionStatus(id, parsed.data.status)
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: 'Nenhuma operação reconhecida' }, { status: 400 })
  } catch (error) {
    console.error('[API/interventions/id] PATCH error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
