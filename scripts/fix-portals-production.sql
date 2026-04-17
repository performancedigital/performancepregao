-- Correção de Portais - Script SQL para Produção
-- Executar este script no banco de dados de produção

-- 1. Desativar BLL e Licitanet no IntegrationSource
UPDATE "IntegrationSource" SET "isEnabled" = false WHERE code IN ('bll', 'licitanet');

-- 2. Ativar todos os portais funcionais
UPDATE "IntegrationSource" SET "isEnabled" = true WHERE code IN (
  'pncp',
  'comprasnet',
  'compras-rs',
  'compras-bahia',
  'compras-amazonas',
  'compras-rj',
  'comprasnet-goias',
  'compras-mg',
  'banpara',
  'pe-integrado',
  'e-lic-sc',
  'licitacoes-e'
);

-- 3. Desativar portais BLL e MUNICIPAL da tabela Portal
UPDATE "Portal" SET "isActive" = false WHERE type IN ('BLL', 'MUNICIPAL');

-- 4. Verificar status após correção
SELECT 'IntegrationSource Ativos' as "Check";
SELECT code, name, "isEnabled" FROM "IntegrationSource" WHERE "isEnabled" = true ORDER BY code;

SELECT 'Portais Ativos' as "Check";
SELECT name, type, "isActive" FROM "Portal" WHERE "isActive" = true ORDER BY name;
