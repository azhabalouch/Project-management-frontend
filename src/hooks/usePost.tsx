import { useState } from 'react';

export const usePost = <TResponse = unknown, TPayload = unknown>(URL: string) => {
  const [responseData, setResponseData] = useState<TResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const execute = async (data: TPayload): Promise<TResponse | true | null> => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch(URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include'
      });

      const contentType = res.headers.get('content-type');
      const json = contentType && contentType.includes('application/json')
        ? await res.json()
        : null;

      if (!res.ok) {
        const errorMessage =
          json && typeof json === 'object' && 'message' in json && typeof json.message === 'string'
            ? json.message
            : `Request failed with status ${res.status}`;
        throw new Error(errorMessage);
      }

      setResponseData(json as TResponse);
      return (json as TResponse) ?? true;

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unexpected error';
      setError(message);
      return null;

    } finally {
      setLoading(false);
    }
  };

  return { execute, responseData, loading, error };
}