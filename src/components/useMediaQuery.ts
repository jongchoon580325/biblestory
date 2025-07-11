import { useEffect, useState } from 'react';

/**
 * useMediaQuery - 미디어 쿼리 대응 커스텀 훅
 * @param query CSS 미디어 쿼리 문자열 (예: '(max-width: 768px)')
 * @returns boolean (쿼리 일치 여부)
 */
export default function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
    // eslint-disable-next-line
  }, [query]);

  return matches;
} 