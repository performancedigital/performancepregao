/**
 * Script de Teste de Conectores por Etapa
 * 
 * Uso: npx ts-node scripts/test-connectors-etapa.ts [etapa]
 * 
 * Etapas:
 * 1 - APIs Públicas (sem credenciais)
 * 2 - APIs com API Key
 * 3 - APIs com Token Bearer
 * all - Todas as etapas
 */

import { getConnector, listSourceCodes } from '../lib/integrations/registry.js'

const ETAPAS = {
  1: {
    nome: 'APIs Públicas (sem credenciais)',
    conectores: [
      'pncp',
      'comprasnet',
      'compras-amazonas',
      'comprasnet-goias',
      'banpara',
      'licitacoes-e'
    ]
  },
  2: {
    nome: 'APIs com API Key',
    conectores: [
      'compras-rs',
      'compras-rj',
      'pe-integrado'
    ]
  },
  3: {
    nome: 'APIs com Token Bearer',
    conectores: [
      'compras-bahia',
      'compras-mg',
      'e-lic-sc'
    ]
  }
}

const COR = {
  reset: '\x1b[0m',
  verde: '\x1b[32m',
  vermelho: '\x1b[31m',
  amarelo: '\x1b[33m',
  azul: '\x1b[34m',
  cinza: '\x1b[90m'
}

function log(tipo: 'info' | 'sucesso' | 'erro' | 'aviso', msg: string) {
  const prefix = {
    info: `${COR.azul}[INFO]${COR.reset}`,
    sucesso: `${COR.verde}[OK]${COR.reset}`,
    erro: `${COR.vermelho}[ERRO]${COR.reset}`,
    aviso: `${COR.amarelo}[AVISO]${COR.reset}`
  }
  console.log(`${prefix[tipo]} ${msg}`)
}

async function testarConector(codigo: string): Promise<{ sucesso: boolean; mensagem: string; latencia?: number }> {
  try {
    const connector = getConnector(codigo)
    const health = await connector.healthCheck()
    
    return {
      sucesso: health.ok,
      mensagem: health.message || 'Sem mensagem',
      latencia: health.latencyMs
    }
  } catch (error) {
    return {
      sucesso: false,
      mensagem: error instanceof Error ? error.message : 'Erro desconhecido'
    }
  }
}

async function executarEtapa(numeroEtapa: number): Promise<void> {
  const etapa = ETAPAS[numeroEtapa as keyof typeof ETAPAS]
  
  if (!etapa) {
    log('erro', `Etapa ${numeroEtapa} não encontrada`)
    return
  }

  console.log('\n' + '='.repeat(60))
  log('info', `ETAPA ${numeroEtapa}: ${etapa.nome}`)
  console.log('='.repeat(60) + '\n')

  const resultados: Array<{ codigo: string; sucesso: boolean; mensagem: string; latencia?: number }> = []

  for (const codigo of etapa.conectores) {
    process.stdout.write(`Testando ${codigo}... `)
    const resultado = await testarConector(codigo)
    resultados.push({ codigo, ...resultado })
    
    if (resultado.sucesso) {
      console.log(`${COR.verde}✓${COR.reset} (${resultado.latencia}ms)`)
    } else {
      console.log(`${COR.vermelho}✗${COR.reset} - ${resultado.mensagem}`)
    }
  }

  // Resumo
  console.log('\n' + '-'.repeat(60))
  const sucessos = resultados.filter(r => r.sucesso).length
  const falhas = resultados.filter(r => !r.sucesso).length
  
  log('info', `RESUMO ETAPA ${numeroEtapa}:`)
  console.log(`  ${COR.verde}✓${COR.reset} Sucessos: ${sucessos}/${resultados.length}`)
  console.log(`  ${COR.vermelho}✗${COR.reset} Falhas: ${falhas}/${resultados.length}`)
  
  if (falhas > 0) {
    console.log(`\n${COR.amarelo}Conectores com falha:${COR.reset}`)
    resultados.filter(r => !r.sucesso).forEach(r => {
      console.log(`  - ${r.codigo}: ${r.mensagem}`)
    })
  }
  
  console.log('-'.repeat(60))
}

async function main() {
  const args = process.argv.slice(2)
  const etapaArg = args[0] || '1'

  console.log('\n' + '='.repeat(60))
  console.log('  TESTE DE CONECTORES - SAAS PREGÃO')
  console.log('='.repeat(60))

  if (etapaArg === 'all') {
    for (let i = 1; i <= 3; i++) {
      await executarEtapa(i)
    }
  } else {
    const etapaNum = parseInt(etapaArg, 10)
    if (isNaN(etapaNum) || etapaNum < 1 || etapaNum > 3) {
      log('erro', `Etapa inválida: ${etapaArg}`)
      console.log('\nUso: npx ts-node scripts/test-connectors-etapa.ts [etapa|all]')
      console.log('  etapa: 1, 2, 3 ou all')
      console.log('\nEtapas:')
      Object.entries(ETAPAS).forEach(([num, info]) => {
        console.log(`  ${num}. ${info.nome}`)
      })
      process.exit(1)
    }
    await executarEtapa(etapaNum)
  }

  console.log('\n' + '='.repeat(60))
  console.log('  TESTE FINALIZADO')
  console.log('='.repeat(60) + '\n')
}

main().catch(error => {
  console.error('Erro fatal:', error)
  process.exit(1)
})
