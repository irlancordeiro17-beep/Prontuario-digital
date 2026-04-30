import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { prisma } from '@/lib/prisma'
import { calculateAge } from '@/lib/utils'

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET })

  if (!token) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim()
  const ubs = searchParams.get('ubs')?.trim()

  if (!q && !ubs) {
    return NextResponse.json([])
  }

  try {
    const where: any = { active: true }

    if (q) {
      const digits = q.replace(/\D/g, '')
      where.OR = [
        { cns: { contains: digits } },
        { cpf: { contains: digits } },
        { name: { contains: q, mode: 'insensitive' } },
      ]
    }

    if (ubs) {
      where.ubs = { contains: ubs, mode: 'insensitive' }
    }

    const citizens = await prisma.citizen.findMany({
      where,
      take: 20,
      include: {
        vulnerabilityScore: true,
        visits: { orderBy: { date: 'desc' }, take: 1 },
      },
    })

    const result = citizens.map((c) => ({
      ...c,
      dateOfBirth: c.dateOfBirth.toISOString(),
      age: calculateAge(c.dateOfBirth.toISOString()),
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
      lastVisit: c.visits[0]?.date?.toISOString(),
      visits: undefined,
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error('[API/citizens] GET error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
