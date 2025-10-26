
import { fetchDatamuseSynonyms, fetchDatamuseAssociations } from '../adapters/datamuse';
import { fetchConceptEdges } from '../adapters/conceptnet';
import { fetchWikiToc } from '../adapters/wikipedia';
import { fetchDictionaryData } from '../adapters/dictionary';
import type { WordBundle } from '../types';
import { traceAdapter } from '../lib/telemetry';

export interface BuildResult {
  bundle: WordBundle;
  errors: { source: string; message: string }[];
}

async function safe<T,>(label: string, promise: Promise<T>): Promise<[T | undefined, { source: string; message: string } | undefined]> {
  try {
    const result = await promise;
    return [result, undefined];
  } catch (e: any) {
    return [undefined, { source: label, message: e?.message || String(e) }];
  }
}

type OrchestratorDependencies = {
  dictionary: typeof fetchDictionaryData;
  datamuseSynonyms: typeof fetchDatamuseSynonyms;
  datamuseAssociations: typeof fetchDatamuseAssociations;
  conceptnet: typeof fetchConceptEdges;
  wikipedia: typeof fetchWikiToc;
};

const defaultDeps: OrchestratorDependencies = {
  dictionary: fetchDictionaryData,
  datamuseSynonyms: fetchDatamuseSynonyms,
  datamuseAssociations: fetchDatamuseAssociations,
  conceptnet: fetchConceptEdges,
  wikipedia: fetchWikiToc,
};

export async function buildWordBundle(term: string, overrides: Partial<OrchestratorDependencies> = {}): Promise<BuildResult> {
  const deps = { ...defaultDeps, ...overrides };
  const errors: BuildResult['errors'] = [];

  const [
    [dictData, dictError],
    [synonyms, synError],
    [associations, assocError],
    [edges, edgeError],
    [toc, tocError]
  ] = await Promise.all([
    safe('dictionaryapi', traceAdapter('dictionaryapi', () => deps.dictionary(term))),
    safe('datamuse-synonyms', traceAdapter('datamuse-synonyms', () => deps.datamuseSynonyms(term))),
    safe('datamuse-associations', traceAdapter('datamuse-associations', () => deps.datamuseAssociations(term))),
    safe('conceptnet', traceAdapter('conceptnet', () => deps.conceptnet(term))),
    safe('wikipedia', traceAdapter('wikipedia', () => deps.wikipedia(term))),
  ]);

  // Collect errors
  [dictError, synError, assocError, edgeError, tocError].forEach(e => {
    if (e) errors.push(e);
  });

  const bundle: WordBundle = {
    query: term,
    definitions: dictData?.definitions ?? [],
    phonetics: dictData?.phonetics ?? [],
    etymology: dictData?.etymology,
    relations: [...(synonyms ?? []), ...(edges ?? [])],
    associations: associations ?? [],
    morphology: [], // To be populated by Morphology service
    wiki: { toc: toc ?? [] },
  };

  return { bundle, errors };
}

export type { OrchestratorDependencies };
