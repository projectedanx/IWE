
import { GoogleGenAI, Type } from "@google/genai";
import type { SourceAttribution } from '../types';
import { fetchConceptEdges } from '../adapters/conceptnet';
import { fetchDatamuseAssociations } from '../adapters/datamuse';
import { assertGeminiKey, env } from '../lib/env';

export interface BlendResult {
  blendedConcept: string;
  definition: string;
  properties: string[];
  applications: string[];
  metaphors: string[];
  riskNotes: string[];
  attribution: SourceAttribution[];
}

const PROHIBITED = /\b(nazi|terrorist|bomb|weapon|suicide|hate|genocide)\b/i;
const PROTECTED = /\b(race|ethnicity|religion|gender|sexuality)\b/i;

function safetyCheck(a: string, b: string) {
  const combined = `${a} ${b}`;
  if (PROHIBITED.test(combined)) throw new Error("Blender safety check failed: Prohibited topic detected.");
  if (PROTECTED.test(combined)) throw new Error("Blender safety check failed: Attempt to blend protected categories.");
}

async function getBlendEvidence(term: string) {
    const [conceptnet, associations] = await Promise.all([
        fetchConceptEdges(term),
        fetchDatamuseAssociations(term),
    ]);
    return {
        concept: term,
        conceptnet: conceptnet.slice(0, 15).map(e => ({ rel: e.rel, target: e.target })),
        associations: associations.slice(0, 15).map(a => ({ term: a.term })),
    };
}

export async function blendConcepts(conceptA: string, conceptB: string): Promise<BlendResult> {
    safetyCheck(conceptA, conceptB);

    assertGeminiKey('Conceptual Blender');
    const ai = new GoogleGenAI({ apiKey: env.geminiApiKey! });
    
    const [evidenceA, evidenceB] = await Promise.all([getBlendEvidence(conceptA), getBlendEvidence(conceptB)]);

    const prompt = `
    Blend the concepts "${conceptA}" and "${conceptB}".
    
    Data for ${conceptA}:
    - ConceptNet Relations: ${JSON.stringify(evidenceA.conceptnet)}
    - Associations: ${JSON.stringify(evidenceA.associations)}

    Data for ${conceptB}:
    - ConceptNet Relations: ${JSON.stringify(evidenceB.conceptnet)}
    - Associations: ${JSON.stringify(evidenceB.associations)}
    
    Generate a creative, blended concept.
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    blendedConcept: { type: Type.STRING },
                    definition: { type: Type.STRING },
                    properties: { type: Type.ARRAY, items: { type: Type.STRING } },
                    applications: { type: Type.ARRAY, items: { type: Type.STRING } },
                    metaphors: { type: Type.ARRAY, items: { type: Type.STRING } },
                    riskNotes: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
            },
        },
    });

    const result = JSON.parse(response.text);
    
    return {
        ...result,
        attribution: [{ source: 'gemini', fetchedAt: new Date().toISOString() }],
    };
}
