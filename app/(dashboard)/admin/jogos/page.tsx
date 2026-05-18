import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { AdminJogosClient } from '@/components/jogos/AdminJogosClient'

export default async function AdminJogosPage() {
  const session = await auth()
  if (session?.user.role !== 'ADMIN') redirect('/')

  const jogos = await prisma.jogo.findMany({
    orderBy: { dataHora: 'asc' },
    include: { _count: { select: { palpites: true } } },
  })

  return (
    <div>
      <h1 className="font-[var(--font-bebas)] mb-1 text-4xl tracking-widest text-[#F5A623]">
        Gerenciar Jogos
      </h1>
      <p className="mb-8 text-sm text-gray-400">
        Cadastre jogos, lance resultados e importe via CSV
      </p>
      <AdminJogosClient jogos={jogos} />
    </div>
  )
}
