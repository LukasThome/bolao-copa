import { describe, it, expect } from 'vitest'
import { jogoJaIniciou, jogoEstaAberto } from '@/lib/utils'

describe('Regras de tempo para palpites', () => {
  describe('jogoJaIniciou', () => {
    it('retorna true quando o horário do jogo já passou', () => {
      const passado = new Date(Date.now() - 60_000)
      expect(jogoJaIniciou(passado)).toBe(true)
    })

    it('retorna false quando o jogo ainda não começou', () => {
      const futuro = new Date(Date.now() + 60_000)
      expect(jogoJaIniciou(futuro)).toBe(false)
    })

    it('retorna true para datas muito antigas', () => {
      const ontem = new Date(Date.now() - 86_400_000)
      expect(jogoJaIniciou(ontem)).toBe(true)
    })
  })

  describe('jogoEstaAberto', () => {
    it('permite palpite quando o jogo ainda não começou', () => {
      const futuro = new Date(Date.now() + 60_000)
      expect(jogoEstaAberto(futuro)).toBe(true)
    })

    it('bloqueia palpite quando o jogo já começou', () => {
      const passado = new Date(Date.now() - 60_000)
      expect(jogoEstaAberto(passado)).toBe(false)
    })

    it('é o inverso de jogoJaIniciou', () => {
      const data = new Date(Date.now() + 3600_000)
      expect(jogoEstaAberto(data)).toBe(!jogoJaIniciou(data))
    })
  })
})
