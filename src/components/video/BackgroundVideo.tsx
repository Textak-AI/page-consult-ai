import { useEffect, useState } from 'react';
import type { PageVideo } from '@/lib/video';

const prefersStill = () => {
  if (typeof window === 'undefined') return true;
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const saveData = (navigator as any).connection?.saveData === true;
  return !!(reduced || saveData);
};

/**
 * Hero background video: muted, looping, inline, no controls, behind the
 * hero's own scrim. Reduced motion or data saver shows the poster still. A
 * failed load hides it, so the hero's photo or typographic fallback shows.
 */
export function BackgroundVideo({ video, className = '', style, onFail }: {
  video: Extract<PageVideo, { source: 'upload' }>;
  className?: string;
  style?: React.CSSProperties;
  onFail?: () => void;
}) {
  const [still, setStill] = useState(prefersStill);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const on = () => setStill(prefersStill());
    mq?.addEventListener?.('change', on);
    return () => mq?.removeEventListener?.('change', on);
  }, []);
  if (failed) return null;
  if (still) {
    return video.poster ? <img src={video.poster} alt="" aria-hidden="true" className={className} style={{ objectFit: 'cover', ...style }} /> : null;
  }
  return (
    <video
      data-hero-video
      src={video.url}
      poster={video.poster || undefined}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      aria-hidden="true"
      tabIndex={-1}
      className={className}
      style={{ objectFit: 'cover', ...style }}
      onError={() => { setFailed(true); onFail?.(); }}
    />
  );
}
