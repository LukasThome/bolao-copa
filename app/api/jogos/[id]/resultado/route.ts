import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { calcularPontos } from '@/lib/pontuacao'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  if (session.user.role !== 'ADMIN')
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })

  const { id } = await params
  const body = await req.json()
  const { placarCasa, placarVisita } = body

  if (placarCasa === undefined || placarVisita === undefined) {
    return NextResponse.json({ error: 'Placar obrigatório' }, { status: 400 })
  }

  if (typeof placarCasa !== 'number' || typeof placarVisita !== 'number') {
    return NextResponse.json({ error: 'Placar deve ser número' }, { status: 400 })
  }

  const jogo = await prisma.jogo.findUnique({
    where: { id },
    include: { palpites: true },
  })
  if (!jogo) return NextResponse.json({ error: 'Jogo não encontrado' }, { status: 404 })

  // Update the game result
  const jogoAtualizado = await prisma.jogo.update({
    where: { id },
    data: { placarCasa, placarVisita },
  })

  // Auto-calculate points for all bets on this game
  const resultado = { placarCasa, placarVisita }

  await Promise.all(
    jogo.palpites.map((palpite) => {
      const pontos = calcularPontos(
        { placarCasa: palpite.placarCasa, placarVisita: palpite.placarVisita },
        resultado
      )
      return prisma.palpite.update({
        where: { id: palpite.id },
        data: { pontos },
      })
    })
  )

  return NextResponse.json({
    jogo: jogoAtualizado,
    palpitesCalculados: jogo.palpites.length,
  })
}
