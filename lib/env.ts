import { z } from 'zod';

const rawEnv: Record<string, unknown> = (() => {
  try {
    if (typeof import.meta !== 'undefined' && typeof import.meta.env !== 'undefined') {
      return import.meta.env as Record<string, unknown>;
    }
  } catch (error) {
    // ignore access errors when import.meta is unavailable
  }
  return process.env as Record<string, unknown>;
})();

const envSchema = z.object({
  VITE_GEMINI_API_KEY: z.string().trim().min(1).optional(),
  GEMINI_API_KEY: z.string().trim().min(1).optional(),
  VITE_DICTIONARY_API_URL: z.string().trim().url().optional(),
  VITE_DATAMUSE_API_URL: z.string().trim().url().optional(),
  VITE_CONCEPTNET_API_URL: z.string().trim().url().optional(),
  VITE_WIKIPEDIA_API_URL: z.string().trim().url().optional(),
  VITE_CACHE_TTL_MINUTES: z.coerce.number().int().positive().optional(),
});

const parsed = envSchema.safeParse(rawEnv);

if (!parsed.success) {
  console.error('Environment configuration validation failed', parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment configuration. Please fix the environment variables.');
}

const data = parsed.data;

export const env = {
  geminiApiKey: data.VITE_GEMINI_API_KEY ?? data.GEMINI_API_KEY ?? undefined,
  dictionaryApiUrl: data.VITE_DICTIONARY_API_URL ?? 'https://api.dictionaryapi.dev/api/v2/entries/en/',
  datamuseApiUrl: data.VITE_DATAMUSE_API_URL ?? 'https://api.datamuse.com/words',
  conceptNetApiUrl: data.VITE_CONCEPTNET_API_URL ?? 'https://api.conceptnet.io',
  wikipediaApiUrl: data.VITE_WIKIPEDIA_API_URL ?? 'https://en.wikipedia.org/w/api.php',
  cacheTtlMs: (data.VITE_CACHE_TTL_MINUTES ?? 30) * 60 * 1000,
} as const;

export type EnvShape = typeof env;

export function assertGeminiKey(feature: string) {
  if (!env.geminiApiKey) {
    throw new Error(`${feature} requires VITE_GEMINI_API_KEY to be configured.`);
  }
}

