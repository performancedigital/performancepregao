import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('📊 Verificação após correção:')
  console.log('=====================================\n')

  const sources = await prisma.integrationSource.findMany({
    where: { isEnabled: true },
    select: { code: true, name: true, baseUrl: true },
    orderBy: { code: 'asc' },
  })

  console.log(`✅ Integration Sources Ativos (${sources.length}):`)
  for (const s of sources) {
    console.log(`   • ${s.code} - ${s.name}`)
  }

  const portals = await prisma.portal.findMany({
    where: { isActive: true },
    select: { name: true, type: true },
    orderBy: { name: 'asc' },
  })

  console.log(`\n✅ Portais Ativos (${portals.length}):`)
  for (const p of portals) {
    console.log(`   • ${p.type} - ${p.name}`)
  }

  const inactive = await prisma.integrationSource.findMany({
    where: { isEnabled: false },
    select: { code: true, name: true },
    orderBy: { code: 'asc' },
  })

  console.log(`\n❌ Sources Desativados (${inactive.length}):`)
  for (const s of inactive) {
    console.log(`   • ${s.code} - ${s.name}`)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
