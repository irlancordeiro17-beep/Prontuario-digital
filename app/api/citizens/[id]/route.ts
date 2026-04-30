// app/api/citizens/[id]/route.ts — Prontuário Social
import { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { MOCK_CITIZEN_DETAIL, MOCK_CITIZENS } from '@/lib/mock-data'
import { sanitizeText } from '@/lib/sanitize'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { apiOk, apiUnauthorized, apiNotFound, apiRateLimit, apiError } from '@/lib/api-response'

const IS_DEMO = !process.env.DATABASE_URL

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Rate limit: 60 detail views/min per IP
  const ip = getClientIp(req)
  const rl = rateLimit(`citizen-detail:${ip}`, { limit: 60, windowMs: 60_000 })
  if (!rl.allowed) return apiRateLimit()

  // Auth check (skip in demo/dev mode)
  if (!IS_DEMO && process.env.NEXT_PUBLIC_DEV_AUTH_BYPASS !== 'true') {
    const token = await getToken({ req, secret: process.env.AUTH_SECRET })
    if (!token) return apiUnauthorized()
  }

  const { id } = await params
  // Sanitize the ID — should only be alphanumeric + dashes
  const safeId = sanitizeText(id).replace(/[^a-z0-9\-]/gi, '').slice(0, 50)
  if (!safeId) return apiNotFound('Cidadão')

  // Demo mode — mock data
  if (IS_DEMO) {
    const mockCitizen = MOCK_CITIZENS.find((c) => c.id === safeId)
    if (!mockCitizen) return apiNotFound('Cidadão')

    if (safeId === 'cit-001') {
      return apiOk(MOCK_CITIZEN_DETAIL)
    }

    return apiOk({
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

  // Production: use Prisma + LGPD audit log
  try {
    const { getCitizenById } = await import('@/lib/services/citizens')
    const { prisma } = await import('@/lib/prisma')
    const token = await getToken({ req, secret: process.env.AUTH_SECRET })

    const detail = await getCitizenById(safeId)
    if (!detail) return apiNotFound('Cidadão')

    // LGPD audit: log VIEW event (non-blocking)
    if (token) {
      prisma.auditLog.create({
        data: {
          userId: token.id as string,
          action: 'VIEW',
          resource: 'citizen',
          resourceId: safeId,
          metadata: { ip: getClientIp(req) },
        },
      }).catch(() => { /* audit failure must not block response */ })
    }

    return apiOk(detail)
  } catch (error) {
    return apiError(error, 'API/citizens/[id]')
  }
}
