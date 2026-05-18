import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calcularPremios, type EntradaRanking } from '@/lib/pontuacao'

export async function GET() {
  const palpitesAgrupados = await prisma.palpite.groupBy({
    by: ['userId'],
    where: { pontos: { not: null } },
    _sum: { pontos: true },
    _count: { id: true },
  })

  if (palpitesAgrupados.length === 0) return NextResponse.json([])

  // Count exact score hits per user
  const acertosExatos = await prisma.palpite.groupBy({
    by: ['userId'],
    where: { pontos: 10 },
    _count: { id: true },
  })

  const acertosMap = new Map(acertosExatos.map((a) => [a.userId, a._count.id]))

  const userIds = palpitesAgrupados.map((p) => p.userId)
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, image: true },
  })

  const usersMap = new Map(users.map((u) => [u.id, u]))

  // Build ranking entries sorted by: points DESC, exact hits DESC
  const entradas: EntradaRanking[] = palpitesAgrupados
    .map((p) => ({
      userId: p.userId,
      pontos: p._sum.pontos ?? 0,
      acertosExatos: acertosMap.get(p.userId) ?? 0,
    }))
    .sort((a, b) => {
      if (b.pontos !== a.pontos) return b.pontos - a.pontos
      return b.acertosExatos - a.acertosExatos
    })

  const comPremios = calcularPremios(entradas)

  const ranking = comPremios.map((entry) => {
    const user = usersMap.get(entry.userId)
    return {
      posicao: entry.posicao,
      userId: entry.userId,
      name: user?.name ?? null,
      image: user?.image ?? null,
      pontos: entry.pontos,
      acertosExatos: entry.acertosExatos,
      marmitas: entry.marmitas,
    }
  })

  return NextResponse.json(ranking)
}
