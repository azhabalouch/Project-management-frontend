import { useState } from 'react';

export const useGet = (URL: string) => {
  const [responseData, setResponseData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const execute = async () => {
    setLoading(true);

    try {
      const res = await fetch(URL, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        credentials: 'include'
      });

      const data = await res.json();
      setResponseData(data);
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { execute, responseData, loading, error };
}