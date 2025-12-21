/**
 * Industry Design Variants
 * 
 * This module provides industry-specific design tokens that override the default
 * SaaS-style dark mode. Each variant defines colors, typography, spacing, and effects
 * that match industry expectations and buyer psychology.
 * 
 * Design Intent by Industry:
 * - Consulting: Warmth, credibility, relationship-focused. Light mode, serif headings.
 * - SaaS: Innovation, efficiency, modernity. Dark mode, tight typography.
 * - Healthcare: Calm, trust, cleanliness. Light mode, accessible typography.
 * - Finance: Precision, stability, restraint. Light mode, sharp corners.
 * - Manufacturing: Authority, reliability, substance. Dark mode, no effects.
 */

export type IndustryVariant = 
  | 'consulting'
  | 'saas'
  | 'healthcare'
  | 'finance'
  | 'manufacturing'
  | 'ecommerce'
  | 'legal'
  | 'default';

export interface IndustryDesignTokens {
  // Mode
  mode: 'light' | 'dark';
  
  // Colors (HSL format for Tailwind)
  colors: {
    bgPrimary: string;      // Main page background
    bgSecondary: string;    // Section alternates
    bgCard: string;         // Card backgrounds
    bgDark: string;         // Dark contrast sections
    textPrimary: string;    // Main text
    textSecondary: string;  // Secondary/muted text
    textOnDark: string;     // Text on dark sections
    accent: string;         // Accent color (falls back to brand color)
    accentHover: string;    // Accent hover state
    border: string;         // Border color
    borderSubtle: string;   // Subtle borders
  };
  
  // Typography
  typography: {
    headingFont: string;
    bodyFont: string;
    headingWeight: number;
    letterSpacing: string;
    lineHeight: number;
  };
  
  // Shape & Effects
  shape: {
    radiusCard: string;
    radiusButton: string;
    shadowCard: string;
    shadowButton: string;
    borderCard: string;
    blur: string;
    glow: string;
  };
  
  // Spacing
  spacing: {
    sectionPadding: string;
    contentWidth: string;
    cardPadding: string;
    elementGap: string;
  };
  
  // Section Headers (industry-specific language)
  sectionHeaders: {
    features: { title: string; subtitle: string; eyebrow: string };
    process: { title: string; subtitle: string };
    proof: { title: string; subtitle: string };
    testimonials: { title: string; subtitle: string };
    cta: { title: string; ctaText: string; subtext: string };
    faq: { title: string; eyebrow: string };
  };
}

/**
 * Consulting Industry Variant
 * 
 * Design Intent: Warmth, credibility, relationship-building.
 * - Light mode creates approachability
 * - Serif headings signal expertise and authority
 * - Generous spacing for executive readers
 * - Goal: "trusted advisor" not "tech startup"
 */
export const consultingVariant: IndustryDesignTokens = {
  mode: 'light',
  
  colors: {
    bgPrimary: '30 6% 98%',           // warm white (stone-50)
    bgSecondary: '30 6% 96%',         // stone-100
    bgCard: '0 0% 100%',              // clean white
    bgDark: '20 14% 11%',             // stone-900 for contrast sections
    textPrimary: '20 14% 11%',        // stone-900
    textSecondary: '25 5% 34%',       // stone-600
    textOnDark: '30 6% 98%',          // warm white
    accent: '174 84% 32%',            // teal-600 (default, overridden by brand)
    accentHover: '174 84% 28%',       // teal-700
    border: '30 6% 91%',              // stone-200
    borderSubtle: '30 6% 94%',        // stone-100
  },
  
  typography: {
    headingFont: '"Source Serif 4", Georgia, serif',
    bodyFont: 'Inter, system-ui, sans-serif',
    headingWeight: 600,
    letterSpacing: '-0.01em',
    lineHeight: 1.75,
  },
  
  shape: {
    radiusCard: '0.75rem',      // 12px - soft but professional
    radiusButton: '0.5rem',     // 8px
    shadowCard: '0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.03)',
    shadowButton: '0 1px 2px rgba(0, 0, 0, 0.05)',
    borderCard: '1px solid hsl(30 6% 91%)',
    blur: 'none',               // No glassmorphism
    glow: 'none',               // No button glow
  },
  
  spacing: {
    sectionPadding: '6rem',     // Generous breathing room
    contentWidth: '1100px',     // Slightly narrower, editorial
    cardPadding: '2rem',
    elementGap: '1.5rem',
  },
  
  sectionHeaders: {
    features: {
      title: 'How We Help',
      subtitle: 'Expertise that drives real results',
      eyebrow: 'Our Approach',
    },
    process: {
      title: 'How We Work Together',
      subtitle: 'A collaborative approach to your success',
    },
    proof: {
      title: 'Results That Speak',
      subtitle: 'Trusted by leaders across industries',
    },
    testimonials: {
      title: 'Client Perspectives',
      subtitle: 'What our clients say about working with us',
    },
    cta: {
      title: "Let's Start a Conversation",
      ctaText: 'Schedule a Discovery Call',
      subtext: 'Free 30-minute consultation • No obligation',
    },
    faq: {
      title: 'Questions We Often Hear',
      eyebrow: 'Common Questions',
    },
  },
};

