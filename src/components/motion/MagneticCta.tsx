import { useRef, type ReactNode } from 'react';
import { MICRO, prefersReducedMotion } from '@/lib/motion/micro';

/**
 * The page's primary ask leans a few pixels toward a nearby cursor and
 * springs back on leave — reserved for the strategy's primary CTA only.
 * Pointer-only (no-op on touch), transform-only (no layout), disabled with
 * reduced motion. Wrap the button; the wrapper owns the transform so the
 * button's own hover/active transforms stay intact.
 */
export function MagneticCta({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const raf = useRef(0);

  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || e.pointerType !== 'mouse' || prefersReducedMotion()) return;
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const { maxShift, strength } = MICRO.magnet;
      const x = Math.max(-maxShift, Math.min(maxShift, dx * strength));
      const y = Math.max(-maxShift, Math.min(maxShift, dy * strength));
      el.style.transition = 'transform 80ms linear';
      el.style.transform = `translate(${x}px, ${y}px)`;
    });
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    cancelAnimationFrame(raf.current);
    el.style.transition = `transform ${MICRO.press.returnMs * 2}ms ${MICRO.ease}`;
    el.style.transform = 'translate(0, 0)';
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{ display: 'inline-block', willChange: 'transform' }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      {children}
    </div>
  );
}
