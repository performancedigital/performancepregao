import { PrismaClient } from '@prisma/client'
const p = new PrismaClient()
const mods = await p.bidding.groupBy({ by: ['modality'], _count: { modality: true }, orderBy: { _count: { modality: 'desc' } } })
console.log('Modalidades no banco:')
for (const m of mods) console.log(m._count.modality, '|', m.modality)
const portals = await p.portal.findMany({ select: { id: true, name: true, type: true } })
console.log('\nPortais:', JSON.stringify(portals))
await p.$disconnect()
