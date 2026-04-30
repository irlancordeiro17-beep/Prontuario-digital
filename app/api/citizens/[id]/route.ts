// app/api/citizens/[id]/route.ts — Prontuário Social
import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { MOCK_CITIZEN_DETAIL, MOCK_CITIZENS } from '@/lib/mock-data'

const IS_DEV = process.env.NEXT_PUBLIC_DEV_AUTH_BYPASS === 'true'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Auth check (skip in dev)
  if (!IS_DEV) {
    const token = await getToken({ req, secret: process.env.AUTH_SECRET })
    if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { id } = await params

  // Dev mode: return mock data
  if (IS_DEV || !process.env.DATABASE_URL) {
    // Check if the citizen exists in mock data
    const mockCitizen = MOCK_CITIZENS.find((c) => c.id === id)
    if (!mockCitizen) {
      return NextResponse.json({ error: 'Cidadão não encontrado' }, { status: 404 })
    }

    // For the first citizen, return full detail; for others, build a basic detail
    if (id === 'cit-001') {
      return NextResponse.json(MOCK_CITIZEN_DETAIL)
    }

    return NextResponse.json({
      citizen: {
        ...mockCitizen,
        dateOfBirth: '1980-01-01T00:00:00Z',
        active: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2026-04-01T00:00:00Z',
      },
      clinicalHistory: [],
      prescriptions: [],
      socialRecord: null,
      vulnerabilityScore: mockCitizen.vulnerabilityScore,
      visits: [],
      interventions: [],
      riskAlerts: [],
    })
  }

  // Production: use Prisma
  try {
    const { getCitizenById } = await import('@/lib/services/citizens')
    const { prisma } = await import('@/lib/prisma')
    const token = await getToken({ req, secret: process.env.AUTH_SECRET })

    const detail = await getCitizenById(id)
    if (!detail) return NextResponse.json({ error: 'Cidadão não encontrado' }, { status: 404 })

    // Write audit log (LGPD — VIEW event)
    if (token) {
      await prisma.auditLog.create({
        data: {
          userId: token.id as string,
          action: 'VIEW',
          resource: 'citizen',
          resourceId: id,
          metadata: { ip: req.headers.get('x-forwarded-for') ?? 'unknown' },
        },
      }).catch(() => { /* audit failure must not block response */ })
    }

    return NextResponse.json(detail)
  } catch (error) {
    console.error('[API/citizens/id] GET error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
