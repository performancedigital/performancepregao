import { PrismaClient } from '@prisma/client'
const p = new PrismaClient()
const runs = await p.integrationRun.findMany({ orderBy: { createdAt: 'desc' }, take: 5, include: { source: true } })
for (const r of runs) {
  console.log(r.createdAt.toISOString(), r.source.code, r.status, r.totalFetched, r.totalUpserted, r.errorMessage || '-')
}
await p['\x24disconnect']()
