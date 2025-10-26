
import type { WikiTocItem } from '../types';
import { env } from '../lib/env';

const API_ENDPOINT = env.wikipediaApiUrl;

export async function fetchWikiToc(title: string): Promise<WikiTocItem[]> {
    const params = new URLSearchParams({
        action: 'parse',
        page: title,
        prop: 'sections',
        format: 'json',
        origin: '*',
    });

    const response = await fetch(`${API_ENDPOINT}?${params.toString()}`);
    if (!response.ok) throw new Error('Wikipedia TOC fetch failed');

    const json = await response.json();
    if (json.error) {
      // It's a valid response, but the page doesn't exist.
      return [];
    }
    const sections = json.parse?.sections ?? [];

    return sections.map((s: any): WikiTocItem => ({
        index: s.index,
        title: s.line,
        level: Number(s.level),
        anchor: s.anchor,
        attribution: {
            source: 'wikipedia',
            fetchedAt: new Date().toISOString(),
        },
    }));
}
