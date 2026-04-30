// app/api/citizens/route.ts — Prontuário Social
import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { searchCitizens } from '@/lib/services/citizens'

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET })
  if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim() ?? undefined
  const ubs = searchParams.get('ubs')?.trim() ?? undefined
  const territory = searchParams.get('territory')?.trim() ?? undefined
  const risk = searchParams.get('risk')?.trim() ?? undefined // category filter

  // Require at least one search param to avoid full-table scan
  if (!q && !ubs && !territory && !risk) {
    return NextResponse.json([])
  }

  try {
    let citizens = await searchCitizens({ q, ubs, territory, take: 30 })

    // Client-side risk filter (score category)
    if (risk) {
      citizens = citizens.filter((c) => c.vulnerabilityScore?.category === risk)
    }

    return NextResponse.json(citizens)
  } catch (error) {
    console.error('[API/citizens] GET error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
