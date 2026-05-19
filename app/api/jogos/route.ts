import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { FaseJogo } from '@prisma/client'

export async function GET() {
  const jogos = await prisma.jogo.findMany({
    orderBy: { dataHora: 'asc' },
  })
  return NextResponse.json(jogos)
}

export async function POST(req: NextRequest) {
  const session = await auth()

  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  if (session.user.role !== 'ADMIN')
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })

  const body = await req.json()
  const { timeCasa, timeVisita, dataHora, fusoHorario, fase, grupo } = body

  if (!timeCasa || !timeVisita || !dataHora || !fase) {
    return NextResponse.json({ error: 'Campos obrigatórios ausentes' }, { status: 400 })
  }

  if (!Object.values(FaseJogo).includes(fase)) {
    return NextResponse.json({ error: 'Fase inválida' }, { status: 400 })
  }

  const jogo = await prisma.jogo.create({
    data: {
      timeCasa,
      timeVisita,
      dataHora: new Date(dataHora),
      fusoHorario: fusoHorario ?? 'America/New_York',
      fase,
      grupo: grupo ?? null,
    },
  })

  return NextResponse.json(jogo, { status: 201 })
}
