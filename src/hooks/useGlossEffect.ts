import { useEffect, useRef } from 'react';

interface GlossConfig {
  direction?: 'vertical' | 'horizontal';
  range?: number; // How much the gloss moves (percentage)
  invert?: boolean; // Reverse direction
}

export function useGlossEffect(config: GlossConfig = {}) {
  const ref = useRef<HTMLElement>(null);
  const { direction = 'vertical', range = 40, invert = false } = config;
  
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;
    
    const handleScroll = () => {
      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate how far through the viewport the section is
      // 0 = section top at viewport bottom
      // 1 = section bottom at viewport top
      const progress = 1 - (rect.bottom / (windowHeight + rect.height));
      const clampedProgress = Math.max(0, Math.min(1, progress));
      
      // Calculate gloss position
      const glossPosition = invert 
        ? 100 - (clampedProgress * range)
        : clampedProgress * range;
      
      if (direction === 'vertical') {
        element.style.setProperty('--gloss-y', `${glossPosition}%`);
      } else {
        element.style.setProperty('--gloss-x', `${glossPosition}%`);
      }
    };
    
    // Initial calculation
    handleScroll();
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [direction, range, invert]);
  
  return ref;
}
