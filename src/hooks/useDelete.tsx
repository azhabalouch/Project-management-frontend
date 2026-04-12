export const useDelete = (URL: string) => {
  const remove = async (data?: unknown) => {
    const requestInit: RequestInit = {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    };

    if (data !== undefined) {
      requestInit.body = JSON.stringify(data);
    }

    try {
      const res = await fetch(URL, requestInit);

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

  return { remove };
}