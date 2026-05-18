export type ResultadoPlacar = {
  placarCasa: number
  placarVisita: number
}

/**
 * Calcula os pontos de um palpite dado o resultado real de um jogo.
 *
 * Regras:
 * - Placar exato         → 10 pontos
 * - Acertou o empate     →  5 pontos
 * - Acertou o vencedor   →  5 pontos
 * - Errou tudo           →  0 pontos
 */
export function calcularPontos(
  palpite: ResultadoPlacar,
  resultado: ResultadoPlacar
): number {
  const acertouExato =
    palpite.placarCasa === resultado.placarCasa &&
    palpite.placarVisita === resultado.placarVisita

  if (acertouExato) return 10

  const palpiteEmpate = palpite.placarCasa === palpite.placarVisita
  const resultadoEmpate = resultado.placarCasa === resultado.placarVisita

  if (palpiteEmpate && resultadoEmpate) return 5

  const vencedorPalpite = Math.sign(palpite.placarCasa - palpite.placarVisita)
  const vencedorResultado = Math.sign(resultado.placarCasa - resultado.placarVisita)

  if (!palpiteEmpate && !resultadoEmpate && vencedorPalpite === vencedorResultado) return 5

  return 0
}

/**
 * Calcula a distribuição de marmitas para o pódio.
 * 1º → 3 marmitas | 2º → 1 marmita | 3º → 1 marmita
 * Em caso de empate, os prêmios das posições empatadas são somados e divididos.
 */
export type EntradaRanking = {
  userId: string
  pontos: number
  acertosExatos: number
}

export type PremioRanking = EntradaRanking & {
  posicao: number
  marmitas: number | null
}

const PREMIOS = [3, 1, 1] // posições 1, 2, 3

export function calcularPremios(ranking: EntradaRanking[]): PremioRanking[] {
  const resultado: PremioRanking[] = []
  let i = 0

  while (i < ranking.length) {
    const atual = ranking[i]
    // Encontra todos os participantes empatados nesta posição
    let j = i
    while (
      j < ranking.length &&
      ranking[j].pontos === atual.pontos &&
      ranking[j].acertosExatos === atual.acertosExatos
    ) {
      j++
    }

    const posicao = i + 1 // posição 1-indexed
    const empatados = j - i

    // Soma os prêmios das posições cobertas pelo grupo empatado
    let totalMarmitas = 0
    for (let p = posicao; p < posicao + empatados && p <= PREMIOS.length; p++) {
      totalMarmitas += PREMIOS[p - 1]
    }

    const marmitasPorPessoa =
      posicao <= PREMIOS.length ? Math.floor(totalMarmitas / empatados) : null

    for (let k = i; k < j; k++) {
      resultado.push({
        ...ranking[k],
        posicao,
        marmitas: marmitasPorPessoa,
      })
    }

    i = j
  }

  return resultado
}
