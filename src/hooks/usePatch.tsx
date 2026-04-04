export const usePatch = (URL: string) => {
  const execute = async (data: any) => {
    try {
      await fetch(URL, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include'
      });
    } catch (err: any) {
      console.error(err.message);
    }
  };

  return { execute };
}