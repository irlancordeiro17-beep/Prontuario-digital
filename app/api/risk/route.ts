// app/api/risk/route.ts — Prontuário Social
import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { getRiskAlerts, getRiskMetrics, resolveAlert } from '@/lib/services/risk'

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET })
  if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const ubs = searchParams.get('ubs') ?? (token as any).ubs ?? undefined
  const severity = searchParams.get('severity') ?? undefined
  const type = searchParams.get('type') ?? 'alerts'

  try {
    if (type === 'metrics') {
      const metrics = await getRiskMetrics(token.role !== 'admin' ? ubs : undefined)
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
  const token = await getToken({ req, secret: process.env.AUTH_SECRET })
  if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  // Resolve alert action
  try {
    const { alertId } = await req.json()
    if (!alertId) return NextResponse.json({ error: 'alertId obrigatório' }, { status: 400 })
    await resolveAlert(alertId)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[API/risk] POST error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
