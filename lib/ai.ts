import { createGoogleGenerativeAI } from '@ai-sdk/google'

/**
 * Chave da API Gemini. Aceita tanto GEMINI_API_KEY (documentada no .env.example)
 * quanto GOOGLE_GENERATIVE_AI_API_KEY (nome padrao do @ai-sdk/google).
 */
export const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || ''

export const isAiConfigured = (): boolean => GEMINI_API_KEY.length > 0

/** Modelo padrao de chat/resumo. */
export const AI_MODEL = 'gemini-1.5-flash'

/** Provider Gemini ja configurado com a chave resolvida. */
export const googleAI = createGoogleGenerativeAI({ apiKey: GEMINI_API_KEY })
