import { PrismaClient } from '@prisma/client'
import { runSync } from '../lib/integrations/core/engine.js'
import { ComprasnetConnector } from '../lib/integrations/connectors/comprasnet.connector.js'

const p = new PrismaClient()

console.log('Testando sync ComprasNet...')
const connector = new ComprasnetConnector()
const result = await runSync('comprasnet', connector)
console.log('Resultado:', JSON.stringify(result, null, 2))

const total = await p.bidding.count()
console.log(`Total no banco: ${total} editais`)
await p.$disconnect()
