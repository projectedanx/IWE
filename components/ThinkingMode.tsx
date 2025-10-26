
import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import type { WordBundle } from '../types';
import LoadingBadge from './LoadingBadge';

interface AnalystOutput {
  plan: string[];
  findings: string[];
  ambiguities: string[];
  next: string[];
}

async function runAnalyst(bundle: WordBundle): Promise<AnalystOutput> {
  if (!process.env.API_KEY) throw new Error("API_KEY environment variable not set.");
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200/80 p-4">
        <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">Thinking Mode (Analyst)</h3>
            <button onClick={handleRun} disabled={loading} className="px-3 py-1.5 rounded-md bg-indigo-600 text-white text-sm disabled:opacity-50">
                {loading ? 'Analyzing...' : 'Run Analysis'}
            </button>
        </div>
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
