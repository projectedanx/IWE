import { describe, expect, it } from 'vitest';
import { buildWordBundle, type OrchestratorDependencies } from '../orchestrator';
import type { Definition, RelationEdge, WikiTocItem } from '../../types';

const fakeDefinition: Definition = {
  text: 'A sample definition',
  partOfSpeech: 'noun',
  attribution: { source: 'dictionaryapi', fetchedAt: new Date().toISOString() },
};

const fakeRelation: RelationEdge = {
  rel: 'synonym',
  target: 'test',
  attribution: { source: 'datamuse', fetchedAt: new Date().toISOString() },
};

const fakeWiki: WikiTocItem = {
  index: '1',
  title: 'Overview',
  level: 1,
  attribution: { source: 'wikipedia', fetchedAt: new Date().toISOString() },
};

describe('buildWordBundle', () => {
  it('aggregates results and reports errors when an adapter fails', async () => {
    const overrides: Partial<OrchestratorDependencies> = {
      dictionary: async () => ({ definitions: [fakeDefinition], phonetics: [], etymology: 'Greek origin' }),
      datamuseSynonyms: async () => [fakeRelation],
      datamuseAssociations: async () => [],
      conceptnet: async () => { throw new Error('ConceptNet offline'); },
      wikipedia: async () => [fakeWiki],
    };

    const { bundle, errors } = await buildWordBundle('resilience', overrides);

    expect(bundle.query).toBe('resilience');
    expect(bundle.definitions).toHaveLength(1);
    expect(bundle.relations).toHaveLength(1);
    expect(bundle.wiki.toc).toHaveLength(1);
    expect(errors).toEqual([{ source: 'conceptnet', message: 'ConceptNet offline' }]);
  });
});
