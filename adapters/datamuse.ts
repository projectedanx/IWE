
import type { RelationEdge, SourceAttribution } from '../types';
import { env } from '../lib/env';

const BASE_URL = env.datamuseApiUrl;

const attr = (): SourceAttribution => ({
    source: 'datamuse',
    fetchedAt: new Date().toISOString(),
});

interface DatamuseWord {
    word: string;
    score: number;
}

export async function fetchDatamuseSynonyms(term: string): Promise<RelationEdge[]> {
    const response = await fetch(`${BASE_URL}?ml=${encodeURIComponent(term)}&md=f`);
    if (!response.ok) throw new Error('Datamuse synonyms fetch failed');
    const json: DatamuseWord[] = await response.json();
    return json.map(item => ({
        rel: 'synonym',
        target: item.word,
        weight: item.score,
        attribution: attr(),
    }));
}

export async function fetchDatamuseAssociations(term: string): Promise<{ term: string; score: number; attribution: SourceAttribution }[]> {
    const response = await fetch(`${BASE_URL}?rel_trg=${encodeURIComponent(term)}&md=f`);
    if (!response.ok) throw new Error('Datamuse associations fetch failed');
    const json: DatamuseWord[] = await response.json();
    return json.map(item => ({
        term: item.word,
        score: item.score,
        attribution: attr(),
    }));
}
