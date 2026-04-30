// app/api/risk/route.ts — Prontuário Social
import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { MOCK_RISK_DATA } from '@/lib/mock-data'

const IS_DEV = process.env.NEXT_PUBLIC_DEV_AUTH_BYPASS === 'true'

export async function GET(req: NextRequest) {
  // Auth check (skip in dev)
  if (!IS_DEV) {
    const token = await getToken({ req, secret: process.env.AUTH_SECRET })
    if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') ?? 'alerts'

  // Dev mode: return mock data
  if (IS_DEV || !process.env.DATABASE_URL) {
    if (type === 'metrics') {
      return NextResponse.json(MOCK_RISK_DATA.kpis)
    }
    return NextResponse.json(MOCK_RISK_DATA.alerts)
  }

  // Production: use Prisma service
  try {
    const { getRiskAlerts, getRiskMetrics } = await import('@/lib/services/risk')
    const token = await getToken({ req, secret: process.env.AUTH_SECRET })
    const ubs = searchParams.get('ubs') ?? (token as any)?.ubs ?? undefined
    const severity = searchParams.get('severity') ?? undefined

    if (type === 'metrics') {
      const metrics = await getRiskMetrics((token as any)?.role !== 'admin' ? ubs : undefined)
      return NextResponse.json(metrics)
    }

    const alerts = await getRiskAlerts({ ubs, severity, take: 30 })
    return NextResponse.json(alerts)
  } catch (error) {
    console.error('[API/risk] GET error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  if (!IS_DEV) {
    const token = await getToken({ req, secret: process.env.AUTH_SECRET })
    if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  if (IS_DEV || !process.env.DATABASE_URL) {
    return NextResponse.json({ ok: true })
  }

  try {
    const { resolveAlert } = await import('@/lib/services/risk')
    const { alertId } = await req.json()
    if (!alertId) return NextResponse.json({ error: 'alertId obrigatório' }, { status: 400 })
    await resolveAlert(alertId)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[API/risk] POST error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
