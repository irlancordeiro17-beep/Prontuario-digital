// app/api/citizens/route.ts — Prontuário Social
import { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { MOCK_CITIZENS } from '@/lib/mock-data'
import { sanitizeSearchQuery } from '@/lib/sanitize'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { apiOk, apiUnauthorized, apiRateLimit, apiError } from '@/lib/api-response'

const IS_DEMO = !process.env.DATABASE_URL

export async function GET(req: NextRequest) {
  // Rate limit: 30 searches/min per IP
  const ip = getClientIp(req)
  const rl = rateLimit(`citizens:${ip}`, { limit: 30, windowMs: 60_000 })
  if (!rl.allowed) return apiRateLimit()

  // Auth check (skip in demo/dev mode)
  if (!IS_DEMO && process.env.NEXT_PUBLIC_DEV_AUTH_BYPASS !== 'true') {
    const token = await getToken({ req, secret: process.env.AUTH_SECRET })
    if (!token) return apiUnauthorized()
  }

  const { searchParams } = new URL(req.url)
  // Sanitize all inputs
  const q = sanitizeSearchQuery(searchParams.get('q') ?? '').toLowerCase()
  const risk = sanitizeSearchQuery(searchParams.get('risk') ?? '')

  // Demo/dev mode — mock data
  if (IS_DEMO) {
    let results = [...MOCK_CITIZENS]

    if (q) {
      results = results.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.cpf.includes(q.replace(/\D/g, '')) ||
          c.cns.includes(q.replace(/\D/g, ''))
      )
    }

    if (risk) {
      results = results.filter((c) => c.vulnerabilityScore?.category === risk)
    }

    results.sort((a, b) => (b.vulnerabilityScore?.score ?? 0) - (a.vulnerabilityScore?.score ?? 0))

    return apiOk(results)
  }

  // Production: use Prisma service
  try {
    const { searchCitizens } = await import('@/lib/services/citizens')
    const ubs = sanitizeSearchQuery(searchParams.get('ubs') ?? '') || undefined
    const territory = sanitizeSearchQuery(searchParams.get('territory') ?? '') || undefined

    if (!q && !ubs && !territory && !risk) {
      return apiOk([])
    }

    let citizens = await searchCitizens({ q: q || undefined, ubs, territory, take: 30 })

    if (risk) {
      citizens = citizens.filter((c) => c.vulnerabilityScore?.category === risk)
    }

    return apiOk(citizens)
  } catch (error) {
    return apiError(error, 'API/citizens')
  }
}
