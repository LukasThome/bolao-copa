import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { PalpiteForm } from '@/components/palpites/PalpiteForm'
import { formatarDataJogo, jogoEstaAberto } from '@/lib/utils'
import Link from 'next/link'

export default async function PalpitePage({
  params,
}: {
  params: Promise<{ jogoId: string }>
}) {
  const { jogoId } = await params
  const session = await auth()

  const jogo = await prisma.jogo.findUnique({ where: { id: jogoId } })
  if (!jogo) notFound()

  const palpite = await prisma.palpite.findUnique({
    where: { userId_jogoId: { userId: session!.user.id, jogoId } },
  })

  const aberto = jogoEstaAberto(jogo.dataHora)

  return (
    <div className="mx-auto max-w-md">
      <Link href="/palpites" className="mb-6 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-300 transition">
        ← Voltar
      </Link>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <p className="mb-1 text-xs text-gray-500">{formatarDataJogo(jogo.dataHora)}</p>
        <h1 className="font-[var(--font-bebas)] mb-6 text-3xl tracking-wide text-white">
          {jogo.timeCasa} <span className="text-[#F5A623]">×</span> {jogo.timeVisita}
        </h1>

        <PalpiteForm jogo={jogo} palpiteExistente={palpite ?? null} aberto={aberto} />
      </div>
    </div>
  )
}
