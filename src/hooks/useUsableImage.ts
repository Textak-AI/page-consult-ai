import { useEffect, useState } from 'react';

/**
 * Returns the image URL while it is loading or loaded, and null once it fails
 * to load (expired provider URL, 404, decode error). Heroes use this so a dead
 * image collapses to the typographic fallback instead of a broken/blank layer.
 */
export function useUsableImage(url?: string | null): string | null {
  const clean = typeof url === 'string' && url.trim() ? url.trim() : null;
  const [failed, setFailed] = useState<string | null>(null);

  useEffect(() => {
    if (!clean || typeof Image === 'undefined') return;
    let active = true;
    const img = new Image();
    img.onerror = () => { if (active) setFailed(clean); };
    img.src = clean;
    return () => { active = false; };
  }, [clean]);

  return clean && failed !== clean ? clean : null;
}
