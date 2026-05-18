import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { PalpiteForm } from '@/components/palpites/PalpiteForm'
import type { Jogo } from '@prisma/client'

// Mock next/navigation
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn() }) }))
// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: { p: ({ children, ...props }: React.PropsWithChildren<object>) => <p {...props}>{children}</p> },
}))

const jogoBase: Jogo = {
  id: 'jogo-1',
  timeCasa: 'Brasil',
  timeVisita: 'Argentina',
  fase: 'GRUPOS',
  grupo: 'A',
  placarCasa: null,
  placarVisita: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  dataHora: new Date(), // overridden in each test
}

describe('Formulário de palpite', () => {
  describe('quando o jogo ainda não começou', () => {
    const jogoFuturo = { ...jogoBase, dataHora: new Date(Date.now() + 86_400_000) }

    it('exibe campos editáveis para o participante palpitar', () => {
      render(<PalpiteForm jogo={jogoFuturo} palpiteExistente={null} aberto={true} />)

      expect(screen.getByLabelText(/placar casa/i)).not.toBeDisabled()
      expect(screen.getByLabelText(/placar visita/i)).not.toBeDisabled()
    })

    it('exibe o botão de salvar palpite', () => {
      render(<PalpiteForm jogo={jogoFuturo} palpiteExistente={null} aberto={true} />)

      expect(screen.getByRole('button', { name: /salvar palpite/i })).toBeInTheDocument()
    })

    it('preenche os campos com o palpite existente quando já palpitou', () => {
      const palpite = {
        id: 'p1', userId: 'u1', jogoId: 'jogo-1',
        placarCasa: 2, placarVisita: 1, pontos: null,
        createdAt: new Date(), updatedAt: new Date(),
      }
      render(<PalpiteForm jogo={jogoFuturo} palpiteExistente={palpite} aberto={true} />)

      expect(screen.getByLabelText(/placar casa/i)).toHaveValue(2)
      expect(screen.getByLabelText(/placar visita/i)).toHaveValue(1)
    })
  })

  describe('quando o jogo já começou', () => {
    const jogoPassado = { ...jogoBase, dataHora: new Date(Date.now() - 86_400_000) }

    it('exibe campos desabilitados', () => {
      render(<PalpiteForm jogo={jogoPassado} palpiteExistente={null} aberto={false} />)

      expect(screen.getByText(/palpites encerrados/i)).toBeInTheDocument()
    })

    it('não exibe formulário de palpite quando não há palpite e jogo encerrado', () => {
      render(<PalpiteForm jogo={jogoPassado} palpiteExistente={null} aberto={false} />)

      expect(screen.queryByRole('button', { name: /salvar palpite/i })).not.toBeInTheDocument()
    })
  })

  describe('quando há campos com palpite e jogo encerrado', () => {
    const jogoPassado = { ...jogoBase, dataHora: new Date(Date.now() - 86_400_000) }
    const palpite = {
      id: 'p1', userId: 'u1', jogoId: 'jogo-1',
      placarCasa: 2, placarVisita: 1, pontos: 10,
      createdAt: new Date(), updatedAt: new Date(),
    }

    it('exibe os campos desabilitados com o palpite registrado', () => {
      render(<PalpiteForm jogo={jogoPassado} palpiteExistente={palpite} aberto={false} />)

      expect(screen.getByLabelText(/placar casa/i)).toBeDisabled()
      expect(screen.getByLabelText(/placar casa/i)).toHaveValue(2)
    })
  })
})
