import { useCallback, useRef, useState } from 'react';
import { ApiError, toApiError } from '@/shared/api/client';
import { queryCache } from '@/shared/api/queryCache';

interface MutationOptions {
  invalidates?: string[];
}

export function useApiMutation<TArgs, TResult>(
  mutationFn: (args: TArgs) => Promise<TResult>,
  options: MutationOptions = {}
) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const fnRef = useRef(mutationFn);
  const invalidateKey = (options.invalidates ?? []).join('|');

  const mutate = useCallback(
    async (args: TArgs): Promise<TResult | undefined> => {
      setIsPending(true);
      setError(null);
      try {
        const result = await fnRef.current(args);
        if (invalidateKey) queryCache.invalidate(...invalidateKey.split('|'));
        return result;
      } catch (e) {
        setError(toApiError(e));
        return undefined;
      } finally {
        setIsPending(false);
      }
    },
    [invalidateKey]
  );

  const reset = useCallback(() => setError(null), []);

  return { mutate, isPending, error, reset };
}
