import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  if (session.user.role !== 'ADMIN')
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })

  const { id } = await params
  const body = await req.json()

  const jogo = await prisma.jogo.findUnique({ where: { id } })
  if (!jogo) return NextResponse.json({ error: 'Jogo não encontrado' }, { status: 404 })

  const updated = await prisma.jogo.update({
    where: { id },
    data: {
      timeCasa: body.timeCasa ?? jogo.timeCasa,
      timeVisita: body.timeVisita ?? jogo.timeVisita,
      dataHora: body.dataHora ? new Date(body.dataHora) : jogo.dataHora,
      fase: body.fase ?? jogo.fase,
      grupo: body.grupo !== undefined ? body.grupo : jogo.grupo,
    },
  })

  return NextResponse.json(updated)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  if (session.user.role !== 'ADMIN')
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })

  const { id } = await params

  await prisma.palpite.deleteMany({ where: { jogoId: id } })
  await prisma.jogo.delete({ where: { id } })

  return NextResponse.json({ ok: true })
}
