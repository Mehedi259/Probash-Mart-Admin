/**
 * useApi — Generic data-fetching hook for the admin dashboard.
 * Handles loading, error, and refetch states.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useApi<T>(
  fetchFn: () => Promise<T>,
  deps: any[] = []
): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchFn()
      .then((result) => {
        setData(result);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Something went wrong');
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}

/**
 * useMutation — Generic mutation hook (create, update, delete).
 */
interface UseMutationResult<T> {
  mutate: (data?: any) => Promise<T>;
  loading: boolean;
  error: string | null;
}

export function useMutation<T>(
  mutationFn: (data?: any) => Promise<T>
): UseMutationResult<T> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(
    async (data?: any) => {
      setLoading(true);
      setError(null);
      try {
        const result = await mutationFn(data);
        setLoading(false);
        return result;
      } catch (err: any) {
        setError(err.message || 'Something went wrong');
        setLoading(false);
        throw err;
      }
    },
    [mutationFn]
  );

  return { mutate, loading, error };
}
