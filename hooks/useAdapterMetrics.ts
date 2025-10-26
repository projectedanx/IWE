import { useSyncExternalStore } from 'react';
import { getAdapterMetrics, subscribeAdapterMetrics, type AdapterMetric } from '../lib/telemetry';

export function useAdapterMetrics(): AdapterMetric[] {
  return useSyncExternalStore(subscribeAdapterMetrics, getAdapterMetrics, getAdapterMetrics);
}
