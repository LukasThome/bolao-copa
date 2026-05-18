import type { User, Jogo, Palpite, FaseJogo, Role } from '@prisma/client'

export type { User, Jogo, Palpite, FaseJogo, Role }

export type JogoComPalpite = Jogo & {
  palpites: Palpite[]
  meuPalpite?: Palpite | null
}

export type RankingEntry = {
  posicao: number
  userId: string
  name: string | null
  image: string | null
  pontos: number
  acertosExatos: number
  totalPalpites: number
  marmitas: number | null
}

export type StatusJogo = 'aberto' | 'encerrado' | 'resultado_lancado'

export function statusJogo(jogo: Jogo): StatusJogo {
  if (jogo.placarCasa !== null && jogo.placarVisita !== null) return 'resultado_lancado'
  if (new Date() >= jogo.dataHora) return 'encerrado'
  return 'aberto'
}

// NextAuth session augmentation
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: Role
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}
