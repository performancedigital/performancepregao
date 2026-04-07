const BASE_URL = 'https://pncp.gov.br/api/consulta/v1'
const PAGE_SIZE = 50

function formatDate(d) {
  return d.toISOString().split('T')[0].replace(/-/g, '')
}

async function fetchComprasNet() {
  const dataInicial = formatDate(new Date('2026-04-01'))
  const dataFinal = formatDate(new Date('2026-04-07'))
  
  console.log(`Buscando: ${dataInicial} ate ${dataFinal}`)
  
  const url = `${BASE_URL}/contratacoes/proposta?dataInicial=${dataInicial}&dataFinal=${dataFinal}&pagina=1&tamanhoPagina=${PAGE_SIZE}`
  
  const res = await fetch(url, {
    headers: { 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0' },
    signal: AbortSignal.timeout(30000),
  })
  
  if (!res.ok) {
    console.error('HTTP', res.status)
    const txt = await res.text()
    console.error(txt.substring(0, 200))
    return
  }
  
  const data = await res.json()
  console.log('Total registros:', data.totalRegistros)
  console.log('Paginas:', data.totalPaginas)
  console.log('Itens pagina 1:', (data.data || []).length)
  console.log('Primeiro item:', JSON.stringify((data.data || [])[0], null, 2)?.substring(0, 300))
}

fetchComprasNet().catch(console.error)
