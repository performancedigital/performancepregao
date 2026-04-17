import { prisma } from '@/lib/prisma'
import { IConnector, NormalizedBidding } from './connector.interface'
import { sha256 } from './crypto'

const MAX_RETRIES = 3
const OVERLAP_MINUTES = 5

interface RunSyncResult {
  runId: string
  status: string
  totalFetched: number
  totalUpserted: number
  totalErrors: number
  errorMessage?: string
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function upsertBidding(
  normalized: NormalizedBidding,
  prismaClient: typeof prisma
) {
  const portal = await prismaClient.portal.findFirst({
    where: { type: normalized.portalCode as 'PNCP' | 'COMPRAS_GOV' },
    select: { id: true },
  })

  if (!portal) {
    throw new Error(`Portal nao encontrado para code: ${normalized.portalCode}`)
  }

  await prismaClient.bidding.upsert({
    where: { externalId: normalized.externalId },
    create: {
      externalId: normalized.externalId,
      portalId: portal.id,
      title: normalized.title,
      organ: normalized.organ,
      state: normalized.state ?? null,
      city: normalized.city ?? null,
      modality: normalized.modality,
      estimatedValue: normalized.estimatedValue ?? null,
      openingDate: normalized.openingDate ? new Date(normalized.openingDate) : null,
      pdfUrl: normalized.pdfUrl ?? null,
      status: normalized.status,
    },
    update: {
      title: normalized.title,
      organ: normalized.organ,
      state: normalized.state ?? null,
      city: normalized.city ?? null,
      modality: normalized.modality,
      estimatedValue: normalized.estimatedValue ?? null,
      openingDate: normalized.openingDate ? new Date(normalized.openingDate) : null,
      pdfUrl: normalized.pdfUrl ?? null,
      status: normalized.status,
      updatedAt: new Date(),
    },
  })
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
    let hasMore = true

    while (hasMore) {
      const result = await connector.fetchIncremental(cursor, windowStart, windowEnd)
      totalFetched += result.records.length

      for (const record of result.records) {
        let normalized: NormalizedBidding | null = null
        try {
          normalized = connector.normalize(record)
          if (!normalized || !connector.validate(normalized)) {
            continue
          }
        } catch {
          totalErrors++
          continue
        }

        const hash = sha256(record)

        const existing = await prisma.integrationRawEvent.findUnique({
          where: { sourceId_externalId: { sourceId: source.id, externalId: normalized.externalId } },
        })

        if (existing && existing.payloadHash === hash) {
          await prisma.integrationRawEvent.update({
            where: { id: existing.id },
            data: { status: 'SKIPPED', updatedAt: new Date() },
          })
          continue
        }

        let retries = 0
        let success = false

        while (retries < MAX_RETRIES && !success) {
          try {
            await upsertBidding(normalized, prisma)

            if (existing) {
              await prisma.integrationRawEvent.update({
                where: { id: existing.id },
                data: {
                  payloadHash: hash,
                  rawPayload: record as object,
                  status: 'PROCESSED',
                  processedAt: new Date(),
                  updatedAt: new Date(),
                },
              })
            } else {
              await prisma.integrationRawEvent.create({
                data: {
                  sourceId: source.id,
                  runId: run.id,
                  externalId: normalized.externalId,
                  payloadHash: hash,
                  rawPayload: record as object,
                  status: 'PROCESSED',
                  processedAt: new Date(),
                },
              })
            }

            totalUpserted++
            success = true
          } catch (err) {
            retries++
            if (retries < MAX_RETRIES) {
              await sleep(500 * Math.pow(2, retries))
            } else {
              totalErrors++
              lastError = err instanceof Error ? err.message : String(err)
              await prisma.integrationDeadLetter.create({
                data: {
                  sourceId: source.id,
                  runId: run.id,
                  externalId: normalized.externalId,
                  rawPayload: record as object,
                  errorMessage: lastError,
                  retryCount: retries,
                },
              })
            }
          }
        }
      }

      if (result.nextCursor) {
        cursor = result.nextCursor
      } else {
        hasMore = false
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
