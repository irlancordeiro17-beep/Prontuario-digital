// app/api/citizens/[id]/route.ts — Prontuário Social
import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { getCitizenById } from '@/lib/services/citizens'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET })
  if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params

  try {
    const detail = await getCitizenById(id)
    if (!detail) return NextResponse.json({ error: 'Cidadão não encontrado' }, { status: 404 })

    // Write audit log (LGPD — VIEW event)
    await prisma.auditLog.create({
      data: {
        userId: token.id as string,
        action: 'VIEW',
        resource: 'citizen',
        resourceId: id,
        metadata: { ip: req.headers.get('x-forwarded-for') ?? 'unknown' },
      },
    }).catch(() => { /* audit failure must not block response */ })

    return NextResponse.json(detail)
  } catch (error) {
    console.error('[API/citizens/id] GET error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
