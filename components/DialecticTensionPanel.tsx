import React, { useState } from 'react';
import { generateDialecticTensions, type DialecticResult } from '../services/dialectic';
import SourceBadge from './SourceBadge';
import { env, hasAiKey } from '../lib/env';
import type { WordBundle } from '../types';

interface Props {
  bundle: WordBundle;
}

const DialecticTensionPanel: React.FC<Props> = ({ bundle }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [result, setResult] = useState<DialecticResult | null>(null);

  const missingKey = !hasAiKey();
  const providerKeyLabel = env.aiProvider === 'openai' ? 'VITE_OPENAI_API_KEY' : 'VITE_GEMINI_API_KEY';

  const handleGenerate = async () => {
    if (missingKey) return;
    setLoading(true);
    setError(undefined);
    try {
      const res = await generateDialecticTensions(bundle.query);
      setResult(res);
    } catch (e: any) {
      setError(e.message || 'An unknown error occurred while generating tensions.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200/80 p-4 space-y-4">
      <div className="flex items-center gap-2">
        <h3 className="font-semibold text-gray-800">Dialectical Tension Map</h3>
        {result?.attribution?.map((attr, idx) => (
          <SourceBadge key={idx} attribution={attr} />
        ))}
      </div>

      <div className="text-sm text-gray-600">
        <p>Explore the inherent contradictions and polysemy of <strong>"{bundle.query}"</strong> across domains.</p>
      </div>

      {!result && (
        <button
          onClick={handleGenerate}
          disabled={loading || missingKey}
          className="px-4 py-2 rounded-md bg-black text-white disabled:opacity-50 w-full sm:w-auto"
        >
          {loading ? 'Generating Dialectical Tensions...' : 'Surface Epistemic Tensions'}
        </button>
      )}

      {missingKey && (
        <p className="text-xs text-amber-600">
          Provide <code className="font-mono">{providerKeyLabel}</code> to surface tensions.
        </p>
      )}

      {error && (
        <div className="text-sm text-red-600 p-2 bg-red-50 rounded-md">
          {error}
        </div>
      )}

      {result && result.tensions.length > 0 && (
        <div className="space-y-6 mt-4">
          {result.tensions.map((tension, i) => (
            <div key={i} className="border-l-4 border-black pl-4 space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-700 text-xs uppercase tracking-wider">Thesis</h4>
                  <p className="text-gray-900">{tension.thesis}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 text-xs uppercase tracking-wider">Antithesis</h4>
                  <p className="text-gray-900">{tension.antithesis}</p>
                </div>
              </div>
              <div className="mt-3 p-3 bg-gray-50 rounded text-sm space-y-2 font-mono text-gray-800">
                <p>{tension.synthesis_gap}</p>
                <p>{tension.golden_scar}</p>
                <p className="text-amber-700">{tension.uncertainty}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DialecticTensionPanel;
