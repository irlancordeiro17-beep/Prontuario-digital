// app/api/risk/route.ts — Prontuário Social
import { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { MOCK_RISK_DATA } from '@/lib/mock-data'
import { sanitizeText } from '@/lib/sanitize'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { apiOk, apiUnauthorized, apiBadRequest, apiRateLimit, apiError } from '@/lib/api-response'

const IS_DEMO = !process.env.DATABASE_URL
const ALLOWED_TYPES = ['alerts', 'metrics'] as const

export async function GET(req: NextRequest) {
  const ip = getClientIp(req)
  const rl = rateLimit(`risk:${ip}`, { limit: 30, windowMs: 60_000 })
  if (!rl.allowed) return apiRateLimit()

  if (!IS_DEMO && process.env.NEXT_PUBLIC_DEV_AUTH_BYPASS !== 'true') {
    const token = await getToken({ req, secret: process.env.AUTH_SECRET })
    if (!token) return apiUnauthorized()
  }

  const { searchParams } = new URL(req.url)
  const rawType = sanitizeText(searchParams.get('type') ?? 'alerts')
  const type = ALLOWED_TYPES.includes(rawType as any) ? rawType : 'alerts'

  if (IS_DEMO) {
    return apiOk(type === 'metrics' ? MOCK_RISK_DATA.kpis : MOCK_RISK_DATA.alerts)
  }

  try {
    const { getRiskAlerts, getRiskMetrics } = await import('@/lib/services/risk')
    const token = await getToken({ req, secret: process.env.AUTH_SECRET })
    const ubs = sanitizeText(searchParams.get('ubs') ?? (token as any)?.ubs ?? '')
    const severity = sanitizeText(searchParams.get('severity') ?? '')

    if (type === 'metrics') {
      const metrics = await getRiskMetrics((token as any)?.role !== 'admin' ? ubs || undefined : undefined)
      return apiOk(metrics)
    }

    const alerts = await getRiskAlerts({ ubs: ubs || undefined, severity: severity || undefined, take: 30 })
    return apiOk(alerts)
  } catch (error) {
    return apiError(error, 'API/risk')
  }
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  const rl = rateLimit(`risk-post:${ip}`, { limit: 20, windowMs: 60_000 })
  if (!rl.allowed) return apiRateLimit()

  if (!IS_DEMO && process.env.NEXT_PUBLIC_DEV_AUTH_BYPASS !== 'true') {
    const token = await getToken({ req, secret: process.env.AUTH_SECRET })
    if (!token) return apiUnauthorized()
  }

  if (IS_DEMO) return apiOk({ ok: true })

  try {
    const { resolveAlert } = await import('@/lib/services/risk')
    const body = await req.json().catch(() => ({}))
    const alertId = sanitizeText(body?.alertId ?? '')
    if (!alertId) return apiBadRequest('alertId é obrigatório')
    await resolveAlert(alertId)
    return apiOk({ ok: true })
  } catch (error) {
    return apiError(error, 'API/risk POST')
  }
}
