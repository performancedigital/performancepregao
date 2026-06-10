import { prisma } from '@/lib/prisma'
import { Prisma, PortalType } from '@prisma/client'
import { randomUUID } from 'crypto'
import { IConnector, NormalizedBidding } from './connector.interface'
import { sha256 } from './crypto'

const OVERLAP_MINUTES = 5
const BATCH_SIZE = 200 // linhas por INSERT em lote

interface RunSyncResult {
  runId: string
  status: string
  totalFetched: number
  totalUpserted: number
  totalErrors: number
  errorMessage?: string
}

type Prepared = { normalized: NormalizedBidding; record: unknown; hash: string }

/**
 * Upsert em lote de licitacoes via INSERT ... ON CONFLICT.
 * Substitui o upsert registro-a-registro (lento por causa da latencia ao banco
 * remoto) por poucas queries — essencial para caber no limite do serverless.
 */
async function bulkUpsertBiddings(rows: Prepared[], portalId: string, now: Date): Promise<void> {
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const values = rows.slice(i, i + BATCH_SIZE).map(({ normalized: n }) => Prisma.sql`(${randomUUID()}, ${n.externalId}, ${portalId}, ${n.title}, ${n.organ}, ${n.state ?? null}, ${n.city ?? null}, ${n.modality}, ${n.estimatedValue ?? null}, ${n.openingDate ? new Date(n.openingDate) : null}, ${n.closingDate ? new Date(n.closingDate) : null}, ${n.pdfUrl ?? null}, ${n.status}::"BiddingStatus", ${now}, ${now})`)
    await prisma.$executeRaw(Prisma.sql`INSERT INTO "Bidding" ("id","externalId","portalId","title","organ","state","city","modality","estimatedValue","openingDate","closingDate","pdfUrl","status","createdAt","updatedAt") VALUES ${Prisma.join(values)} ON CONFLICT ("externalId") DO UPDATE SET "title"=EXCLUDED."title","organ"=EXCLUDED."organ","state"=EXCLUDED."state","city"=EXCLUDED."city","modality"=EXCLUDED."modality","estimatedValue"=EXCLUDED."estimatedValue","openingDate"=EXCLUDED."openingDate","closingDate"=EXCLUDED."closingDate","pdfUrl"=EXCLUDED."pdfUrl","status"=EXCLUDED."status","updatedAt"=EXCLUDED."updatedAt"`)
  }
}

/** Upsert em lote dos eventos brutos (auditoria + dedup por hash do payload). */
async function bulkUpsertRawEvents(rows: Prepared[], sourceId: string, runId: string, now: Date): Promise<void> {
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const values = rows.slice(i, i + BATCH_SIZE).map(({ normalized: n, record, hash }) => Prisma.sql`(${randomUUID()}, ${sourceId}, ${runId}, ${n.externalId}, ${hash}, ${JSON.stringify(record)}::jsonb, 'PROCESSED'::"EventStatus", ${now}, ${now}, ${now})`)
    await prisma.$executeRaw(Prisma.sql`INSERT INTO "IntegrationRawEvent" ("id","sourceId","runId","externalId","payloadHash","rawPayload","status","processedAt","createdAt","updatedAt") VALUES ${Prisma.join(values)} ON CONFLICT ("sourceId","externalId") DO UPDATE SET "payloadHash"=EXCLUDED."payloadHash","rawPayload"=EXCLUDED."rawPayload","status"=EXCLUDED."status","processedAt"=EXCLUDED."processedAt","updatedAt"=EXCLUDED."updatedAt"`)
  }
}

