
import type { MorphVariant, SourceAttribution } from '../types';
import { env } from '../lib/env';

const DATAMUSE_API = env.datamuseApiUrl;
const DICTIONARY_API = (w: string) => {
  const base = env.dictionaryApiUrl.endsWith('/') ? env.dictionaryApiUrl : `${env.dictionaryApiUrl}/`;
  return `${base}${encodeURIComponent(w)}`;
};

export type ValidationSource = "datamuse" | "dictionaryapi";
const now = () => new Date().toISOString();

const PREFIXES = [
  "un", "re", "pre", "post", "anti", "pro", "hyper", "super", "over", "under",
  "non", "mis", "dis", "inter", "sub", "micro", "macro"
];
const SUFFIXES = [
  "ness", "less", "ful", "able", "ible", "ment", "tion", "sion", "al",
  "er", "or", "ist", "ism", "ize", "ify", "ly", "ish", "ous", "ive"
];
const INFLECTIONS = ["s", "es", "ed", "ing", "er", "est"] as const;

async function validateWithDictionary(word: string): Promise<boolean> {
  try {
    const response = await fetch(DICTIONARY_API(word));
    if (!response.ok) return false;
    const json = await response.json();
    return Array.isArray(json) && json.length > 0 && typeof json[0]?.word === 'string';
  } catch {
    return false;
  }
}

async function validateWithDatamuse(word: string): Promise<boolean> {
  try {
    const response = await fetch(`${DATAMUSE_API}?sp=${encodeURIComponent(word)}&max=1`);
    if (!response.ok) return false;
    const json = await response.json();
    return Array.isArray(json) && json.length > 0 && json[0].word?.toLowerCase() === word.toLowerCase();
  } catch {
    return false;
  }
}

async function validateVariant(word: string): Promise<{ ok: boolean; source?: ValidationSource }> {
  if (await validateWithDictionary(word)) {
    return { ok: true, source: "dictionaryapi" };
  }
  if (await validateWithDatamuse(word)) {
    return { ok: true, source: "datamuse" };
  }
  return { ok: false };
}

const attr = (source: SourceAttribution['source']): SourceAttribution => ({ source, fetchedAt: now() });

export interface MorphologyOptions { max?: number; validate?: boolean; }

function normalizeSuffix(root: string, suffix: string): string {
  if (suffix === "s" && /[^aeiou]y$/i.test(root)) {
    return `${root.slice(0, -1)}ies`;
  }
  if (suffix === "es") {
    if (/([sxz]|[cs]h)$/i.test(root)) {
      return `${root}es`;
    }
    if (/[^aeiou]y$/i.test(root)) {
      return `${root.slice(0, -1)}ies`;
    }
  }
  if (suffix === "ed") {
    if (/e$/i.test(root)) {
      return `${root}d`;
    }
    if (/[^aeiou]y$/i.test(root)) {
      return `${root.slice(0, -1)}ied`;
    }
  }
  if (suffix === "ing") {
    if (/ie$/i.test(root)) {
      return `${root.slice(0, -2)}ying`;
    }
    if (/e$/i.test(root) && !/ee$/i.test(root)) {
      return `${root.slice(0, -1)}ing`;
    }
  }
  if (suffix === "er" || suffix === "est") {
    if (/[^aeiou]y$/i.test(root)) {
      return `${root.slice(0, -1)}i${suffix}`;
    }
    if (/e$/i.test(root)) {
      return `${root}${suffix === 'er' ? 'r' : 'st'}`;
    }
  }
  return `${root}${suffix}`;
}

export async function generateMorphology(root: string, options: MorphologyOptions = {}): Promise<MorphVariant[]> {
  const { max = 30, validate = false } = options;
  const variants = new Map<string, MorphVariant>();

  for (const prefix of PREFIXES) {
    const form = `${prefix}${root}`;
    variants.set(form, { form, kind: 'prefix', rule: `+${prefix}`, attribution: attr('rule') });
  }

  for (const suffix of SUFFIXES) {
    const form = normalizeSuffix(root, suffix);
    variants.set(form, { form, kind: 'suffix', rule: `+${suffix}`, attribution: attr('rule') });
  }

  for (const ending of INFLECTIONS) {
    const form = normalizeSuffix(root, ending);
    variants.set(form, { form, kind: 'inflection', rule: `+${ending}`, attribution: attr('rule') });
  }

  const uniqueVariants = Array.from(variants.values());
  if (!validate) {
    return uniqueVariants.slice(0, max);
  }

  const candidates = uniqueVariants.slice(0, Math.max(max * 2, max));

  const validationResults = await Promise.allSettled(
    candidates.map(async (variant) => {
      const result = await validateVariant(variant.form);
      return { variant, result };
    })
  );

  const validated: MorphVariant[] = [];
  for (const item of validationResults) {
    if (item.status === 'fulfilled' && item.value.result.ok && item.value.result.source) {
      const { variant, result } = item.value;
      validated.push({ ...variant, attribution: attr(result.source) });
    }
  }

  return validated.slice(0, max);
}
