import { useState, useEffect } from 'react';
import React from 'react';

const average = arr =>
  arr?.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

export default function App() {
  const [query, setQuery] = useState('');
  const [movies, setMovies] = useState([]);
  const [watched, setWatched] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    async function fetchMovies() {
      try {
        setLoading(true);
        const res = await fetch(
          `https://www.omdbapi.com/?i=tt3896198&apikey=12dc7873&s=${query}`,
          { signal: controller.signal },
        );

        if (!res.ok) throw new Error('Something Went Wrong');
        const data = await res.json();
        if (data.Response === 'False') throw new Error('Movies Not Found');

        setMovies(data.Search);
        setError('');
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    }

    if (query.length < 3) {
      setMovies([]);
      setError('');
      return;
    }

    fetchMovies();

    return () => controller.abort();
  }, [query]);

  function handleSelectedMovies(id) {
    setSelectedId(selectedId => (selectedId === id ? null : id));
  }

  return (
    <>
      <NavBar query={query} setQuery={setQuery} movies={movies} />
      <Main>
        <Box>
          <MovieLists
            movies={movies}
            loading={loading}
            error={error}
            onSelectedId={handleSelectedMovies}
          />
        </Box>
        <Box>
          {selectedId ? (
            <>
              <button className="btn-back" onClick={() => setSelectedId(null)}>
                &larr;
              </button>
              {selectedId}
            </>
          ) : (
            <MovieWatched watched={watched} />
          )}
        </Box>
      </Main>
    </>
  );
}

function NavBar({ query, setQuery, movies }) {
  return (
    <nav className="nav-bar">
      <div className="logo">
        <span role="img">🍿</span>
        <h1>usePopcorn</h1>
      </div>
      <input
        className="search"
        type="text"
        placeholder="Search movies..."
        value={query}
        onChange={e => setQuery(e.target.value)}
      />
      <p className="num-results">
        Found <strong>{movies?.length}</strong> results
      </p>
    </nav>
  );
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function Box({ children }) {
  return <div className="box">{children}</div>;
}

function MovieLists({ loading, error, movies, onSelectedId }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      {loading && <p className="loader">Loading...</p>}
      {error && <ErrorMessage message={error} />}
      {!loading && !error && (
        <>
          <Button onClick={() => setIsOpen(open => !open)}>
            {isOpen ? '-' : '+'}
          </Button>

          {isOpen && (
            <ul className="list list-movies">
              {movies?.map(movie => (
                <Movie
                  movie={movie}
                  key={movie.imdbID}
                  onSelectedId={onSelectedId}
                />
              ))}
            </ul>
          )}
        </>
      )}
    </>
  );
}

function Movie({ movie, onSelectedId }) {
  return (
    <li className="list-movies" onClick={() => onSelectedId(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function MovieWatched({ watched }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      <Button onClick={() => setIsOpen(open => !open)}>
        {isOpen ? '-' : '+'}
      </Button>

      <MoviesSummary watched={watched} />

      {isOpen && (
        <ul className="list">
          {watched?.map(movie => (
            <li key={movie.imdbID}>
              <img src={movie.Poster} alt={`${movie.Title} poster`} />
              <h3>{movie.Title}</h3>
              <div>
                <p>
                  <span>⭐️</span>
                  <span>{movie.imdbRating}</span>
                </p>
                <p>
                  <span>🌟</span>
                  <span>{movie.userRating}</span>
                </p>
                <p>
                  <span>⏳</span>
                  <span>{movie.runtime} min</span>
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function MoviesSummary({ watched }) {
  const avgImdbRating = average(watched?.map(movie => movie.imdbRating));
  const avgUserRating = average(watched?.map(movie => movie.userRating));
  const avgRuntime = average(watched?.map(movie => movie.runtime));

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched?.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}

function ErrorMessage({ message }) {
  return <p className="error">{message}</p>;
}

function Button({ onClick, children }) {
  return (
    <button className="btn-toggle" onClick={onClick}>
      {children}
    </button>
  );
}
