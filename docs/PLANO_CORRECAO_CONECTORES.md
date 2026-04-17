# Plano de Correção - Conectores de Portais de Licitação

## Data: 17/04/2026
## Status: Diagnóstico Completo

---

## 1. Resumo dos Problemas Encontrados

| Portal | Status | Problema | Impacto |
|--------|--------|----------|---------|
| **PNCP** | ⚠️ Parcial | Health check falha, mas dados funcionam | Aparece como "offline" na tela |
| **COMPRAS_GOV** | ❌ Quebrado | Usando URL errada (PNCP em vez de ComprasNet) | Não traz dados |
| **BLL** | ❌ Não implementado | Apenas stub vazio | Não traz dados |
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

### 2.2 COMPRAS_GOV - URL Incorreta

**Arquivo**: `lib/integrations/connectors/comprasnet.connector.ts`

**Problema CRÍTICO**: Usando a mesma URL do PNCP!

```typescript
// LINHA 3 - ERRADO!
const BASE_URL = 'https://pncp.gov.br/api/consulta/v1'

// Deveria ser algo como:
// const BASE_URL = 'https://comprasnet.gov.br/api'
```

**Impacto**: O conector ComprasNet está buscando dados do PNCP em vez do ComprasNet.

---

### 2.3 BLL - Stub Não Implementado

**Arquivo**: `lib/integrations/connectors/bll.connector.ts`

**Problema**: Conector está vazio, apenas retorna arrays vazios.

```typescript
// LINHAS 5-13
export class BllConnector implements IConnector {
  async fetchIncremental(): Promise<FetchResult> {
    return { records: [], nextCursor: null, total: 0 }  // ❌ VAZIO!
  }
  async healthCheck(): Promise<ConnectorHealth> { 
    return { ok: false, latencyMs: 0, message: 'Stub - nao implementado' } 
  }
}
```

**Nota**: O BLL (bllcompras.com) requer scraping com Playwright em VPS.

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

### ✅ PASSO 2: Pesquisar API do ComprasNet

**Problema**: Precisamos da URL correta da API do ComprasNet.

**Ações**:
1. Acessar https://comprasnet.gov.br
2. Procurar por documentação de API ou portal de dados abertos
3. Verificar se existe API REST similar ao PNCP
4. Se não houver API, avaliar scraping com Playwright

**Possíveis URLs para testar**:
- `https://comprasnet.gov.br/api/`
- `https://comprasnet.gov.br/ws/`
- `https://api.comprasnet.gov.br/`

**Se não houver API pública**:
- Desativar o portal ComprasNet da tela
- Ou implementar scraping via Playwright

---

### ✅ PASSO 3: Decidir sobre BLL e MUNICIPAL

**Opção A - Remover da Tela (Recomendado)**

Remover BLL e MUNICIPAL da tela de portais até terem implementação.

**Arquivo**: `app/admin/portals/page.tsx` ou onde a lista é renderizada

```typescript
// Filtrar apenas portais implementados
const implementedPortals = ['PNCP', 'COMPRAS_GOV'] // Adicionar outros conforme implementados
```

**Opção B - Implementar Scraping**

Se quiser implementar BLL:

1. Criar conta em VPS (DigitalOcean, AWS, etc.)
2. Instalar Playwright
3. Implementar scraping do bllcompras.com
4. Expôr API interna para o conector consumir

**Custo**: ~R$ 50-100/mês em VPS

---

### ✅ PASSO 4: Corrigir ou Desativar ComprasNet

**Se encontrar API do ComprasNet**:

```typescript
// lib/integrations/connectors/comprasnet.connector.ts

// ATUALIZAR LINHA 3
const BASE_URL = 'https://URL_CORRETA_DO_COMPRASNET.gov.br/api'

// ATUALIZAR LINHA 37 - Endpoint correto
const url = `${BASE_URL}/endpoint/correto?dataInicial=${dataInicial}&dataFinal=${dataFinal}&pagina=${pagina}&tamanhoPagina=${PAGE_SIZE}`

// ATUALIZAR LINHA 79 - Portal correto
portalCode: 'COMPRAS_GOV',
```

**Se NÃO encontrar API**:

Desativar o portal da tela ou mostrar como "em breve".

---

### ✅ PASSO 5: Atualizar Tabela IntegrationSource

Verificar se as fontes estão cadastradas corretamente no banco:

```sql
-- Verificar sources cadastradas
SELECT code, name, isEnabled FROM "IntegrationSource";

-- Se necessário, desativar as que não funcionam
UPDATE "IntegrationSource" SET isEnabled = false WHERE code IN ('bll', 'municipal');
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
  // comprasnet: new ComprasnetConnector(), // ❌ Desativado - URL errada
  // licitanet: new LicitanetConnector(),    // ❌ Desativado - stub
  // bll: new BllConnector(),                // ❌ Desativado - stub
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
  // COMPRAS_GOV  // ❌ Remover temporariamente
  // BLL          // ❌ Remover temporariamente
  // MUNICIPAL    // ❌ Remover temporariamente
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
| Pesquisar API ComprasNet | 2-4 horas | 🔴 Alta |
| Desativar portais quebrados | 30 min | 🟡 Média |
| Implementar ComprasNet (se achar API) | 4-8 horas | 🟢 Baixa |
| Implementar BLL (scraping) | 16-24 horas | 🟢 Baixa |

---

## 7. Referências

- **PNCP API**: https://pncp.gov.br/api/consulta/v1
- **ComprasNet**: https://comprasnet.gov.br (documentação de API desconhecida)
- **BLL**: https://bllcompras.com.br (requer scraping)
- **Arquivos de Conectores**: `lib/integrations/connectors/`
- **Registry**: `lib/integrations/registry.ts`
- **Schema**: `prisma/schema.prisma`

---

## 8. Checklist de Conclusão

- [ ] Health check do PNCP corrigido
- [ ] API do ComprasNet pesquisada/documentada
- [ ] Decisão sobre BLL tomada (implementar/remover)
- [ ] Decisão sobre MUNICIPAL tomada
- [ ] Portais não funcionais removidos da tela
- [ ] Tabela IntegrationSource atualizada
- [ ] Testes manuais realizados
- [ ] Deploy em produção

---

*Documento criado em: 17/04/2026*
*Última atualização: 17/04/2026*
