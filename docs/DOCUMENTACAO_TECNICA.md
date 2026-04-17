# Documentação Técnica - SAAS Pregão

## Data: 17/04/2026
## Versão: 1.0

---

## 1. Visão Geral do Sistema

O **SAAS Pregão** é uma plataforma de inteligência para licitações públicas brasileiras. O sistema coleta, processa e disponibiliza editais de licitação de múltiplos portais governamentais.

### Tecnologias Principais
- **Frontend**: Next.js 14 + React 18 + TypeScript
- **Backend**: API Routes do Next.js
- **Banco de Dados**: PostgreSQL + Prisma ORM
- **Autenticação**: NextAuth.js com JWT
- **IA**: Google Gemini (via AI SDK)
- **Pagamentos**: MercadoPago
- **Deploy**: Vercel

---

## 2. Estrutura de Segurança Multi-Tenant

### 2.1 Implementações de Segurança

#### Rate Limiting por Plano
| Plano | Requisições/min | Tokens IA/min |
|-------|-----------------|---------------|
| FREE | 30 | 1.000 |
| PRO | 100 | 10.000 |
| INFINITY_PLUS | 300 | 50.000 |

#### Headers de Segurança nas Respostas
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1713379200
X-Token-Remaining: 9500
```

### 2.2 Arquivos de Segurança

| Arquivo | Função |
|---------|--------|
| `lib/auth.ts` | Autenticação centralizada, helpers de sessão |
| `lib/rate-limit.ts` | Rate limiting e controle de tokens |
| `lib/api-security.ts` | Wrapper `withAuth()` para APIs |

### 2.3 APIs Protegidas

Todas as APIs usam o wrapper `withAuth()`:
- `/api/biddings/*` - Licitações
- `/api/saved/*` - Licitações salvas
- `/api/analytics` - Analytics do usuário
- `/api/checkout` - Pagamentos
- `/api/ai/*` - APIs de IA
- `/api/admin/*` - APIs administrativas (requer ADMIN)
- `/api/internal/*` - APIs internas (requer ADMIN)

---

## 3. Dados Mockados vs. Reais

### 3.1 DADOS MOCKADOS (Precisam ser implementados)

| Componente/Página | Dados Mockados | Prioridade |
|-------------------|----------------|------------|
| `/dashboard/analise` | Todos os gráficos e estatísticas | 🔴 Alta |
| | `monthlyData` - disputas/ganhos mensais | 🔴 Alta |
| | `statusData` - distribuição por estágio | 🔴 Alta |
| | `portalData` - valor por portal | 🔴 Alta |
| | `stats` - disputas ativas, taxa vitória, valor jogo | 🔴 Alta |
| `components/layout/Header.tsx` | `mockNotifications` - notificações | 🔴 Alta |
| `components/ai/ChatModal.tsx` | `MOCK_RESPONSES` - respostas da IA | 🟡 Média |
| `/dashboard/juridico` | Módulo jurídico completo | 🟢 Baixa (Q2 2025) |

### 3.2 DADOS REAIS (Implementados)

| Componente/Página | Dados Reais | Fonte |
|-------------------|-------------|-------|
| `/dashboard/opportunities` | Lista de licitações | API `/api/biddings` |
| `/dashboard/bidding/[id]` | Detalhes da licitação | API `/api/biddings/[id]` |
| `/dashboard/negocios` | Kanban board | API `/api/saved` |
| `/admin/users` | Lista de usuários | API `/api/admin/users` |
| `/admin/portals` | Portais monitorados | API `/api/admin/portals` |
| `/admin/integrations` | Status das integrações | API `/api/internal/integrations/*` |
| Header/Perfil | Dados do usuário | Session JWT |

### 3.3 PARCIALMENTE REAL

| Componente | O que é Real | O que é Mock |
|------------|--------------|--------------|
| ChatModal IA | Conexão com API | Respostas pré-definidas por keyword |
| Kanban Stats | Contagem de cards | Valores monetários não calculados |

---

## 4. Integrações com Portais de Licitação

### 4.1 Conectores Implementados (14 fontes)

| Código | Portal | Status |
|--------|--------|--------|
| `pncp` | PNCP (Portal Nacional) | ✅ Ativo |
| `comprasnet` | ComprasNet | ✅ Ativo |
| `licitanet` | LicitaNet | ✅ Ativo |
| `bll` | BLL (Bolsa de Licitações) | ✅ Ativo |
| `compras-rs` | Compras RS | ✅ Ativo |
| `compras-bahia` | Compras Bahia | ✅ Ativo |
| `compras-amazonas` | Compras Amazonas | ✅ Ativo |
| `compras-rj` | Compras RJ | ✅ Ativo |
| `comprasnet-goias` | ComprasNet Goiás | ✅ Ativo |
| `compras-mg` | Compras MG | ✅ Ativo |
| `banpara` | Banpará | ✅ Ativo |
| `pe-integrado` | PE Integrado | ✅ Ativo |
| `e-lic-sc` | E-Lic SC | ✅ Ativo |
| `licitacoes-e` | Licitações-e | ✅ Ativo |

### 4.2 Arquitetura de Integração

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────────┐
│  Cron Job       │────▶│  Connectors  │────▶│  Engine         │
│  (Vercel Cron)  │     │  (14 sources)│     │  (Normalização) │
└─────────────────┘     └──────────────┘     └─────────────────┘
                                                        │
                       ┌────────────────────────────────┘
                       ▼
              ┌─────────────────┐
              │  PostgreSQL     │
              │  (Bidding table)│
              └─────────────────┘
```

### 4.3 Tabelas de Integração

- `IntegrationSource` - Configuração das fontes
- `IntegrationRun` - Execuções de sincronização
- `IntegrationCursor` - Controle de paginação
- `IntegrationRawEvent` - Eventos brutos recebidos
- `IntegrationDeadLetter` - Falhas de processamento

---

## 5. Schema do Banco de Dados

### 5.1 Tabelas Principais

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  password      String
  role          Role      @default(USER)
  status        Status    @default(ACTIVE)
  planType      PlanType  @default(FREE)
  planExpiresAt DateTime?
  cnpj          String?
  phone         String?
  company       String?
  savedBiddings SavedBidding[]
  alerts        Alert[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Portal {
  id        String     @id @default(cuid())
  name      String
  url       String
  type      PortalType
  isActive  Boolean    @default(true)
  biddings  Bidding[]
  createdAt DateTime   @default(now())
}

model Bidding {
  id             String        @id @default(cuid())
  externalId     String        @unique
  portalId       String
  portal         Portal        @relation(fields: [portalId], references: [id])
  title          String
  organ          String
  state          String?
  city           String?
  modality       String
  estimatedValue Decimal?      @db.Decimal(15, 2)
  openingDate    DateTime?
  status         BiddingStatus @default(OPEN)
  pdfUrl         String?
  rawText        String?       @db.Text
  aiSummary      String?       @db.Text
  items          BiddingItem[]
  savedBy        SavedBidding[]
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt
}

model SavedBidding {
  id        String      @id @default(cuid())
  userId    String
  biddingId String
  user      User        @relation(fields: [userId], references: [id])
  bidding   Bidding     @relation(fields: [biddingId], references: [id])
  stage     KanbanStage @default(LEAD)
  notes     String?     @db.Text
  alertAt   DateTime?
  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt

  @@unique([userId, biddingId])
}

model Alert {
  id        String     @id @default(cuid())
  userId    String
  user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  keywords  String[]
  states    String[]
  portals   PortalType[]
  minValue  Decimal?   @db.Decimal(15, 2)
  isActive  Boolean    @default(true)
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt

  @@index([userId])
}
```

### 5.2 Tabelas Faltantes (Sugestão)

```prisma
// Para notificações em tempo real
model Notification {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  title     String
  message   String
  type      NotificationType
  read      Boolean  @default(false)
  metadata  Json?
  createdAt DateTime @default(now())
  
  @@index([userId, read])
}

// Para analytics histórico
model AnalyticsSnapshot {
  id           String   @id @default(cuid())
  userId       String
  date         DateTime
  metricType   String
  value        Decimal
  metadata     Json?
  
  @@unique([userId, date, metricType])
}
```

---

## 6. APIs Disponíveis

### 6.1 APIs Públicas (Autenticadas)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/biddings` | Lista licitações com filtros |
| GET | `/api/biddings/[id]` | Detalhes de uma licitação |
| POST | `/api/biddings/[id]/save` | Salvar/remover licitação |
| GET | `/api/saved` | Lista licitações salvas do usuário |
| PATCH | `/api/saved/[id]` | Atualizar estágio/notas |
| DELETE | `/api/saved/[id]` | Remover licitação salva |
| GET | `/api/analytics` | Analytics do usuário |
| POST | `/api/checkout` | Criar preferência de pagamento |
| POST | `/api/ai/chat` | Chat com IA sobre edital |
| POST | `/api/ai/resume` | Resumir edital com IA |

### 6.2 APIs Administrativas

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/admin/users` | Listar usuários |
| POST | `/api/admin/users` | Criar usuário |
| PATCH | `/api/admin/users/[id]` | Atualizar usuário |
| GET | `/api/admin/portals` | Listar portais |
| POST | `/api/admin/portals` | Criar portal |
| PATCH | `/api/admin/portals/[id]` | Atualizar portal |
| GET | `/api/admin/metrics` | Métricas gerais do sistema |

### 6.3 APIs Internas (Integrações)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/internal/integrations/cron` | Executar sincronização (cron) |
| GET | `/api/internal/integrations/[source]/status` | Status do conector |
| POST | `/api/internal/integrations/[source]/sync` | Sincronizar manualmente |
| GET | `/api/internal/integrations/runs` | Listar execuções |
| POST | `/api/internal/integrations/runs/[runId]/reprocess` | Reprocessar falhas |
| GET | `/api/internal/integrations/dlq` | Listar dead letters |

### 6.4 Webhooks

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/webhooks/mercadopago` | Webhook de pagamentos |
| POST | `/api/n8n-receiver` | Receptor de dados (legado) |

---

## 7. Processo de Deploy

### 7.1 Deploy Automatizado

Script disponível em: `scripts/deploy.sh`

```bash
# Deploy completo (GitHub + Vercel)
./scripts/deploy.sh "mensagem do commit"

# Ou manualmente:
git add -A
git commit -m "mensagem"
git push origin main
vercel deploy --prod -y
```

### 7.2 URLs de Deploy

| Ambiente | URL |
|----------|-----|
| Produção | https://www.performancepregao.online |
| Preview | https://performance-pregao-*.vercel.app |

### 7.3 Configuração Vercel

O Vercel está configurado com:
- Deploy automático a cada push no GitHub
- Variáveis de ambiente configuradas
- Cron jobs para sincronização diária

---

## 8. Roadmap de Implementação

### 8.1 Prioridade Alta

1. **Módulo de Analytics** (`/dashboard/analise`)
   - [ ] Criar API `/api/analytics` real
   - [ ] Calcular estatísticas do usuário logado
   - [ ] Gráficos dinâmicos baseados em dados reais

2. **Sistema de Notificações**
   - [ ] Criar tabela `Notification` no banco
   - [ ] API para listar/marcar como lido
   - [ ] WebSocket ou polling para tempo real

### 8.2 Prioridade Média

3. **IA Chat Completo**
   - [ ] Remover `MOCK_RESPONSES` do frontend
   - [ ] Integrar completamente com API Gemini
   - [ ] Usar contexto real do edital

### 8.3 Prioridade Baixa

4. **Módulo Jurídico**
   - [ ] Aguardar desenvolvimento (Q2 2025)

---

## 9. Variáveis de Ambiente Necessárias

```env
# Banco de Dados
DATABASE_URL="postgresql://..."

# Autenticação
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="https://www.performancepregao.online"

# Google AI
GOOGLE_GENERATIVE_AI_API_KEY="..."

# MercadoPago
MP_ACCESS_TOKEN="..."
MP_WEBHOOK_SECRET="..."

# Integrações
CRON_SECRET="..."
N8N_WEBHOOK_SECRET="..."
```

---

## 10. Comandos Úteis

```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Lint
npm run lint

# Prisma
npx prisma generate
npx prisma db push
npx prisma studio

# Deploy
vercel deploy --prod -y
```

---

## 11. Contato e Suporte

- **Repositório**: https://github.com/performancedigital/performancepregao
- **Deploy**: Vercel
- **Banco**: PostgreSQL (Neon/Supabase)

---

*Documento gerado em: 17/04/2026*
*Última atualização: 17/04/2026*
