'use client'

import { useState, useTransition } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { gerarSecret, salvarEnv, testarConexao } from '@/app/setup/actions'

type FormData = {
  DATABASE_URL: string
  AUTH_SECRET: string
  AUTH_URL: string
  GOOGLE_CLIENT_ID: string
  GOOGLE_CLIENT_SECRET: string
}

const STEPS = ['Banco de dados', 'NextAuth', 'Google OAuth', 'Conclusão']

const slide = {
  initial: (dir: number) => ({ x: dir * 48, opacity: 0 }),
  animate: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir * -48, opacity: 0 }),
  transition: { duration: 0.22, ease: 'easeInOut' },
}

// ── Shared UI ─────────────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return <label className="mb-1.5 block text-xs font-medium text-gray-400">{children}</label>
}

function Input({
  value,
  onChange,
  placeholder,
  type = 'text',
  readOnly,
}: {
  value: string
  onChange?: (v: string) => void
  placeholder?: string
  type?: string
  readOnly?: boolean
}) {
  return (
    <input
      type={type}
      value={value}
      readOnly={readOnly}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-[#F5A623]/50 focus:ring-1 focus:ring-[#F5A623]/30 disabled:opacity-40"
    />
  )
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-white/5 bg-white/3 p-3 text-xs leading-relaxed text-gray-400">
      {children}
    </div>
  )
}

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[#F5A623] underline-offset-2 hover:underline"
    >
      {children}
    </a>
  )
}

