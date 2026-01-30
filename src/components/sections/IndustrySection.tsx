/**
 * Industry-Aware Section Wrapper
 * 
 * Wraps section content with industry-specific styling.
 * Applies design tokens (colors, typography, spacing, effects) based on industry variant.
 * 
 * Updated to use industry-aware patterns for "minimal, intentional imagery" aesthetic.
 */

import React from 'react';
import { 
  type IndustryVariant, 
  getIndustryTokens,
  industryTokensToCSS 
} from '@/config/designSystem/industryVariants';
import { getIndustryPattern, getAmbientHeroGradient, type PatternConfig } from '@/lib/industryPatterns';

/**
 * Pattern background component that applies CSS via ref
 */
function PatternBackground({ css }: { css: string }) {
  const ref = React.useRef<HTMLDivElement>(null);
  
  React.useEffect(() => {
    if (ref.current) {
      ref.current.style.cssText = css;
    }
  }, [css]);
  
  return (
    <div 
      ref={ref}
      className="absolute inset-0 z-0 pointer-events-none"
    />
  );
}

interface IndustrySectionProps {
  children: React.ReactNode;
  industryVariant?: IndustryVariant;
  className?: string;
  isDarkSection?: boolean; // For contrast sections (testimonials, final CTA)
  brandColor?: string;
  sectionType?: 'hero' | 'features' | 'how-it-works' | 'social-proof' | 'faq' | 'problem-solution' | 'final-cta';
  useAmbientBackground?: boolean; // Use industry-aware pattern instead of solid color
}

/**
 * Get inline styles for industry variant with optional pattern background
 */
function getIndustryStyles(
  variant: IndustryVariant,
  isDark: boolean = false,
  brandColor?: string,
  sectionType?: string,
  usePattern: boolean = false
): React.CSSProperties {
  const tokens = getIndustryTokens(variant);
  const isLightMode = tokens.mode === 'light';
  
  // Get industry-specific pattern if requested
  const pattern = usePattern 
    ? getIndustryPattern(
        variant as any, // Cast to industryDesignSystem variant type
        isLightMode ? 'light' : 'dark',
        sectionType as any
      )
    : null;
  
  // For light mode industries (consulting), use appropriate backgrounds
  if (isLightMode && !isDark) {
    const baseStyles: React.CSSProperties = {
      backgroundColor: `hsl(${tokens.colors.bgPrimary})`,
      color: `hsl(${tokens.colors.textPrimary})`,
      fontFamily: tokens.typography.bodyFont,
      ['--color-surface' as any]: `hsl(${tokens.colors.bgCard})`,
      ['--color-text-primary' as any]: `hsl(${tokens.colors.textPrimary})`,
      ['--color-text-secondary' as any]: `hsl(${tokens.colors.textSecondary})`,
      ['--color-border' as any]: `hsl(${tokens.colors.border})`,
      ['--color-primary' as any]: brandColor || `hsl(${tokens.colors.accent})`,
      ['--font-heading' as any]: tokens.typography.headingFont,
      ['--font-body' as any]: tokens.typography.bodyFont,
      ['--font-weight-heading' as any]: tokens.typography.headingWeight,
      ['--letter-spacing-heading' as any]: tokens.typography.letterSpacing,
      ['--line-height-body' as any]: tokens.typography.lineHeight,
      ['--radius-medium' as any]: tokens.shape.radiusCard,
      ['--shadow-card' as any]: tokens.shape.shadowCard,
      ['--spacing-section-y' as any]: tokens.spacing.sectionPadding,
      ['--spacing-section-x' as any]: '24px',
    };
    
    return baseStyles;
  }
  
  // Dark contrast sections for light mode pages
  if (isLightMode && isDark) {
    return {
      backgroundColor: `hsl(${tokens.colors.bgDark})`,
      color: `hsl(${tokens.colors.textOnDark})`,
      fontFamily: tokens.typography.bodyFont,
      ['--color-surface' as any]: `hsl(${tokens.colors.bgDark})`,
      ['--color-text-primary' as any]: `hsl(${tokens.colors.textOnDark})`,
      ['--color-text-secondary' as any]: 'hsl(30 6% 75%)', // Lighter secondary text on dark
      ['--color-border' as any]: 'hsla(30, 6%, 98%, 0.1)',
      ['--color-primary' as any]: brandColor || `hsl(${tokens.colors.accent})`,
      ['--font-heading' as any]: tokens.typography.headingFont,
      ['--font-body' as any]: tokens.typography.bodyFont,
      ['--font-weight-heading' as any]: tokens.typography.headingWeight,
      ['--letter-spacing-heading' as any]: tokens.typography.letterSpacing,
      ['--line-height-body' as any]: tokens.typography.lineHeight,
      ['--radius-medium' as any]: tokens.shape.radiusCard,
      ['--shadow-card' as any]: '0 4px 12px rgba(0, 0, 0, 0.3)',
      ['--spacing-section-y' as any]: tokens.spacing.sectionPadding,
      ['--spacing-section-x' as any]: '24px',
    };
  }
  
  // Default dark mode (SaaS, etc.)
  return {
    backgroundColor: isDark ? 'hsl(217, 33%, 4%)' : 'hsl(217, 33%, 6%)',
    color: 'white',
  };
}

export function IndustrySection({ 
  children, 
  industryVariant = 'default',
  className = '',
  isDarkSection = false,
  brandColor,
  sectionType,
  useAmbientBackground = false,
}: IndustrySectionProps) {
  const tokens = getIndustryTokens(industryVariant);
  const styles = getIndustryStyles(industryVariant, isDarkSection, brandColor, sectionType, useAmbientBackground);
  
  // Get pattern for ambient background
  const pattern = useAmbientBackground 
    ? getIndustryPattern(
        industryVariant as any,
        tokens.mode,
        sectionType as any
      )
    : null;
  
  return (
    <section 
      className={`relative overflow-hidden ${className}`}
      style={{
        ...styles,
        padding: `${tokens.spacing.sectionPadding} 24px`,
      }}
      data-industry={industryVariant}
      data-mode={tokens.mode}
    >
      {/* Industry-aware ambient pattern background */}
      {pattern && (
        <PatternBackground css={pattern.css} />
      )}
      <div className="relative z-10">
        {children}
      </div>
    </section>
  );
}

/**
 * Hook to get industry design tokens
 */
export function useIndustryTokens(variant?: IndustryVariant) {
  const actualVariant = variant || 'default';
  return getIndustryTokens(actualVariant);
}

/**
 * Check if an industry variant uses light mode
 */
export function isLightModeIndustry(variant?: IndustryVariant): boolean {
  if (!variant || variant === 'default') return false;
  const tokens = getIndustryTokens(variant);
  return tokens.mode === 'light';
}

/**
 * Get ambient hero gradient for when no background image is available
 * Follows "minimal, intentional imagery" philosophy
 */
export function getHeroAmbientGradient(variant?: IndustryVariant): string {
  const tokens = getIndustryTokens(variant || 'default');
  return getAmbientHeroGradient(variant as any || 'default', tokens.mode);
}
