import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react';
import { queryCache } from '@/shared/api/queryCache';

export function useApiQuery<T>(key: string | null, fetcher: () => Promise<T>) {
  const fetcherRef = useRef(fetcher);

  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  const subscribe = useCallback(
    (listener: () => void) => (key ? queryCache.subscribe(key, listener) : () => {}),
    [key]
  );
  const getSnapshot = useCallback(() => queryCache.get<T>(key ?? ''), [key]);
  const entry = useSyncExternalStore(subscribe, getSnapshot);

  useEffect(() => {
    if (!key || entry.status === 'loading') return;
    if (entry.stale) {
      queryCache.fetch(key, () => fetcherRef.current()).catch(() => undefined);
    }
  }, [key, entry]);

  const refetch = useCallback(() => {
    if (!key) return;
    queryCache.fetch(key, () => fetcherRef.current()).catch(() => undefined);
  }, [key]);

  return {
    data: key ? entry.data : undefined,
    error: key ? entry.error : null,
    isLoading: Boolean(key) && entry.data === undefined && entry.status !== 'error',
    isFetching: entry.status === 'loading',
    refetch,
  };
}
