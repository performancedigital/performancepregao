import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Desativar portais BLL e MUNICIPAL
  await prisma.portal.updateMany({
    where: { type: { in: ['BLL', 'MUNICIPAL'] } },
    data: { isActive: false },
  })
  console.log('✅ Portais BLL e MUNICIPAL desativados.')

  // Ativar todos os portais municipais no IntegrationSource
  await prisma.integrationSource.updateMany({
    where: {
      code: {
        in: [
          'compras-rs',
          'compras-bahia',
          'compras-amazonas',
          'compras-rj',
          'comprasnet-goias',
          'compras-mg',
          'banpara',
          'pe-integrado',
          'e-lic-sc',
          'licitacoes-e',
        ],
      },
    },
    data: { isEnabled: true },
  })
  console.log('✅ Portais municipais ativados no IntegrationSource.')

  // Verificar status atualizado
  console.log('\n📊 Status atualizado:')
  console.log('=====================================')

  const sources = await prisma.integrationSource.findMany({
    where: { isEnabled: true },
    select: { code: true, name: true },
    orderBy: { code: 'asc' },
  })

  for (const s of sources) {
    console.log(`✅ ATIVO | ${s.code} | ${s.name}`)
  }

  const portals = await prisma.portal.findMany({
    where: { isActive: true },
    select: { name: true, type: true },
    orderBy: { name: 'asc' },
  })

  console.log('\n📊 Portais ativos:')
  console.log('=====================================')
  for (const p of portals) {
    console.log(`✅ ${p.type} | ${p.name}`)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
