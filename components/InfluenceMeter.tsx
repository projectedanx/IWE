
import React, { useEffect, useMemo, useState } from 'react';
import type { WordBundle, InfluenceScore, SourceAttribution } from '../types';
import { computeInfluence } from '../services/influence';
import LoadingBadge from './LoadingBadge';
import SourceBadge from './SourceBadge';

interface InfluenceMeterProps {
  bundle: WordBundle;
}

const FactorBar: React.FC<{ label: string; value: number }> = ({ label, value }) => (
    <div>
        <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium text-gray-600">{label}</span>
            <span className="text-xs font-bold text-gray-800">{value.toFixed(2)}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${Math.abs(value) * 100}%` }}></div>
        </div>
    </div>
);

const InfluenceMeter: React.FC<InfluenceMeterProps> = ({ bundle }) => {
  const [score, setScore] = useState<InfluenceScore | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const aiAttribution = useMemo<SourceAttribution>(() => ({ source: 'gemini', fetchedAt: new Date().toISOString() }), []);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(undefined);
    setScore(null);

    computeInfluence(bundle)
      .then(s => { if (isMounted) setScore(s); })
      .catch(e => { if (isMounted) setError(String(e)); })
      .finally(() => { if (isMounted) setLoading(false); });

    return () => { isMounted = false; };
  }, [bundle.query]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200/80 p-4">
      <div className="flex items-center gap-2 flex-wrap">
        <h3 className="font-semibold text-gray-800">Word Influence Meter</h3>
        <SourceBadge attribution={aiAttribution} />
        <LoadingBadge loading={loading} />
      </div>
      {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
      
      {score ? (
        <div className="mt-3 grid md:grid-cols-2 gap-4">
            <div className="flex flex-col items-center justify-center">
                <div className="text-5xl font-bold text-gray-800">{score.score}</div>
                <div className="text-sm text-gray-500">0 (low) — 100 (high)</div>
            </div>
            <div className="space-y-3">
                <FactorBar label="Intensity" value={score.intensity} />
                <FactorBar label="Polarity" value={score.polarity} />
                <FactorBar label="Frequency" value={score.frequency} />
                <FactorBar label="Persuasiveness" value={score.persuasiveness} />
            </div>
        </div>
      ) : (!loading && !error && 
          <p className="mt-2 text-sm text-gray-500">No influence data available.</p>
      )}
    </div>
  );
};

export default InfluenceMeter;
