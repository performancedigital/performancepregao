# Plano de Correção - Conectores de Portais de Licitação

## Data: 17/04/2026
## Status: **ATUALIZADO** - API ComprasNet Documentada

---

## 1. Resumo dos Problemas Encontrados

| Portal | Status | Problema | Impacto |
|--------|--------|----------|---------|
| **PNCP** | ⚠️ Parcial | Health check falha, mas dados funcionam | Aparece como "offline" na tela |
| **COMPRAS_GOV** | ❌ Quebrado | Usando URL errada (PNCP em vez de ComprasNet) | Não traz dados |
| **BLL** | ✅ Resolvido | Removido do registry - não possui API pública | Desativado até ter implementação viável |
| **MUNICIPAL** | ❌ Não existe | Não há conector implementado | Não traz dados |

---

## 2. Diagnóstico Detalhado

### 2.1 PNCP - Health Check Falhando

**Arquivo**: `lib/integrations/connectors/pncp.connector.ts`

**Problema**: O health check usa a modalidade 8 (Dispensa) que pode não ter dados no dia atual, causando falha.

```typescript
// LINHA 124-127 - Health check problemático
const res = await fetch(
  `${BASE_URL}/contratacoes/publicacao?dataInicial=${today}&dataFinal=${today}&codigoModalidadeContratacao=8&pagina=1&tamanhoPagina=1`,
  { signal: AbortSignal.timeout(10000) }
)
```

**Causas**:
1. Modalidade 8 (Dispensa) pode não ter publicações no dia
2. Timeout de 10s pode ser curto para a API do PNCP
3. Falta tratamento de 404 (sem dados ≠ erro)

---

### 2.2 COMPRAS_GOV - URL Incorreta (CRÍTICO)

**Arquivo**: `lib/integrations/connectors/comprasnet.connector.ts`

**Problema CRÍTICO**: Usando a mesma URL do PNCP!

```typescript
// LINHA 3 - ERRADO!
const BASE_URL = 'https://pncp.gov.br/api/consulta/v1'

// Deveria ser:
// const BASE_URL = 'https://dadosabertos.compras.gov.br'
```

**Impacto**: O conector ComprasNet está buscando dados do PNCP em vez do ComprasNet.

