// app/api/citizens/route.ts — Prontuário Social
import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { MOCK_CITIZENS } from '@/lib/mock-data'

const IS_DEV = process.env.NEXT_PUBLIC_DEV_AUTH_BYPASS === 'true'

export async function GET(req: NextRequest) {
  // Auth check (skip in dev)
  if (!IS_DEV) {
    const token = await getToken({ req, secret: process.env.AUTH_SECRET })
    if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim().toLowerCase() ?? ''
  const risk = searchParams.get('risk')?.trim() ?? ''

  // If no DB configured, return mock data
  if (IS_DEV || !process.env.DATABASE_URL) {
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

    // Sort by vulnerability score desc
    results.sort((a, b) => (b.vulnerabilityScore?.score ?? 0) - (a.vulnerabilityScore?.score ?? 0))

    return NextResponse.json(results)
  }

  // Production: use Prisma service
  try {
    const { searchCitizens } = await import('@/lib/services/citizens')
    const ubs = searchParams.get('ubs')?.trim() ?? undefined
    const territory = searchParams.get('territory')?.trim() ?? undefined

    if (!q && !ubs && !territory && !risk) {
      return NextResponse.json([])
    }

    let citizens = await searchCitizens({ q: q || undefined, ubs, territory, take: 30 })

    if (risk) {
      citizens = citizens.filter((c) => c.vulnerabilityScore?.category === risk)
    }

    return NextResponse.json(citizens)
  } catch (error) {
    console.error('[API/citizens] GET error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
