'use client'

import Link from 'next/link'
import type { Jogo, Palpite } from '@prisma/client'
import { formatarDataJogo, jogoEstaAberto } from '@/lib/utils'

type Props = {
  jogo: Jogo
  meuPalpite: Palpite | null
}

function StatusBadge({ jogo, aberto }: { jogo: Jogo; aberto: boolean }) {
  if (jogo.placarCasa !== null) {
    return (
      <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-xs text-green-400">
        Resultado lançado
      </span>
    )
  }
  if (!aberto) {
    return (
      <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-xs text-red-400">
        Encerrado
      </span>
    )
  }
  return (
    <span className="rounded-full bg-[#F5A623]/20 px-2 py-0.5 text-xs text-[#F5A623]">
      Aberto
    </span>
  )
}

export function JogoCard({ jogo, meuPalpite }: Props) {
  const aberto = jogoEstaAberto(jogo.dataHora)

  return (
    <Link
      href={`/palpites/${jogo.id}`}
      className="block rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-[#F5A623]/30 hover:bg-white/8"
    >
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs text-gray-500">{formatarDataJogo(jogo.dataHora)}</p>
        <StatusBadge jogo={jogo} aberto={aberto} />
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className="flex-1 text-sm font-medium text-white">{jogo.timeCasa}</span>

        {/* Result or bet */}
        <div className="flex min-w-[80px] items-center justify-center gap-1 rounded-lg bg-white/5 px-3 py-2">
          {jogo.placarCasa !== null ? (
            <span className="text-sm font-bold text-[#F5A623]">
              {jogo.placarCasa} × {jogo.placarVisita}
            </span>
          ) : meuPalpite ? (
            <span className="text-sm text-gray-300">
              {meuPalpite.placarCasa} × {meuPalpite.placarVisita}
            </span>
          ) : (
            <span className="text-xs text-gray-600">{aberto ? 'Palpitar' : '–'}</span>
          )}
        </div>

        <span className="flex-1 text-right text-sm font-medium text-white">{jogo.timeVisita}</span>
      </div>

      {/* Points earned */}
      {meuPalpite?.pontos !== undefined && meuPalpite.pontos !== null && (
        <div className="mt-2 text-right">
          <span
            className={`text-xs font-semibold ${
              meuPalpite.pontos === 10
                ? 'text-green-400'
                : meuPalpite.pontos === 5
                  ? 'text-[#F5A623]'
                  : 'text-red-400'
            }`}
          >
            {meuPalpite.pontos === 0 ? '0' : `+${meuPalpite.pontos}`} pts
          </span>
        </div>
      )}
    </Link>
  )
}