export async function runSync(
  sourceCode: string,
  connector: IConnector
): Promise<RunSyncResult> {
  const source = await prisma.integrationSource.findUnique({
    where: { code: sourceCode },
  })

  if (!source || !source.isEnabled) {
    return {
      runId: '',
      status: 'SKIPPED',
      totalFetched: 0,
      totalUpserted: 0,
      totalErrors: 0,
      errorMessage: `Source ${sourceCode} nao encontrada ou desabilitada`,
    }
  }

  const windowEnd = new Date()
  const cursorRecord = await prisma.integrationCursor.findUnique({
    where: { sourceId_endpoint: { sourceId: source.id, endpoint: 'default' } },
  })

  const windowStart = cursorRecord
    ? new Date(new Date(cursorRecord.lastValue).getTime() - OVERLAP_MINUTES * 60 * 1000)
    : new Date(Date.now() - 48 * 60 * 60 * 1000)

  const run = await prisma.integrationRun.create({
    data: {
      sourceId: source.id,
      status: 'RUNNING',
      windowStart,
      windowEnd,
      startedAt: new Date(),
    },
  })

  let totalFetched = 0
  let totalUpserted = 0
  let totalErrors = 0
  let cursor: string | null = cursorRecord?.lastValue ?? null
  let runStatus: 'SUCCESS' | 'PARTIAL' | 'FAILED' = 'SUCCESS'
  let lastError: string | undefined

  try {
    const result = await connector.fetchIncremental(cursor, windowStart, windowEnd)
    totalFetched = result.records.length

    // 1) Normaliza e calcula o hash de tudo em memoria
    const prepared: { normalized: NormalizedBidding; record: unknown; hash: string }[] = []
    for (const record of result.records) {
      let normalized: NormalizedBidding | null = null
      try {
        normalized = connector.normalize(record)
        if (!normalized || !connector.validate(normalized)) continue
      } catch {
        totalErrors++
        continue
      }
      prepared.push({ normalized, record, hash: sha256(record) })
    }

    // 2) Pre-carrega os rawEvents existentes em lote (evita 1 query por registro)
    const existingHashes = new Map<string, string>()
    const externalIds = prepared.map((p) => p.normalized.externalId)
    for (let i = 0; i < externalIds.length; i += 1000) {
      const rows = await prisma.integrationRawEvent.findMany({
        where: { sourceId: source.id, externalId: { in: externalIds.slice(i, i + 1000) } },
        select: { externalId: true, payloadHash: true },
      })
      for (const r of rows) existingHashes.set(r.externalId, r.payloadHash)
    }

    // 3) So processa registros novos ou alterados (re-vistos sao ignorados sem custo)
    const toProcess = prepared.filter(
      (p) => existingHashes.get(p.normalized.externalId) !== p.hash
    )

    // 4) Upsert em lote (rapido o suficiente para o serverless)
    if (toProcess.length > 0) {
      const portalCode = toProcess[0].normalized.portalCode as PortalType
      const portal = await prisma.portal.findFirst({
        where: { type: portalCode },
        select: { id: true },
      })
      if (!portal) {
        throw new Error(`Portal nao encontrado para code: ${portalCode}`)
      }

      const now = new Date()
      try {
        await bulkUpsertBiddings(toProcess, portal.id, now)
        await bulkUpsertRawEvents(toProcess, source.id, run.id, now)
        totalUpserted = toProcess.length
      } catch (err) {
        totalErrors = toProcess.length
        lastError = err instanceof Error ? err.message : String(err)
        await prisma.integrationDeadLetter
          .create({
            data: {
              sourceId: source.id,
              runId: run.id,
              externalId: `BATCH-${run.id}`,
              rawPayload: {},
              errorMessage: lastError,
              retryCount: 0,
            },
          })
          .catch(() => {})
      }
    }

    if (totalErrors > 0 && totalUpserted === 0) {
      runStatus = 'FAILED'
    } else if (totalErrors > 0) {
      runStatus = 'PARTIAL'
    }

    await prisma.integrationCursor.upsert({
      where: { sourceId_endpoint: { sourceId: source.id, endpoint: 'default' } },
      create: { sourceId: source.id, endpoint: 'default', lastValue: windowEnd.toISOString() },
      update: { lastValue: windowEnd.toISOString() },
    })
  } catch (err) {
    runStatus = 'FAILED'
    lastError = err instanceof Error ? err.message : String(err)
  }

  await prisma.integrationRun.update({
    where: { id: run.id },
    data: {
      status: runStatus,
      totalFetched,
      totalUpserted,
      totalErrors,
      errorMessage: lastError,
      finishedAt: new Date(),
    },
  })

  return {
    runId: run.id,
    status: runStatus,
    totalFetched,
    totalUpserted,
    totalErrors,
    errorMessage: lastError,
  }
}
