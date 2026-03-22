import { useState, useEffect } from "react";

export const usePost = (url:string, payload:any, bearerToken:string) => {
  const [response, setResponse] = useState<any>(null);

  useEffect(() => {
    try {
      fetch(url, {
        method: 'POST',
        body: JSON.stringify({
          payload
        }),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${bearerToken}` 
        }
      })
      .then((res) => res.json())
      .then((resData) => setResponse(resData))
    } catch(error) {
      console.log(error);
    }
  }, [url]);

  return [response];
}