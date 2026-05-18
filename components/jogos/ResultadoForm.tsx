'use client'

import { useState } from 'react'

type Props = {
  jogoId: string
  onSuccess: () => void
  onCancel: () => void
}

export function ResultadoForm({ jogoId, onSuccess, onCancel }: Props) {
  const [placarCasa, setPlacarCasa] = useState('')
  const [placarVisita, setPlacarVisita] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const res = await fetch(`/api/jogos/${jogoId}/resultado`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        placarCasa: Number(placarCasa),
        placarVisita: Number(placarVisita),
      }),
    })

    if (res.ok) {
      const data = await res.json()
      alert(`Resultado lançado! ${data.palpitesCalculados} palpites calculados.`)
      onSuccess()
    } else {
      const data = await res.json()
      setError(data.error ?? 'Erro ao lançar resultado')
    }
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <div className="text-center">
        <label className="mb-1 block text-xs text-gray-400">Casa</label>
        <input
          type="number"
          min={0}
          max={20}
          value={placarCasa}
          onChange={(e) => setPlacarCasa(e.target.value)}
          required
          className="w-16 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-center text-lg font-bold text-white focus:border-[#F5A623]/50 focus:outline-none"
        />
      </div>

      <span className="pb-2 text-lg text-[#F5A623]">×</span>

      <div className="text-center">
        <label className="mb-1 block text-xs text-gray-400">Visita</label>
        <input
          type="number"
          min={0}
          max={20}
          value={placarVisita}
          onChange={(e) => setPlacarVisita(e.target.value)}
          required
          className="w-16 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-center text-lg font-bold text-white focus:border-[#F5A623]/50 focus:outline-none"
        />
      </div>

      {error && <p className="w-full text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="rounded-xl bg-[#F5A623] px-4 py-2 text-sm font-semibold text-[#0B1120] hover:bg-[#fbbf24] disabled:opacity-50 transition"
      >
        {saving ? 'Salvando...' : 'Confirmar resultado'}
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="rounded-xl border border-white/10 px-4 py-2 text-sm text-gray-400 hover:bg-white/5 transition"
      >
        Cancelar
      </button>
    </form>
  )
}
