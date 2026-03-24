import { useState } from "react";

export const usePost = (url: string, bearerToken: string) => {
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);

  const execute = async (data: any) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${bearerToken}`
        },
        body: JSON.stringify(data)
      });

      const resData = await res.json();
      setResponse(resData);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return { execute, response, loading, error };
}