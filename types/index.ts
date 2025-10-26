
export type SourceTag = 'dictionaryapi' | 'datamuse' | 'conceptnet' | 'wikipedia' | 'gemini' | 'openai' | 'rule';

export interface SourceAttribution {
  source: SourceTag;
  url?: string;
  fetchedAt: string;
}

export interface Phonetic {
  text?: string;
  audio?: string;
}

export interface Definition {
  text: string;
  partOfSpeech?: string;
  examples?: string[];
  attribution: SourceAttribution;
}

export interface RelationEdge {
  rel: 'synonym' | 'antonym' | 'hypernym' | 'hyponym' | 'meronym' | 'holonym' | 'isa' | 'usedfor' | 'relatedto' | 'atlocation' | 'derivedfrom' | string;
  target: string;
  weight?: number;
  attribution: SourceAttribution;
}

export interface MorphVariant {
  form: string;
  kind: 'prefix' | 'suffix' | 'inflection';
  rule?: string;
  attribution: SourceAttribution;
}

export interface WikiTocItem {
  index: string;
  title: string;
  level: number;
  anchor?: string;
  attribution: SourceAttribution;
}

export interface WordBundle {
  query: string;
  phonetics?: Phonetic[];
  etymology?: string;
  definitions: Definition[];
  relations: RelationEdge[];
  associations: { term: string; score?: number; attribution: SourceAttribution }[];
  morphology: MorphVariant[];
  wiki: { summary?: string; toc: WikiTocItem[] };
  analytics?: { influence?: InfluenceScore; };
}

export interface InfluenceScore {
  score: number; // 0–100
  intensity: number; // emphasis/morph intensity 0–1
  polarity: number;  // sentiment -1..1
  frequency: number; // normalized usage 0–1
  persuasiveness: number; // rhetorical heft 0–1
  rationale: string[]; // human-readable factors
}
