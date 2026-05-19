'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Jogo } from '@prisma/client'
import { formatarDataJogo, labelFase } from '@/lib/utils'
import { JogoForm } from './JogoForm'
import { ResultadoForm } from './ResultadoForm'

type JogoComCount = Jogo & { _count: { palpites: number } }

const CSV_TEMPLATE = `timeCasa,timeVisita,dataHora,fase,grupo
Brasil,Alemanha,2026-06-15T18:00:00-03:00,GRUPOS,A
Argentina,França,2026-06-15T21:00:00-03:00,GRUPOS,B`

export function AdminJogosClient({ jogos: initialJogos }: { jogos: JogoComCount[] }) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [editJogo, setEditJogo] = useState<Jogo | null>(null)
  const [resultadoJogo, setResultadoJogo] = useState<Jogo | null>(null)
  const [importing, setImporting] = useState(false)

  async function handleDelete(id: string) {
    if (!confirm('Deletar este jogo e todos os palpites?')) return
    await fetch(`/api/jogos/${id}`, { method: 'DELETE' })
    router.refresh()
  }

  async function handleCSV(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)

    const text = await file.text()
    const lines = text.trim().split('\n').slice(1) // skip header
    let ok = 0
    let errors = 0

    for (const line of lines) {
      const [timeCasa, timeVisita, dataHora, fase, grupo] = line.split(',').map((s) => s.trim())
      if (!timeCasa || !timeVisita || !dataHora || !fase) { errors++; continue }

      const res = await fetch('/api/jogos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timeCasa, timeVisita, dataHora, fase, grupo: grupo || null }),
      })
      if (res.ok) { ok++ } else { errors++ }
    }

    setImporting(false)
    alert(`Importação concluída: ${ok} jogos criados, ${errors} erros.`)
    router.refresh()
    e.target.value = ''
  }

  function downloadTemplate() {
    const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'template-jogos.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      {/* Actions bar */}
      <div className="mb-6 flex flex-wrap gap-3">
        <button
          onClick={() => { setShowForm(true); setEditJogo(null) }}
          className="rounded-xl bg-[#F5A623] px-4 py-2 text-sm font-semibold text-[#0B1120] hover:bg-[#fbbf24] transition"
        >
          + Novo jogo
        </button>

        <label className="cursor-pointer rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300 hover:bg-white/10 transition">
          {importing ? 'Importando...' : '📥 Importar CSV'}
          <input type="file" accept=".csv" onChange={handleCSV} className="hidden" />
        </label>

        <button
          onClick={downloadTemplate}
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-400 hover:bg-white/10 transition"
        >
          📄 Template CSV
        </button>
      </div>

      {/* Create/Edit form */}
      {(showForm || editJogo) && (
        <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="mb-4 text-sm font-semibold text-white">
            {editJogo ? 'Editar jogo' : 'Novo jogo'}
          </h2>
          <JogoForm
            jogo={editJogo}
            onSuccess={() => { setShowForm(false); setEditJogo(null); router.refresh() }}
            onCancel={() => { setShowForm(false); setEditJogo(null) }}
          />
        </div>
      )}

      {/* Result form */}
      {resultadoJogo && (
        <div className="mb-6 rounded-2xl border border-[#F5A623]/30 bg-[#F5A623]/5 p-5">
          <h2 className="mb-4 text-sm font-semibold text-[#F5A623]">
            Lançar resultado — {resultadoJogo.timeCasa} × {resultadoJogo.timeVisita}
          </h2>
          <ResultadoForm
            jogoId={resultadoJogo.id}
            onSuccess={() => { setResultadoJogo(null); router.refresh() }}
            onCancel={() => setResultadoJogo(null)}
          />
        </div>
      )}

      {/* Games table */}
      <div className="overflow-hidden rounded-2xl border border-white/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-widest text-gray-500">
              <th className="px-4 py-3 text-left">Jogo</th>
              <th className="px-4 py-3 text-left hidden md:table-cell">Data</th>
              <th className="px-4 py-3 text-center hidden md:table-cell">Fase</th>
              <th className="px-4 py-3 text-center">Resultado</th>
              <th className="px-4 py-3 text-center hidden sm:table-cell">Palpites</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {initialJogos.map((jogo) => (
              <tr key={jogo.id} className="border-b border-white/5 last:border-0">
                <td className="px-4 py-3 font-medium text-white">
                  {jogo.timeCasa} × {jogo.timeVisita}
                </td>
                <td className="px-4 py-3 text-gray-400 hidden md:table-cell">
                  {formatarDataJogo(jogo.dataHora)}
                </td>
                <td className="px-4 py-3 text-center text-gray-400 hidden md:table-cell">
                  {labelFase(jogo.fase)}
                </td>
                <td className="px-4 py-3 text-center">
                  {jogo.placarCasa !== null ? (
                    <span className="font-semibold text-[#F5A623]">
                      {jogo.placarCasa} × {jogo.placarVisita}
                    </span>
                  ) : (
                    <button
                      onClick={() => setResultadoJogo(jogo)}
                      className="rounded-lg border border-white/10 px-3 py-1 text-xs text-gray-400 hover:border-[#F5A623]/30 hover:text-[#F5A623] transition"
                    >
                      Lançar
                    </button>
                  )}
                </td>
                <td className="px-4 py-3 text-center text-gray-400 hidden sm:table-cell">
                  {jogo._count.palpites}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => { setEditJogo(jogo); setShowForm(false) }}
                      className="text-xs text-gray-500 hover:text-white transition"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(jogo.id)}
                      className="text-xs text-red-500 hover:text-red-400 transition"
                    >
                      Deletar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {initialJogos.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-600">
                  Nenhum jogo cadastrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
