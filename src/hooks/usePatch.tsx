import { useState } from 'react';

export const usePatch = <TResponse = unknown, TPayload = unknown>(URL: string) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const execute = async (data: TPayload): Promise<TResponse | true | null> => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch(URL, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include'
      });

      const contentType = res.headers.get('content-type');
      const parsedData = contentType && contentType.includes('application/json')
        ? await res.json()
        : null;

      if (!res.ok) {
        const errorMessage =
          parsedData && typeof parsedData === 'object' && 'message' in parsedData && typeof parsedData.message === 'string'
            ? parsedData.message
            : `Request failed with status ${res.status}`;
        throw new Error(errorMessage);
      }

      return (parsedData as TResponse) ?? true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unexpected error';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { execute, loading, error };
}