'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import type { Jogo, Palpite } from '@prisma/client'

type Props = {
  jogo: Jogo
  palpiteExistente: Palpite | null
  aberto: boolean
}

export function PalpiteForm({ jogo, palpiteExistente, aberto }: Props) {
  const router = useRouter()
  const [placarCasa, setPlacarCasa] = useState(
    palpiteExistente ? String(palpiteExistente.placarCasa) : ''
  )
  const [placarVisita, setPlacarVisita] = useState(
    palpiteExistente ? String(palpiteExistente.placarVisita) : ''
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!aberto) return

    setSaving(true)
    setError(null)
    setSuccess(false)

    const method = palpiteExistente ? 'PUT' : 'POST'
    const url = palpiteExistente ? `/api/palpites/${jogo.id}` : '/api/palpites'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jogoId: jogo.id,
        placarCasa: Number(placarCasa),
        placarVisita: Number(placarVisita),
      }),
    })

    if (res.ok) {
      setSuccess(true)
      router.refresh()
    } else {
      const data = await res.json()
      setError(data.error ?? 'Erro ao salvar palpite')
    }

    setSaving(false)
  }

  if (!aberto && !palpiteExistente) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 px-6 py-8 text-center">
        <p className="text-gray-400">Palpites encerrados para este jogo</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6 flex items-center gap-4">
        {/* Casa */}
        <div className="flex-1 text-center">
          <label
            htmlFor="placar-casa"
            className="mb-2 block text-xs uppercase tracking-widest text-gray-500"
          >
            {jogo.timeCasa}
          </label>
          <input
            id="placar-casa"
            aria-label="placar casa"
            type="number"
            min={0}
            max={20}
            value={placarCasa}
            onChange={(e) => setPlacarCasa(e.target.value)}
            disabled={!aberto}
            required
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-4 text-center text-2xl font-bold text-white focus:border-[#F5A623]/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        <span className="text-2xl font-bold text-[#F5A623]">×</span>

        {/* Visita */}
        <div className="flex-1 text-center">
          <label
            htmlFor="placar-visita"
            className="mb-2 block text-xs uppercase tracking-widest text-gray-500"
          >
            {jogo.timeVisita}
          </label>
          <input
            id="placar-visita"
            aria-label="placar visita"
            type="number"
            min={0}
            max={20}
            value={placarVisita}
            onChange={(e) => setPlacarVisita(e.target.value)}
            disabled={!aberto}
            required
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-4 text-center text-2xl font-bold text-white focus:border-[#F5A623]/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
      </div>

      {!aberto ? (
        <p className="text-center text-sm text-gray-500">Palpites encerrados para este jogo</p>
      ) : (
        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-xl bg-[#F5A623] px-6 py-3 font-semibold text-[#0B1120] transition hover:bg-[#fbbf24] disabled:opacity-50"
        >
          {saving ? 'Salvando...' : 'Salvar palpite'}
        </button>
      )}

      {success && (
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 text-center text-sm text-green-400"
        >
          Palpite salvo com sucesso ✓
        </motion.p>
      )}

      {error && (
        <p className="mt-3 text-center text-sm text-red-400">{error}</p>
      )}
    </form>
  )
}
