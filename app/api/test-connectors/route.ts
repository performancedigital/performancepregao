/**
 * API para testar conectores por etapa
 * 
 * GET /api/test-connectors?etapa=1
 * 
 * Etapas:
 * 1 - APIs Públicas ativas (PNCP e ComprasNet)
 * all - Todas as etapas (equivalente à etapa 1)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getConnector } from '@/lib/integrations/registry'

const ETAPAS = {
  1: {
    nome: 'APIs Públicas (sem credenciais)',
    conectores: [
      'pncp',
    ]
  }
}

async function testarConector(codigo: string) {
  try {
    const connector = getConnector(codigo)
    const inicio = Date.now()
    const health = await connector.healthCheck()
    const latencia = Date.now() - inicio
    
    return {
      codigo,
      sucesso: health.ok,
      mensagem: health.message || 'Sem mensagem',
      latenciaMs: health.latencyMs || latencia
    }
  } catch (error) {
    return {
      codigo,
      sucesso: false,
      mensagem: error instanceof Error ? error.message : 'Erro desconhecido',
      latenciaMs: null
    }
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const etapaArg = searchParams.get('etapa') || '1'
  
  // Verificar autenticação admin (opcional, mas recomendado)
  // const session = await getServerSession(...)
  
  if (etapaArg === 'all') {
    const resultados = []
    
    for (let i = 1; i <= 1; i++) {
      const etapa = ETAPAS[i as keyof typeof ETAPAS]
      const testes = await Promise.all(
        etapa.conectores.map(codigo => testarConector(codigo))
      )
      resultados.push({
        etapa: i,
        nome: etapa.nome,
        resultados: testes
      })
    }
    
    return NextResponse.json({
      tipo: 'completo',
      timestamp: new Date().toISOString(),
      etapas: resultados
    })
  }
  
  const etapaNum = parseInt(etapaArg, 10)
  if (isNaN(etapaNum) || etapaNum < 1 || etapaNum > 1) {
    return NextResponse.json(
      { erro: `Etapa inválida: ${etapaArg}` },
      { status: 400 }
    )
  }
  
  const etapa = ETAPAS[etapaNum as keyof typeof ETAPAS]
  const testes = await Promise.all(
    etapa.conectores.map(codigo => testarConector(codigo))
  )
  
  const sucessos = testes.filter(t => t.sucesso).length
  const falhas = testes.filter(t => !t.sucesso).length
  
  return NextResponse.json({
    tipo: 'etapa',
    etapa: etapaNum,
    nome: etapa.nome,
    timestamp: new Date().toISOString(),
    resumo: {
      total: testes.length,
      sucessos,
      falhas
    },
    resultados: testes
  })
}
