'use client'

import { useState } from 'react'
import type { Jogo, FaseJogo } from '@prisma/client'

const FASES: FaseJogo[] = ['GRUPOS', 'OITAVAS', 'QUARTAS', 'SEMIFINAL', 'TERCEIRO_LUGAR', 'FINAL']

type Props = {
  jogo?: Jogo | null
  onSuccess: () => void
  onCancel: () => void
}

export function JogoForm({ jogo, onSuccess, onCancel }: Props) {
  const [timeCasa, setTimeCasa] = useState(jogo?.timeCasa ?? '')
  const [timeVisita, setTimeVisita] = useState(jogo?.timeVisita ?? '')
  const [dataHora, setDataHora] = useState(
    jogo ? new Date(jogo.dataHora).toISOString().slice(0, 16) : ''
  )
  const [fase, setFase] = useState<FaseJogo>(jogo?.fase ?? 'GRUPOS')
  const [grupo, setGrupo] = useState(jogo?.grupo ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const method = jogo ? 'PUT' : 'POST'
    const url = jogo ? `/api/jogos/${jogo.id}` : '/api/jogos'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ timeCasa, timeVisita, dataHora, fase, grupo: grupo || null }),
    })

    if (res.ok) {
      onSuccess()
    } else {
      const data = await res.json()
      setError(data.error ?? 'Erro ao salvar jogo')
    }
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
      <div>
        <label className="mb-1 block text-xs text-gray-400">Time da Casa</label>
        <input
          value={timeCasa}
          onChange={(e) => setTimeCasa(e.target.value)}
          required
          placeholder="Brasil"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-[#F5A623]/50 focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs text-gray-400">Time Visitante</label>
        <input
          value={timeVisita}
          onChange={(e) => setTimeVisita(e.target.value)}
          required
          placeholder="Argentina"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-[#F5A623]/50 focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs text-gray-400">Data e Hora</label>
        <input
          type="datetime-local"
          value={dataHora}
          onChange={(e) => setDataHora(e.target.value)}
          required
          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-[#F5A623]/50 focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs text-gray-400">Fase</label>
        <select
          value={fase}
          onChange={(e) => setFase(e.target.value as FaseJogo)}
          className="w-full rounded-xl border border-white/10 bg-[#0B1120] px-3 py-2 text-sm text-white focus:border-[#F5A623]/50 focus:outline-none"
        >
          {FASES.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </div>

      {fase === 'GRUPOS' && (
        <div>
          <label className="mb-1 block text-xs text-gray-400">Grupo (opcional)</label>
          <input
            value={grupo}
            onChange={(e) => setGrupo(e.target.value)}
            placeholder="A"
            maxLength={2}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-[#F5A623]/50 focus:outline-none"
          />
        </div>
      )}

      {error && <p className="col-span-2 text-sm text-red-400">{error}</p>}

      <div className="col-span-2 flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-[#F5A623] px-4 py-2 text-sm font-semibold text-[#0B1120] hover:bg-[#fbbf24] disabled:opacity-50 transition"
        >
          {saving ? 'Salvando...' : jogo ? 'Atualizar' : 'Criar jogo'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-white/10 px-4 py-2 text-sm text-gray-400 hover:bg-white/5 transition"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
