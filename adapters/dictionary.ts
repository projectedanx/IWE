
import type { Definition, Phonetic, SourceAttribution } from '../types';

const API_URL = 'https://api.dictionaryapi.dev/api/v2/entries/en/';

interface DictionaryAPIResponse {
    word: string;
    phonetic: string;
    phonetics: { text?: string; audio?: string }[];
    meanings: {
        partOfSpeech: string;
        definitions: {
            definition: string;
            synonyms: string[];
            antonyms: string[];
            example?: string;
        }[];
    }[];
    origin?: string;
}

const attr: SourceAttribution = {
    source: 'dictionaryapi',
    fetchedAt: new Date().toISOString(),
};

export async function fetchDictionaryData(term: string): Promise<{ definitions: Definition[], phonetics: Phonetic[], etymology?: string }> {
    const response = await fetch(`${API_URL}${encodeURIComponent(term)}`);
    if (!response.ok) {
        if (response.status === 404) return { definitions: [], phonetics: [], etymology: undefined };
        throw new Error(`DictionaryAPI request failed: ${response.statusText}`);
    }

    const data: DictionaryAPIResponse[] = await response.json();
    if (!data || data.length === 0) {
        return { definitions: [], phonetics: [], etymology: undefined };
    }

    const entry = data[0];
    const definitions: Definition[] = [];
    entry.meanings.forEach(meaning => {
        meaning.definitions.forEach(def => {
            definitions.push({
                text: def.definition,
                partOfSpeech: meaning.partOfSpeech,
                examples: def.example ? [def.example] : [],
                attribution: attr,
            });
        });
    });

    const phonetics: Phonetic[] = entry.phonetics.map(p => ({ text: p.text, audio: p.audio }));
    const etymology = entry.origin;

    return { definitions, phonetics, etymology };
}
