import { type ClassValue, clsx } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

/** Retorna true se o horário do jogo já passou */
export function jogoJaIniciou(dataHora: Date): boolean {
  return new Date() >= dataHora
}

/** Retorna true se ainda é possível enviar palpite */
export function jogoEstaAberto(dataHora: Date): boolean {
  return !jogoJaIniciou(dataHora)
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
