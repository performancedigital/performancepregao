import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Verificar status de todos os sources
  const sources = await prisma.integrationSource.findMany({
    select: { code: true, name: true, isEnabled: true, baseUrl: true },
    orderBy: { code: 'asc' },
  })

  console.log('📊 Status dos Integration Sources:')
  console.log('=====================================')
  for (const s of sources) {
    const status = s.isEnabled ? '✅ ATIVO' : '❌ DESATIVADO'
    console.log(`${status} | ${s.code} | ${s.name}`)
    console.log(`         URL: ${s.baseUrl}`)
  }

  // Verificar portais
  console.log('\n📊 Portais cadastrados:')
  console.log('=====================================')
  const portals = await prisma.portal.findMany({
    select: { name: true, type: true, isActive: true, url: true },
    orderBy: { name: 'asc' },
  })

  for (const p of portals) {
    const status = p.isActive ? '✅ ATIVO' : '❌ INATIVO'
    console.log(`${status} | ${p.type} | ${p.name}`)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
