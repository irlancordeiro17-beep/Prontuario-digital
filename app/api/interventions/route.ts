// app/api/interventions/route.ts — Prontuário Social
import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { z } from 'zod'
import { listInterventions, createIntervention } from '@/lib/services/interventions'
import { prisma } from '@/lib/prisma'

const createSchema = z.object({
  citizenId: z.string().min(1),
  title: z.string().min(3).max(200),
  plan: z.string().min(10).max(2000),
})

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET })
  if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const citizenId = searchParams.get('citizenId') ?? undefined
  const status = searchParams.get('status') ?? undefined
  const workerId = token.role === 'agente_saude' ? (token.id as string) : undefined

  try {
    const data = await listInterventions({ citizenId, status, workerId, take: 50 })
    return NextResponse.json(data)
  } catch (error) {
    console.error('[API/interventions] GET error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET })
  if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  try {
    const body = await req.json()
    const parsed = createSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Dados inválidos', details: parsed.error.flatten() }, { status: 422 })
    }

    const id = await createIntervention({ ...parsed.data, workerId: token.id as string })

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: token.id as string,
        action: 'CREATE',
        resource: 'intervention',
        resourceId: id,
      },
    }).catch(() => {})

    return NextResponse.json({ id }, { status: 201 })
  } catch (error) {
    console.error('[API/interventions] POST error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
