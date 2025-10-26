
import React, { useMemo, useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import type { WordBundle, SourceAttribution } from '../types';
import LoadingBadge from './LoadingBadge';
import { assertGeminiKey, env } from '../lib/env';
import SourceBadge from './SourceBadge';

interface AnalystOutput {
  plan: string[];
  findings: string[];
  ambiguities: string[];
  next: string[];
}

async function runAnalyst(bundle: WordBundle): Promise<AnalystOutput> {
  assertGeminiKey('Thinking Mode');
  const ai = new GoogleGenAI({ apiKey: env.geminiApiKey! });
  
  const prompt = `You are the Analyst. Using ONLY the provided data for "${bundle.query}", perform a brief analysis. Do not invent facts. Cite sources by name (e.g., [dictionaryapi], [conceptnet]).
  Data: ${JSON.stringify({ defs: bundle.definitions.length, rels: bundle.relations.length, wiki_toc: bundle.wiki.toc.length })}
  `;

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

  return JSON.parse(response.text);
}


const ThinkingModePanel: React.FC<{ bundle: WordBundle }> = ({ bundle }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [output, setOutput] = useState<AnalystOutput | null>(null);
  const aiAttribution = useMemo<SourceAttribution>(() => ({ source: 'gemini', fetchedAt: new Date().toISOString() }), []);
  const missingKey = !env.geminiApiKey;

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
        {missingKey && <p className="text-xs text-amber-600" role="status">Set <code className="font-mono">VITE_GEMINI_API_KEY</code> to enable analyst insights.</p>}
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
