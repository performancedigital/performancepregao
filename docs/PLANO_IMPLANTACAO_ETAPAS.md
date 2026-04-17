# Plano de Implantação por Etapas - APIs REST

**Data de Início:** 17/04/2026  
**Responsável:** Equipe SAAS Pregão  
**Status:** Em andamento

---

## Visão Geral

Este documento acompanha a implantação gradual das 11 APIs REST de portais de licitação, organizadas em 3 etapas por nível de complexidade.

---

## Etapa 1: APIs Públicas (Sem Credenciais) ✅

**Status:** CONCLUÍDA  
**Data:** 17/04/2026

### Conectores

| Portal | Código | Status | Health Check | Observações |
|--------|--------|--------|--------------|-------------|
| PNCP | `pncp` | ✅ Implementado | ⏳ Pendente | API Nacional |
| ComprasNet Federal | `comprasnet` | ✅ Implementado | ⏳ Pendente | Dados Abertos |
| Compras Amazonas | `compras-amazonas` | ✅ Implementado | ⏳ Pendente | API Pública |
| ComprasNet Goiás | `comprasnet-goias` | ✅ Implementado | ⏳ Pendente | API Pública |
| Banpará | `banpara` | ✅ Implementado | ⏳ Pendente | API Pública |
| Licitacoes-e (BB) | `licitacoes-e` | ✅ Implementado | ⏳ Pendente | API Pública |

### Ações da Etapa 1

- [x] Implementar conectores
- [x] Criar health checks
- [x] Testar build
- [ ] Executar health checks em produção
- [ ] Validar coleta de dados

### Variáveis de Ambiente

Nenhuma variável necessária para esta etapa.

---

## Etapa 2: APIs com API Key ⏳

**Status:** AGUARDANDO CREDENCIAIS  
**Previsão:** Após obtenção das API Keys

### Conectores

| Portal | Código | Status | API Key | Contato |
|--------|--------|--------|---------|---------|
| Compras RS | `compras-rs` | ✅ Implementado | ⏳ Pendente | consultas@compras.rs.gov.br |
| Compras RJ | `compras-rj` | ✅ Implementado | ⏳ Pendente | sistemas@compras.rj.gov.br |
| PE Integrado | `pe-integrado` | ✅ Implementado | ⏳ Pendente | suporte@peintegrado.pe.gov.br |

### Ações da Etapa 2

- [x] Implementar conectores
- [ ] Solicitar API Keys
- [ ] Configurar variáveis de ambiente
- [ ] Testar health checks
- [ ] Validar coleta de dados

### Variáveis de Ambiente

```bash
COMPRAS_RS_API_KEY=""
COMPRAS_RJ_KEY=""
PE_INTEGRADO_KEY=""
```

### Checklist de Solicitação

- [ ] Compras RS: Criar conta de desenvolvedor
- [ ] Compras RS: Gerar API Key
- [ ] Compras RJ: Cadastrar como desenvolvedor
- [ ] Compras RJ: Aguardar aprovação
- [ ] PE Integrado: Solicitar acesso à API
- [ ] PE Integrado: Aguardar aprovação

---

## Etapa 3: APIs com Token Bearer ⏳

**Status:** AGUARDANDO CREDENCIAIS  
**Previsão:** Após obtenção dos tokens

### Conectores

| Portal | Código | Status | Token | Contato |
|--------|--------|--------|-------|---------|
| Compras Bahia | `compras-bahia` | ✅ Implementado | ⏳ Pendente | atendimento@compras.ba.gov.br |
| Compras MG | `compras-mg` | ✅ Implementado | ⏳ Pendente | ouvidoria@compras.mg.gov.br |
| E-Lic SC | `e-lic-sc` | ✅ Implementado | ⏳ Pendente | suporte@e-lic.sc.gov.br |

### Ações da Etapa 3

- [x] Implementar conectores
- [ ] Solicitar credenciais de acesso
- [ ] Configurar variáveis de ambiente
- [ ] Testar autenticação
- [ ] Testar health checks
- [ ] Validar coleta de dados

### Variáveis de Ambiente

```bash
COMPRAS_BA_USER=""
COMPRAS_BA_PASS=""
COMPRAS_MG_TOKEN=""
ELIC_SC_TOKEN=""
```

### Checklist de Solicitação

- [ ] Compras Bahia: Criar conta
- [ ] Compras Bahia: Aguardar validação
- [ ] Compras Bahia: Obter token
- [ ] Compras MG: Solicitar credenciais
- [ ] Compras MG: Aguardar aprovação (3-5 dias)
- [ ] E-Lic SC: Criar conta de fornecedor
- [ ] E-Lic SC: Preencher termo de responsabilidade
- [ ] E-Lic SC: Aguardar liberação do token

---

## Como Testar

### Testar por Etapa

```bash
# Etapa 1 - APIs Públicas
curl https://seu-dominio.com/api/test-connectors?etapa=1

# Etapa 2 - APIs com API Key
curl https://seu-dominio.com/api/test-connectors?etapa=2

# Etapa 3 - APIs com Token
curl https://seu-dominio.com/api/test-connectors?etapa=3

# Todas as etapas
curl https://seu-dominio.com/api/test-connectors?etapa=all
```

### Resposta Esperada

```json
{
  "tipo": "etapa",
  "etapa": 1,
  "nome": "APIs Públicas (sem credenciais)",
  "timestamp": "2026-04-17T10:00:00.000Z",
  "resumo": {
    "total": 6,
    "sucessos": 6,
    "falhas": 0
  },
  "resultados": [
    {
      "codigo": "pncp",
      "sucesso": true,
      "mensagem": "API OK",
      "latenciaMs": 245
    }
  ]
}
```

---

## Próximos Passos

1. **Imediato:** Executar health checks da Etapa 1 em produção
2. **Curto prazo:** Solicitar credenciais das Etapas 2 e 3
3. **Médio prazo:** Configurar variáveis e testar Etapas 2 e 3
4. **Longo prazo:** Monitoramento contínuo e otimização

---

## Histórico de Alterações

| Data | Versão | Alteração | Responsável |
|------|--------|-----------|-------------|
| 17/04/2026 | 1.0 | Criação do plano de implantação | Verdent |
| 17/04/2026 | 1.1 | Conclusão da Etapa 1 (implementação) | Verdent |

---

**Documento gerado em:** 17/04/2026  
**Última atualização:** 17/04/2026
