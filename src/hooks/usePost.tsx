import { useState } from 'react';

export const usePost = (URL: string) => {
  const [responseData, setResponseData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const execute = async (data: any) => {
    setLoading(true);

    try {
      const res = await fetch(URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include'
      });

      const json = await res.json();
      setResponseData(json);
      return json;

    } catch (err: any) {
      setError(err.message);
      return null;

    } finally {
      setLoading(false);
    }
  };

  return { execute, responseData, loading, error };
}