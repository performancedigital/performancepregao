import { PrismaClient } from '@prisma/client'

const p = new PrismaClient()
const BASE_URL = 'https://pncp.gov.br/api/consulta/v1'
const PAGE_SIZE = 50

// Codigos de modalidade PNCP
const MODALIDADES = [
  { codigo: 6, nome: 'Pregao - Eletronico' },
  { codigo: 7, nome: 'Pregao - Presencial' },
  { codigo: 4, nome: 'Concorrencia - Eletronica' },
  { codigo: 8, nome: 'Dispensa' },
  { codigo: 9, nome: 'Inexigibilidade' },
  { codigo: 12, nome: 'Credenciamento' },
]

function formatDate(d) {
  return d.toISOString().split('T')[0].replace(/-/g, '')
}

const windowEnd = new Date('2026-04-06')
const windowStart = new Date('2026-03-28')

console.log(`Sincronizando PNCP: ${formatDate(windowStart)} ate ${formatDate(windowEnd)}`)

const portal = await p.portal.findFirst({ where: { type: 'PNCP' }, select: { id: true } })
if (!portal) { console.error('Portal PNCP nao encontrado'); process.exit(1) }

let totalFetched = 0
let totalUpserted = 0

for (const mod of MODALIDADES) {
  console.log(`\nModalidade: ${mod.nome} (${mod.codigo})`)
  let pagina = 1
  let totalPaginas = 1

  do {
    const url = `${BASE_URL}/contratacoes/publicacao?dataInicial=${formatDate(windowStart)}&dataFinal=${formatDate(windowEnd)}&codigoModalidadeContratacao=${mod.codigo}&pagina=${pagina}&tamanhoPagina=${PAGE_SIZE}`
    
    try {
      const res = await fetch(url, {
        headers: { 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(45000),
      })

      if (!res.ok) {
        const body = await res.text().catch(() => '')
        console.log(`  HTTP ${res.status} pag ${pagina}:`, body.substring(0, 100))
        break
      }

      const data = await res.json()
      const items = data.data || data.content || (Array.isArray(data) ? data : [])
      totalPaginas = data.totalPaginas || data.totalPages || 1
      totalFetched += items.length
      console.log(`  Pagina ${pagina}/${totalPaginas}: ${items.length} itens`)

      for (const item of items) {
        if (!item.numeroControlePNCP) continue
        const status = (item.situacaoCompraNome || '').toLowerCase().includes('encerr') ? 'CLOSED' : 'OPEN'
        try {
          await p.bidding.upsert({
            where: { externalId: item.numeroControlePNCP },
            create: {
              externalId: item.numeroControlePNCP,
              portalId: portal.id,
              title: item.objetoCompra || 'Sem titulo',
              organ: item.orgaoEntidade?.razaoSocial || 'Nao informado',
              state: item.unidadeOrgao?.ufSigla || null,
              city: item.unidadeOrgao?.municipioNome || null,
              modality: mod.nome,
              estimatedValue: item.valorTotalEstimado ? parseFloat(String(item.valorTotalEstimado)) : null,
              openingDate: item.dataAberturaProposta ? new Date(item.dataAberturaProposta) : null,
              pdfUrl: item.linkSistemaOrigem || null,
              status,
            },
            update: {
              title: item.objetoCompra || 'Sem titulo',
              organ: item.orgaoEntidade?.razaoSocial || 'Nao informado',
              state: item.unidadeOrgao?.ufSigla || null,
              city: item.unidadeOrgao?.municipioNome || null,
              modality: mod.nome,
              estimatedValue: item.valorTotalEstimado ? parseFloat(String(item.valorTotalEstimado)) : null,
              openingDate: item.dataAberturaProposta ? new Date(item.dataAberturaProposta) : null,
              pdfUrl: item.linkSistemaOrigem || null,
              status,
              updatedAt: new Date(),
            },
          })
          totalUpserted++
        } catch (err) {
          console.error('  Erro upsert:', item.numeroControlePNCP?.substring(0, 20), err.message)
        }
      }

      pagina++
      if (pagina > totalPaginas || items.length === 0) break
      await new Promise(r => setTimeout(r, 500))
    } catch (err) {
      console.log(`  Erro pagina ${pagina}:`, err.message)
      break
    }
  } while (pagina <= Math.min(totalPaginas, 10))
}

const total = await p.bidding.count()
console.log(`\nConcluido! Coletados: ${totalFetched} | Upserted: ${totalUpserted}`)
console.log(`Total no banco: ${total} editais`)
await p.$disconnect()
