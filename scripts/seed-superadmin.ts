import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create superadmin
  const password = await bcrypt.hash('Admin@2024!', 12)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@performancepregao.online' },
    update: {},
    create: {
      email: 'admin@performancepregao.online',
      name: 'Super Admin',
      password,
      role: 'SUPERADMIN',
      status: 'ACTIVE',
      planType: 'INFINITY_PLUS',
    },
  })

  console.log('✅ Superadmin created:', admin.email)

  // Seed portals
  await prisma.portal.createMany({
    data: [
      {
        name: 'PNCP',
        url: 'https://pncp.gov.br',
        type: 'PNCP',
        isActive: true,
      },
      {
        name: 'Compras.gov',
        url: 'https://compras.gov.br',
        type: 'COMPRAS_GOV',
        isActive: true,
      },
      {
        name: 'BLL Compras',
        url: 'https://bll.org.br',
        type: 'BLL',
        isActive: true,
      },
    ],
    skipDuplicates: true,
  })

  console.log('✅ Portals seeded')

  // Create a demo user (PRO plan)
  const demoPassword = await bcrypt.hash('Demo@2024!', 12)

  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@performancepregao.online' },
    update: {},
    create: {
      email: 'demo@performancepregao.online',
      name: 'Usuário Demo',
      password: demoPassword,
      role: 'USER',
      status: 'ACTIVE',
      planType: 'PRO',
      planExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  })

  console.log('✅ Demo user created:', demoUser.email)

  console.log('\n📋 Credentials summary:')
  console.log('   Admin  → admin@performancepregao.online / Admin@2024!')
  console.log('   Demo   → demo@performancepregao.online  / Demo@2024!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
