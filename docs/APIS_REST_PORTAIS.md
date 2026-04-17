# Documentação das APIs REST - Portais de Licitação

**Data**: 17/04/2026  
**Versão**: 1.0  
**Total de APIs Documentadas**: 11 portais

---

## Sumário

1. [Visão Geral](#1-visão-geral)
2. [Arquitetura de Integração](#2-arquitetura-de-integração)
3. [APIs por Portal](#3-apis-por-portal)
   - 3.1 [PNCP (Portal Nacional)](#31-pncp-portal-nacional)
   - 3.2 [ComprasNet (Federal)](#32-comprasnet-federal)
   - 3.3 [Compras RS](#33-compras-rs)
   - 3.4 [Compras Bahia](#34-compras-bahia)
   - 3.5 [Compras Amazonas](#35-compras-amazonas)
   - 3.6 [Compras RJ](#36-compras-rj)
   - 3.7 [ComprasNet Goiás](#37-comprasnet-goiás)
   - 3.8 [Compras MG](#38-compras-mg)
   - 3.9 [Banpará](#39-banpará)
   - 3.10 [PE Integrado](#310-pe-integrado)
   - 3.11 [E-Lic SC](#311-e-lic-sc)
4. [Implementação no Sistema](#4-implementação-no-sistema)
5. [Variáveis de Ambiente](#5-variáveis-de-ambiente)
6. [Tratamento de Erros](#6-tratamento-de-erros)
7. [Rate Limiting](#7-rate-limiting)

---

## 1. Visão Geral

Esta documentação descreve as 11 APIs REST utilizadas pelo SAAS Pregão para coleta de dados de licitações públicas brasileiras.

### Classificação das APIs

| Categoria | Quantidade | Portais |
|-----------|------------|---------|
| APIs Públicas (sem autenticação) | 4 | PNCP, Compras Amazonas, ComprasNet Goiás, Banpará |
| APIs com API Key | 4 | Compras RS, Compras RJ, PE Integrado |
| APIs com OAuth/Token | 3 | ComprasNet, Compras Bahia, Compras MG, E-Lic SC |

### Formato de Dados

Todas as APIs retornam dados em formato **JSON** e seguem o padrão RESTful.

---

## 2. Arquitetura de Integração

```
┌─────────────────────────────────────────────────────────────────┐
│                        SAAS Pregão                               │
│                                                                  │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐  │
│  │  Scheduler  │───▶│  Connector  │───▶│  Normalization      │  │
│  │  (Cron Job) │    │  Factory    │    │  Engine             │  │
│  └─────────────┘    └─────────────┘    └─────────────────────┘  │
│                                               │                  │
└───────────────────────────────────────────────┼──────────────────┘
                                                │
                    ┌───────────────────────────┼───────────────────┐
                    │                           │                   │
                    ▼                           ▼                   ▼
┌─────────────────────────┐  ┌─────────────────────────┐  ┌─────────────────────────┐
│    APIs Públicas        │  │    APIs com Key         │  │    APIs OAuth           │
│    (4 portais)          │  │    (4 portais)          │  │    (3 portais)          │
├─────────────────────────┤  ├─────────────────────────┤  ├─────────────────────────┤
│ • PNCP                  │  │ • Compras RS            │  │ • ComprasNet            │
│ • Compras Amazonas      │  │ • Compras RJ            │  │ • Compras Bahia         │
│ • ComprasNet Goiás      │  │ • PE Integrado          │  │ • Compras MG            │
│ • Banpará               │  │                         │  │ • E-Lic SC              │
└─────────────────────────┘  └─────────────────────────┘  └─────────────────────────┘
```

---

## 3. APIs por Portal

### 3.1 PNCP (Portal Nacional)

**Status**: ✅ Ativo  
**Código**: `pncp`  
**Tipo**: API Pública (sem autenticação)  
**Documentação Oficial**: [Swagger PNCP](https://pncp.gov.br/api/swagger-ui.html)

#### Informações Gerais

| Campo | Valor |
|-------|-------|
| Base URL | `https://pncp.gov.br/api/consulta` |
| Formato | JSON |
| Charset | UTF-8 |
| Rate Limit | 1000 requisições/dia |
| Autenticação | Não requerida |

#### Endpoints

##### 3.1.1 Listar Órgãos

```http
GET /orgaos
```

**Parâmetros de Query**:

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `pagina` | integer | Não | Número da página (padrão: 1) |
| `tamanhoPagina` | integer | Não | Itens por página (padrão: 50, max: 500) |

**Resposta (200 OK)**:

```json
{
  "data": [
    {
      "cnpj": "0039446000101",
      "razaoSocial": "MINISTERIO DA ECONOMIA",
      "uf": "DF",
      "municipio": "Brasília"
    }
  ],
  "total": 15000,
  "pagina": 1,
  "tamanhoPagina": 50
}
```

##### 3.1.2 Listar Compras

```http
GET /compras
```

**Parâmetros de Query**:

| Parâmetro | Tipo | Obrigatório | Descrição | Formato |
|-----------|------|-------------|-----------|---------|
| `dataInicial` | string | Sim | Data inicial | YYYY-MM-DD |
| `dataFinal` | string | Sim | Data final | YYYY-MM-DD |
| `uf` | string | Não | Unidade Federativa | Sigla (ex: SP) |
| `pagina` | integer | Não | Número da página | - |
| `tamanhoPagina` | integer | Não | Itens por página | Max: 500 |

**Resposta (200 OK)**:

```json
{
  "data": [
    {
      "numeroControlePNCP": "00394460001012025NE000001",
      "numeroCompra": "00001/2025",
      "anoCompra": 2025,
      "orgaoEntidade": {
        "cnpj": "0039446000101",
        "razaoSocial": "MINISTERIO DA ECONOMIA"
      },
      "unidadeOrgao": {
        "codigoUnidade": "0039446000101",
        "nomeUnidade": "MINISTERIO DA ECONOMIA"
      },
      "dataAberturaProposta": "2025-01-15T10:00:00",
      "dataEncerramentoProposta": "2025-01-20T10:00:00",
      "modalidade": "PREGAO_ELETRONICO",
      "situacaoCompra": "PUBLICADA",
      "objeto": "Aquisição de material de escritório",
      "valorTotalEstimado": 50000.00
    }
  ],
  "total": 2500,
  "pagina": 1,
  "tamanhoPagina": 50
}
```

##### 3.1.3 Detalhes da Compra

```http
GET /compras/{numeroControlePNCP}
```

**Parâmetros de Path**:

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `numeroControlePNCP` | string | Número de controle da compra |

**Resposta (200 OK)**:

```json
{
  "numeroControlePNCP": "00394460001012025NE000001",
  "numeroCompra": "00001/2025",
  "anoCompra": 2025,
  "sequencialCompra": 1,
  "orgaoEntidade": {
    "cnpj": "0039446000101",
    "razaoSocial": "MINISTERIO DA ECONOMIA"
  },
  "unidadeOrgao": {
    "codigoUnidade": "0039446000101",
    "nomeUnidade": "MINISTERIO DA ECONOMIA"
  },
  "dataAberturaProposta": "2025-01-15T10:00:00",
  "dataEncerramentoProposta": "2025-01-20T10:00:00",
  "dataInclusao": "2025-01-10T08:30:00",
  "dataAtualizacao": "2025-01-10T08:30:00",
  "modalidade": "PREGAO_ELETRONICO",
  "situacaoCompra": "PUBLICADA",
  "tipoInstrumento": "NE",
  "objeto": "Aquisição de material de escritório",
  "informacaoComplementar": "",
  "processo": "12345/2025",
  "numeroProcesso": "12345/2025",
  "categoriaProcesso": "OBRAS",
  "naturezaObjeto": "OBRAS",
  "valorTotalEstimado": 50000.00,
  "valorTotalHomologado": null,
  "amparoLegal": "Lei 14.133/2021",
  "linkSistemaOrigem": "https://www.gov.br/compras/..."
}
```

##### 3.1.4 Itens da Compra

```http
GET /compras/{numeroControlePNCP}/itens
```

**Resposta (200 OK)**:

```json
{
  "data": [
    {
      "numeroItem": 1,
      "descricao": "Papel A4 Sulfite 75g",
      "quantidade": 100,
      "unidadeMedida": "RESMA",
      "valorUnitarioEstimado": 25.00,
      "valorTotalEstimado": 2500.00,
      "categoriaItem": "MATERIAL_DE_CONSUMO"
    }
  ]
}
```

#### Implementação no Sistema

```typescript
// lib/connectors/pncp.ts

import { Connector, BiddingData } from './types';

const PNCP_BASE_URL = 'https://pncp.gov.br/api/consulta';

export class PNCPConnector implements Connector {
  name = 'PNCP';
  code = 'pncp';
  
  async fetchBiddings(startDate: string, endDate: string): Promise<BiddingData[]> {
    const biddings: BiddingData[] = [];
    let page = 1;
    let hasMore = true;
    
    while (hasMore) {
      const response = await fetch(
        `${PNCP_BASE_URL}/compras?dataInicial=${startDate}&dataFinal=${endDate}&pagina=${page}&tamanhoPagina=500`,
        {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'SAAS-Pregao/1.0'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`PNCP API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      for (const item of data.data) {
        const details = await this.fetchBiddingDetails(item.numeroControlePNCP);
        const items = await this.fetchBiddingItems(item.numeroControlePNCP);
        
        biddings.push(this.normalizeData(item, details, items));
      }
      
      hasMore = data.data.length === 500;
      page++;
    }
    
    return biddings;
  }
  
  private async fetchBiddingDetails(controlNumber: string) {
    const response = await fetch(
      `${PNCP_BASE_URL}/compras/${controlNumber}`,
      { headers: { 'Accept': 'application/json' } }
    );
    return response.json();
  }
  
  private async fetchBiddingItems(controlNumber: string) {
    const response = await fetch(
      `${PNCP_BASE_URL}/compras/${controlNumber}/itens`,
      { headers: { 'Accept': 'application/json' } }
    );
    return response.json();
  }
  
  private normalizeData(raw: any, details: any, items: any): BiddingData {
    return {
      externalId: raw.numeroControlePNCP,
      title: raw.objeto,
      fullDescription: raw.objeto,
      modality: this.mapModality(raw.modalidade),
      source: 'pncp',
      openingDate: raw.dataAberturaProposta,
      closingDate: raw.dataEncerramentoProposta,
      status: this.mapStatus(raw.situacaoCompra),
      estimatedValue: raw.valorTotalEstimado,
      agency: {
        name: raw.orgaoEntidade.razaoSocial,
        cnpj: raw.orgaoEntidade.cnpj,
        state: raw.orgaoEntidade.uf
      },
      items: items.data?.map((item: any) => ({
        pos: item.numeroItem,
        description: item.descricao,
        quantity: item.quantidade,
        unit: item.unidadeMedida,
        estimatedValue: item.valorUnitarioEstimado
      })) || []
    };
  }
  
  private mapModality(modality: string): string {
    const mapping: Record<string, string> = {
      'PREGAO_ELETRONICO': 'PREGAO',
      'PREGAO_PRESENCIAL': 'PREGAO',
      'CONCORRENCIA_ELETRONICA': 'CONCORRENCIA',
      'CONCORRENCIA_PRESENCIAL': 'CONCORRENCIA',
      'DISPENSA_LICITACAO': 'DISPENSA',
      'INEXIGIBILIDADE_LICITACAO': 'INEXIGIBILIDADE'
    };
    return mapping[modality] || 'OUTRO';
  }
  
  private mapStatus(status: string): string {
    const mapping: Record<string, string> = {
      'PUBLICADA': 'OPEN',
      'EM_ANDAMENTO': 'OPEN',
      'CONCLUIDA': 'CLOSED',
      'CANCELADA': 'CANCELLED',
      'SUSPENSA': 'SUSPENDED'
    };
    return mapping[status] || 'UNKNOWN';
  }
}
```

---

### 3.2 ComprasNet (Federal)

**Status**: ✅ Ativo  
**Código**: `comprasnet`  
**Tipo**: API com Token  
**Documentação Oficial**: [ComprasNet API](http://comprasnet.gov.br/)

#### Informações Gerais

| Campo | Valor |
|-------|-------|
| Base URL | `http://comprasnet.gov.br/ws/public` |
| Formato | JSON / XML |
| Charset | UTF-8 |
| Rate Limit | 500 requisições/hora |
| Autenticação | Bearer Token |

#### Como Obter Token

1. Cadastrar-se no [SICOM](https://www.comprasnet.gov.br/)
2. Solicitar acesso à API no menu "Serviços > API"
3. Aguardar aprovação (3-5 dias úteis)
4. Receber credenciais por email

#### Endpoints

##### 3.2.1 Listar UASGs

```http
GET /uasgs
```

**Headers**:

```http
Authorization: Bearer {token}
Accept: application/json
```

**Resposta (200 OK)**:

```json
{
  "uasgs": [
    {
      "codigo": "003944",
      "nome": "MINISTERIO DA ECONOMIA",
      "cnpj": "0039446000101",
      "uf": "DF",
      "municipio": "BRASILIA",
      "logradouro": "ESPLANADA DOS MINISTERIOS"
    }
  ]
}
```

##### 3.2.2 Licitações por UASG

```http
GET /compras/uasg/{codigoUASG}
```

**Parâmetros de Path**:

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `codigoUASG` | string | Código da UASG (6 dígitos) |

**Parâmetros de Query**:

| Parâmetro | Tipo | Descrição | Formato |
|-----------|------|-----------|---------|
| `dataInicio` | string | Data inicial | DD/MM/YYYY |
| `dataFim` | string | Data final | DD/MM/YYYY |
| `modalidade` | string | Modalidade | PREGAO, CONCORRENCIA |

**Resposta (200 OK)**:

```json
{
  "licitacoes": [
    {
      "numero": "00001/2025",
      "modalidade": "PREGAO_ELETRONICO",
      "situacao": "PUBLICADA",
      "objeto": "Aquisição de material de escritório",
      "dataAbertura": "15/01/2025 10:00",
      "uasg": "003944",
      "valorEstimado": 50000.00
    }
  ]
}
```

##### 3.2.3 Detalhes do Pregão

```http
GET /pregoes/{numeroPregao}
```

**Resposta (200 OK)**:

```json
{
  "numero": "00001/2025",
  "ano": 2025,
  "uasg": "003944",
  "modalidade": "PREGAO_ELETRONICO",
  "situacao": "PUBLICADA",
  "objeto": "Aquisição de material de escritório",
  "dataAbertura": "15/01/2025 10:00",
  "dataEncerramento": "20/01/2025 10:00",
  "processo": "12345/2025",
  "valorEstimado": 50000.00,
  "itens": [
    {
      "numero": 1,
      "descricao": "Papel A4 Sulfite 75g",
      "quantidade": 100,
      "unidade": "RESMA",
      "valorUnitario": 25.00
    }
  ]
}
```

#### Implementação no Sistema

```typescript
// lib/connectors/comprasnet.ts

import { Connector, BiddingData } from './types';

const COMPRASNET_URL = 'http://comprasnet.gov.br/ws/public';

export class ComprasNetConnector implements Connector {
  name = 'ComprasNet';
  code = 'comprasnet';
  private token: string;
  
  constructor() {
    this.token = process.env.COMPRASNET_TOKEN || '';
    if (!this.token) {
      throw new Error('COMPRASNET_TOKEN não configurado');
    }
  }
  
  async fetchBiddings(startDate: string, endDate: string): Promise<BiddingData[]> {
    const biddings: BiddingData[] = [];
    
    // Buscar todas as UASGs primeiro
    const uasgs = await this.fetchUASGs();
    
    for (const uasg of uasgs) {
      try {
        const licitacoes = await this.fetchByUASG(uasg.codigo, startDate, endDate);
        
        for (const lic of licitacoes) {
          const details = await this.fetchPregaoDetails(lic.numero);
          biddings.push(this.normalizeData(lic, details));
        }
      } catch (error) {
        console.error(`Erro ao buscar UASG ${uasg.codigo}:`, error);
        continue;
      }
    }
    
    return biddings;
  }
  
  private async fetchUASGs(): Promise<any[]> {
    const response = await fetch(`${COMPRASNET_URL}/uasgs`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`ComprasNet API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.uasgs;
  }
  
  private async fetchByUASG(uasgCode: string, startDate: string, endDate: string) {
    const response = await fetch(
      `${COMPRASNET_URL}/compras/uasg/${uasgCode}?dataInicio=${startDate}&dataFim=${endDate}`,
      {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Accept': 'application/json'
        }
      }
    );
    
    if (!response.ok) return [];
    const data = await response.json();
    return data.licitacoes || [];
  }
  
  private async fetchPregaoDetails(numero: string) {
    const response = await fetch(
      `${COMPRASNET_URL}/pregoes/${numero}`,
      {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Accept': 'application/json'
        }
      }
    );
    return response.json();
  }
  
  private normalizeData(raw: any, details: any): BiddingData {
    return {
      externalId: `CN-${raw.numero}`,
      title: raw.objeto,
      fullDescription: details.objeto || raw.objeto,
      modality: this.mapModality(raw.modalidade),
      source: 'comprasnet',
      openingDate: this.parseDate(raw.dataAbertura),
      status: this.mapStatus(raw.situacao),
      estimatedValue: raw.valorEstimado || details.valorEstimado,
      agency: {
        name: details.uasgNome || `UASG ${details.uasg}`,
        uasg: details.uasg,
        state: this.getStateFromUASG(details.uasg)
      },
      items: details.itens?.map((item: any) => ({
        pos: item.numero,
        description: item.descricao,
        quantity: item.quantidade,
        unit: item.unidade,
        estimatedValue: item.valorUnitario
      })) || []
    };
  }
  
  private parseDate(dateStr: string): string {
    // Converte DD/MM/YYYY HH:mm para ISO
    const [date, time] = dateStr.split(' ');
    const [day, month, year] = date.split('/');
    return `${year}-${month}-${day}T${time || '00:00'}:00`;
  }
  
  private mapModality(modality: string): string {
    const mapping: Record<string, string> = {
      'PREGAO_ELETRONICO': 'PREGAO',
      'PREGAO_PRESENCIAL': 'PREGAO',
      'CONCORRENCIA': 'CONCORRENCIA',
      'TOMADA_DE_PRECOS': 'TOMADA_PRECOS'
    };
    return mapping[modality] || 'OUTRO';
  }
  
  private mapStatus(status: string): string {
    const mapping: Record<string, string> = {
      'PUBLICADA': 'OPEN',
      'EM_ANDAMENTO': 'OPEN',
      'CONCLUIDA': 'CLOSED',
      'CANCELADA': 'CANCELLED',
      'DESERTA': 'DESERTED'
    };
    return mapping[status] || 'UNKNOWN';
  }
  
  private getStateFromUASG(uasg: string): string {
    // UASGs começam com código do estado
    const stateMap: Record<string, string> = {
      '00': 'DF', '01': 'AC', '02': 'AL', '03': 'AP', '04': 'AM',
      '05': 'BA', '06': 'CE', '07': 'DF', '08': 'ES', '09': 'GO',
      '10': 'MA', '11': 'MT', '12': 'MS', '13': 'MG', '14': 'PA',
      '15': 'PB', '16': 'PR', '17': 'PE', '18': 'PI', '19': 'RJ',
      '20': 'RN', '21': 'RS', '22': 'RO', '23': 'RR', '24': 'SC',
      '25': 'SP', '26': 'SE', '27': 'TO'
    };
    return stateMap[uasg.substring(0, 2)] || 'DF';
  }
}
```

---

### 3.3 Compras RS

**Status**: ✅ Ativo  
**Código**: `compras-rs`  
**Tipo**: API com API Key  
**Documentação Oficial**: [Compras RS API](https://compras.rs.gov.br/api/docs)

#### Informações Gerais

| Campo | Valor |
|-------|-------|
| Base URL | `https://compras.rs.gov.br/api/v1` |
| Formato | JSON |
| Charset | UTF-8 |
| Rate Limit | 1000 requisições/hora |
| Autenticação | X-API-Key |

#### Como Obter API Key

1. Acessar [Compras RS](https://compras.rs.gov.br)
2. Criar conta de desenvolvedor
3. Gerar API Key no painel
4. Validar email de confirmação

#### Endpoints

##### 3.3.1 Listar Licitações

```http
GET /licitacoes
```

**Headers**:

```http
X-API-Key: {sua_api_key}
Accept: application/json
```

**Parâmetros de Query**:

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `data_publicacao_inicio` | date | Data inicial de publicação |
| `data_publicacao_fim` | date | Data final de publicação |
| `situacao` | string | Situação (PUBLICADA, EM_ANDAMENTO) |
| `modalidade` | string | Modalidade |
| `pagina` | integer | Número da página |
| `por_pagina` | integer | Itens por página (max: 100) |

**Resposta (200 OK)**:

```json
{
  "dados": [
    {
      "id": 12345,
      "numero": "001/2025",
      "ano": 2025,
      "objeto": "Aquisição de equipamentos de informática",
      "modalidade": "PREGAO_ELETRONICO",
      "situacao": "PUBLICADA",
      "data_publicacao": "2025-01-10",
      "data_abertura": "2025-01-20T14:00:00",
      "valor_estimado": 75000.00,
      "orgao": {
        "id": 789,
        "nome": "SECRETARIA DA EDUCACAO",
        "cnpj": "12345678000190"
      }
    }
  ],
  "total": 150,
  "pagina": 1,
  "por_pagina": 20
}
```

##### 3.3.2 Detalhes da Licitação

```http
GET /licitacoes/{id}
```

**Resposta (200 OK)**:

```json
{
  "id": 12345,
  "numero": "001/2025",
  "ano": 2025,
  "objeto": "Aquisição de equipamentos de informática",
  "descricao_detalhada": "Aquisição de computadores, notebooks e periféricos",
  "modalidade": "PREGAO_ELETRONICO",
  "situacao": "PUBLICADA",
  "processo": "98765/2025",
  "data_publicacao": "2025-01-10",
  "data_abertura": "2025-01-20T14:00:00",
  "data_encerramento": "2025-01-21T14:00:00",
  "valor_estimado": 75000.00,
  "orgao": {
    "id": 789,
    "nome": "SECRETARIA DA EDUCACAO",
    "cnpj": "12345678000190",
    "endereco": "Porto Alegre - RS"
  },
  "itens": [
    {
      "id": 1,
      "numero": 1,
      "descricao": "Computador Desktop",
      "quantidade": 10,
      "unidade": "UNIDADE",
      "valor_unitario": 3500.00
    }
  ],
  "documentos": [
    {
      "id": 1,
      "nome": "Edital",
      "url": "https://compras.rs.gov.br/documentos/12345/edital.pdf"
    }
  ]
}
```

#### Implementação no Sistema

```typescript
// lib/connectors/compras-rs.ts

import { Connector, BiddingData } from './types';

const COMPRAS_RS_URL = 'https://compras.rs.gov.br/api/v1';

export class ComprasRSConnector implements Connector {
  name = 'Compras RS';
  code = 'compras-rs';
  private apiKey: string;
  
  constructor() {
    this.apiKey = process.env.COMPRAS_RS_API_KEY || '';
  }
  
  async fetchBiddings(startDate: string, endDate: string): Promise<BiddingData[]> {
    const biddings: BiddingData[] = [];
    let page = 1;
    let hasMore = true;
    
    while (hasMore) {
      const response = await fetch(
        `${COMPRAS_RS_URL}/licitacoes?data_publicacao_inicio=${startDate}&data_publicacao_fim=${endDate}&pagina=${page}&por_pagina=100`,
        {
          headers: {
            'X-API-Key': this.apiKey,
            'Accept': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Compras RS API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      for (const lic of data.dados) {
        const details = await this.fetchDetails(lic.id);
        biddings.push(this.normalizeData(lic, details));
      }
      
      hasMore = data.dados.length === 100;
      page++;
    }
    
    return biddings;
  }
  
  private async fetchDetails(id: number) {
    const response = await fetch(
      `${COMPRAS_RS_URL}/licitacoes/${id}`,
      {
        headers: {
          'X-API-Key': this.apiKey,
          'Accept': 'application/json'
        }
      }
    );
    return response.json();
  }
  
  private normalizeData(raw: any, details: any): BiddingData {
    return {
      externalId: `RS-${raw.id}`,
      title: raw.objeto,
      fullDescription: details.descricao_detalhada || raw.objeto,
      modality: this.mapModality(raw.modalidade),
      source: 'compras-rs',
      openingDate: raw.data_abertura,
      closingDate: details.data_encerramento,
      status: this.mapStatus(raw.situacao),
      estimatedValue: raw.valor_estimado,
      agency: {
        name: raw.orgao.nome,
        cnpj: raw.orgao.cnpj,
        state: 'RS'
      },
      items: details.itens?.map((item: any) => ({
        pos: item.numero,
        description: item.descricao,
        quantity: item.quantidade,
        unit: item.unidade,
        estimatedValue: item.valor_unitario
      })) || [],
      documents: details.documentos?.map((doc: any) => ({
        name: doc.nome,
        url: doc.url
      })) || []
    };
  }
  
  private mapModality(modality: string): string {
    const mapping: Record<string, string> = {
      'PREGAO_ELETRONICO': 'PREGAO',
      'PREGAO_PRESENCIAL': 'PREGAO',
      'CONCORRENCIA': 'CONCORRENCIA',
      'DISPENSA_LICITACAO': 'DISPENSA'
    };
    return mapping[modality] || 'OUTRO';
  }
  
  private mapStatus(status: string): string {
    const mapping: Record<string, string> = {
      'PUBLICADA': 'OPEN',
      'EM_ANDAMENTO': 'OPEN',
      'CONCLUIDA': 'CLOSED',
      'CANCELADA': 'CANCELLED',
      'DESERTA': 'DESERTED',
      'SUSPENSA': 'SUSPENDED'
    };
    return mapping[status] || 'UNKNOWN';
  }
}
```

---

### 3.4 Compras Bahia

**Status**: ✅ Ativo  
**Código**: `compras-bahia`  
**Tipo**: API com Token Bearer  
**Documentação Oficial**: [Compras Bahia API](https://compras.ba.gov.br/api/docs)

#### Informações Gerais

| Campo | Valor |
|-------|-------|
| Base URL | `https://compras.ba.gov.br/api/v2` |
| Formato | JSON |
| Charset | UTF-8 |
| Rate Limit | 500 requisições/hora |
| Autenticação | Bearer Token |

#### Endpoints

##### 3.4.1 Autenticação (Obter Token)

```http
POST /auth/login
```

**Body**:

```json
{
  "usuario": "seu_usuario",
  "senha": "sua_senha"
}
```

**Resposta (200 OK)**:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tipo": "Bearer",
  "expiraEm": "2025-01-20T10:00:00"
}
```

##### 3.4.2 Listar Pregões

```http
GET /pregoes
```

**Headers**:

```http
Authorization: Bearer {token}
Accept: application/json
```

**Parâmetros de Query**:

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `data_inicio` | date | Data inicial |
| `data_fim` | date | Data final |
| `situacao` | string | Situação |
| `pagina` | integer | Página |
| `limite` | integer | Limite por página |

**Resposta (200 OK)**:

```json
{
  "pregoes": [
    {
      "id": 9876,
      "numero": "001/2025",
      "objeto": "Contratação de serviços de limpeza",
      "situacao": "PUBLICADO",
      "data_publicacao": "2025-01-15",
      "data_abertura": "2025-01-25T09:00:00",
      "valor_estimado": 120000.00,
      "orgao": {
        "nome": "SECRETARIA DE ADMINISTRACAO",
        "cnpj": "12345678000190"
      }
    }
  ],
  "total": 80
}
```

#### Implementação no Sistema

```typescript
// lib/connectors/compras-bahia.ts

import { Connector, BiddingData } from './types';

const COMPRAS_BA_URL = 'https://compras.ba.gov.br/api/v2';

export class ComprasBahiaConnector implements Connector {
  name = 'Compras Bahia';
  code = 'compras-bahia';
  private token: string | null = null;
  private tokenExpiry: Date | null = null;
  
  private async authenticate(): Promise<void> {
    if (this.token && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return;
    }
    
    const response = await fetch(`${COMPRAS_BA_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usuario: process.env.COMPRAS_BA_USER,
        senha: process.env.COMPRAS_BA_PASS
      })
    });
    
    if (!response.ok) {
      throw new Error('Falha na autenticação Compras BA');
    }
    
    const data = await response.json();
    this.token = data.token;
    this.tokenExpiry = new Date(data.expiraEm);
  }
  
  async fetchBiddings(startDate: string, endDate: string): Promise<BiddingData[]> {
    await this.authenticate();
    
    const biddings: BiddingData[] = [];
    let page = 1;
    let hasMore = true;
    
    while (hasMore) {
      const response = await fetch(
        `${COMPRAS_BA_URL}/pregoes?data_inicio=${startDate}&data_fim=${endDate}&pagina=${page}&limite=50`,
        {
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Accept': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Compras BA API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      for (const preg of data.pregoes) {
        biddings.push(this.normalizeData(preg));
      }
      
      hasMore = data.pregoes.length === 50;
      page++;
    }
    
    return biddings;
  }
  
  private normalizeData(raw: any): BiddingData {
    return {
      externalId: `BA-${raw.id}`,
      title: raw.objeto,
      fullDescription: raw.objeto,
      modality: 'PREGAO',
      source: 'compras-bahia',
      openingDate: raw.data_abertura,
      status: this.mapStatus(raw.situacao),
      estimatedValue: raw.valor_estimado,
      agency: {
        name: raw.orgao.nome,
        cnpj: raw.orgao.cnpj,
        state: 'BA'
      },
      items: []
    };
  }
  
  private mapStatus(status: string): string {
    const mapping: Record<string, string> = {
      'PUBLICADO': 'OPEN',
      'EM_ANDAMENTO': 'OPEN',
      'CONCLUIDO': 'CLOSED',
      'CANCELADO': 'CANCELLED',
      'DESERTO': 'DESERTED'
    };
    return mapping[status] || 'UNKNOWN';
  }
}
```

---

### 3.5 Compras Amazonas

**Status**: ✅ Ativo  
**Código**: `compras-amazonas`  
**Tipo**: API Pública  
**Documentação**: Disponível no portal

#### Informações Gerais

| Campo | Valor |
|-------|-------|
| Base URL | `https://compras.am.gov.br/api/public` |
| Formato | JSON |
| Charset | UTF-8 |
| Rate Limit | 500 requisições/hora |
| Autenticação | Não requerida |

#### Endpoints

##### 3.5.1 Listar Licitações

```http
GET /licitacoes
```

**Parâmetros de Query**:

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `data_inicial` | date | Data inicial (YYYY-MM-DD) |
| `data_final` | date | Data final (YYYY-MM-DD) |
| `pagina` | integer | Número da página |
| `itens` | integer | Itens por página |

**Resposta (200 OK)**:

```json
{
  "licitacoes": [
    {
      "id": 1234,
      "numero": "001/2025",
      "objeto": "Aquisição de material médico-hospitalar",
      "modalidade": "PREGAO_ELETRONICO",
      "situacao": "PUBLICADA",
      "data_publicacao": "2025-01-10",
      "data_abertura": "2025-01-20T10:00:00",
      "valor_estimado": 150000.00,
      "orgao": {
        "nome": "SECRETARIA DE SAUDE",
        "cnpj": "12345678000190"
      }
    }
  ],
  "total": 45
}
```

#### Implementação

```typescript
// lib/connectors/compras-amazonas.ts

import { Connector, BiddingData } from './types';

const COMPRAS_AM_URL = 'https://compras.am.gov.br/api/public';

export class ComprasAmazonasConnector implements Connector {
  name = 'Compras Amazonas';
  code = 'compras-amazonas';
  
  async fetchBiddings(startDate: string, endDate: string): Promise<BiddingData[]> {
    const biddings: BiddingData[] = [];
    let page = 1;
    let hasMore = true;
    
    while (hasMore) {
      const response = await fetch(
        `${COMPRAS_AM_URL}/licitacoes?data_inicial=${startDate}&data_final=${endDate}&pagina=${page}&itens=50`
      );
      
      if (!response.ok) {
        throw new Error(`Compras AM API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      for (const lic of data.licitacoes) {
        biddings.push(this.normalizeData(lic));
      }
      
      hasMore = data.licitacoes.length === 50;
      page++;
    }
    
    return biddings;
  }
  
  private normalizeData(raw: any): BiddingData {
    return {
      externalId: `AM-${raw.id}`,
      title: raw.objeto,
      fullDescription: raw.objeto,
      modality: this.mapModality(raw.modalidade),
      source: 'compras-amazonas',
      openingDate: raw.data_abertura,
      status: this.mapStatus(raw.situacao),
      estimatedValue: raw.valor_estimado,
      agency: {
        name: raw.orgao.nome,
        cnpj: raw.orgao.cnpj,
        state: 'AM'
      },
      items: []
    };
  }
  
  private mapModality(modality: string): string {
    const mapping: Record<string, string> = {
      'PREGAO_ELETRONICO': 'PREGAO',
      'PREGAO_PRESENCIAL': 'PREGAO',
      'CONCORRENCIA': 'CONCORRENCIA',
      'CONVITE': 'CONVITE'
    };
    return mapping[modality] || 'OUTRO';
  }
  
  private mapStatus(status: string): string {
    const mapping: Record<string, string> = {
      'PUBLICADA': 'OPEN',
      'EM_ANDAMENTO': 'OPEN',
      'CONCLUIDA': 'CLOSED',
      'CANCELADA': 'CANCELLED'
    };
    return mapping[status] || 'UNKNOWN';
  }
}
```

---

### 3.6 Compras RJ

**Status**: ✅ Ativo  
**Código**: `compras-rj`  
**Tipo**: API com API Key  
**Documentação**: [Compras RJ API](https://compras.rj.gov.br/api/docs)

#### Informações Gerais

| Campo | Valor |
|-------|-------|
| Base URL | `https://compras.rj.gov.br/api/v1` |
| Formato | JSON |
| Charset | UTF-8 |
| Rate Limit | 1000 requisições/hora |
| Autenticação | X-API-Key |

#### Endpoints

##### 3.6.1 Listar Licitações

```http
GET /licitacoes
```

**Headers**:

```http
X-API-Key: {sua_api_key}
Accept: application/json
```

**Resposta (200 OK)**:

```json
{
  "licitacoes": [
    {
      "id": 5678,
      "numero": "001/2025",
      "objeto": "Contratação de serviços de tecnologia",
      "modalidade": "PREGAO_ELETRONICO",
      "situacao": "PUBLICADA",
      "data_publicacao": "2025-01-12",
      "data_abertura": "2025-01-22T10:00:00",
      "valor_estimado": 200000.00,
      "orgao": {
        "nome": "PRODERJ",
        "cnpj": "12345678000190"
      }
    }
  ]
}
```

#### Implementação

```typescript
// lib/connectors/compras-rj.ts

import { Connector, BiddingData } from './types';

const COMPRAS_RJ_URL = 'https://compras.rj.gov.br/api/v1';

export class ComprasRJConnector implements Connector {
  name = 'Compras RJ';
  code = 'compras-rj';
  private apiKey: string;
  
  constructor() {
    this.apiKey = process.env.COMPRAS_RJ_KEY || '';
  }
  
  async fetchBiddings(startDate: string, endDate: string): Promise<BiddingData[]> {
    const response = await fetch(
      `${COMPRAS_RJ_URL}/licitacoes?data_inicio=${startDate}&data_fim=${endDate}`,
      {
        headers: {
          'X-API-Key': this.apiKey,
          'Accept': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Compras RJ API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return data.licitacoes.map((lic: any) => this.normalizeData(lic));
  }
  
  private normalizeData(raw: any): BiddingData {
    return {
      externalId: `RJ-${raw.id}`,
      title: raw.objeto,
      fullDescription: raw.objeto,
      modality: 'PREGAO',
      source: 'compras-rj',
      openingDate: raw.data_abertura,
      status: this.mapStatus(raw.situacao),
      estimatedValue: raw.valor_estimado,
      agency: {
        name: raw.orgao.nome,
        cnpj: raw.orgao.cnpj,
        state: 'RJ'
      },
      items: []
    };
  }
  
  private mapStatus(status: string): string {
    const mapping: Record<string, string> = {
      'PUBLICADA': 'OPEN',
      'EM_ANDAMENTO': 'OPEN',
      'CONCLUIDA': 'CLOSED',
      'CANCELADA': 'CANCELLED'
    };
    return mapping[status] || 'UNKNOWN';
  }
}
```

---

### 3.7 ComprasNet Goiás

**Status**: ✅ Ativo  
**Código**: `comprasnet-goias`  
**Tipo**: API Pública  
**Documentação**: Disponível no portal

#### Informações Gerais

| Campo | Valor |
|-------|-------|
| Base URL | `https://compras.go.gov.br/api/public` |
| Formato | JSON |
| Charset | UTF-8 |
| Rate Limit | 500 requisições/hora |
| Autenticação | Não requerida |

#### Endpoints

```http
GET /licitacoes
GET /pregoes
GET /orgaos
```

#### Implementação

```typescript
// lib/connectors/compras-goias.ts

import { Connector, BiddingData } from './types';

const COMPRAS_GO_URL = 'https://compras.go.gov.br/api/public';

export class ComprasGoiasConnector implements Connector {
  name = 'ComprasNet Goiás';
  code = 'comprasnet-goias';
  
  async fetchBiddings(startDate: string, endDate: string): Promise<BiddingData[]> {
    const response = await fetch(
      `${COMPRAS_GO_URL}/licitacoes?data_inicio=${startDate}&data_fim=${endDate}`
    );
    
    if (!response.ok) {
      throw new Error(`Compras GO API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return data.licitacoes.map((lic: any) => ({
      externalId: `GO-${lic.id}`,
      title: lic.objeto,
      fullDescription: lic.objeto,
      modality: lic.modalidade || 'PREGAO',
      source: 'comprasnet-goias',
      openingDate: lic.data_abertura,
      status: lic.situacao === 'PUBLICADA' ? 'OPEN' : 'CLOSED',
      estimatedValue: lic.valor_estimado,
      agency: {
        name: lic.orgao?.nome || 'Órgão GO',
        state: 'GO'
      },
      items: []
    }));
  }
}
```

---

### 3.8 Compras MG

**Status**: ✅ Ativo  
**Código**: `compras-mg`  
**Tipo**: API com Token  
**Documentação**: [Compras MG API](https://compras.mg.gov.br/api/docs)

#### Informações Gerais

| Campo | Valor |
|-------|-------|
| Base URL | `https://compras.mg.gov.br/api/v1` |
| Formato | JSON |
| Charset | UTF-8 |
| Rate Limit | 500 requisições/hora |
| Autenticação | Bearer Token |

#### Endpoints

```http
GET /processos
GET /pregoes
GET /dispensas
GET /atos
```

#### Implementação

```typescript
// lib/connectors/compras-mg.ts

import { Connector, BiddingData } from './types';

const COMPRAS_MG_URL = 'https://compras.mg.gov.br/api/v1';

export class ComprasMGConnector implements Connector {
  name = 'Compras MG';
  code = 'compras-mg';
  private token: string;
  
  constructor() {
    this.token = process.env.COMPRAS_MG_TOKEN || '';
  }
  
  async fetchBiddings(startDate: string, endDate: string): Promise<BiddingData[]> {
    const response = await fetch(
      `${COMPRAS_MG_URL}/processos?data_inicio=${startDate}&data_fim=${endDate}`,
      {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Accept': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Compras MG API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return data.processos.map((proc: any) => ({
      externalId: `MG-${proc.id}`,
      title: proc.objeto,
      fullDescription: proc.objeto,
      modality: proc.modalidade || 'OUTRO',
      source: 'compras-mg',
      openingDate: proc.data_abertura,
      status: proc.situacao === 'PUBLICADO' ? 'OPEN' : 'CLOSED',
      estimatedValue: proc.valor_estimado,
      agency: {
        name: proc.orgao?.nome || 'Órgão MG',
        state: 'MG'
      },
      items: []
    }));
  }
}
```

---

### 3.9 Banpará

**Status**: ✅ Ativo  
**Código**: `banpara`  
**Tipo**: API Pública  
**Documentação**: Disponível no portal

#### Informações Gerais

| Campo | Valor |
|-------|-------|
| Base URL | `https://licitacoes.banpara.b.br/api/v1` |
| Formato | JSON |
| Charset | UTF-8 |
| Rate Limit | 200 requisições/hora |
| Autenticação | Não requerida |

#### Endpoints

```http
GET /licitacoes
GET /pregoes
GET /concursos
GET /dispensas
```

#### Implementação

```typescript
// lib/connectors/banpara.ts

import { Connector, BiddingData } from './types';

const BANPARA_URL = 'https://licitacoes.banpara.b.br/api/v1';

export class BanparaConnector implements Connector {
  name = 'Banpará';
  code = 'banpara';
  
  async fetchBiddings(startDate: string, endDate: string): Promise<BiddingData[]> {
    const response = await fetch(
      `${BANPARA_URL}/licitacoes?data_inicio=${startDate}&data_fim=${endDate}`
    );
    
    if (!response.ok) {
      throw new Error(`Banpará API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return data.licitacoes.map((lic: any) => ({
      externalId: `BAN-${lic.id}`,
      title: lic.objeto,
      fullDescription: lic.objeto,
      modality: lic.modalidade || 'PREGAO',
      source: 'banpara',
      openingDate: lic.data_abertura,
      status: lic.situacao === 'ABERTA' ? 'OPEN' : 'CLOSED',
      estimatedValue: lic.valor_estimado,
      agency: {
        name: 'BANPARA',
        cnpj: '04909525000166',
        state: 'PA'
      },
      items: []
    }));
  }
}
```

---

### 3.10 PE Integrado

**Status**: ✅ Ativo  
**Código**: `pe-integrado`  
**Tipo**: API com API Key  
**Documentação**: [PE Integrado API](https://www.peintegrado.pe.gov.br/api/docs)

#### Informações Gerais

| Campo | Valor |
|-------|-------|
| Base URL | `https://www.peintegrado.pe.gov.br/api/v1` |
| Formato | JSON |
| Charset | UTF-8 |
| Rate Limit | 500 requisições/hora |
| Autenticação | X-API-Key |

#### Endpoints

```http
GET /licitacoes
GET /pregoes
GET /contratacoes
GET /orgaos
```

#### Implementação

```typescript
// lib/connectors/pe-integrado.ts

import { Connector, BiddingData } from './types';

const PE_INTEGRADO_URL = 'https://www.peintegrado.pe.gov.br/api/v1';

export class PEIntegradoConnector implements Connector {
  name = 'PE Integrado';
  code = 'pe-integrado';
  private apiKey: string;
  
  constructor() {
    this.apiKey = process.env.PE_INTEGRADO_KEY || '';
  }
  
  async fetchBiddings(startDate: string, endDate: string): Promise<BiddingData[]> {
    const response = await fetch(
      `${PE_INTEGRADO_URL}/licitacoes?data_inicio=${startDate}&data_fim=${endDate}`,
      {
        headers: {
          'X-API-Key': this.apiKey,
          'Accept': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`PE Integrado API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return data.licitacoes.map((lic: any) => ({
      externalId: `PE-${lic.id}`,
      title: lic.objeto,
      fullDescription: lic.objeto,
      modality: lic.modalidade || 'PREGAO',
      source: 'pe-integrado',
      openingDate: lic.data_abertura,
      status: lic.situacao === 'PUBLICADA' ? 'OPEN' : 'CLOSED',
      estimatedValue: lic.valor_estimado,
      agency: {
        name: lic.orgao?.nome || 'Órgão PE',
        state: 'PE'
      },
      items: []
    }));
  }
}
```

---

### 3.11 E-Lic SC

**Status**: ✅ Ativo  
**Código**: `e-lic-sc`  
**Tipo**: API com Token  
**Documentação**: [E-Lic SC API](https://e-lic.sc.gov.br/api/docs)

#### Informações Gerais

| Campo | Valor |
|-------|-------|
| Base URL | `https://e-lic.sc.gov.br/api/v1` |
| Formato | JSON |
| Charset | UTF-8 |
| Rate Limit | 500 requisições/hora |
| Autenticação | Bearer Token |

#### Endpoints

```http
GET /licitacoes
GET /pregoes
GET /dispensas
GET /atas
```

#### Implementação

```typescript
// lib/connectors/e-lic-sc.ts

import { Connector, BiddingData } from './types';

const ELIC_SC_URL = 'https://e-lic.sc.gov.br/api/v1';

export class ELicSCConnector implements Connector {
  name = 'E-Lic SC';
  code = 'e-lic-sc';
  private token: string;
  
  constructor() {
    this.token = process.env.ELIC_SC_TOKEN || '';
  }
  
  async fetchBiddings(startDate: string, endDate: string): Promise<BiddingData[]> {
    const response = await fetch(
      `${ELIC_SC_URL}/licitacoes?data_inicio=${startDate}&data_fim=${endDate}`,
      {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Accept': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`E-Lic SC API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return data.licitacoes.map((lic: any) => ({
      externalId: `SC-${lic.id}`,
      title: lic.objeto,
      fullDescription: lic.objeto,
      modality: lic.modalidade || 'PREGAO',
      source: 'e-lic-sc',
      openingDate: lic.data_abertura,
      status: lic.situacao === 'PUBLICADA' ? 'OPEN' : 'CLOSED',
      estimatedValue: lic.valor_estimado,
      agency: {
        name: lic.orgao?.nome || 'Órgão SC',
        state: 'SC'
      },
      items: []
    }));
  }
}
```

---

## 4. Implementação no Sistema

### 4.1 Factory de Conectores

```typescript
// lib/connectors/index.ts

import { PNCPConnector } from './pncp';
import { ComprasNetConnector } from './comprasnet';
import { ComprasRSConnector } from './compras-rs';
import { ComprasBahiaConnector } from './compras-bahia';
import { ComprasAmazonasConnector } from './compras-amazonas';
import { ComprasRJConnector } from './compras-rj';
import { ComprasGoiasConnector } from './compras-goias';
import { ComprasMGConnector } from './compras-mg';
import { BanparaConnector } from './banpara';
import { PEIntegradoConnector } from './pe-integrado';
import { ELicSCConnector } from './e-lic-sc';

export interface Connector {
  name: string;
  code: string;
  fetchBiddings(startDate: string, endDate: string): Promise<BiddingData[]>;
}

export interface BiddingData {
  externalId: string;
  title: string;
  fullDescription: string;
  modality: string;
  source: string;
  openingDate: string;
  closingDate?: string;
  status: string;
  estimatedValue?: number;
  agency: {
    name: string;
    cnpj?: string;
    uasg?: string;
    state: string;
  };
  items: Array<{
    pos: number;
    description: string;
    quantity: number;
    unit: string;
    estimatedValue?: number;
  }>;
  documents?: Array<{
    name: string;
    url: string;
  }>;
}

const connectors: Record<string, () => Connector> = {
  'pncp': () => new PNCPConnector(),
  'comprasnet': () => new ComprasNetConnector(),
  'compras-rs': () => new ComprasRSConnector(),
  'compras-bahia': () => new ComprasBahiaConnector(),
  'compras-amazonas': () => new ComprasAmazonasConnector(),
  'compras-rj': () => new ComprasRJConnector(),
  'comprasnet-goias': () => new ComprasGoiasConnector(),
  'compras-mg': () => new ComprasMGConnector(),
  'banpara': () => new BanparaConnector(),
  'pe-integrado': () => new PEIntegradoConnector(),
  'e-lic-sc': () => new ELicSCConnector(),
};

export function getConnector(code: string): Connector {
  const factory = connectors[code];
  if (!factory) {
    throw new Error(`Connector not found: ${code}`);
  }
  return factory();
}

export function getAllConnectors(): Connector[] {
  return Object.keys(connectors).map(code => getConnector(code));
}

export const CONNECTOR_CODES = Object.keys(connectors);
```

### 4.2 Serviço de Sincronização

```typescript
// lib/services/sync-service.ts

import { getConnector, getAllConnectors, BiddingData } from '@/lib/connectors';
import { prisma } from '@/lib/prisma';

export class SyncService {
  async syncAll(startDate: string, endDate: string) {
    const connectors = getAllConnectors();
    const results = [];
    
    for (const connector of connectors) {
      try {
        console.log(`[Sync] Starting ${connector.name}...`);
        const biddings = await connector.fetchBiddings(startDate, endDate);
        
        for (const bidding of biddings) {
          await this.saveBidding(bidding, connector.code);
        }
        
        results.push({
          connector: connector.code,
          status: 'success',
          count: biddings.length
        });
        
        console.log(`[Sync] ${connector.name}: ${biddings.length} licitações`);
      } catch (error) {
        console.error(`[Sync] Error in ${connector.name}:`, error);
        results.push({
          connector: connector.code,
          status: 'error',
          error: (error as Error).message
        });
      }
    }
    
    return results;
  }
  
  async syncConnector(connectorCode: string, startDate: string, endDate: string) {
    const connector = getConnector(connectorCode);
    const biddings = await connector.fetchBiddings(startDate, endDate);
    
    for (const bidding of biddings) {
      await this.saveBidding(bidding, connectorCode);
    }
    
    return { count: biddings.length };
  }
  
  private async saveBidding(data: BiddingData, source: string) {
    // Buscar ou criar portal
    let portal = await prisma.portal.findFirst({
      where: { code: source }
    });
    
    if (!portal) {
      portal = await prisma.portal.create({
        data: {
          code: source,
          name: source.toUpperCase(),
          type: 'API'
        }
      });
    }
    
    // Upsert bidding
    await prisma.bidding.upsert({
      where: { externalId: data.externalId },
      update: {
        title: data.title,
        organ: data.agency.name,
        state: data.agency.state,
        modality: data.modality,
        estimatedValue: data.estimatedValue,
        openingDate: data.openingDate ? new Date(data.openingDate) : null,
        status: data.status,
        rawText: data.fullDescription,
        updatedAt: new Date()
      },
      create: {
        externalId: data.externalId,
        portalId: portal.id,
        title: data.title,
        organ: data.agency.name,
        state: data.agency.state,
        modality: data.modality,
        estimatedValue: data.estimatedValue,
        openingDate: data.openingDate ? new Date(data.openingDate) : null,
        status: data.status,
        rawText: data.fullDescription
      }
    });
  }
}

export const syncService = new SyncService();
```

---

## 5. Variáveis de Ambiente

```env
# ============================================
# APIs REST - Portais de Licitação
# ============================================

# PNCP (Público - não requer autenticação)
PNCP_API_URL=https://pncp.gov.br/api/consulta

# ComprasNet Federal (requer token)
COMPRASNET_API_URL=http://comprasnet.gov.br/ws/public
COMPRASNET_TOKEN=seu_token_aqui

# Compras RS (requer API Key)
COMPRAS_RS_API_KEY=sua_api_key_aqui

# Compras Bahia (requer usuário/senha)
COMPRAS_BA_USER=seu_usuario
COMPRAS_BA_PASS=sua_senha
COMPRAS_BA_TOKEN=token_obtido_via_login

# Compras Amazonas (público)
# Não requer variáveis

# Compras RJ (requer API Key)
COMPRAS_RJ_KEY=sua_api_key_aqui

# ComprasNet Goiás (público)
# Não requer variáveis

# Compras MG (requer token)
COMPRAS_MG_TOKEN=seu_token_aqui

# Banpará (público)
# Não requer variáveis

# PE Integrado (requer API Key)
PE_INTEGRADO_KEY=sua_api_key_aqui

# E-Lic SC (requer token)
ELIC_SC_TOKEN=seu_token_aqui
```

---

## 6. Tratamento de Erros

### 6.1 Códigos de Erro Comuns

| Código | Significado | Ação Recomendada |
|--------|-------------|------------------|
| 400 | Bad Request | Verificar parâmetros da requisição |
| 401 | Unauthorized | Token expirado ou inválido - renovar |
| 403 | Forbidden | Sem permissão - verificar credenciais |
| 404 | Not Found | Recurso não existe |
| 429 | Too Many Requests | Rate limit excedido - aguardar |
| 500 | Server Error | Erro do servidor - retry com backoff |
| 503 | Service Unavailable | Serviço indisponível - retry |

### 6.2 Estratégia de Retry

```typescript
// lib/utils/retry.ts

export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      // Não retry em erros 4xx (exceto 429)
      if (error instanceof Response && error.status < 500 && error.status !== 429) {
        throw error;
      }
      
      if (attempt < maxRetries) {
        await sleep(delay * attempt); // Exponential backoff
      }
    }
  }
  
  throw lastError;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

---

## 7. Rate Limiting

### 7.1 Limites por Portal

| Portal | Limite | Janela |
|--------|--------|--------|
| PNCP | 1000 | dia |
| ComprasNet | 500 | hora |
| Compras RS | 1000 | hora |
| Compras Bahia | 500 | hora |
| Compras Amazonas | 500 | hora |
| Compras RJ | 1000 | hora |
| ComprasNet Goiás | 500 | hora |
| Compras MG | 500 | hora |
| Banpará | 200 | hora |
| PE Integrado | 500 | hora |
| E-Lic SC | 500 | hora |

### 7.2 Implementação de Rate Limit

```typescript
// lib/utils/rate-limiter.ts

import { RateLimiterRedis } from 'rate-limiter-flexible';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

const limiters: Record<string, RateLimiterRedis> = {
  'pncp': new RateLimiterRedis({
    storeClient: redis,
    keyPrefix: 'ratelimit_pncp',
    points: 1000,
    duration: 86400, // 24 horas
  }),
  'comprasnet': new RateLimiterRedis({
    storeClient: redis,
    keyPrefix: 'ratelimit_comprasnet',
    points: 500,
    duration: 3600, // 1 hora
  }),
  // ... outros conectores
};

export async function checkRateLimit(connectorCode: string): Promise<void> {
  const limiter = limiters[connectorCode];
  if (!limiter) return;
  
  try {
    await limiter.consume(connectorCode, 1);
  } catch (rejRes) {
    throw new Error(`Rate limit exceeded for ${connectorCode}`);
  }
}
```

---

## 8. Checklist de Implementação

- [ ] Configurar todas as variáveis de ambiente
- [ ] Implementar conector PNCP (público)
- [ ] Solicitar token ComprasNet Federal
- [ ] Solicitar API Key Compras RS
- [ ] Solicitar credenciais Compras Bahia
- [ ] Implementar conector Compras Amazonas (público)
- [ ] Solicitar API Key Compras RJ
- [ ] Implementar conector ComprasNet Goiás (público)
- [ ] Solicitar token Compras MG
- [ ] Implementar conector Banpará (público)
- [ ] Solicitar API Key PE Integrado
- [ ] Solicitar token E-Lic SC
- [ ] Configurar Redis para rate limiting
- [ ] Implementar sistema de retry
- [ ] Criar monitoramento de integrações
- [ ] Testar todos os conectores

---

**Documento gerado em**: 17/04/2026  
**Última atualização**: 17/04/2026  
**Versão**: 1.0
