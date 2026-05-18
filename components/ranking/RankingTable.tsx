'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'

type RankingEntry = {
  posicao: number
  userId: string
  name: string | null
  image: string | null
  pontos: number
  acertosExatos: number
  marmitas: number | null
}

const MEDALS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' }

export function RankingTable({ ranking }: { ranking: RankingEntry[] }) {
  if (ranking.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 py-16 text-center text-gray-500">
        Nenhum resultado lançado ainda. Volte em breve!
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-widest text-gray-500">
            <th className="px-4 py-3 text-left">#</th>
            <th className="px-4 py-3 text-left">Participante</th>
            <th className="px-4 py-3 text-right">Pontos</th>
            <th className="px-4 py-3 text-right hidden sm:table-cell">Exatos</th>
            <th className="px-4 py-3 text-right">Prêmio</th>
          </tr>
        </thead>
        <tbody>
          {ranking.map((entry, i) => (
            <motion.tr
              key={entry.userId}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`border-b border-white/5 last:border-0 ${
                entry.posicao === 1 ? 'bg-[#F5A623]/5' : 'bg-transparent'
              }`}
            >
              <td className="px-4 py-4 text-sm font-medium text-gray-400">
                {MEDALS[entry.posicao] ?? entry.posicao}
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center gap-3">
                  {entry.image ? (
                    <Image
                      src={entry.image}
                      alt={entry.name ?? ''}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xs text-gray-400">
                      {entry.name?.[0]?.toUpperCase() ?? '?'}
                    </div>
                  )}
                  <span className="text-sm font-medium text-white">{entry.name ?? 'Anônimo'}</span>
                </div>
              </td>
              <td className="px-4 py-4 text-right text-sm font-semibold text-[#F5A623]">
                {entry.pontos} pts
              </td>
              <td className="px-4 py-4 text-right text-sm text-gray-400 hidden sm:table-cell">
                {entry.acertosExatos} ✓
              </td>
              <td className="px-4 py-4 text-right text-sm">
                {entry.marmitas !== null ? (
                  <span className="text-white">
                    🍱 {entry.marmitas} {entry.marmitas === 1 ? 'marmita' : 'marmitas'}
                  </span>
                ) : (
                  <span className="text-gray-600">—</span>
                )}
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