/**
 * Default SaaS Variant
 * Current dark mode styling - serves as the baseline
 */
export const defaultVariant: IndustryDesignTokens = {
  mode: 'dark',
  
  colors: {
    bgPrimary: '217 33% 6%',          // Current dark bg
    bgSecondary: '217 33% 8%',        // Slightly lighter
    bgCard: '220 13% 10%',            // Card bg
    bgDark: '217 33% 4%',             // Darker sections
    textPrimary: '0 0% 100%',         // White
    textSecondary: '215 20% 65%',     // Slate-400
    textOnDark: '0 0% 100%',          // White
    accent: '189 95% 43%',            // Cyan
    accentHover: '189 95% 48%',       // Lighter cyan
    border: '220 13% 20%',            // Dark border
    borderSubtle: '220 13% 15%',      // Subtle border
  },
  
  typography: {
    headingFont: 'Inter, system-ui, sans-serif',
    bodyFont: 'Inter, system-ui, sans-serif',
    headingWeight: 700,
    letterSpacing: '-0.02em',
    lineHeight: 1.6,
  },
  
  shape: {
    radiusCard: '1rem',
    radiusButton: '0.75rem',
    shadowCard: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
    shadowButton: '0 0 20px hsla(189, 95%, 43%, 0.3)',
    borderCard: '1px solid hsla(220, 13%, 100%, 0.08)',
    blur: 'blur(12px)',
    glow: '0 0 40px hsla(189, 95%, 43%, 0.3)',
  },
  
  spacing: {
    sectionPadding: '120px',
    contentWidth: '1200px',
    cardPadding: '2rem',
    elementGap: '1.5rem',
  },
  
  sectionHeaders: {
    features: {
      title: 'Why Choose Us',
      subtitle: 'Everything you need to succeed',
      eyebrow: 'Features',
    },
    process: {
      title: 'How It Works',
      subtitle: 'Simple steps to get started',
    },
    proof: {
      title: 'Trusted By',
      subtitle: 'Join thousands of satisfied customers',
    },
    testimonials: {
      title: 'What People Say',
      subtitle: 'Real stories from real customers',
    },
    cta: {
      title: 'Ready to Start?',
      ctaText: 'Get Started',
      subtext: 'No credit card required • Free to start',
    },
    faq: {
      title: 'Frequently Asked Questions',
      eyebrow: 'FAQ',
    },
  },
};

/**
 * Map of all industry variants
 */
export const industryVariants: Record<IndustryVariant, IndustryDesignTokens> = {
  consulting: consultingVariant,
  saas: defaultVariant,
  healthcare: defaultVariant, // TODO: Implement healthcare variant
  finance: defaultVariant,    // TODO: Implement finance variant
  manufacturing: defaultVariant, // TODO: Implement manufacturing variant
  ecommerce: defaultVariant,  // TODO: Implement ecommerce variant
  legal: defaultVariant,      // TODO: Implement legal variant
  default: defaultVariant,
};

/**
 * Detect the industry variant from consultation data
 */
