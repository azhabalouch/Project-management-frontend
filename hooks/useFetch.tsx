import { useState, useEffect } from "react";

export const useFetch = (url:string) => {
	const [response, setResponse] = useState<any>(null);

	useEffect(() => {
		try {
			fetch(url)
			.then((res) => res.json())
			.then((resData) => setResponse(resData))
		} catch(error) {
			console.log(error);
		}
	}, [url]);

	return [response];
}