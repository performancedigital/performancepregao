import { PrismaClient, BiddingStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Buscando portal PNCP no banco...')
  let portal = await prisma.portal.findFirst({ where: { type: 'PNCP' } })
  if (!portal) {
    portal = await prisma.portal.create({
      data: { name: 'PNCP', url: 'https://pncp.gov.br', type: 'PNCP', isActive: true }
    })
    console.log('✅ Portal PNCP criado:', portal.id)
  } else {
    console.log('✅ Portal PNCP encontrado:', portal.id)
  }

  const today = new Date()
  const sevenDaysAgo = new Date(today)
  sevenDaysAgo.setDate(today.getDate() - 7)
  const fmt = (d: Date) => d.toISOString().slice(0, 10).replace(/-/g, '')

  let totalUpserted = 0

  for (let page = 1; page <= 5; page++) {
    const url = `https://pncp.gov.br/api/consulta/v1/contratacoes/proposta?dataInicial=${fmt(sevenDaysAgo)}&dataFinal=${fmt(today)}&pagina=${page}&tamanhoPagina=50`
    console.log(`📡 Página ${page}: ${url}`)

    let data: any
    try {
      const res = await fetch(url)
      if (!res.ok) { console.log(`  ⚠️ Status ${res.status} — parando`); break }
      data = await res.json()
    } catch (e) {
      console.log('  ❌ Erro na requisição:', e); break
    }

    const items: any[] = data?.data ?? data?.contratacoes ?? []
    if (!Array.isArray(items) || items.length === 0) { console.log('  📭 Sem mais resultados'); break }

    for (const item of items) {
      const externalId = item.numeroControlePNCP || item.numeroCompra || String(item.id || '')
      if (!externalId) continue
      try {
        await prisma.bidding.upsert({
          where: { externalId },
          update: {
            title: item.objetoCompra || item.descricao || 'Sem título',
            organ: item.orgaoEntidade?.razaoSocial || item.orgao || 'Órgão não informado',
            state: item.unidadeOrgao?.ufSigla || item.uf || null,
            city: item.unidadeOrgao?.municipioNome || item.municipio || null,
            modality: item.modalidadeNome || item.modalidade || 'Não informado',
            estimatedValue: item.valorTotalEstimado ? parseFloat(item.valorTotalEstimado) : null,
            openingDate: item.dataAberturaProposta ? new Date(item.dataAberturaProposta) : null,
            status: BiddingStatus.OPEN,
            pdfUrl: item.linkSistemaOrigem || null,
          },
          create: {
            externalId,
            portalId: portal!.id,
            title: item.objetoCompra || item.descricao || 'Sem título',
            organ: item.orgaoEntidade?.razaoSocial || item.orgao || 'Órgão não informado',
            state: item.unidadeOrgao?.ufSigla || item.uf || null,
            city: item.unidadeOrgao?.municipioNome || item.municipio || null,
            modality: item.modalidadeNome || item.modalidade || 'Não informado',
            estimatedValue: item.valorTotalEstimado ? parseFloat(item.valorTotalEstimado) : null,
            openingDate: item.dataAberturaProposta ? new Date(item.dataAberturaProposta) : null,
            status: BiddingStatus.OPEN,
            pdfUrl: item.linkSistemaOrigem || null,
          }
        })
        totalUpserted++
      } catch (e) {
        console.log('  ⚠️ Erro no upsert:', externalId, String(e))
      }
    }
    console.log(`  ✅ Página ${page}: ${items.length} itens processados`)
  }

  console.log(`\n🎉 Total upserted: ${totalUpserted} editais`)
  const count = await prisma.bidding.count()
  console.log(`📊 Total no banco: ${count} editais`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
