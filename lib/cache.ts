
import type { WordBundle } from '../types';
import { env } from './env';

const MEM = new Map<string, { ts: number; bundle: WordBundle }>();
const TTL = env.cacheTtlMs;
const CACHE_PREFIX = 'uwe:';

export function getCached(term: string): WordBundle | undefined {
  const key = term.toLowerCase();
  
  // Check memory cache first
  const memHit = MEM.get(key);
  if (memHit && Date.now() - memHit.ts < TTL) {
    return memHit.bundle;
  }

  // Check session storage
  try {
    const raw = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(CACHE_PREFIX + key) : null;
    if (raw) {
      const hit = JSON.parse(raw);
      if (Date.now() - hit.ts < TTL) {
        MEM.set(key, hit); // warm up memory cache
        return hit.bundle;
      }
    }
  } catch (e) {
    console.error("Failed to read from cache", e);
  }
  
  return undefined;
}

export function setCached(term: string, bundle: WordBundle) {
  const key = term.toLowerCase();
  const record = { ts: Date.now(), bundle };
  MEM.set(key, record);
  try {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(CACHE_PREFIX + key, JSON.stringify(record));
    }
  } catch (e) {
    console.error("Failed to write to cache", e);
    // Handle potential full storage
  }
}

export function clearCache() {
  MEM.clear();
  if (typeof sessionStorage === 'undefined') return;
  Object.keys(sessionStorage).forEach(key => {
    if (key.startsWith(CACHE_PREFIX)) {
      sessionStorage.removeItem(key);
    }
  });
}
