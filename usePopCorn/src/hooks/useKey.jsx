import { useEffect } from 'react';

export function useKey(key, action) {
  useEffect(() => {
    function callBack(e) {
      if (e.code.toLowerCase() === key.toLowerCase()) action(null);
      console.log('Closing');
    }

    document.addEventListener('keydown', callBack);
    return () => document.removeEventListener('keydown', callBack);
  }, [action, key]);
}
