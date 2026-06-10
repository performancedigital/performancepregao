export interface ConnectorConfig {
  sourceCode: string
  baseUrl: string
  metadata?: Record<string, unknown>
}

export interface FetchResult {
  records: unknown[]
  nextCursor: string | null
  total: number
}

export interface NormalizedBidding {
  externalId: string
  portalCode: string
  title: string
  organ: string
  state?: string | null
  city?: string | null
  modality: string
  estimatedValue?: number | null
  openingDate?: string | null
  closingDate?: string | null
  pdfUrl?: string | null
  status: 'OPEN' | 'CLOSED'
  rawPayload: unknown
}

export interface ConnectorHealth {
  ok: boolean
  latencyMs: number
  message?: string
}

export interface IConnector {
  readonly sourceCode: string
  fetchIncremental(
    cursor: string | null,
    windowStart: Date,
    windowEnd: Date
  ): Promise<FetchResult>
  normalize(record: unknown): NormalizedBidding | null
  validate(normalized: NormalizedBidding): boolean
  healthCheck(): Promise<ConnectorHealth>
}
