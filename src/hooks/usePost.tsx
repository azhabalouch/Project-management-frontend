import { useState } from "react";

export const usePost = (URL: string) => {
  const [responseData, setResponseData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

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

      setResponseData(await res.json());

    } catch (err: any) {
      setError(err.message);

    } finally {
      setLoading(false);
    }
  };

  return { execute, responseData, loading, error };
}