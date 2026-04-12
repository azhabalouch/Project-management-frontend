export const usePatch = (URL: string) => {
  const execute = async (data: unknown) => {
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

      return parsedData ?? true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unexpected error';
      console.error(message);
      return null;
    }
  };

  return { execute };
}