export function detectIndustryVariant(
  industry?: string,
  serviceType?: string,
  pageType?: string
): IndustryVariant {
  const industryLower = (industry || '').toLowerCase();
  const serviceTypeLower = (serviceType || '').toLowerCase();
  
  // Consulting detection
  if (
    industryLower.includes('consulting') ||
    industryLower.includes('professional services') ||
    industryLower.includes('advisor') ||
    industryLower.includes('coach') ||
    industryLower.includes('strategy') ||
    serviceTypeLower.includes('consulting') ||
    serviceTypeLower.includes('advisory')
  ) {
    return 'consulting';
  }
  
  // SaaS detection
  if (
    industryLower.includes('saas') ||
    industryLower.includes('software') ||
    industryLower.includes('tech') ||
    industryLower.includes('app')
  ) {
    return 'saas';
  }
  
  // Healthcare detection
  if (
    industryLower.includes('health') ||
    industryLower.includes('medical') ||
    industryLower.includes('dental') ||
    industryLower.includes('wellness')
  ) {
    return 'healthcare';
  }
  
  // Finance detection
  if (
    industryLower.includes('finance') ||
    industryLower.includes('banking') ||
    industryLower.includes('investment') ||
    industryLower.includes('accounting')
  ) {
    return 'finance';
  }
  
  // Manufacturing detection
  if (
    industryLower.includes('manufacturing') ||
    industryLower.includes('industrial') ||
    industryLower.includes('factory')
  ) {
    return 'manufacturing';
  }
  
  // Legal detection
  if (
    industryLower.includes('legal') ||
    industryLower.includes('law') ||
    industryLower.includes('attorney')
  ) {
    return 'legal';
  }
  
  // Ecommerce detection
  if (
    industryLower.includes('ecommerce') ||
    industryLower.includes('retail') ||
    industryLower.includes('shop')
  ) {
    return 'ecommerce';
  }
  
  return 'default';
}

/**
 * Generate CSS variables string from industry tokens
 */
export function industryTokensToCSS(
  tokens: IndustryDesignTokens,
  brandColor?: string
): string {
  // Parse brand color to HSL if provided
  let accentHSL = tokens.colors.accent;
  if (brandColor) {
    // Use brand color as accent (assume it's already valid)
    // In production, we'd convert hex to HSL here
    accentHSL = tokens.colors.accent; // Keep default for now, brand handled separately
  }
  
  return `
    :root {
      /* Industry Mode */
      --industry-mode: ${tokens.mode};
      
      /* Industry Colors */
      --industry-bg-primary: ${tokens.colors.bgPrimary};
      --industry-bg-secondary: ${tokens.colors.bgSecondary};
      --industry-bg-card: ${tokens.colors.bgCard};
      --industry-bg-dark: ${tokens.colors.bgDark};
      --industry-text-primary: ${tokens.colors.textPrimary};
      --industry-text-secondary: ${tokens.colors.textSecondary};
      --industry-text-on-dark: ${tokens.colors.textOnDark};
      --industry-accent: ${tokens.colors.accent};
      --industry-accent-hover: ${tokens.colors.accentHover};
      --industry-border: ${tokens.colors.border};
      --industry-border-subtle: ${tokens.colors.borderSubtle};
      
      /* Industry Typography */
      --industry-font-heading: ${tokens.typography.headingFont};
      --industry-font-body: ${tokens.typography.bodyFont};
      --industry-font-weight-heading: ${tokens.typography.headingWeight};
      --industry-letter-spacing: ${tokens.typography.letterSpacing};
      --industry-line-height: ${tokens.typography.lineHeight};
      
      /* Industry Shape */
      --industry-radius-card: ${tokens.shape.radiusCard};
      --industry-radius-button: ${tokens.shape.radiusButton};
      --industry-shadow-card: ${tokens.shape.shadowCard};
      --industry-shadow-button: ${tokens.shape.shadowButton};
      --industry-border-card: ${tokens.shape.borderCard};
      --industry-blur: ${tokens.shape.blur};
      --industry-glow: ${tokens.shape.glow};
      
      /* Industry Spacing */
      --industry-section-padding: ${tokens.spacing.sectionPadding};
      --industry-content-width: ${tokens.spacing.contentWidth};
      --industry-card-padding: ${tokens.spacing.cardPadding};
      --industry-element-gap: ${tokens.spacing.elementGap};
    }
  `;
}

/**
 * Get the design tokens for an industry
 */
export function getIndustryTokens(variant: IndustryVariant): IndustryDesignTokens {
  return industryVariants[variant] || defaultVariant;
}
