
import React, { useEffect, useState } from 'react';
import type { WordBundle, MorphVariant } from '../types';
import { generateMorphology } from '../services/morphology';
import LoadingBadge from './LoadingBadge';
import SourceBadge from './SourceBadge';

interface MorphologyPanelProps {
  root: WordBundle;
  onPick: (term: string) => void;
}

const MorphologyPanel: React.FC<MorphologyPanelProps> = ({ root, onPick }) => {
  const [variants, setVariants] = useState<MorphVariant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(undefined);
    setVariants([]);

    generateMorphology(root.query, { max: 30, validate: true })
      .then(v => { if (isMounted) setVariants(v); })
      .catch(e => { if (isMounted) setError(String(e)); })
      .finally(() => { if (isMounted) setLoading(false); });

    return () => { isMounted = false; };
  }, [root.query]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200/80 p-4">
      <div className="flex items-center">
        <h3 className="font-semibold text-gray-800">Morphology Explorer</h3>
        <LoadingBadge loading={loading} className="ml-2" />
      </div>
      {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
      
      {variants.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-3">
          {variants.map((v, i) => (
            <div key={i} className="flex flex-col items-start gap-1">
              <button
                onClick={() => onPick(v.form)}
                className="text-sm px-2 py-1 rounded bg-gray-100 border hover:bg-gray-200 transition-colors flex items-center gap-1.5"
              >
                <span className={`text-xs font-mono px-1 rounded ${v.kind === 'prefix' ? 'bg-green-100 text-green-800' : v.kind === 'suffix' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800'}`}>{v.kind}</span>
                {v.form}
              </button>
              <SourceBadge attribution={v.attribution} />
            </div>
          ))}
        </div>
      ) : (!loading && !error &&
          <p className="mt-2 text-sm text-gray-500">No validated variants found.</p>
      )}
    </div>
  );
};

export default MorphologyPanel;
