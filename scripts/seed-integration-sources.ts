import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const sources = [
  { code: 'pncp', name: 'PNCP', baseUrl: 'https://pncp.gov.br/api/consulta/v1', authType: 'none', supportsIncremental: true, rateLimit: 60 },
  { code: 'comprasnet', name: 'ComprasNet / Compras.gov', baseUrl: 'https://dadosabertos.compras.gov.br', authType: 'none', supportsIncremental: true, rateLimit: 30 },
  // { code: 'licitanet', name: 'Licitanet', baseUrl: 'https://licitanet.com.br', authType: 'none', supportsIncremental: false, rateLimit: 20 }, // Removido - stub não implementado
  // { code: 'bll', name: 'BLL Compras', baseUrl: 'https://bllcompras.com', authType: 'playwright', supportsIncremental: false, rateLimit: 10 }, // Removido - requer scraping com VPS
  { code: 'compras-rs', name: 'Compras RS', baseUrl: 'https://www.compras.rs.gov.br', authType: 'none', supportsIncremental: true, rateLimit: 30 },
  { code: 'compras-bahia', name: 'Compras Bahia', baseUrl: 'https://www.compras.ba.gov.br', authType: 'none', supportsIncremental: true, rateLimit: 30 },
  { code: 'compras-amazonas', name: 'Compras Amazonas', baseUrl: 'https://www.compras.am.gov.br', authType: 'none', supportsIncremental: true, rateLimit: 20 },
  { code: 'compras-rj', name: 'Compras RJ', baseUrl: 'https://www.compras.rj.gov.br', authType: 'none', supportsIncremental: true, rateLimit: 20 },
  { code: 'comprasnet-goias', name: 'ComprasNet Goias', baseUrl: 'https://comprasnet.go.gov.br', authType: 'none', supportsIncremental: true, rateLimit: 20 },
  { code: 'compras-mg', name: 'Compras Minas Gerais', baseUrl: 'https://www.compras.mg.gov.br', authType: 'none', supportsIncremental: true, rateLimit: 20 },
  { code: 'banpara', name: 'Banpara', baseUrl: 'https://www.banpara.b.br', authType: 'none', supportsIncremental: false, rateLimit: 10 },
  { code: 'pe-integrado', name: 'PE Integrado', baseUrl: 'https://www.licitacoes-e.com.br', authType: 'none', supportsIncremental: true, rateLimit: 20 },
  { code: 'e-lic-sc', name: 'e-LIC SC', baseUrl: 'https://e-lic.sc.gov.br', authType: 'none', supportsIncremental: true, rateLimit: 20 },
  { code: 'licitacoes-e', name: 'Licitacoes-e BB', baseUrl: 'https://www.licitacoes-e.com.br', authType: 'none', supportsIncremental: true, rateLimit: 20 },
]

async function main() {
  for (const s of sources) {
    await prisma.integrationSource.upsert({
      where: { code: s.code },
      create: { ...s, isEnabled: s.code === 'pncp' },
      update: { name: s.name, baseUrl: s.baseUrl, authType: s.authType, supportsIncremental: s.supportsIncremental, rateLimit: s.rateLimit },
    })
    console.log(`Upserted: ${s.code}`)
  }
  console.log('Seed de integration_sources concluido.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
