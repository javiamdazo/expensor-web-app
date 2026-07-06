import { useEffect, useState } from 'react';

export function usePrefersDark(): boolean {
  const query = '(prefers-color-scheme: dark)';
  const [dark, setDark] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches,
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const listener = (e: MediaQueryListEvent) => setDark(e.matches);
    mql.addEventListener('change', listener);
    return () => mql.removeEventListener('change', listener);
  }, []);

  return dark;
}
