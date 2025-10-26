
import type { MorphVariant, SourceAttribution } from '../types';

const DATAMUSE_API = "https://api.datamuse.com/words";
const DICTIONARY_API = (w: string) => `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(w)}`;

export type ValidationSource = "datamuse" | "dictionaryapi";
const now = () => new Date().toISOString();

const PREFIXES = ["un", "re", "pre", "post", "anti", "pro", "hyper", "super", "over", "under", "non", "mis", "dis", "inter", "sub", "micro", "macro"];
const SUFFIXES = ["ness", "less", "ful", "able", "ible", "ment", "tion", "sion", "al", "er", "or", "ist", "ism", "ize", "ify", "ly", "ish", "ous", "ive"];
const INFLECTIONS = ["s", "es", "ed", "ing", "er", "est"] as const;

async function validateWithAPI(word: string): Promise<boolean> {
  try {
    const dictResponse = await fetch(DICTIONARY_API(word), { method: 'HEAD' });
    if (dictResponse.ok) return true;
    
    const dmResponse = await fetch(`${DATAMUSE_API}?sp=${encodeURIComponent(word)}&max=1`);
    if(dmResponse.ok) {
      const json = await dmResponse.json();
      return Array.isArray(json) && json.length > 0 && json[0].word?.toLowerCase() === word.toLowerCase();
    }
    return false;
  } catch {
    return false;
  }
}

const attr = (source: SourceAttribution['source']): SourceAttribution => ({ source, fetchedAt: now() });

export interface MorphologyOptions { max?: number; validate?: boolean; }

export async function generateMorphology(root: string, options: MorphologyOptions = {}): Promise<MorphVariant[]> {
  const { max = 30, validate = false } = options;
  const variants = new Map<string, MorphVariant>();

  // Prefixes
  for (const p of PREFIXES) {
    const form = p + root;
    variants.set(form, { form, kind: 'prefix', rule: `+${p}`, attribution: attr('rule') });
  }

  // Suffixes
  for (const s of SUFFIXES) {
    let form = root + s;
    if (root.endsWith('e') && ['able', 'ible', 'ing', 'ize'].includes(s)) {
      form = root.slice(0, -1) + s;
    }
    variants.set(form, { form, kind: 'suffix', rule: `+${s}`, attribution: attr('rule') });
  }

  // Inflections
  for (const i of INFLECTIONS) {
     let form = root + i;
     if (root.endsWith('e') && ['ed', 'er', 'est'].includes(i)) form = root + i.substring(1);
     if (root.endsWith('y') && ['es', 'ed'].includes(i)) form = root.slice(0, -1) + 'i' + i;
     variants.set(form, { form, kind: 'inflection', rule: `+${i}`, attribution: attr('rule') });
  }

  const uniqueVariants = Array.from(variants.values());
  if (!validate) {
    return uniqueVariants.slice(0, max);
  }

  const validationResults = await Promise.allSettled(
    uniqueVariants.map(v => validateWithAPI(v.form).then(ok => ({...v, ok})))
  );

  const validated: MorphVariant[] = [];
  for (const result of validationResults) {
    if (result.status === 'fulfilled' && result.value.ok) {
      validated.push({ ...result.value, attribution: attr('datamuse') }); // Assume validation source
    }
  }

  return validated.slice(0, max);
}
