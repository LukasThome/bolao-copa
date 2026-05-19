import { type ClassValue, clsx } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

// Cidades-sede da Copa 2026 com seus fusos IANA
export const CIDADES_SEDE = [
  { nome: 'New York / New Jersey', fuso: 'America/New_York' },
  { nome: 'Los Angeles',           fuso: 'America/Los_Angeles' },
  { nome: 'Dallas',                fuso: 'America/Chicago' },
  { nome: 'São Francisco',         fuso: 'America/Los_Angeles' },
  { nome: 'Seattle',               fuso: 'America/Los_Angeles' },
  { nome: 'Miami',                 fuso: 'America/New_York' },
  { nome: 'Boston',                fuso: 'America/New_York' },
  { nome: 'Filadélfia',            fuso: 'America/New_York' },
  { nome: 'Atlanta',               fuso: 'America/New_York' },
  { nome: 'Houston',               fuso: 'America/Chicago' },
  { nome: 'Kansas City',           fuso: 'America/Chicago' },
  { nome: 'Toronto',               fuso: 'America/Toronto' },
  { nome: 'Vancouver',             fuso: 'America/Vancouver' },
  { nome: 'Cidade do México',      fuso: 'America/Mexico_City' },
  { nome: 'Guadalajara',           fuso: 'America/Mexico_City' },
  { nome: 'Monterrey',             fuso: 'America/Monterrey' },
] as const

export type CidadeSede = (typeof CIDADES_SEDE)[number]

/**
 * Converte horário local da cidade-sede para UTC ISO string.
 * Usa o offset real do fuso (incluindo horário de verão) na data informada.
 * Ex: "2026-07-02T20:00" + "America/New_York" → "2026-07-03T00:00:00.000Z"
 */
export function localParaUTC(localStr: string, timezone: string): string {
  const fakeUtc = new Date(localStr + ':00.000Z')
  const tzName = new Intl.DateTimeFormat('en', {
    timeZone: timezone,
    timeZoneName: 'longOffset',
  })
    .formatToParts(fakeUtc)
    .find((p) => p.type === 'timeZoneName')?.value ?? 'GMT+00:00'

  const match = tzName.match(/GMT([+-])(\d{2}):(\d{2})/)
  if (!match) return fakeUtc.toISOString()

  const sign = match[1] === '+' ? 1 : -1
  const offsetMs = sign * (parseInt(match[2]) * 60 + parseInt(match[3])) * 60_000
  return new Date(fakeUtc.getTime() - offsetMs).toISOString()
}

/**
 * Converte data UTC para string "YYYY-MM-DDTHH:MM" no fuso da cidade-sede.
 * Usado para preencher o datetime-local ao editar um jogo.
 */
export function utcParaLocal(date: Date | string, timezone: string): string {
  const d = new Date(date)
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(d)

  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '00'
  return `${get('year')}-${get('month')}-${get('day')}T${get('hour').padStart(2, '0')}:${get('minute')}`
}

/** Retorna true se o jogo já iniciou */
export function jogoJaIniciou(dataHora: Date): boolean {
  return new Date() >= dataHora
}

/** Retorna true se ainda é possível enviar palpite (fecha 10 min antes do início) */
export function jogoEstaAberto(dataHora: Date): boolean {
  return Date.now() < new Date(dataHora).getTime() - 10 * 60_000
}

/** Formata data para exibição em pt-BR */
export function formatarDataJogo(dataHora: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  }).format(dataHora)
}

/** Label da fase do jogo */
export function labelFase(fase: string): string {
  const labels: Record<string, string> = {
    GRUPOS: 'Fase de Grupos',
    OITAVAS: 'Oitavas de Final',
    QUARTAS: 'Quartas de Final',
    SEMIFINAL: 'Semifinal',
    TERCEIRO_LUGAR: 'Disputa pelo 3º Lugar',
    FINAL: 'Final',
  }
  return labels[fase] ?? fase
}
