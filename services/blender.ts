
import { GoogleGenAI, Type } from "@google/genai";
import OpenAI from 'openai';
import type { SourceAttribution } from '../types';
import { fetchConceptEdges } from '../adapters/conceptnet';
import { fetchDatamuseAssociations } from '../adapters/datamuse';
import { assertAiKey, env, aiSourceTag } from '../lib/env';

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

    assertAiKey('Conceptual Blender');

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

    const normalize = (payload: any) => ({
        blendedConcept: typeof payload?.blendedConcept === 'string' ? payload.blendedConcept : `${conceptA} × ${conceptB}`,
        definition: typeof payload?.definition === 'string' ? payload.definition : '',
        properties: Array.isArray(payload?.properties) ? payload.properties.map(String) : [],
        applications: Array.isArray(payload?.applications) ? payload.applications.map(String) : [],
        metaphors: Array.isArray(payload?.metaphors) ? payload.metaphors.map(String) : [],
        riskNotes: Array.isArray(payload?.riskNotes) ? payload.riskNotes.map(String) : [],
    });

    if (env.aiProvider === 'openai') {
        const ai = new OpenAI({ apiKey: env.openAiApiKey!, dangerouslyAllowBrowser: true });
        const response = await ai.responses.create({
            model: env.openAiModel,
            input: prompt,
            response_format: {
                type: 'json_schema',
                json_schema: {
                    name: 'ConceptBlend',
                    schema: {
                        type: 'object',
                        additionalProperties: false,
                        required: ['blendedConcept', 'definition', 'properties', 'applications', 'metaphors', 'riskNotes'],
                        properties: {
                            blendedConcept: { type: 'string' },
                            definition: { type: 'string' },
                            properties: { type: 'array', items: { type: 'string' } },
                            applications: { type: 'array', items: { type: 'string' } },
                            metaphors: { type: 'array', items: { type: 'string' } },
                            riskNotes: { type: 'array', items: { type: 'string' } },
                        },
                    },
                },
            },
        });
        const payload = response.output_text;
        if (!payload) throw new Error('OpenAI returned an empty response.');
        const result = normalize(JSON.parse(payload));
        return {
            ...result,
            attribution: [{ source: aiSourceTag, fetchedAt: new Date().toISOString() }],
        };
    }

    const ai = new GoogleGenAI({ apiKey: env.geminiApiKey! });
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

    const result = normalize(JSON.parse(response.text));

    return {
        ...result,
        attribution: [{ source: aiSourceTag, fetchedAt: new Date().toISOString() }],
    };
}
