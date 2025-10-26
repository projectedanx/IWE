
import { fetchDatamuseSynonyms, fetchDatamuseAssociations } from '../adapters/datamuse';
import { fetchConceptEdges } from '../adapters/conceptnet';
import { fetchWikiToc } from '../adapters/wikipedia';
import { fetchDictionaryData } from '../adapters/dictionary';
import type { WordBundle } from '../types';

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

export async function buildWordBundle(term: string): Promise<BuildResult> {
  const errors: BuildResult['errors'] = [];

  const [
    [dictData, dictError],
    [synonyms, synError],
    [associations, assocError],
    [edges, edgeError],
    [toc, tocError]
  ] = await Promise.all([
    safe('dictionaryapi', fetchDictionaryData(term)),
    safe('datamuse-synonyms', fetchDatamuseSynonyms(term)),
    safe('datamuse-associations', fetchDatamuseAssociations(term)),
    safe('conceptnet', fetchConceptEdges(term)),
    safe('wikipedia', fetchWikiToc(term)),
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
