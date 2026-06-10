const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function ensurePortal(type, name, url, isActive) {
  const existing = await prisma.portal.findFirst({
    where: { type },
    orderBy: { createdAt: 'asc' },
  })

  if (existing) {
    await prisma.portal.update({
      where: { id: existing.id },
      data: { name, url, isActive },
    })
    return existing.id
  }

  const created = await prisma.portal.create({
    data: { type, name, url, isActive },
  })
  return created.id
}

async function main() {
  // PNCP e a fonte unica e autoritativa: agrega licitacoes federais, estaduais e
  // municipais (Lei 14.133). ComprasNet/dados-abertos foi removido (endpoint
  // legado vazio; o moderno apenas duplicava o PNCP).
  await ensurePortal('PNCP', 'PNCP', 'https://pncp.gov.br', true)

  await prisma.integrationSource.upsert({
    where: { code: 'pncp' },
    create: {
      code: 'pncp',
      name: 'PNCP',
      baseUrl: 'https://pncp.gov.br/api/consulta/v1',
      authType: 'none',
      rateLimit: 60,
      supportsIncremental: true,
      isEnabled: true,
    },
    update: {
      name: 'PNCP',
      baseUrl: 'https://pncp.gov.br/api/consulta/v1',
      authType: 'none',
      rateLimit: 60,
      supportsIncremental: true,
      isEnabled: true,
    },
  })

  // Desativa qualquer outra fonte legada que ainda exista no banco.
  await prisma.integrationSource.updateMany({
    where: { code: { not: 'pncp' } },
    data: { isEnabled: false },
  })

  // Desativa portais que nao sejam PNCP (ex.: COMPRAS_GOV legado).
  await prisma.portal.updateMany({
    where: { type: { not: 'PNCP' } },
    data: { isActive: false },
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })