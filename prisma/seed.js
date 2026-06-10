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
  // PNCP e a fonte unica e autoritativa (agrega federal + estadual + municipal,
  // Lei 14.133). ComprasNet/dados-abertos foi desativado: o endpoint legado
  // retorna vazio e o moderno apenas duplica os dados do PNCP.
  await ensurePortal('PNCP', 'PNCP', 'https://pncp.gov.br', true)
  await ensurePortal('COMPRAS_GOV', 'ComprasNet Federal', 'https://dadosabertos.compras.gov.br', false)

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

  await prisma.integrationSource.upsert({
    where: { code: 'comprasnet' },
    create: {
      code: 'comprasnet',
      name: 'ComprasNet Federal',
      baseUrl: 'https://dadosabertos.compras.gov.br',
      authType: 'none',
      rateLimit: 60,
      supportsIncremental: true,
      isEnabled: false,
    },
    update: {
      name: 'ComprasNet Federal',
      baseUrl: 'https://dadosabertos.compras.gov.br',
      authType: 'none',
      rateLimit: 60,
      supportsIncremental: true,
      isEnabled: false,
    },
  })

  await prisma.integrationSource.updateMany({
    where: { code: { notIn: ['pncp', 'comprasnet'] } },
    data: { isEnabled: false },
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