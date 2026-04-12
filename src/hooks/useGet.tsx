import { useState } from 'react';

export const useGet = <T,>(URL: string) => {
  const [responseData, setResponseData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const execute = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch(URL, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        credentials: 'include'
      });

      const contentType = res.headers.get('content-type');
      const data = contentType && contentType.includes('application/json')
        ? await res.json()
        : null;

      if (!res.ok) {
        const errorMessage =
          data && typeof data === 'object' && 'message' in data && typeof data.message === 'string'
            ? data.message
            : `Request failed with status ${res.status}`;
        throw new Error(errorMessage);
      }

      setResponseData(data);
      return data;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unexpected error';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { execute, responseData, loading, error };
}