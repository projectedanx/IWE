
import React, { useEffect, useState, memo } from 'react';
import { getRecentHistory, type HistoryItem } from '../lib/history';

interface RecentSearchesProps {
  onPick: (term: string) => void;
  refreshKey: number;
}

const RecentSearches: React.FC<RecentSearchesProps> = ({ onPick, refreshKey }) => {
  const [items, setItems] = useState<HistoryItem[]>([]);

  useEffect(() => {
    getRecentHistory(10).then(setItems);
  }, [refreshKey]);

  if (items.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 pt-3">
      <span className="text-sm text-gray-500 self-center">Recent:</span>
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onPick(item.term)}
          className="text-sm px-3 py-1 rounded-full bg-gray-100 border border-gray-200 hover:bg-gray-200 transition-colors"
          title={`Search for "${item.term}" again`}
        >
          {item.term}
        </button>
      ))}
    </div>
  );
};

export default memo(RecentSearches);
