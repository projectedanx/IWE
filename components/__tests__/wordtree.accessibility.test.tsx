import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { axe } from 'jest-axe';
import WordTree from '../WordTree';
import type { WordBundle } from '../../types';
import { afterEach, describe, expect, it } from 'vitest';

afterEach(cleanup);

const bundle: WordBundle = {
  query: 'resilience',
  phonetics: [],
  etymology: 'From Latin resilire.',
  definitions: [
    {
      text: 'The capacity to recover quickly from difficulties.',
      partOfSpeech: 'noun',
      attribution: { source: 'dictionaryapi', fetchedAt: new Date().toISOString() },
    },
  ],
  relations: [
    {
      rel: 'synonym',
      target: 'grit',
      attribution: { source: 'datamuse', fetchedAt: new Date().toISOString() },
    },
  ],
  associations: [],
  morphology: [],
  wiki: {
    toc: [
      { index: '1', title: 'Overview', level: 1, attribution: { source: 'wikipedia', fetchedAt: new Date().toISOString() } },
    ],
  },
};

describe('WordTree accessibility', () => {
  it('has no obvious accessibility violations', async () => {
    const { container } = render(<WordTree bundle={bundle} loading={{}} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
