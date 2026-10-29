import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { animate } from 'framer-motion';
import { MOTION } from '@/lib/motion/tokens';
import { resolveGazeOrder } from '@/lib/motion/gazeMap';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * Plays a section's entrance once, in gaze order, when it first scrolls into view.
 * Progressive safety: elements are hidden only after this mounts in a browser;
 * without JS, IntersectionObserver, or with reduced motion, content stays visible.
 */
export function GazeReveal({ sectionType, children }: { sectionType: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root || prefersReducedMotion() || typeof IntersectionObserver === 'undefined') return;

    // Mount does a single style write and no layout reads. DOM measurement
    // (resolveGazeOrder) is deferred until the section actually scrolls into
    // view, so loading a page never runs layout-thrashing work for every
    // section synchronously before first paint.
    // Hero: the LCP candidate must never wait on motion. The wrapper is not
    // hidden; the largest element paints immediately and only the rest animate.
    const isHero = sectionType === 'hero';
    if (!isHero) root.style.opacity = '0';

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
        let beats = resolveGazeOrder(root, sectionType);
        if (isHero) {
          const all = beats.flat();
          const areas = all.map((el) => { const r = el.getBoundingClientRect(); return r.width * r.height; });
          const largest = all[areas.indexOf(Math.max(0, ...areas))];
          if (largest) beats = beats.map((b) => b.filter((el) => el !== largest && !el.contains(largest))).filter((b) => b.length);
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
    if (isHero) play();
    else io.observe(root);

    return () => {
      io.disconnect();
      controls.forEach((c) => c.stop());
      els.forEach(reset);
      root.style.opacity = '';
    };
    // Play once per mount; content edits after reveal are not re-hidden.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionType]);

  return <div ref={ref} data-gaze-section="">{children}</div>;
}
