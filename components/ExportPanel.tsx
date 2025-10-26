
import React from 'react';
import { Download } from 'lucide-react';
import type { WordBundle } from '../types';
import { toJSON, toMarkdown } from '../lib/export';

interface ExportPanelProps {
  bundle: WordBundle;
}

const ExportPanel: React.FC<ExportPanelProps> = ({ bundle }) => {
  
  const handleExport = (format: 'json' | 'md') => {
    const content = format === 'json' ? toJSON(bundle) : toMarkdown(bundle);
    const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${bundle.query}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex items-center gap-2">
      <button 
        onClick={() => handleExport('json')}
        className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors"
      >
        <Download size={14} />
        JSON
      </button>
      <button 
        onClick={() => handleExport('md')}
        className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors"
      >
        <Download size={14} />
        Markdown
      </button>
    </div>
  );
};

export default ExportPanel;
