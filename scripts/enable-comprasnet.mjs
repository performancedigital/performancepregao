import { PrismaClient } from '@prisma/client'
const p = new PrismaClient()

// Habilitar ComprasNet
await p.integrationSource.updateMany({
  where: { code: 'comprasnet' },
  data: { isEnabled: true },
})

// Reset cursor PNCP para forcar novo sync
await p.integrationCursor.deleteMany({ where: { source: { code: 'pncp' } } })

console.log('ComprasNet habilitado. Cursor PNCP resetado.')
await p.$disconnect()
