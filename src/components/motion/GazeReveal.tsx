import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { animate } from 'framer-motion';
import { MOTION } from '@/lib/motion/tokens';
import { resolveGazeOrder } from '@/lib/motion/gazeMap';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * Hide a section and play its gaze-ordered entrance the first time it
 * intersects. Returns the teardown. Mount does a single style write and no
 * layout reads; DOM measurement (resolveGazeOrder) waits for intersection.
 * Hero: the LCP candidate is never hidden — the wrapper stays visible, the
 * largest element only settles, and the rest animate in.
 */
function armReveal(root: HTMLElement, sectionType: string): () => void {
  const isHero = sectionType === 'hero';
  if (!isHero) root.style.opacity = '0';
  // Arms CSS-side draws (connector lines, accent rules): they hold their
  // start state only while armed-and-unrevealed, so no-JS pages stay static.
  root.setAttribute('data-reveal-armed', '');

  const reset = (el: HTMLElement) => {
    el.style.opacity = '';
    el.style.transform = '';
    el.style.willChange = '';
  };
  let els: HTMLElement[] = [];
  const controls: { stop: () => void }[] = [];
  let played = false;

  const play = () => {
    played = true;
    root.setAttribute('data-revealed', '');
    let beats = resolveGazeOrder(root, sectionType);
    if (isHero) {
      const all = beats.flat();
      const areas = all.map((el) => { const r = el.getBoundingClientRect(); return r.width * r.height; });
      const largest = all[areas.indexOf(Math.max(0, ...areas))];
      if (largest) {
        beats = beats.map((b) => b.filter((el) => el !== largest && !el.contains(largest))).filter((b) => b.length);
        // Kinetic-lite settle: the headline is NEVER hidden (LCP paints at
        // once) — it only eases the last few pixels into place.
        const c = animate(
          largest,
          { transform: ['translateY(8px) scale(0.995)', 'translateY(0px) scale(1)'] },
          { duration: MOTION.duration.md, ease: MOTION.ease },
        );
        controls.push(c);
        c.then(() => reset(largest));
      }
    }
    els = beats.flat();
    // Hide children and unhide the wrapper in the same frame: no flash.
    els.forEach((el) => {
      el.style.opacity = '0';
      el.style.transform = `translateY(${MOTION.distance}px)`;
      el.style.willChange = 'opacity, transform';
    });
    root.style.opacity = '';
    beats.forEach((beat, i) =>
      beat.forEach((el) => {
        const c = animate(
          el,
          { opacity: [0, 1], transform: [`translateY(${MOTION.distance}px)`, 'translateY(0px)'] },
          { duration: MOTION.duration.md, ease: MOTION.ease, delay: i * MOTION.stagger },
        );
        controls.push(c);
        c.then(() => reset(el));
      }),
    );
  };

  const io = new IntersectionObserver(
    (entries) => {
      if (played || !entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      play();
    },
    { threshold: 0.15 },
  );
  // If the page is hidden while a section is still waiting, show it at once:
  // IntersectionObserver doesn't run for hidden pages, so it would stay blank.
  const revealNow = () => {
    if (played) return;
    io.disconnect();
    played = true;
    root.setAttribute('data-revealed', '');
    root.style.opacity = '';
  };
  const onHide = () => { if (document.visibilityState === 'hidden') revealNow(); };
  document.addEventListener('visibilitychange', onHide);
  if (isHero) play();
  else io.observe(root);

  return () => {
    document.removeEventListener('visibilitychange', onHide);
    io.disconnect();
    controls.forEach((c) => c.stop());
    els.forEach(reset);
    root.style.opacity = '';
    root.removeAttribute('data-reveal-armed');
    root.setAttribute('data-revealed', '');
  };
}

/**
 * Plays a section's entrance once, in gaze order, when it first scrolls into view.
 * Progressive safety: elements are hidden only after this mounts in a browser;
 * without JS, IntersectionObserver, or with reduced motion, content stays visible.
 *
 * Pages that mount while hidden (opened in a background tab, a window behind
 * another app, prerender) never hide anything up front — IntersectionObserver
 * doesn't run while hidden, so hidden content would stay blank. Instead the
 * section waits until the page is first shown, then animates only if it is
 * still below the fold; anything already on screen stays as it is.
 */
export function GazeReveal({ sectionType, sectionBg, children }: { sectionType: string; sectionBg?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root || prefersReducedMotion() || typeof IntersectionObserver === 'undefined') return;

    if (document.visibilityState !== 'hidden') {
      return armReveal(root, sectionType);
    }

    let teardown: (() => void) | null = null;
    let probe: IntersectionObserver | null = null;
    const onShown = () => {
      if (document.visibilityState !== 'visible') return;
      document.removeEventListener('visibilitychange', onShown);
      // One async probe for the initial position — no synchronous layout reads.
      probe = new IntersectionObserver((entries) => {
        probe?.disconnect();
        probe = null;
        if (entries.some((e) => e.isIntersecting)) {
          root.setAttribute('data-revealed', ''); // already on screen: stay static
          return;
        }
        teardown = armReveal(root, sectionType); // below the fold: animate on arrival
      });
      probe.observe(root);
    };
    document.addEventListener('visibilitychange', onShown);

    return () => {
      document.removeEventListener('visibilitychange', onShown);
      probe?.disconnect();
      teardown?.();
    };
    // Play once per mount; content edits after reveal are not re-hidden.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionType]);

  return <div ref={ref} data-gaze-section="" data-section-bg={sectionBg}>{children}</div>;
}
