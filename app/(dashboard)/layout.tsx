import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { signOut } from '@/lib/auth'
import Image from 'next/image'
import Link from 'next/link'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/login')

  const isAdmin = session.user.role === 'ADMIN'

  return (
    <div className="min-h-screen bg-[#0B1120]">
      {/* Navigation */}
      <nav className="border-b border-white/10 bg-[#0B1120]/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/" className="font-[var(--font-bebas)] text-2xl tracking-widest text-[#F5A623]">
            🏆 Bolão da Copa
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/palpites" className="text-sm text-gray-300 hover:text-white transition">
              Palpites
            </Link>
            {isAdmin && (
              <Link href="/admin/jogos" className="text-sm text-[#F5A623] hover:text-[#fbbf24] transition">
                Admin
              </Link>
            )}

            {/* User avatar + logout */}
            <div className="flex items-center gap-2">
              {session.user.image && (
                <Image
                  src={session.user.image}
                  alt={session.user.name ?? ''}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              )}
              <form
                action={async () => {
                  'use server'
                  await signOut({ redirectTo: '/login' })
                }}
              >
                <button type="submit" className="text-xs text-gray-500 hover:text-gray-300 transition">
                  Sair
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  )
}
