import { useEffect, useRef, useState } from 'react';
import { MICRO, prefersReducedMotion, easeOutCubic, parseStatNumber } from '@/lib/motion/micro';

/**
 * Animates the leading number of an already-sourced stat ("54 migrations",
 * "2,800+", "$425", "41 min") from 0 to its value when it scrolls into view.
 * The system only renders sourced stats, so the motion emphasizes real proof.
 * Falls back to static text with reduced motion, hidden pages, or when no
 * leading number can be parsed. Final rendered text is always exact.
 */
export function StatCountUp({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const match = parseStatNumber(value);
  const [display, setDisplay] = useState<string | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !match) return;
    if (prefersReducedMotion() || typeof IntersectionObserver === 'undefined') {
      return; // static
    }
    // Mounted hidden (background tab): same contract as GazeReveal — wait for
    // first show; if the stat is already on screen then, it stays static,
    // otherwise it counts when scrolled to.
    if (document.visibilityState === 'hidden') {
      let probe: IntersectionObserver | null = null;
      let inner: (() => void) | undefined;
      const onShown = () => {
        if (document.visibilityState !== 'visible') return;
        document.removeEventListener('visibilitychange', onShown);
        probe = new IntersectionObserver((entries) => {
          probe?.disconnect();
          probe = null;
          if (!entries.some((e) => e.isIntersecting)) inner = startCount(el);
        });
        probe.observe(el);
      };
      document.addEventListener('visibilitychange', onShown);
      return () => {
        document.removeEventListener('visibilitychange', onShown);
        probe?.disconnect();
        inner?.();
      };
    }
    return startCount(el);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  function startCount(el: HTMLElement): () => void {
    if (!match) return () => {};
    const target = match.num;
    const decimals = (match.raw.split('.')[1] || '').length;
    const grouped = match.raw.includes(',');
    const fmt = (n: number) => {
      const fixed = n.toFixed(decimals);
      return grouped ? Number(fixed).toLocaleString('en-US', { minimumFractionDigits: decimals }) : fixed;
    };
    let raf = 0;
    let played = false;
    const io = new IntersectionObserver(
      (entries) => {
        if (played || !entries.some((e) => e.isIntersecting)) return;
        played = true;
        io.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / MICRO.countUp.durationMs);
          setDisplay(match.prefix + fmt(target * easeOutCubic(t)) + match.suffix);
          if (t < 1) raf = requestAnimationFrame(tick);
          else setDisplay(null); // settle on exact original text
        };
        setDisplay(match.prefix + fmt(0) + match.suffix);
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    const onHide = () => {
      if (document.visibilityState === 'hidden') {
        io.disconnect();
        cancelAnimationFrame(raf);
        setDisplay(null);
      }
    };
    document.addEventListener('visibilitychange', onHide);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      document.removeEventListener('visibilitychange', onHide);
    };
  }

  return (
    <span ref={ref} className={className}>
      {display ?? value}
    </span>
  );
}
