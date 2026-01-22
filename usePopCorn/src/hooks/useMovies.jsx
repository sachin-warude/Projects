import { useEffect, useState } from 'react';

export function useMovies(query, callBack) {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    async function fetchMovies() {
      try {
        setError('');
        setIsLoading(true);
        const res = await fetch(
          `https://www.omdbapi.com/?apikey=12dc7873&s=${query}`,
          { signal: controller.signal },
        );

        if (!res.ok) throw new Error('⛔ Something Went Wrong');
        const data = await res.json();
        if (data.Response === 'False') throw new Error('Movies Not Found');

        setMovies(data.Search);
        setError('');
      } catch (err) {
        if (err.name !== 'AbortError') setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    if (query.length < 3) {
      setMovies([]);
      setError('');
      callBack?.(null);
      return;
    }

    fetchMovies();

    return () => controller.abort();
  }, [query]);

  return { movies, isLoading, error };
}
