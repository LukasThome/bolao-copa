import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    session({ session, user }) {
      session.user.id = user.id
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      session.user.role = (user as any).role
      return session
    },
  },
  events: {
    async signIn({ user }) {
      if (user.id) {
        await prisma.loginLog.create({ data: { userId: user.id } })
      }
    },
  },
  pages: {
    signIn: '/login',
  },
})