function StatusPill({ ok, erro }: { ok: boolean | null; erro?: string }) {
  if (ok === null) return null
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
        ok
          ? 'bg-green-500/20 text-green-400'
          : 'bg-red-500/20 text-red-400'
      }`}
    >
      {ok ? '✓ Conectado' : `✗ ${erro ?? 'Erro'}`}
    </span>
  )
}

// ── Steps ─────────────────────────────────────────────────────────────────────

function DatabaseStep({
  data,
  onChange,
}: {
  data: FormData
  onChange: (k: keyof FormData, v: string) => void
}) {
  const [status, setStatus] = useState<{ ok: boolean; erro?: string } | null>(null)
  const [pending, startTransition] = useTransition()

  function testar() {
    startTransition(async () => {
      const res = await testarConexao(data.DATABASE_URL)
      setStatus(res)
    })
  }

  return (
    <div className="space-y-5">
      <div>
        <Label>DATABASE_URL</Label>
        <Input
          value={data.DATABASE_URL}
          onChange={(v) => { onChange('DATABASE_URL', v); setStatus(null) }}
          placeholder="postgresql://postgres:senha@db.xxx.supabase.co:5432/postgres"
        />
        <div className="mt-2 flex items-center gap-3">
          <button
            onClick={testar}
            disabled={!data.DATABASE_URL || pending}
            className="rounded-lg bg-white/10 px-3 py-1.5 text-xs text-white transition hover:bg-white/15 disabled:opacity-40"
          >
            {pending ? 'Testando…' : 'Testar conexão'}
          </button>
          {status && <StatusPill ok={status.ok} erro={status.erro} />}
        </div>
      </div>

      <Note>
        <p className="mb-2 font-medium text-white/70">Como obter a URL no Supabase:</p>
        <ol className="list-inside list-decimal space-y-1">
          <li>Acesse <ExternalLink href="https://supabase.com">supabase.com</ExternalLink> e crie um projeto</li>
          <li>Vá em <strong className="text-white/60">Settings → Database</strong></li>
          <li>Copie a <strong className="text-white/60">Connection string → URI</strong></li>
          <li>Substitua <code className="text-[#F5A623]">[YOUR-PASSWORD]</code> pela senha do banco</li>
        </ol>
      </Note>
    </div>
  )
}

function AuthStep({
  data,
  onChange,
}: {
  data: FormData
  onChange: (k: keyof FormData, v: string) => void
}) {
  const [pending, startTransition] = useTransition()

  function gerar() {
    startTransition(async () => {
      const secret = await gerarSecret()
      onChange('AUTH_SECRET', secret)
    })
  }

  return (
    <div className="space-y-5">
      <div>
        <Label>AUTH_SECRET</Label>
        <div className="flex gap-2">
          <Input value={data.AUTH_SECRET} onChange={(v) => onChange('AUTH_SECRET', v)} readOnly />
          <button
            onClick={gerar}
            disabled={pending}
            className="shrink-0 rounded-lg bg-[#F5A623]/20 px-3 py-2.5 text-xs font-medium text-[#F5A623] transition hover:bg-[#F5A623]/30 disabled:opacity-40"
          >
            {pending ? '…' : 'Gerar'}
          </button>
        </div>
        <p className="mt-1.5 text-xs text-gray-600">
          Clique em <strong className="text-gray-400">Gerar</strong> para criar uma chave segura aleatória.
        </p>
      </div>

      <div>
        <Label>AUTH_URL</Label>
        <Input
          value={data.AUTH_URL}
          onChange={(v) => onChange('AUTH_URL', v)}
          placeholder="http://localhost:3000"
        />
        <p className="mt-1.5 text-xs text-gray-600">
          URL base da aplicação. Em produção, use a URL do Vercel (ex: <code className="text-gray-400">https://bolao-copa.vercel.app</code>).
        </p>
      </div>
    </div>
  )
}

function GoogleStep({
  data,
  onChange,
}: {
  data: FormData
  onChange: (k: keyof FormData, v: string) => void
}) {
  return (
    <div className="space-y-5">
      <div>
        <Label>GOOGLE_CLIENT_ID</Label>
        <Input
          value={data.GOOGLE_CLIENT_ID}
          onChange={(v) => onChange('GOOGLE_CLIENT_ID', v)}
          placeholder="123456789-abc.apps.googleusercontent.com"
        />
      </div>

      <div>
        <Label>GOOGLE_CLIENT_SECRET</Label>
        <Input
          value={data.GOOGLE_CLIENT_SECRET}
          onChange={(v) => onChange('GOOGLE_CLIENT_SECRET', v)}
          placeholder="GOCSPX-..."
          type="password"
        />
      </div>

      <Note>
        <p className="mb-2 font-medium text-white/70">Como criar as credenciais:</p>
        <ol className="list-inside list-decimal space-y-1.5">
          <li>
            Acesse o{' '}
            <ExternalLink href="https://console.cloud.google.com/apis/credentials">
              Google Cloud Console → Credenciais
            </ExternalLink>
          </li>
          <li>
            Clique em <strong className="text-white/60">Criar credenciais → ID do cliente OAuth</strong>
          </li>
          <li>
            Tipo: <strong className="text-white/60">Aplicativo da Web</strong>
          </li>
          <li>
            Origens JS autorizadas: <code className="text-[#F5A623]">http://localhost:3000</code>
          </li>
          <li>
            URIs de redirecionamento:{' '}
            <code className="text-[#F5A623]">http://localhost:3000/api/auth/callback/google</code>
          </li>
        </ol>
      </Note>
    </div>
  )
}

function SummaryStep({
  data,
  onSave,
}: {
  data: FormData
  onSave: () => Promise<void>
}) {
  const [saved, setSaved] = useState(false)
  const [pending, startTransition] = useTransition()
  const [erro, setErro] = useState<string | null>(null)

  function salvar() {
    startTransition(async () => {
      try {
        await onSave()
        setSaved(true)
      } catch (e) {
        setErro(e instanceof Error ? e.message : 'Erro ao salvar')
      }
    })
  }

  const campos = [
    { label: 'DATABASE_URL', value: data.DATABASE_URL, mask: true },
    { label: 'AUTH_SECRET', value: data.AUTH_SECRET, mask: true },
    { label: 'AUTH_URL', value: data.AUTH_URL },
    { label: 'GOOGLE_CLIENT_ID', value: data.GOOGLE_CLIENT_ID },
    { label: 'GOOGLE_CLIENT_SECRET', value: data.GOOGLE_CLIENT_SECRET, mask: true },
  ]

  function mascarar(v: string) {
    if (!v) return <span className="italic text-gray-600">não preenchido</span>
    return v.slice(0, 8) + '••••••••'
  }

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-white/10 bg-white/3 divide-y divide-white/5">
        {campos.map(({ label, value, mask }) => (
          <div key={label} className="flex items-center justify-between gap-4 px-3 py-2.5">
            <code className="text-xs text-gray-400">{label}</code>
            <span className="text-right text-xs text-white/70 font-mono break-all">
              {mask ? mascarar(value) : value || <span className="italic text-gray-600">não preenchido</span>}
            </span>
          </div>
        ))}
      </div>

      {!saved ? (
        <div className="space-y-2">
          <button
            onClick={salvar}
            disabled={pending}
            className="w-full rounded-xl bg-[#F5A623] py-3 text-sm font-semibold text-[#0B1120] transition hover:bg-[#fbbf24] disabled:opacity-50"
          >
            {pending ? 'Salvando…' : 'Salvar .env.local'}
          </button>
          {erro && <p className="text-center text-xs text-red-400">{erro}</p>}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-4 text-center">
            <p className="text-sm font-medium text-green-400">
              ✓ .env.local salvo com sucesso!
            </p>
            <p className="mt-1 text-xs text-gray-500">Reinicie o servidor com <code className="text-gray-400">npm run dev</code></p>
          </div>

          <Note>
            <p className="mb-2 font-medium text-white/70">Deploy no Vercel:</p>
            <ol className="list-inside list-decimal space-y-1.5">
              <li>
                Acesse <ExternalLink href="https://vercel.com/new">vercel.com/new</ExternalLink> e importe o repositório <code className="text-[#F5A623]">bolao-copa</code>
              </li>
              <li>
                Em <strong className="text-white/60">Environment Variables</strong>, adicione as mesmas 5 variáveis acima
              </li>
              <li>
                Em <strong className="text-white/60">AUTH_URL</strong>, use a URL final do Vercel (ex: <code className="text-[#F5A623]">https://bolao-copa.vercel.app</code>)
              </li>
              <li>
                No Google Cloud Console, adicione a URL de produção nas origens e URIs autorizadas
              </li>
              <li>Clique em <strong className="text-white/60">Deploy</strong></li>
            </ol>
          </Note>
        </div>
      )}
    </div>
  )
}

// ── Wizard ────────────────────────────────────────────────────────────────────

export function SetupWizard() {
  const [step, setStep] = useState(0)
  const [dir, setDir] = useState(1)
  const [data, setData] = useState<FormData>({
    DATABASE_URL: '',
    AUTH_SECRET: '',
    AUTH_URL: 'http://localhost:3000',
    GOOGLE_CLIENT_ID: '',
    GOOGLE_CLIENT_SECRET: '',
  })

  function onChange(k: keyof FormData, v: string) {
    setData((prev) => ({ ...prev, [k]: v }))
  }

  function avancar() {
    setDir(1)
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }

  function voltar() {
    setDir(-1)
    setStep((s) => Math.max(s - 1, 0))
  }

  async function salvar() {
    await salvarEnv(data)
  }

  const canAdvance = [
    !!data.DATABASE_URL,
    !!data.AUTH_SECRET && !!data.AUTH_URL,
    !!data.GOOGLE_CLIENT_ID && !!data.GOOGLE_CLIENT_SECRET,
    true,
  ][step]

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#0B1120] px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="font-[var(--font-bebas)] text-4xl tracking-widest text-[#F5A623]">
            Configuração
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Preencha as credenciais para rodar o Bolão da Copa
          </p>
        </div>

        {/* Step indicator */}
        <div className="mb-6 flex items-center justify-between">
          {STEPS.map((label, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                  i < step
                    ? 'bg-[#F5A623] text-[#0B1120]'
                    : i === step
                      ? 'border-2 border-[#F5A623] text-[#F5A623]'
                      : 'border border-white/10 text-gray-600'
                }`}
              >
                {i < step ? '✓' : i + 1}
              </div>
              <span
                className={`text-center text-[10px] leading-tight ${
                  i === step ? 'text-[#F5A623]' : 'text-gray-600'
                }`}
              >
                {label}
              </span>
              {i < STEPS.length - 1 && (
                <div
                  className={`absolute mt-3.5 h-px w-[calc(25%-1.75rem)] translate-x-[calc(50%+3.5rem)] ${
                    i < step ? 'bg-[#F5A623]/50' : 'bg-white/10'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={step}
              custom={dir}
              variants={slide}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={slide.transition}
            >
              <h2 className="mb-5 text-base font-semibold text-white">{STEPS[step]}</h2>

              {step === 0 && <DatabaseStep data={data} onChange={onChange} />}
              {step === 1 && <AuthStep data={data} onChange={onChange} />}
              {step === 2 && <GoogleStep data={data} onChange={onChange} />}
              {step === 3 && <SummaryStep data={data} onSave={salvar} />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        {step < STEPS.length - 1 && (
          <div className="mt-4 flex justify-between">
            <button
              onClick={voltar}
              disabled={step === 0}
              className="rounded-lg px-4 py-2 text-sm text-gray-500 transition hover:text-white disabled:opacity-0"
            >
              ← Voltar
            </button>
            <button
              onClick={avancar}
              disabled={!canAdvance}
              className="rounded-lg bg-[#F5A623]/20 px-5 py-2 text-sm font-medium text-[#F5A623] transition hover:bg-[#F5A623]/30 disabled:opacity-40"
            >
              Próximo →
            </button>
          </div>
        )}
        {step === STEPS.length - 1 && (
          <div className="mt-4 flex justify-start">
            <button
              onClick={voltar}
              className="rounded-lg px-4 py-2 text-sm text-gray-500 transition hover:text-white"
            >
              ← Voltar
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
