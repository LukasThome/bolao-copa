import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { JogoCard } from '@/components/jogos/JogoCard'
import { labelFase } from '@/lib/utils'
import { FaseJogo } from '@prisma/client'

const FASE_ORDER: FaseJogo[] = [
  'GRUPOS',
  'OITAVAS',
  'QUARTAS',
  'SEMIFINAL',
  'TERCEIRO_LUGAR',
  'FINAL',
]

export default async function PalpitesPage() {
  const session = await auth()

  const jogos = await prisma.jogo.findMany({
    orderBy: { dataHora: 'asc' },
    include: {
      palpites: {
        where: { userId: session!.user.id },
        take: 1,
      },
    },
  })

  // Group by phase
  const porFase = FASE_ORDER.reduce(
    (acc, fase) => {
      const jogosNaFase = jogos.filter((j) => j.fase === fase)
      if (jogosNaFase.length > 0) acc[fase] = jogosNaFase
      return acc
    },
    {} as Record<string, typeof jogos>
  )

  return (
    <div>
      <h1 className="font-[var(--font-bebas)] mb-1 text-4xl tracking-widest text-[#F5A623]">
        Palpites
      </h1>
      <p className="mb-8 text-sm text-gray-400">Envie seus palpites antes do início de cada jogo</p>

      {Object.entries(porFase).map(([fase, jogos]) => (
        <section key={fase} className="mb-8">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-500">
            {labelFase(fase)}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {jogos.map((jogo) => (
              <JogoCard key={jogo.id} jogo={jogo} meuPalpite={jogo.palpites[0] ?? null} />
            ))}
          </div>
        </section>
      ))}

      {Object.keys(porFase).length === 0 && (
        <p className="text-center text-gray-500">Nenhum jogo cadastrado ainda.</p>
      )}
    </div>
  )
}
