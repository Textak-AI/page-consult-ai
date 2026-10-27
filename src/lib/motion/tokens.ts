// Single source of truth for product-page motion. All reveal animation reads these.
export const MOTION = {
  /** Gentle ease-out */
  ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
  duration: { sm: 0.3, md: 0.4, lg: 0.5 }, // seconds (300/400/500ms)
  stagger: 0.1, // seconds between gaze beats (100ms)
  distance: 20, // px translateY
} as const;

export const MOTION_EASE_CSS = `cubic-bezier(${MOTION.ease.join(', ')})`;
