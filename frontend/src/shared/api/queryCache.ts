import { ApiError, toApiError } from './client';

export interface QueryEntry<T = unknown> {
  data?: T;
  error: ApiError | null;
  status: 'idle' | 'loading' | 'success' | 'error';
  stale: boolean;
}

type Listener = () => void;

const entries = new Map<string, QueryEntry>();
const listeners = new Map<string, Set<Listener>>();
const inflight = new Map<string, Promise<unknown>>();

const IDLE: QueryEntry = { error: null, status: 'idle', stale: true };

function setEntry(key: string, entry: QueryEntry) {
  entries.set(key, entry);
  listeners.get(key)?.forEach((listener) => listener());
}

const matches = (key: string, prefix: string) =>
  key === prefix || key.startsWith(`${prefix}:`) || key.startsWith(`${prefix}?`);

export const queryCache = {
  get<T>(key: string): QueryEntry<T> {
    return (entries.get(key) ?? IDLE) as QueryEntry<T>;
  },

  subscribe(key: string, listener: Listener) {
    if (!listeners.has(key)) listeners.set(key, new Set());
    listeners.get(key)!.add(listener);
    return () => {
      listeners.get(key)?.delete(listener);
    };
  },

  fetch<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    const running = inflight.get(key);
    if (running) return running as Promise<T>;

    setEntry(key, { ...queryCache.get<T>(key), status: 'loading', stale: false });

    const promise = fetcher()
      .then((data) => {
        setEntry(key, { data, error: null, status: 'success', stale: false });
        return data;
      })
      .catch((error: unknown) => {
        setEntry(key, { ...queryCache.get<T>(key), error: toApiError(error), status: 'error' });
        throw error;
      })
      .finally(() => inflight.delete(key));

    inflight.set(key, promise);
    return promise;
  },

  invalidate(...prefixes: string[]) {
    for (const [key, entry] of entries) {
      if (prefixes.some((prefix) => matches(key, prefix))) {
        setEntry(key, { ...entry, stale: true });
      }
    }
  },

  clear() {
    entries.clear();
    inflight.clear();
    listeners.forEach((set) => set.forEach((listener) => listener()));
  },
};
