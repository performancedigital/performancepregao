import { IConnector } from './core/connector.interface'
import { PncpConnector } from './connectors/pncp.connector'
import { ComprasnetConnector } from './connectors/comprasnet.connector'
import { LicitanetConnector } from './connectors/licitanet.connector'
import { ComprasRsConnector } from './connectors/compras-rs.connector'
import { ComprasBahiaConnector } from './connectors/compras-bahia.connector'
import { ComprasAmazonasConnector } from './connectors/compras-amazonas.connector'
import { ComprasRjConnector } from './connectors/compras-rj.connector'
import { ComprasnetGoiasConnector } from './connectors/comprasnet-goias.connector'
import { ComprasMgConnector } from './connectors/compras-mg.connector'
import { BanparaConnector } from './connectors/banpara.connector'
import { PeIntegradoConnector } from './connectors/pe-integrado.connector'
import { ELicScConnector } from './connectors/e-lic-sc.connector'
import { LicitacoesEConnector } from './connectors/licitacoes-e.connector'

const registry: Record<string, IConnector> = {
  pncp: new PncpConnector(),
  comprasnet: new ComprasnetConnector(),
  // licitanet: desativado - stub não implementado
  // bll: desativado - não possui API pública (requer scraping com VPS)
  'compras-rs': new ComprasRsConnector(),
  'compras-bahia': new ComprasBahiaConnector(),
  'compras-amazonas': new ComprasAmazonasConnector(),
  'compras-rj': new ComprasRjConnector(),
  'comprasnet-goias': new ComprasnetGoiasConnector(),
  'compras-mg': new ComprasMgConnector(),
  banpara: new BanparaConnector(),
  'pe-integrado': new PeIntegradoConnector(),
  'e-lic-sc': new ELicScConnector(),
  'licitacoes-e': new LicitacoesEConnector(),
}

export function getConnector(sourceCode: string): IConnector {
  const connector = registry[sourceCode]
  if (!connector) {
    throw new Error(`Conector nao encontrado para source: ${sourceCode}`)
  }
  return connector
}

export function getAllConnectors(): Record<string, IConnector> {
  return registry
}

export function listSourceCodes(): string[] {
  return Object.keys(registry)
}
