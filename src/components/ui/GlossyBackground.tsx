import { useGlossEffect } from '@/hooks/useGlossEffect';
import { cn } from '@/lib/utils';
import React from 'react';

type PatternType = 'diagonal' | 'hexagon' | 'diamond' | 'dots';
type GlossDirection = 'vertical' | 'horizontal';

interface GlossyBackgroundProps {
  pattern: PatternType;
  glossDirection?: GlossDirection;
  glossRange?: number;
  invertGloss?: boolean;
  className?: string;
  children: React.ReactNode;
}

const patterns: Record<PatternType, React.CSSProperties> = {
  diagonal: {
    backgroundImage: `repeating-linear-gradient(
      135deg,
      transparent,
      transparent 40px,
      rgba(255,255,255,0.02) 40px,
      rgba(255,255,255,0.02) 41px
    )`
  },
  hexagon: {
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
    backgroundSize: '28px 49px'
  },
  diamond: {
    backgroundImage: `
      linear-gradient(45deg, rgba(255,255,255,0.015) 25%, transparent 25%),
      linear-gradient(-45deg, rgba(255,255,255,0.015) 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, rgba(255,255,255,0.015) 75%),
      linear-gradient(-45deg, transparent 75%, rgba(255,255,255,0.015) 75%)
    `,
    backgroundSize: '24px 24px',
    backgroundPosition: '0 0, 12px 0, 12px -12px, 0 12px'
  },
  dots: {
    backgroundImage: `radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)`,
    backgroundSize: '20px 20px'
  }
};

export function GlossyBackground({
  pattern,
  glossDirection = 'vertical',
  glossRange = 40,
  invertGloss = false,
  className,
  children
}: GlossyBackgroundProps) {
  const glossRef = useGlossEffect({
    direction: glossDirection,
    range: glossRange,
    invert: invertGloss
  });
  
  const glossGradient = glossDirection === 'vertical'
    ? `radial-gradient(ellipse 150% 60% at 50% var(--gloss-y, 0%), rgba(255,255,255,0.04) 0%, transparent 50%)`
    : `radial-gradient(ellipse 60% 150% at var(--gloss-x, 0%) 50%, rgba(255,255,255,0.04) 0%, transparent 50%)`;
  
  return (
    <div
      ref={glossRef as React.RefObject<HTMLDivElement>}
      className={cn("relative", className)}
      style={{ '--gloss-y': '0%', '--gloss-x': '0%' } as React.CSSProperties}
    >
      {/* Pattern layer */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={patterns[pattern]}
        aria-hidden="true"
      />
      
      {/* Gloss layer */}
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
        style={{ backgroundImage: glossGradient }}
        aria-hidden="true"
      />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
