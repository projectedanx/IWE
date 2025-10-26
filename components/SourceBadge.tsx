import React from 'react';
import type { SourceAttribution, SourceTag } from '../types';

const LABELS: Record<SourceTag, string> = {
  dictionaryapi: 'DictionaryAPI',
  datamuse: 'Datamuse',
  conceptnet: 'ConceptNet',
  wikipedia: 'Wikipedia',
  gemini: 'Gemini (AI)',
  rule: 'Heuristic Rule',
};

const TONE: Record<SourceTag, string> = {
  dictionaryapi: 'bg-slate-100 text-slate-700',
  datamuse: 'bg-emerald-100 text-emerald-700',
  conceptnet: 'bg-sky-100 text-sky-700',
  wikipedia: 'bg-indigo-100 text-indigo-700',
  gemini: 'bg-purple-100 text-purple-700',
  rule: 'bg-amber-100 text-amber-700',
};

const KIND: Record<SourceTag, 'sourced' | 'ai'> = {
  dictionaryapi: 'sourced',
  datamuse: 'sourced',
  conceptnet: 'sourced',
  wikipedia: 'sourced',
  gemini: 'ai',
  rule: 'ai',
};

interface SourceBadgeProps {
  attribution: SourceAttribution;
  className?: string;
}

const SourceBadge: React.FC<SourceBadgeProps> = ({ attribution, className = '' }) => {
  const label = LABELS[attribution.source] ?? attribution.source;
  const tone = TONE[attribution.source] ?? 'bg-gray-100 text-gray-700';
  const variant = KIND[attribution.source] ?? 'sourced';
  const descriptor = variant === 'ai' ? 'AI-derived insight' : 'Sourced fact';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.7rem] font-medium ${tone} ${className}`}
      aria-label={`${descriptor} from ${label}`}
    >
      <span aria-hidden="true">{variant === 'ai' ? '🤖' : '📚'}</span>
      {label}
    </span>
  );
};

export default SourceBadge;
