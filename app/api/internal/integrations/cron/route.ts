import { NextRequest, NextResponse } from 'next/server'
import { runSync } from '@/lib/integrations/core/engine'
import { getAllConnectors } from '@/lib/integrations/registry'

// Vercel: maximo de execucao da function. Hobby aceita ate 60s; Pro ate 300s.
// O default (10s) nao e suficiente para a sincronizacao e causa timeout.
export const maxDuration = 60
export const dynamic = 'force-dynamic'

const CRON_SECRET = process.env.CRON_SECRET

function validateCronAuth(req: NextRequest): boolean {
  const authHeader = req.headers.get('authorization')

  // Vercel injeta automaticamente "Authorization: Bearer <CRON_SECRET>" quando
  // a env CRON_SECRET existe. Tambem aceitamos o header interno x-vercel-cron
  // (injetado pelo Vercel Cron, nao forjavel pelo cliente) independente do valor.
  if (req.headers.get('x-vercel-cron')) {
    return true
  }

  if (CRON_SECRET) {
    return authHeader === `Bearer ${CRON_SECRET}`
  }

  return false
}

async function runCronSync() {
  const connectors = getAllConnectors()
  const results: Record<string, unknown> = {}

  for (const [code, connector] of Object.entries(connectors)) {
    try {
      const result = await runSync(code, connector)
      results[code] = result
    } catch (err) {
      results[code] = { error: err instanceof Error ? err.message : String(err) }
    }
  }

  return NextResponse.json({ ok: true, results })
}

// Vercel Cron Jobs enviam GET por padrao
export async function GET(req: NextRequest) {
  if (!validateCronAuth(req)) {
    return NextResponse.json({ error: 'Nao autorizado - configure CRON_SECRET' }, { status: 401 })
  }
  return runCronSync()
}

// Chamada manual via API
export async function POST(req: NextRequest) {
  if (!validateCronAuth(req)) {
    return NextResponse.json({ error: 'Nao autorizado - configure CRON_SECRET' }, { status: 401 })
  }
  return runCronSync()
}