**✅ API Compras.gov.br Documentada** (https://dadosabertos.compras.gov.br/swagger-ui/index.html):

| Aspecto | Detalhes |
|---------|----------|
| **Base URL** | `https://dadosabertos.compras.gov.br` |
| **Autenticação** | Pública (dados abertos) |
| **Swagger UI** | https://dadosabertos.compras.gov.br/swagger-ui/index.html |

**Endpoints Principais para Licitações:**

| Módulo | Endpoint | Descrição |
|--------|----------|-----------|
| **Legado (Lei 8.666)** | `GET /modulo-legado/1_consultarLicitacao` | Lista licitações |
| | `GET /modulo-legado/3_consultarPregoes` | Lista pregões |
| | `GET /modulo-legado/5_consultarComprasSemLicitacao` | Compras sem licitação |
| **Contratações (Lei 14.133)** | `GET /modulo-contratacoes/1_consultarContratacoes_PNCP_14133` | Contratações nova lei |
| **ARP** | `GET /modulo-arp/1_consultarARP` | Atas de Registro de Preços |
| **Contratos** | `GET /modulo-contratos/1_consultarContratos` | Contratos |

**⚠️ IMPORTANTE**: A API do Compras.gov.br é diferente do PNCP:
- **PNCP**: Portal Nacional de Contratações Públicas - licitações de todos os entes
- **Compras.gov.br**: Sistema do Governo Federal - licitações federais

**Diferença Conceitual:**
| Aspecto | PNCP | Compras.gov.br |
|---------|------|----------------|
| **Cobertura** | União, Estados, Municípios | União (Governo Federal) |
| **Legislação** | Todas | Lei 8.666 (legado) + Lei 14.133 (nova) |
| **Dados** | Publicações PNCP | Licitações, Pregões, ARPs, Contratos |
| **Autenticação** | Pública | Pública (dados abertos) |

---

### 2.3 BLL - ✅ Resolvido (Removido do Registry)

**Status**: Desativado - Não possui API pública

**Arquivo**: `lib/integrations/registry.ts`

**Problema**: O BLL (bllcompras.com) não possui API pública de dados abertos. A plataforma é fechada e requer autenticação.

**Solução Aplicada**: Removido o BLL do registry de conectores ativos.

```typescript
// registry.ts - BLL removido
const registry: Record<string, IConnector> = {
  pncp: new PncpConnector(),
  // bll: desativado - não possui API pública (requer scraping com VPS)
  // ... outros conectores
}
```

**Nota**: Para implementar BLL no futuro, seria necessário:
1. Criar conta em VPS (DigitalOcean, AWS, etc.)
2. Implementar scraping com Playwright
3. Expôr API interna para o conector consumir

**Custo estimado**: ~R$ 50-100/mês em VPS

---

### 2.4 MUNICIPAL - Conector Inexistente

**Arquivo**: Não existe

**Problema**: O enum `PortalType` tem `MUNICIPAL`, mas não há conector correspondente.

```typescript
// schema.prisma
enum PortalType {
  PNCP
  COMPRAS_GOV
  BLL
  MUNICIPAL  // ❌ Sem implementação!
}
```

**Observação**: Os portais municipais estão separados em conectores individuais:
- `compras-rs`
- `compras-bahia`
- `compras-amazonas`
- `compras-rj`
- `compras-mg`
- `comprasnet-goias`
- `banpara`
- `pe-integrado`
- `e-lic-sc`
- `licitacoes-e`

---

## 3. Plano de Correção Passo a Passo

### ✅ PASSO 1: Corrigir Health Check do PNCP

**Arquivo**: `lib/integrations/connectors/pncp.connector.ts`

**Ação**: Melhorar o health check para usar uma modalidade que sempre tenha dados.

```typescript
// SUBSTITUIR as linhas 119-132
async healthCheck(): Promise<ConnectorHealth> {
  const start = Date.now()
  try {
    const today = formatDate(new Date())
    // Usa Pregão Eletrônico (6) - modalidade mais comum
    const res = await fetch(
      `${BASE_URL}/contratacoes/publicacao?dataInicial=${today}&dataFinal=${today}&codigoModalidadeContratacao=6&pagina=1&tamanhoPagina=1`,
      { 
        headers: { 'Accept': 'application/json', 'User-Agent': 'PerformancePregao/1.0' },
        signal: AbortSignal.timeout(15000) // Aumentado para 15s
      }
    )
    
    // 404 significa que não há dados, mas a API está funcionando
    if (res.status === 404) {
      return { ok: true, latencyMs: Date.now() - start, message: 'API OK (sem dados hoje)' }
    }
    
    return { ok: res.ok, latencyMs: Date.now() - start, message: `HTTP ${res.status}` }
  } catch (err) {
    return { ok: false, latencyMs: Date.now() - start, message: String(err) }
  }
}
```

**Teste**: Verificar se o status muda para "online" na tela de portais.

---

### ✅ PASSO 2: Corrigir ComprasNet

**✅ API Compras.gov.br de Dados Abertos encontrada!**

**Base URL correta**: `https://dadosabertos.compras.gov.br`

**Documentação**: https://dadosabertos.compras.gov.br/swagger-ui/index.html

#### Correção do Conector

**Arquivo**: `lib/integrations/connectors/comprasnet.connector.ts`

```typescript
// ATUALIZAR LINHA 3
const BASE_URL = 'https://dadosabertos.compras.gov.br'

// ATUALIZAR LINHA 37 - Endpoint de pregões (mais relevante)
const url = `${BASE_URL}/modulo-legado/3_consultarPregoes?dataInicial=${dataInicial}&dataFinal=${dataFinal}&pagina=${pagina}&tamanhoPagina=${PAGE_SIZE}`

// Ou usar endpoint de licitações:
// const url = `${BASE_URL}/modulo-legado/1_consultarLicitacao?dataInicial=${dataInicial}&dataFinal=${dataFinal}&pagina=${pagina}`

// ATUALIZAR LINHA 79 - Portal correto
portalCode: 'COMPRAS_GOV',
```

**Endpoints disponíveis:**

| Endpoint | Descrição |
|----------|-----------|
| `/modulo-legado/1_consultarLicitacao` | Licitações (Lei 8.666) |
| `/modulo-legado/3_consultarPregoes` | Pregões eletrônicos/presenciais |
| `/modulo-legado/5_consultarComprasSemLicitacao` | Dispensa/Inexigibilidade |
| `/modulo-contratacoes/1_consultarContratacoes_PNCP_14133` | Nova lei (14.133) |
| `/modulo-arp/1_consultarARP` | Atas de Registro de Preços |

**Nota**: A API retorna dados em formato diferente do PNCP. Será necessário ajustar o `normalize()` para mapear os campos corretos.

---

### ✅ PASSO 3: Decidir sobre BLL e MUNICIPAL

**Opção A - Remover da Tela (Recomendado)**

Remover BLL e MUNICIPAL da tela de portais até terem implementação.

**Arquivo**: `app/admin/portals/page.tsx` ou onde a lista é renderizada

```typescript
// Filtrar apenas portais implementados
const implementedPortals = ['PNCP'] // Adicionar outros conforme implementados
```

**Opção B - Implementar Scraping**

Se quiser implementar BLL:

1. Criar conta em VPS (DigitalOcean, AWS, etc.)
2. Instalar Playwright
3. Implementar scraping do bllcompras.com
4. Expôr API interna para o conector consumir

**Custo**: ~R$ 50-100/mês em VPS

---

### ✅ PASSO 4: Implementar Correções

#### 4.1 Corrigir PNCP Health Check

**Arquivo**: `lib/integrations/connectors/pncp.connector.ts`

```typescript
async healthCheck(): Promise<ConnectorHealth> {
  const start = Date.now()
  try {
    const today = formatDate(new Date())
    // Usa Pregão Eletrônico (6) - modalidade mais comum
    const res = await fetch(
      `${BASE_URL}/contratacoes/publicacao?dataInicial=${today}&dataFinal=${today}&codigoModalidadeContratacao=6&pagina=1&tamanhoPagina=1`,
      { 
        headers: { 'Accept': 'application/json', 'User-Agent': 'PerformancePregao/1.0' },
        signal: AbortSignal.timeout(15000)
      }
    )
    
    if (res.status === 404) {
      return { ok: true, latencyMs: Date.now() - start, message: 'API OK (sem dados)' }
    }
    
    return { ok: res.ok, latencyMs: Date.now() - start, message: `HTTP ${res.status}` }
  } catch (err) {
    return { ok: false, latencyMs: Date.now() - start, message: String(err) }
  }
}
```

#### 4.2 Atualizar ComprasNet

**Arquivo**: `lib/integrations/connectors/comprasnet.connector.ts`

```typescript
const BASE_URL = 'https://dadosabertos.compras.gov.br'

// Endpoints disponíveis:
// - /modulo-legado/1_consultarLicitacao (Licitações Lei 8.666)
// - /modulo-legado/3_consultarPregoes (Pregões)
// - /modulo-legado/5_consultarComprasSemLicitacao (Dispensas)
// - /modulo-contratacoes/1_consultarContratacoes_PNCP_14133 (Nova Lei 14.133)

// IMPORTANTE: A estrutura de dados é diferente do PNCP
// Será necessário reescrever o método normalize() para mapear os campos corretos
```

---

### ✅ PASSO 5: Atualizar Tabela IntegrationSource

Verificar se as fontes estão cadastradas corretamente no banco:

```sql
-- Verificar sources cadastradas
SELECT code, name, isEnabled FROM "IntegrationSource";

-- Se necessário, desativar as que não funcionam
UPDATE "IntegrationSource" SET isEnabled = false WHERE code IN ('comprasnet', 'bll', 'municipal');
```

---

## 4. Implementação Rápida (Solução Imediata)

Se quiser uma solução rápida para deixar apenas portais funcionais visíveis:

### 4.1 Atualizar o Registry

**Arquivo**: `lib/integrations/registry.ts`

```typescript
// Comentar conectores não implementados
const registry: Record<string, IConnector> = {
  pncp: new PncpConnector(),
  // comprasnet: new ComprasnetConnector(), // Desativado - requer correção da URL e ajuste no normalize
  // licitanet: new LicitanetConnector(),    // Desativado - stub
  // bll: new BllConnector(),                // Desativado - stub
  'compras-rs': new ComprasRsConnector(),
  'compras-bahia': new ComprasBahiaConnector(),
  // ... etc
}
```

### 4.2 Atualizar o Enum PortalType (Opcional)

**Arquivo**: `prisma/schema.prisma`

```prisma
enum PortalType {
  PNCP
  // COMPRAS_GOV  // Desativado - requer correção da URL e ajuste no normalize
  // BLL          // Desativado - stub
  // MUNICIPAL    // Desativado - não implementado
}
```

**Nota**: Requer migração do banco de dados.

---

## 5. Testes Após Correção

### 5.1 Testar Health Check

```bash
# Fazer request manual para testar
curl "https://pncp.gov.br/api/consulta/v1/contratacoes/publicacao?dataInicial=20260417&dataFinal=20260417&codigoModalidadeContratacao=6&pagina=1&tamanhoPagina=1"
```

### 5.2 Testar Sincronização

1. Acessar painel admin `/admin/integrations`
2. Clicar em "Sincronizar" no PNCP
3. Verificar se status fica verde
4. Verificar se novos dados aparecem

### 5.3 Verificar Tela de Portais

1. Acessar `/admin/portals`
2. Confirmar que apenas portais funcionais aparecem
3. Status deve estar "online" para PNCP

---

## 6. Cronograma Sugerido

| Tarefa | Tempo Estimado | Prioridade |
|--------|----------------|------------|
| Corrigir health check PNCP | 30 min | 🔴 Alta |
| Decidir sobre ComprasNet (contratos vs licitações) | 1 hora | 🔴 Alta |
| Desativar portais quebrados | 30 min | 🟡 Média |
| Implementar ComprasNet com JWT (se decidido) | 4-8 horas | 🟢 Baixa |
| Implementar BLL (scraping) | 16-24 horas | 🟢 Baixa |

---

## 7. Referências

- **PNCP API**: https://pncp.gov.br/api/consulta/v1
- **Compras.gov.br API (Dados Abertos)**: https://dadosabertos.compras.gov.br/swagger-ui/index.html
  - Base URL: `https://dadosabertos.compras.gov.br`
  - Autenticação: Pública
  - Endpoints: `/modulo-legado/1_consultarLicitacao`, `/modulo-legado/3_consultarPregoes`, `/modulo-contratacoes/1_consultarContratacoes_PNCP_14133`
- **ComprasNet Portal**: https://www.comprasnet.gov.br
- **BLL**: https://bllcompras.com.br (requer scraping)
- **Arquivos de Conectores**: `lib/integrations/connectors/`
- **Registry**: `lib/integrations/registry.ts`
- **Schema**: `prisma/schema.prisma`

---

## 8. Checklist de Conclusão

- [x] Health check do PNCP corrigido (modalidade 6, timeout 15s, tratamento 404)
- [x] URL do ComprasNet corrigida para `https://dadosabertos.compras.gov.br`
- [x] Conector ComprasNet reescrito com endpoints corretos (/modulo-legado/3_consultarPregoes, /modulo-legado/1_consultarLicitacao)
- [x] Método normalize() do ComprasNet ajustado para nova estrutura de dados
- [x] Conector ComprasNet ativado no registry
- [x] Seed de integration sources atualizado com URL correta
- [x] BLL e Licitanet removidos (desativados no banco e comentados no seed)
- [x] MUNICIPAL removido do enum PortalType
- [x] API de portais atualizada (tipos válidos: PNCP, COMPRAS_GOV)
- [x] Build passou sem erros
- [x] Deploy em produção concluído

---

*Documento criado em: 17/04/2026*
*Última atualização: 17/04/2026 - ✅ DEPLOY CONCLUÍDO - https://www.performancepregao.online*
