export const usePatch = (URL: string) => {
  const execute = async (data: any) => {
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

      if (contentType && contentType.includes('application/json')) {
        return await res.json();
      }

      return null;
    } catch (err: any) {
      console.error(err.message);
      return null;
    }
  };

  return { execute };
}