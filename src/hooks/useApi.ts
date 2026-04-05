/**
 * API layer placeholder — point `API_BASE` at your Express server or Firebase callable.
 */
import { useCallback, useState } from 'react';

const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

type ApiState<T> = {
  data: T | null;
  loading: boolean;
  error: Error | null;
};

/** Generic GET; extend with POST helpers as endpoints are added. */
export function useApiGet<T>(path: string) {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const res = await fetch(`${API_BASE}${path}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as T;
      setState({ data, loading: false, error: null });
      return data;
    } catch (e) {
      const error = e instanceof Error ? e : new Error('Request failed');
      setState({ data: null, loading: false, error });
      throw error;
    }
  }, [path]);

  return { ...state, refetch: execute };
}

export { API_BASE };
