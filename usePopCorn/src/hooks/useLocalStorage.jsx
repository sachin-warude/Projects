import { useEffect, useState } from 'react';

export function useLocalStorage(initialState, key) {
  const [value, setValue] = useState(() => {
    const stored = localStorage.getItem(key);
    return JSON.parse(stored) || initialState;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue];
}
