# Correção de Portais - Documentação

## Problema
O deploy foi realizado mas apenas o PNCP estava funcionando. Os outros portais (ComprasNet e municipais) estavam desativados no banco de dados.

## Causa Root
Os portais foram desativados no `IntegrationSource` e havia portais antigos (BLL, MUNICIPAL) ativos no banco.

## Solução
1. Ativar todos os portais funcionais no `IntegrationSource`
2. Desativar portais não implementados (BLL, MUNICIPAL)
3. Fazer novo deploy

## Portais que devem estar ATIVOS
- pncp
- comprasnet
- compras-rs
- compras-bahia
- compras-amazonas
- compras-rj
- comprasnet-goias
- compras-mg
- banpara
- pe-integrado
- e-lic-sc
- licitacoes-e

## Portais que devem estar DESATIVADOS
- bll (requer scraping com VPS)
- licitanet (stub não implementado)
- MUNICIPAL (não existe implementação)

## Status da Correção
✅ **COMPLETADO** - 17/04/2026
- Script SQL executado no banco de dados
- 12 portais ativados
- 2 portais desativados (BLL, Licitanet)
- Deploy realizado com sucesso
