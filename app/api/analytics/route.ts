// app/api/analytics/route.ts — Prontuário Social
import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { getAnalyticsMetrics } from '@/lib/services/analytics'

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET })
  if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  // Analytics is gestor + admin only (middleware enforces route, but double-check here)
  const role = (token as any).role as string
  if (!['gestor', 'admin'].includes(role)) {
    return NextResponse.json({ error: 'Acesso não autorizado para este perfil' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const ubs = searchParams.get('ubs') ?? (token as any).ubs ?? undefined

  try {
    const data = await getAnalyticsMetrics(role === 'gestor' ? ubs : undefined)
    return NextResponse.json(data)
  } catch (error) {
    console.error('[API/analytics] GET error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
