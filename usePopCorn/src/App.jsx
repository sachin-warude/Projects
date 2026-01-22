import { useState, useEffect } from 'react';
import React from 'react';
import StarRating from './StarRating';
import { Loader } from './components/Loader';
import { Button } from './components/Button';
import { ErrorMessage } from './components/ErrorMessage';
import { useMovies } from './hooks/useMovies';
import { useLocalStorage } from './hooks/useLocalStorage';

const average = arr =>
  arr?.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

export default function App() {
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [watched, setWatched] = useLocalStorage([], 'watched');
  const { movies, error, isLoading } = useMovies(query);

  function handleSelectedMovies(id) {
    setSelectedId(selectedId => (selectedId === id ? null : id));
  }

  function handleAddWatchededMovies(movie) {
    setWatched(watched => [...watched, movie]);
  }

  function handleDeleteWatchedMovie(id) {
    setWatched(watched => watched.filter(watch => watch.imdbID !== id));
  }

  return (
    <>
      <NavBar query={query} setQuery={setQuery} movies={movies} />
      <Main>
        <Box>
          <MovieLists
            movies={movies}
            isLoading={isLoading}
            error={error}
            onSelectedId={handleSelectedMovies}
          />
        </Box>
        <Box>
          {selectedId ? (
            <MovieDetails
              selectedId={selectedId}
              onAddWatchedMovies={handleAddWatchededMovies}
              setSelectedId={setSelectedId}
              watched={watched}
            />
          ) : (
            <MovieWatched
              watched={watched}
              onDeleteWathedMovie={handleDeleteWatchedMovie}
            />
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

function MovieLists({ isLoading, error, movies, onSelectedId }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      {isLoading && <Loader />}
      {error && <ErrorMessage message={error} />}
      {!isLoading && !error && (
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

function MovieDetails({
  selectedId,
  onAddWatchedMovies,
  setSelectedId,
  watched,
}) {
  const [movie, setMovie] = useState({});
  const [isisLoading, setIsisLoading] = useState(false);
  const [error, setError] = useState('');
  const [userRating, setUserRating] = useState('');
  let isWatched = watched?.find(
    watch => watch.imdbID === selectedId,
  )?.userRating;
  const {
    Actors: actors,
    Director: director,
    Genre: genre,
    Poster: poster,
    Title: title,
    Year: year,
    imdbRating,
    Released: released,
    Runtime: runtime,
    Plot: plot,
  } = movie;
  useEffect(() => {
    async function fetchMovieDetails() {
      try {
        setIsisLoading(true);
        const res = await fetch(
          `https://www.omdbapi.com/?apikey=12dc7873&i=${selectedId}`,
        );
        if (!res.ok) throw new Error('Something went wrong');
        const data = await res.json();
        setMovie(data);
        console.log(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsisLoading(false);
      }
    }

    fetchMovieDetails();
  }, [selectedId]);

  useEffect(() => {
    function callBack(e) {
      if (e.code === 'Escape') setSelectedId(null);
      console.log('Closing');
    }

    document.addEventListener('keydown', callBack);
    return () => document.removeEventListener('keydown', callBack);
  }, [setSelectedId]);

  function handleAddMovie() {
    const newMovie = {
      imdbID: selectedId,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(' ').at(0)),
      userRating: Number(userRating),
    };
    onAddWatchedMovies(newMovie);
    setSelectedId(null);
  }

  useEffect(() => {
    if (!title) return;
    document.title = `Movie | ${title}`;
    return () => (document.title = `use-Popcorn`);
  }, [title]);
  return (
    <div className="details">
      {isisLoading && <Loader />}
      {error && <ErrorMessage message={error} />}
      {!isisLoading && !error && (
        <>
          <header>
            <button className="btn-back" onClick={() => setSelectedId(null)}>
              &larr;
            </button>
            <img src={poster} alt={`Poster of ${movie.title}`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐</span>
                {imdbRating} IMDb Rating
              </p>
            </div>
          </header>
          <section>
            <div className="rating">
              {!!isWatched ? (
                <p>You rated with movie {isWatched}</p>
              ) : (
                <>
                  <StarRating
                    maxRating={10}
                    size={24}
                    onSetRating={setUserRating}
                  />
                  {userRating > 0 && (
                    <button className="btn-add" onClick={handleAddMovie}>
                      + Add to list
                    </button>
                  )}
                </>
              )}
            </div>
            <p>
              <em>{plot}</em>
            </p>
            <p>Starring {actors}</p>
            <p>Directed by {director}</p>
          </section>
        </>
      )}
    </div>
  );
}

function MovieWatched({ watched, onDeleteWathedMovie }) {
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
              <img src={movie.poster} alt={`${movie.title} poster`} />
              <h3>{movie.title}</h3>
              <div>
                <p>
                  <span>⭐️</span>
                  <span>{movie.imdbRating.toFixed(1)}</span>
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
              <button
                className="btn-delete"
                onClick={() => onDeleteWathedMovie(movie.imdbID)}
              >
                X
              </button>
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
          <span>
            {Number.isInteger(+avgImdbRating)
              ? avgImdbRating
              : Number(avgImdbRating?.toFixed(1))}
          </span>
        </p>
        <p>
          <span>🌟</span>
          <span>
            {Number.isInteger(avgUserRating)
              ? avgUserRating
              : Number(avgUserRating?.toFixed(1))}
          </span>
        </p>
        <p>
          <span>⏳</span>
          <span>{Math.floor(avgRuntime)} min</span>
        </p>
      </div>
    </div>
  );
}
