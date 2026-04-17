import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Desativar BLL e Licitanet
  await prisma.integrationSource.updateMany({
    where: { code: { in: ['bll', 'licitanet'] } },
    data: { isEnabled: false },
  })
  console.log('BLL e Licitanet desativados.')

  // Ativar ComprasNet
  await prisma.integrationSource.updateMany({
    where: { code: 'comprasnet' },
    data: { isEnabled: true },
  })
  console.log('ComprasNet ativado.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
