import React from 'react';
import { useAdapterMetrics } from '../hooks/useAdapterMetrics';

const AdapterMetricsPanel: React.FC = () => {
  const metrics = useAdapterMetrics();

  if (metrics.length === 0) {
    return <p className="text-sm text-gray-500">No adapter activity recorded yet.</p>;
  }

  return (
    <div className="max-h-64 overflow-y-auto" aria-live="polite">
      <table className="w-full text-xs text-left">
        <thead className="text-gray-500 uppercase">
          <tr>
            <th className="py-1 pr-2">Source</th>
            <th className="py-1 pr-2">Status</th>
            <th className="py-1 pr-2">Duration</th>
            <th className="py-1">Detail</th>
          </tr>
        </thead>
        <tbody className="text-gray-700">
          {metrics.slice().reverse().map((metric) => (
            <tr key={metric.id} className="border-t border-gray-100">
              <td className="py-1 pr-2 font-medium">{metric.source}</td>
              <td className={`py-1 pr-2 ${metric.status === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
                {metric.status}
              </td>
              <td className="py-1 pr-2">{metric.durationMs.toFixed(1)} ms</td>
              <td className="py-1 text-gray-500">{metric.detail ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdapterMetricsPanel;
