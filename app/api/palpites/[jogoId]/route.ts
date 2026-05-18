import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { jogoJaIniciou } from '@/lib/utils'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ jogoId: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { jogoId } = await params
  const body = await req.json()
  const { placarCasa, placarVisita } = body

  const jogo = await prisma.jogo.findUnique({ where: { id: jogoId } })
  if (!jogo) return NextResponse.json({ error: 'Jogo não encontrado' }, { status: 404 })

  if (jogoJaIniciou(jogo.dataHora)) {
    return NextResponse.json({ error: 'Jogo já iniciado. Palpites encerrados.' }, { status: 403 })
  }

  const palpite = await prisma.palpite.upsert({
    where: { userId_jogoId: { userId: session.user.id, jogoId } },
    update: { placarCasa: Number(placarCasa), placarVisita: Number(placarVisita) },
    create: {
      userId: session.user.id,
      jogoId,
      placarCasa: Number(placarCasa),
      placarVisita: Number(placarVisita),
    },
  })

  return NextResponse.json(palpite)
}
