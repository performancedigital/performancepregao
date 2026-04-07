import { PrismaClient } from '@prisma/client'
const p = new PrismaClient()

const types = ['PNCP', 'COMPRAS_GOV', 'BLL', 'MUNICIPAL']

for (const type of types) {
  const all = await p.portal.findMany({ where: { type }, orderBy: { createdAt: 'asc' } })
  if (all.length <= 1) continue
  const keep = all[0]
  const remove = all.slice(1)
  console.log(`${type}: mantendo ${keep.id}, removendo ${remove.length} duplicados`)
  await p.bidding.updateMany({ where: { portalId: { in: remove.map(r => r.id) } }, data: { portalId: keep.id } })
  await p.portal.deleteMany({ where: { id: { in: remove.map(r => r.id) } } })
}

const remaining = await p.portal.findMany({ select: { id: true, name: true, type: true } })
console.log('Portais restantes:', JSON.stringify(remaining, null, 2))
await p.$disconnect()
