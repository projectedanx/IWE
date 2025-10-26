
import React, { useMemo, useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import OpenAI from 'openai';
import type { WordBundle, SourceAttribution } from '../types';
import LoadingBadge from './LoadingBadge';
import { assertAiKey, env, aiSourceTag, hasAiKey } from '../lib/env';
import SourceBadge from './SourceBadge';

interface AnalystOutput {
  plan: string[];
  findings: string[];
  ambiguities: string[];
  next: string[];
}

const analystOpenAiSchema = {
  name: 'AnalystOutput',
  schema: {
    type: 'object',
    additionalProperties: false,
    required: ['plan', 'findings', 'ambiguities', 'next'],
    properties: {
      plan: { type: 'array', items: { type: 'string' } },
      findings: { type: 'array', items: { type: 'string' } },
      ambiguities: { type: 'array', items: { type: 'string' } },
      next: { type: 'array', items: { type: 'string' } },
    },
  },
} as const;

async function runAnalyst(bundle: WordBundle): Promise<AnalystOutput> {
  assertAiKey('Thinking Mode');

  const prompt = `You are the Analyst. Using ONLY the provided data for "${bundle.query}", perform a brief analysis. Do not invent facts. Cite sources by name (e.g., [dictionaryapi], [conceptnet]).
  Data: ${JSON.stringify({ defs: bundle.definitions.length, rels: bundle.relations.length, wiki_toc: bundle.wiki.toc.length })}
  `;

  const normalize = (payload: any): AnalystOutput => ({
    plan: Array.isArray(payload?.plan) ? payload.plan.map(String) : [],
    findings: Array.isArray(payload?.findings) ? payload.findings.map(String) : [],
    ambiguities: Array.isArray(payload?.ambiguities) ? payload.ambiguities.map(String) : [],
    next: Array.isArray(payload?.next) ? payload.next.map(String) : [],
  });

  if (env.aiProvider === 'openai') {
    const ai = new OpenAI({ apiKey: env.openAiApiKey!, dangerouslyAllowBrowser: true });
    const response = await ai.responses.create({
      model: env.openAiModel,
      input: prompt,
      response_format: { type: 'json_schema', json_schema: analystOpenAiSchema },
    });
    const payload = response.output_text;
    if (!payload) throw new Error('OpenAI returned an empty response.');
    return normalize(JSON.parse(payload));
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
                plan: { type: Type.ARRAY, items: { type: Type.STRING }, description: "5-step analysis plan." },
                findings: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Key findings with citations." },
                ambiguities: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Unclear points or conflicts." },
                next: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Suggested next queries." },
            },
        },
    },
  });

  return normalize(JSON.parse(response.text));
}


const ThinkingModePanel: React.FC<{ bundle: WordBundle }> = ({ bundle }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [output, setOutput] = useState<AnalystOutput | null>(null);
  const aiAttribution = useMemo<SourceAttribution>(() => ({ source: aiSourceTag, fetchedAt: new Date().toISOString() }), []);
  const missingKey = !hasAiKey();
  const providerKeyLabel = env.aiProvider === 'openai' ? 'VITE_OPENAI_API_KEY' : 'VITE_GEMINI_API_KEY';

  const handleRun = async () => {
    setLoading(true);
    setError(undefined);
    setOutput(null);
    try {
      const result = await runAnalyst(bundle);
      setOutput(result);
    } catch (e: any) {
      setError(e.message || "Failed to run analysis.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200/80 p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-800">Thinking Mode (Analyst)</h3>
              <SourceBadge attribution={aiAttribution} />
            </div>
            <div className="flex items-center gap-2">
              <LoadingBadge loading={loading} />
              <button onClick={handleRun} disabled={loading || missingKey} className="px-3 py-1.5 rounded-md bg-indigo-600 text-white text-sm disabled:opacity-50">
                  {loading ? 'Analyzing...' : 'Run Analysis'}
              </button>
            </div>
        </div>
        {missingKey && <p className="text-xs text-amber-600" role="status">Set <code className="font-mono">{providerKeyLabel}</code> to enable analyst insights.</p>}
        {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
        {output && (
            <div className="mt-4 grid sm:grid-cols-2 gap-4 text-sm">
                {[
                    { title: "Plan", items: output.plan, list: 'decimal' },
                    { title: "Findings", items: output.findings },
                    { title: "Ambiguities", items: output.ambiguities },
                    { title: "Next Steps", items: output.next }
                ].map(({ title, items, list }) => items.length > 0 && (
                    <div key={title}>
                        <h4 className="font-medium mb-1">{title}</h4>
                        <ul className={`pl-5 space-y-1 ${list === 'decimal' ? 'list-decimal' : 'list-disc'}`}>
                            {items.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                    </div>
                ))}
            </div>
        )}
    </div>
  );
};

export default ThinkingModePanel;
