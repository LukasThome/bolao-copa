import { describe, it, expect } from 'vitest'
import { calcularPontos } from '@/lib/pontuacao'
import { calcularPremios } from '@/lib/pontuacao'

// ── calcularPontos ────────────────────────────────────────────────────────────

describe('Sistema de pontuação do bolão', () => {
  describe('quando o participante acerta o placar exato', () => {
    it('recebe 10 pontos', () => {
      expect(calcularPontos({ placarCasa: 2, placarVisita: 1 }, { placarCasa: 2, placarVisita: 1 })).toBe(10)
    })

    it('recebe 10 pontos mesmo quando o empate é exato', () => {
      expect(calcularPontos({ placarCasa: 0, placarVisita: 0 }, { placarCasa: 0, placarVisita: 0 })).toBe(10)
    })

    it('recebe 10 pontos em placares altos exatos', () => {
      expect(calcularPontos({ placarCasa: 4, placarVisita: 3 }, { placarCasa: 4, placarVisita: 3 })).toBe(10)
    })
  })

  describe('quando o participante acerta o empate mas erra o placar', () => {
    it('recebe 5 pontos', () => {
      expect(calcularPontos({ placarCasa: 1, placarVisita: 1 }, { placarCasa: 0, placarVisita: 0 })).toBe(5)
    })

    it('recebe 5 pontos com qualquer empate incorreto', () => {
      expect(calcularPontos({ placarCasa: 2, placarVisita: 2 }, { placarCasa: 3, placarVisita: 3 })).toBe(5)
    })
  })

  describe('quando o participante acerta o vencedor mas erra o placar', () => {
    it('recebe 5 pontos quando o time da casa vence', () => {
      expect(calcularPontos({ placarCasa: 3, placarVisita: 1 }, { placarCasa: 2, placarVisita: 0 })).toBe(5)
    })

    it('recebe 5 pontos quando o time visitante vence', () => {
      expect(calcularPontos({ placarCasa: 0, placarVisita: 2 }, { placarCasa: 1, placarVisita: 3 })).toBe(5)
    })
  })

  describe('quando o participante erra o vencedor', () => {
    it('não recebe pontos ao errar quem vence', () => {
      expect(calcularPontos({ placarCasa: 2, placarVisita: 0 }, { placarCasa: 0, placarVisita: 1 })).toBe(0)
    })

    it('não recebe pontos ao palpitar empate e o jogo ter vencedor', () => {
      expect(calcularPontos({ placarCasa: 1, placarVisita: 1 }, { placarCasa: 2, placarVisita: 0 })).toBe(0)
    })

    it('não recebe pontos ao palpitar vencedor e o jogo terminar empatado', () => {
      expect(calcularPontos({ placarCasa: 2, placarVisita: 0 }, { placarCasa: 1, placarVisita: 1 })).toBe(0)
    })
  })
})

// ── calcularPremios ───────────────────────────────────────────────────────────

describe('Distribuição de marmitas', () => {
  describe('quando os participantes têm pontuações distintas', () => {
    it('o primeiro colocado recebe 3 marmitas', () => {
      const ranking = [
        { userId: '1', pontos: 30, acertosExatos: 3 },
        { userId: '2', pontos: 20, acertosExatos: 2 },
        { userId: '3', pontos: 10, acertosExatos: 1 },
      ]
      const result = calcularPremios(ranking)
      expect(result[0].marmitas).toBe(3)
    })

    it('o segundo colocado recebe 1 marmita', () => {
      const ranking = [
        { userId: '1', pontos: 30, acertosExatos: 3 },
        { userId: '2', pontos: 20, acertosExatos: 2 },
        { userId: '3', pontos: 10, acertosExatos: 1 },
      ]
      const result = calcularPremios(ranking)
      expect(result[1].marmitas).toBe(1)
    })

    it('o terceiro colocado recebe 1 marmita', () => {
      const ranking = [
        { userId: '1', pontos: 30, acertosExatos: 3 },
        { userId: '2', pontos: 20, acertosExatos: 2 },
        { userId: '3', pontos: 10, acertosExatos: 1 },
      ]
      const result = calcularPremios(ranking)
      expect(result[2].marmitas).toBe(1)
    })

    it('participantes fora do pódio não recebem marmita', () => {
      const ranking = [
        { userId: '1', pontos: 30, acertosExatos: 3 },
        { userId: '2', pontos: 20, acertosExatos: 2 },
        { userId: '3', pontos: 10, acertosExatos: 1 },
        { userId: '4', pontos: 5, acertosExatos: 0 },
        { userId: '5', pontos: 0, acertosExatos: 0 },
      ]
      const result = calcularPremios(ranking)
      expect(result[3].marmitas).toBeNull()
      expect(result[4].marmitas).toBeNull()
    })
  })

  describe('quando dois participantes empatam no 1º lugar', () => {
    it('cada um recebe 2 marmitas (divisão de 3+1)', () => {
      const ranking = [
        { userId: '1', pontos: 30, acertosExatos: 3 },
        { userId: '2', pontos: 30, acertosExatos: 3 },
        { userId: '3', pontos: 10, acertosExatos: 1 },
      ]
      const result = calcularPremios(ranking)
      expect(result[0].marmitas).toBe(2)
      expect(result[1].marmitas).toBe(2)
    })

    it('o terceiro colocado continua recebendo 1 marmita', () => {
      const ranking = [
        { userId: '1', pontos: 30, acertosExatos: 3 },
        { userId: '2', pontos: 30, acertosExatos: 3 },
        { userId: '3', pontos: 10, acertosExatos: 1 },
      ]
      const result = calcularPremios(ranking)
      expect(result[2].marmitas).toBe(1)
    })
  })

  describe('quando dois participantes empatam no 2º lugar', () => {
    it('cada um recebe 1 marmita', () => {
      const ranking = [
        { userId: '1', pontos: 30, acertosExatos: 3 },
        { userId: '2', pontos: 20, acertosExatos: 2 },
        { userId: '3', pontos: 20, acertosExatos: 2 },
      ]
      const result = calcularPremios(ranking)
      expect(result[1].marmitas).toBe(1)
      expect(result[2].marmitas).toBe(1)
    })
  })
})
