import { prisma } from '@/lib/prisma'
import { calcularPremios, type EntradaRanking } from '@/lib/pontuacao'
import { RankingTable } from '@/components/ranking/RankingTable'

async function getRanking() {
  const palpitesAgrupados = await prisma.palpite.groupBy({
    by: ['userId'],
    where: { pontos: { not: null } },
    _sum: { pontos: true },
  })

  if (palpitesAgrupados.length === 0) return []

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

  const entradas: EntradaRanking[] = palpitesAgrupados
    .map((p) => ({
      userId: p.userId,
      pontos: p._sum.pontos ?? 0,
      acertosExatos: acertosMap.get(p.userId) ?? 0,
    }))
    .sort((a, b) => b.pontos - a.pontos || b.acertosExatos - a.acertosExatos)

  return calcularPremios(entradas).map((entry) => ({
    ...entry,
    name: usersMap.get(entry.userId)?.name ?? null,
    image: usersMap.get(entry.userId)?.image ?? null,
  }))
}

export default async function RankingPage() {
  const ranking = await getRanking()

  return (
    <div>
      <h1 className="font-[var(--font-bebas)] mb-1 text-4xl tracking-widest text-[#F5A623]">
        Ranking
      </h1>
      <p className="mb-8 text-sm text-gray-400">Atualizado em tempo real</p>
      <RankingTable ranking={ranking} />
    </div>
  )
}
