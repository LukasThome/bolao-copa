'use server'

import { writeFile } from 'fs/promises'
import path from 'path'
import crypto from 'crypto'
import { PrismaClient } from '@prisma/client'

function devOnly() {
  if (process.env.NODE_ENV !== 'development') {
    throw new Error('Disponível apenas em desenvolvimento')
  }
}

export async function gerarSecret(): Promise<string> {
  return crypto.randomBytes(32).toString('base64')
}

export async function testarConexao(
  url: string,
): Promise<{ ok: boolean; erro?: string }> {
  devOnly()
  if (!url) return { ok: false, erro: 'URL vazia' }

  const client = new PrismaClient({ datasources: { db: { url } } })
  try {
    await client.$queryRaw`SELECT 1`
    return { ok: true }
  } catch (e) {
    return { ok: false, erro: e instanceof Error ? e.message : String(e) }
  } finally {
    await client.$disconnect()
  }
}

export async function salvarEnv(dados: {
  DATABASE_URL: string
  AUTH_SECRET: string
  AUTH_URL: string
  GOOGLE_CLIENT_ID: string
  GOOGLE_CLIENT_SECRET: string
}): Promise<void> {
  devOnly()

  const linhas = Object.entries(dados)
    .map(([k, v]) => `${k}="${v.replace(/"/g, '\\"')}"`)
    .join('\n')

  const caminho = path.join(process.cwd(), '.env.local')
  await writeFile(caminho, linhas + '\n', 'utf8')
}
