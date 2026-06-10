import { IConnector } from './core/connector.interface'
import { PncpConnector } from './connectors/pncp.connector'

// PNCP e a fonte unica e autoritativa (agrega federal + estadual + municipal,
// Lei 14.133). ComprasNet/dados-abertos foi removido: endpoint legado vazio e
// o moderno apenas duplicava os dados do PNCP.
const registry: Record<string, IConnector> = {
  pncp: new PncpConnector(),
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
