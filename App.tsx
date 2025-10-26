
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Book, Bot, SlidersHorizontal, Search } from 'lucide-react';
import type { WordBundle } from './types';
import { buildWordBundle, type BuildResult } from './services/orchestrator';
import { useDebounce } from './hooks/useDebounce';
import { getCached, setCached } from './lib/cache';
import { pushHistory } from './lib/history';
import WordTree from './components/WordTree';
import InfluenceMeter from './components/InfluenceMeter';
import MorphologyPanel from './components/MorphologyPanel';
import ConceptualBlender from './components/ConceptualBlender';
import ThinkingModePanel from './components/ThinkingMode';
import RecentSearches from './components/RecentSearches';
import ExportPanel from './components/ExportPanel';

type AppTabs = 'explore' | 'tools';

const App: React.FC = () => {
  const [term, setTerm] = useState('entropy');
  const [bundle, setBundle] = useState<WordBundle | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingSources, setLoadingSources] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<BuildResult['errors']>([]);
  const [activeTab, setActiveTab] = useState<AppTabs>('explore');
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);

  const debouncedTerm = useDebounce(term, 500);

  const fetchAll = useCallback(async (searchTerm: string) => {
    if (!searchTerm) return;
    setLoading(true);
    setErrors([]);

    const cached = getCached(searchTerm);
    if (cached) {
      setBundle(cached);
    } else {
      setBundle(null); // Clear old bundle while new one loads
    }
    
    // Simulate granular loading
    setLoadingSources({ dictionaryapi: true, 'datamuse-synonyms': true, conceptnet: true, wikipedia: true });

    const { bundle: newBundle, errors: fetchErrors } = await buildWordBundle(searchTerm);
    
    setBundle(newBundle);
    setErrors(fetchErrors);
    setCached(searchTerm, newBundle);
    await pushHistory(searchTerm);
    setHistoryRefreshKey(k => k + 1);

    setLoading(false);
    setLoadingSources({});
  }, []);

  useEffect(() => {
    if (debouncedTerm) {
      fetchAll(debouncedTerm);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedTerm]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAll(term);
  };
  
  const handlePick = (pickedTerm: string) => {
    setTerm(pickedTerm);
    // The debounced effect will pick this up
  };

  const TabButton = ({ id, label, icon: Icon }: { id: AppTabs; label: string; icon: React.ElementType }) => (
      <button 
        onClick={() => setActiveTab(id)}
        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === id ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-200'
        }`}
      >
        <Icon size={16} />
        {label}
      </button>
  );

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 font-sans">
      <header className="mb-6">
        <div className="flex items-center gap-2">
            <Book className="text-gray-800" />
            <h1 className="text-2xl font-bold text-gray-800">Unified Word Explorer</h1>
        </div>
        <p className="text-gray-600 mt-1">An AI-augmented lexicon dashboard.</p>
      </header>

      <form onSubmit={handleSubmit} className="relative mb-2">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Explore a word..."
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </form>
      <RecentSearches onPick={handlePick} refreshKey={historyRefreshKey} />
      
      <main className="mt-8">
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 border border-gray-200 rounded-lg p-1">
                <TabButton id="explore" label="Explorer" icon={Book} />
                <TabButton id="tools" label="AI Tools" icon={Bot} />
            </div>
            {bundle && <ExportPanel bundle={bundle} />}
        </div>
        
        {loading && !bundle && <p>Loading for "{term}"...</p>}
        {errors.length > 0 && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm">
            <p className="font-semibold">Some sources could not be loaded:</p>
            <ul className="list-disc pl-5 mt-1">
              {errors.map((e, i) => <li key={i}>{e.source}: {e.message}</li>)}
            </ul>
          </div>
        )}

        {bundle && (
            <div className="space-y-6">
                <div className={activeTab === 'explore' ? 'block' : 'hidden'}>
                  <div className="space-y-6">
                    <h2 className="text-3xl font-bold text-gray-900 break-all">{bundle.query}</h2>
                    <WordTree bundle={bundle} loading={loadingSources} />
                  </div>
                </div>
                <div className={activeTab === 'tools' ? 'block' : 'hidden'}>
                  <div className="space-y-6">
                    <InfluenceMeter bundle={bundle} />
                    <MorphologyPanel root={bundle} onPick={handlePick} />
                    <ThinkingModePanel bundle={bundle} />
                    <ConceptualBlender />
                  </div>
                </div>
            </div>
        )}

      </main>
    </div>
  );
};

export default App;
