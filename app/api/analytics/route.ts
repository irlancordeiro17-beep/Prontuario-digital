// app/api/analytics/route.ts — Prontuário Social
import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { MOCK_ANALYTICS } from '@/lib/mock-data'

const IS_DEV = process.env.NEXT_PUBLIC_DEV_AUTH_BYPASS === 'true'

export async function GET(req: NextRequest) {
  // Auth check (skip in dev)
  if (!IS_DEV) {
    const token = await getToken({ req, secret: process.env.AUTH_SECRET })
    if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const role = (token as any).role as string
    if (!['gestor', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Acesso não autorizado para este perfil' }, { status: 403 })
    }
  }

  // Dev mode: return mock data
  if (IS_DEV || !process.env.DATABASE_URL) {
    return NextResponse.json(MOCK_ANALYTICS)
  }

  // Production: use Prisma service
  try {
    const { getAnalyticsMetrics } = await import('@/lib/services/analytics')
    const token = await getToken({ req, secret: process.env.AUTH_SECRET })
    const { searchParams } = new URL(req.url)
    const ubs = searchParams.get('ubs') ?? (token as any)?.ubs ?? undefined
    const role = (token as any)?.role as string

    const data = await getAnalyticsMetrics(role === 'gestor' ? ubs : undefined)
    return NextResponse.json(data)
  } catch (error) {
    console.error('[API/analytics] GET error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
