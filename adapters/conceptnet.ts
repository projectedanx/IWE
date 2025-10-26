
import type { RelationEdge } from '../types';
import { env } from '../lib/env';

const BASE_URL = env.conceptNetApiUrl;

function normalizeTerm(term: string): string {
    return term.trim().toLowerCase().replace(/\s+/g, '_');
}

export async function fetchConceptEdges(term: string, lang = 'en'): Promise<RelationEdge[]> {
    const normalizedTerm = normalizeTerm(term);
    const node = `/c/${lang}/${encodeURIComponent(normalizedTerm)}`;
    const response = await fetch(`${BASE_URL}/query?node=${node}&limit=200`);
    if (!response.ok) throw new Error('ConceptNet fetch failed');

    const { edges = [] } = await response.json();

    return edges.map((edge: any): RelationEdge => ({
        rel: edge.rel['@id'].split('/').pop().toLowerCase(),
        target: (edge.start['@id'] === node ? edge.end['@id'] : edge.start['@id']).split('/').pop().replace(/_/g, ' '),
        weight: edge.weight,
        attribution: {
            source: 'conceptnet',
            url: edge['@id'],
            fetchedAt: new Date().toISOString(),
        },
    }));
}
