
import React, { useState } from 'react';
import { blendConcepts, type BlendResult } from '../services/blender';

const ConceptualBlender: React.FC = () => {
  const [conceptA, setConceptA] = useState('philosophy');
  const [conceptB, setConceptB] = useState('gardening');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [result, setResult] = useState<BlendResult | null>(null);

  const handleBlend = async () => {
    setLoading(true);
    setError(undefined);
    setResult(null);
    try {
      const res = await blendConcepts(conceptA, conceptB);
      setResult(res);
    } catch (e: any) {
      setError(e.message || 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200/80 p-4 space-y-4">
      <h3 className="font-semibold text-gray-800">Conceptual Blender</h3>
      <div className="grid sm:grid-cols-2 gap-3">
        <input
          value={conceptA}
          onChange={e => setConceptA(e.target.value)}
          placeholder="Concept A"
          className="border rounded-md p-2 w-full"
        />
        <input
          value={conceptB}
          onChange={e => setConceptB(e.target.value)}
          placeholder="Concept B"
          className="border rounded-md p-2 w-full"
        />
      </div>
      <button
        onClick={handleBlend}
        disabled={loading || !conceptA || !conceptB}
        className="px-4 py-2 rounded-md bg-black text-white disabled:opacity-50 w-full sm:w-auto"
      >
        {loading ? 'Blending...' : 'Blend Concepts'}
      </button>

      {error && <div className="text-sm text-red-600 p-2 bg-red-50 rounded-md">{error}</div>}
      
      {result && (
        <div className="space-y-3 text-sm pt-4 border-t">
          <h4 className="text-xl font-bold text-gray-800">{result.blendedConcept}</h4>
          <p className="text-gray-600">{result.definition}</p>
          
          {['properties', 'applications', 'metaphors', 'riskNotes'].map(key => {
            const items = result[key as keyof BlendResult] as string[];
            if (!items || items.length === 0) return null;
            return (
              <div key={key}>
                <h5 className="font-semibold capitalize mt-2">{key.replace('Notes', ' Notes')}</h5>
                <ul className="list-disc pl-5 text-gray-600 space-y-1">
                  {items.map((item: string, i: number) => <li key={i}>{item}</li>)}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ConceptualBlender;
