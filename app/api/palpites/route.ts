import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { jogoJaIniciou } from '@/lib/utils'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const jogoId = searchParams.get('jogoId')

  const where = jogoId
    ? { userId: session.user.id, jogoId }
    : { userId: session.user.id }

  const palpites = await prisma.palpite.findMany({ where })
  return NextResponse.json(palpites)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const body = await req.json()
  const { jogoId, placarCasa, placarVisita } = body

  if (!jogoId || placarCasa === undefined || placarVisita === undefined) {
    return NextResponse.json({ error: 'Campos obrigatórios ausentes' }, { status: 400 })
  }

  const jogo = await prisma.jogo.findUnique({ where: { id: jogoId } })
  if (!jogo) return NextResponse.json({ error: 'Jogo não encontrado' }, { status: 404 })

  // Business rule: cannot bet after game starts (server-side check)
  if (jogoJaIniciou(jogo.dataHora)) {
    return NextResponse.json({ error: 'Jogo já iniciado. Palpites encerrados.' }, { status: 403 })
  }

  const existing = await prisma.palpite.findUnique({
    where: { userId_jogoId: { userId: session.user.id, jogoId } },
  })

  if (existing) {
    return NextResponse.json({ error: 'Palpite já enviado para este jogo' }, { status: 409 })
  }

  const palpite = await prisma.palpite.create({
    data: {
      userId: session.user.id,
      jogoId,
      placarCasa: Number(placarCasa),
      placarVisita: Number(placarVisita),
    },
  })

  return NextResponse.json(palpite, { status: 201 })
}
