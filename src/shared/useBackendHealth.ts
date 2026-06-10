import { useEffect, useState } from 'react';
import { apiUrl } from './api';

export type BackendHealth = {
  ok: boolean;
  hasXaiKey: boolean;
  version?: string;
  loading: boolean;
  error?: string;
};

export function useBackendHealth(pollMs = 30000): BackendHealth {
  const [state, setState] = useState<BackendHealth>({
    ok: false,
    hasXaiKey: false,
    loading: true,
  });

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      try {
        const res = await fetch(apiUrl('/api/health'), { method: 'GET' });
        const data = await res.json().catch(() => ({}));
        if (!cancelled) {
          setState({
            ok: res.ok && data?.success,
            hasXaiKey: !!data?.hasXaiKey,
            version: data?.version,
            loading: false,
          });
        }
      } catch (e: any) {
        if (!cancelled) {
          setState({
            ok: false,
            hasXaiKey: false,
            loading: false,
            error: e?.message || 'unreachable',
          });
        }
      }
    };

    check();
    const id = setInterval(check, pollMs);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [pollMs]);

  return state;
}