// app/api/interventions/route.ts — Prontuário Social
import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { z } from 'zod'
import { MOCK_INTERVENTIONS } from '@/lib/mock-data'

const IS_DEV = process.env.NEXT_PUBLIC_DEV_AUTH_BYPASS === 'true'

const createSchema = z.object({
  citizenId: z.string().min(1),
  title: z.string().min(3).max(200),
  plan: z.string().min(10).max(2000),
})

export async function GET(req: NextRequest) {
  // Auth check (skip in dev)
  if (!IS_DEV) {
    const token = await getToken({ req, secret: process.env.AUTH_SECRET })
    if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') ?? undefined

  // Dev mode: return mock data
  if (IS_DEV || !process.env.DATABASE_URL) {
    let results = [...MOCK_INTERVENTIONS]
    if (status) {
      results = results.filter((i) => i.status === status)
    }
    return NextResponse.json(results)
  }

  // Production: use Prisma service
  try {
    const { listInterventions } = await import('@/lib/services/interventions')
    const token = await getToken({ req, secret: process.env.AUTH_SECRET })
    const citizenId = searchParams.get('citizenId') ?? undefined
    const workerId = (token as any)?.role === 'agente_saude' ? ((token as any)?.id as string) : undefined
    const data = await listInterventions({ citizenId, status, workerId, take: 50 })
    return NextResponse.json(data)
  } catch (error) {
    console.error('[API/interventions] GET error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  if (!IS_DEV) {
    const token = await getToken({ req, secret: process.env.AUTH_SECRET })
    if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  if (IS_DEV || !process.env.DATABASE_URL) {
    return NextResponse.json({ id: 'mock-int-new' }, { status: 201 })
  }

  try {
    const { createIntervention } = await import('@/lib/services/interventions')
    const { prisma } = await import('@/lib/prisma')
    const token = await getToken({ req, secret: process.env.AUTH_SECRET })

    const body = await req.json()
    const parsed = createSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Dados inválidos', details: parsed.error.flatten() }, { status: 422 })
    }

    const id = await createIntervention({ ...parsed.data, workerId: (token as any)?.id as string })

    // Audit log
    if (token) {
      await prisma.auditLog.create({
        data: {
          userId: token.id as string,
          action: 'CREATE',
          resource: 'intervention',
          resourceId: id,
        },
      }).catch(() => {})
    }

    return NextResponse.json({ id }, { status: 201 })
  } catch (error) {
    console.error('[API/interventions] POST error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
