
import React, { useState } from 'react';
import { ChevronRight, Volume2 } from 'lucide-react';
import type { WordBundle } from '../types';
import LoadingBadge from './LoadingBadge';

interface SectionProps {
  id: string;
  title: string;
  count?: number;
  loading?: boolean;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const Section: React.FC<SectionProps> = ({ id, title, count, loading, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200/80">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full p-4 text-left"
      >
        <div className="flex items-center gap-2">
          <ChevronRight size={18} className={`transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
          <h3 className="font-semibold text-gray-800">{title}</h3>
          {count !== undefined && <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full">{count}</span>}
        </div>
        <LoadingBadge loading={loading ?? false} />
      </button>
      {isOpen && <div className="p-4 pt-0 pl-10 space-y-3 text-gray-700">{children}</div>}
    </div>
  );
};

interface WordTreeProps {
  bundle: WordBundle;
  loading: Record<string, boolean>;
}

const WordTree: React.FC<WordTreeProps> = ({ bundle, loading }) => {
  
  const playAudio = (url?: string) => {
    if (url) new Audio(url).play().catch(e => console.error("Audio playback failed", e));
  };
  
  const groupedRelations = bundle.relations.reduce((acc, r) => {
    const key = r.rel || 'unknown';
    if (!acc[key]) acc[key] = [];
    acc[key].push(r);
    return acc;
  }, {} as Record<string, typeof bundle.relations>);

  return (
    <div className="space-y-4">
      {bundle.phonetics && bundle.phonetics.length > 0 && (
        <div className="flex items-center gap-4 flex-wrap">
          {bundle.phonetics.filter(p => p.text).map((p, i) => (
            <div key={i} className="flex items-center gap-2 text-lg text-gray-600 font-mono">
              <span>{p.text}</span>
              {p.audio && <button onClick={() => playAudio(p.audio)} className="text-gray-400 hover:text-gray-700"><Volume2 size={18} /></button>}
            </div>
          ))}
        </div>
      )}

      {bundle.etymology && (
         <Section id="etymology" title="Etymology" loading={loading.dictionaryapi}>
          <p className="text-sm leading-relaxed">{bundle.etymology}</p>
        </Section>
      )}

      <Section id="definitions" title="Definitions" count={bundle.definitions.length} loading={loading.dictionaryapi}>
        {bundle.definitions.length > 0 ? bundle.definitions.map((def, i) => (
          <div key={i} className="text-sm">
            <p><span className="font-semibold px-2 py-0.5 rounded bg-gray-100 mr-2">{def.partOfSpeech || 'def'}</span>{def.text}</p>
            {def.examples && def.examples.length > 0 && (
              <p className="mt-1 pl-4 text-xs text-gray-500 italic">e.g., "{def.examples[0]}"</p>
            )}
          </div>
        )) : <p className="text-sm text-gray-500">No definitions found.</p>}
      </Section>

      <Section id="relations" title="Semantic Relations" count={bundle.relations.length} loading={loading.conceptnet || loading['datamuse-synonyms']}>
        {Object.keys(groupedRelations).length > 0 ? Object.entries(groupedRelations).map(([rel, items]) => (
          <div key={rel}>
            <h4 className="font-medium text-sm capitalize mb-1">{rel} ({items.length})</h4>
            <div className="flex flex-wrap gap-1.5">
              {items.slice(0, 15).map((item, i) => (
                <span key={i} className="text-xs px-2 py-1 bg-blue-50 text-blue-800 rounded">{item.target}</span>
              ))}
              {items.length > 15 && <span className="text-xs p-1 text-gray-400">...and {items.length - 15} more</span>}
            </div>
          </div>
        )) : <p className="text-sm text-gray-500">No semantic relations found.</p>}
      </Section>

      <Section id="wiki" title="Wikipedia Subtopics" count={bundle.wiki.toc.length} loading={loading.wikipedia}>
        {bundle.wiki.toc.length > 0 ? (
          <ul className="space-y-1">
            {bundle.wiki.toc.map(item => (
              <li key={item.index} className="text-sm" style={{ paddingLeft: `${(item.level -1) * 1}rem` }}>
                <a href={`https://en.wikipedia.org/wiki/${bundle.query}#${item.anchor}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  <span className="text-gray-400 mr-2">{item.index}</span>{item.title}
                </a>
              </li>
            ))}
          </ul>
        ) : <p className="text-sm text-gray-500">No Wikipedia article or table of contents found.</p>}
      </Section>
    </div>
  );
};

export default WordTree;
