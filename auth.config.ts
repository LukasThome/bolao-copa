import type { NextAuthConfig } from 'next-auth'
import Google from 'next-auth/providers/google'

type Role = 'USER' | 'ADMIN'

// Config leve sem Prisma — segura para Edge Runtime (middleware)
export const authConfig = {
  providers: [Google],
  pages: { signIn: '/login' },
  session: { strategy: 'jwt' as const },
  callbacks: {
    jwt({ token, user }) {
      // Na primeira vez (login), user existe — salvamos id e role no token
      if (user) {
        token.id = user.id
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        token.role = (user as any).role ?? 'USER'
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.id as string
      session.user.role = token.role as Role
      return session
    },
  },
} satisfies NextAuthConfig
