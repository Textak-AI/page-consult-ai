/**
 * Industry-Aware Section Wrapper
 * 
 * Wraps section content with industry-specific styling.
 * Applies design tokens (colors, typography, spacing, effects) based on industry variant.
 */

import React from 'react';
import { 
  type IndustryVariant, 
  getIndustryTokens,
  industryTokensToCSS 
} from '@/config/designSystem/industryVariants';

interface IndustrySectionProps {
  children: React.ReactNode;
  industryVariant?: IndustryVariant;
  className?: string;
  isDarkSection?: boolean; // For contrast sections (testimonials, final CTA)
  brandColor?: string;
}

/**
 * Get inline styles for industry variant
 */
function getIndustryStyles(
  variant: IndustryVariant,
  isDark: boolean = false,
  brandColor?: string
): React.CSSProperties {
  const tokens = getIndustryTokens(variant);
  const isLightMode = tokens.mode === 'light';
  
  // For light mode industries (consulting), use appropriate backgrounds
  if (isLightMode && !isDark) {
    return {
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
}: IndustrySectionProps) {
  const tokens = getIndustryTokens(industryVariant);
  const styles = getIndustryStyles(industryVariant, isDarkSection, brandColor);
  
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
      {children}
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
