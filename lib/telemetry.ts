export type AdapterStatus = 'success' | 'error';

export interface AdapterMetric {
  id: string;
  source: string;
  status: AdapterStatus;
  durationMs: number;
  timestamp: string;
  detail?: string;
}

const MAX_METRICS = 40;
let buffer: AdapterMetric[] = [];
const subscribers = new Set<() => void>();

function emit() {
  subscribers.forEach((listener) => {
    try {
      listener();
    } catch (error) {
      console.error('Telemetry subscriber failed', error);
    }
  });
}

export function recordAdapterMetric(metric: Omit<AdapterMetric, 'id'>) {
  const entry: AdapterMetric = { ...metric, id: `${metric.source}-${Date.now()}-${Math.random().toString(16).slice(2)}` };
  buffer = [...buffer.slice(-(MAX_METRICS - 1)), entry];

  if (typeof console !== 'undefined') {
    const label = metric.status === 'success' ? '✅' : '⚠️';
    console.info(`[adapter:${metric.source}] ${label} ${metric.durationMs.toFixed(1)}ms`, metric.detail ?? '');
  }

  emit();
}

export function subscribeAdapterMetrics(listener: () => void) {
  subscribers.add(listener);
  return () => {
    subscribers.delete(listener);
  };
}

export function getAdapterMetrics() {
  return buffer;
}

export async function traceAdapter<T>(source: string, fn: () => Promise<T>): Promise<T> {
  const start = typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now();
  try {
    const result = await fn();
    const end = typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now();
    recordAdapterMetric({
      source,
      status: 'success',
      durationMs: end - start,
      timestamp: new Date().toISOString(),
    });
    return result;
  } catch (error: any) {
    const end = typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now();
    recordAdapterMetric({
      source,
      status: 'error',
      durationMs: end - start,
      timestamp: new Date().toISOString(),
      detail: error?.message ?? String(error),
    });
    throw error;
  }
}
