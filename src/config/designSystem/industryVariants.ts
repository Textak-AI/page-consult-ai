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
  | 'creative'
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
 * 
 * Layout characteristics:
 * - Trust-first hero with credentials
 * - Heavy upfront proof (stats bar right after hero)
 * - Professional photography, clean, spacious
 */
export const consultingVariant: IndustryDesignTokens = {
  mode: 'light',
  
  colors: {
    // Backgrounds (slate-based for professional feel)
    bgPrimary: '0 0% 100%',              // #FFFFFF - pure white
    bgSecondary: '210 40% 98%',          // #F8FAFC - slate-50
    bgCard: '0 0% 100%',                 // #FFFFFF - white cards
    bgDark: '222 47% 11%',               // #0F172A - slate-900 for contrast
    // Text
    textPrimary: '222 47% 11%',          // #0F172A - slate-900
    textSecondary: '215 16% 47%',        // #64748B - slate-500
    textOnDark: '210 40% 98%',           // #F8FAFC - slate-50
    // Accent (brand color, falls back to blue)
    accent: '217 91% 60%',               // #3B82F6 - blue-500 (overridden by user brand)
    accentHover: '217 91% 50%',          // #2563EB - blue-600
    // Borders
    border: '214 32% 91%',               // #E2E8F0 - slate-200
    borderSubtle: '210 40% 96%',         // #F1F5F9 - slate-100
  },
  
  typography: {
    headingFont: '"Source Serif 4", Georgia, serif',
    bodyFont: 'Inter, system-ui, sans-serif',
    headingWeight: 700,
    letterSpacing: '-0.01em',
    lineHeight: 1.6,
  },
  
  shape: {
    radiusCard: '1rem',           // 16px - modern rounded
    radiusButton: '0.5rem',       // 8px
    shadowCard: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
    shadowButton: '0 1px 2px rgba(0, 0, 0, 0.05)',
    borderCard: '1px solid hsl(214 32% 91%)',
    blur: 'none',                 // No glassmorphism
    glow: 'none',                 // No button glow
  },
  
  spacing: {
    sectionPadding: '96px',       // Standard section padding
    contentWidth: '1024px',       // Focused, editorial width
    cardPadding: '2rem',
    elementGap: '1.5rem',
  },
  
  sectionHeaders: {
    features: {
      title: 'Why Choose Us',
      subtitle: 'Expertise that drives real results',
      eyebrow: 'Our Expertise',
    },
    process: {
      title: 'How It Works',
      subtitle: 'Your path to results',
    },
    proof: {
      title: 'Results That Speak',
      subtitle: 'Trusted by leaders across industries',
    },
    testimonials: {
      title: 'What Our Clients Say',
      subtitle: 'Real results from real clients',
    },
    cta: {
      title: 'Ready to Get Started?',
      ctaText: 'Schedule a Consultation',
      subtext: 'No commitment required • Response within 24 hours',
    },
    faq: {
      title: 'Frequently Asked Questions',
      eyebrow: 'Common Questions',
    },
  },
};

/**
 * Creative Agency Industry Variant
 * 
 * Design Intent: Bold, expressive, portfolio-forward.
 * - Dark OR light mode - more flexibility for personality
 * - Display fonts allowed, dramatic sizing
 * - Editorial, can break the mold
 * - Portfolio and case studies as proof
 * - Personality-forward, not buttoned-up
 * 
 * Layout characteristics:
 * - Visual-first hero with portfolio showcase
 * - "Selected Work" instead of "Case Studies"
 * - Client logos as social proof
 * - Bold typography and creative layout
 */
export const creativeVariant: IndustryDesignTokens = {
  mode: 'dark',
  
  colors: {
    // Dark mode with warm undertones for creative feel
    bgPrimary: '240 10% 6%',              // Near black with warmth
    bgSecondary: '240 10% 10%',           // Slightly lighter
    bgCard: '240 10% 12%',                // Card backgrounds
    bgDark: '240 10% 4%',                 // Darker sections
    textPrimary: '0 0% 98%',              // Near white
    textSecondary: '0 0% 65%',            // Warm gray
    textOnDark: '0 0% 98%',               // Near white
    // Accent - warm coral/orange for creative energy
    accent: '15 90% 60%',                 // Warm coral
    accentHover: '15 90% 65%',            // Lighter coral
    border: '240 10% 20%',                // Subtle border
    borderSubtle: '240 10% 15%',          // Very subtle border
  },
  
  typography: {
    headingFont: '"Clash Display", "Cabinet Grotesk", Inter, system-ui, sans-serif',
    bodyFont: 'Inter, system-ui, sans-serif',
    headingWeight: 600,
    letterSpacing: '-0.03em',             // Tighter tracking for display
    lineHeight: 1.3,                      // Tighter line height for headlines
  },
  
  shape: {
    radiusCard: '1.5rem',                 // Larger radius for modern feel
    radiusButton: '2rem',                 // Pill buttons
    shadowCard: '0 8px 32px rgba(0, 0, 0, 0.3)',
    shadowButton: 'none',                 // Clean buttons
    borderCard: '1px solid hsla(240, 10%, 100%, 0.06)',
    blur: 'blur(16px)',
    glow: 'none',                         // No glow - too techy
  },
  
  spacing: {
    sectionPadding: '120px',              // Generous spacing
    contentWidth: '1280px',               // Wider for portfolio
    cardPadding: '2.5rem',
    elementGap: '2rem',
  },
  
  sectionHeaders: {
    features: {
      title: 'What We Do',
      subtitle: 'Transforming brands through strategic creativity',
      eyebrow: 'CAPABILITIES',
    },
    process: {
      title: 'Our Process',
      subtitle: 'From insight to impact',
    },
    proof: {
      title: 'Selected Work',
      subtitle: 'Projects that moved the needle',
    },
    testimonials: {
      title: 'Client Love',
      subtitle: 'Words from the people we work with',
    },
    cta: {
      title: "Let's Create Something",
      ctaText: 'Start a Project',
      subtext: 'We respond within 24 hours',
    },
    faq: {
      title: 'Common Questions',
      eyebrow: 'FAQ',
    },
  },
};

/**
 * SaaS Industry Variant
 * 
 * Design Intent: Modern, innovative, product-led.
 * - Dark mode for tech-forward feel
 * - Purple/blue gradients for innovation
 * - Product-focused layouts
 * - Self-serve CTAs
 */
export const saasVariant: IndustryDesignTokens = {
  mode: 'dark',
  
  colors: {
    bgPrimary: '222 47% 11%',              // #0F172A - slate-900
    bgSecondary: '217 33% 17%',            // #1E293B - slate-800
    bgCard: '217 33% 17%',                 // #1E293B - slate-800
    bgDark: '222 47% 8%',                  // Darker slate
    textPrimary: '210 40% 98%',            // #F8FAFC - slate-50
    textSecondary: '215 20% 65%',          // #94A3B8 - slate-400
    textOnDark: '210 40% 98%',             // #F8FAFC - slate-50
    accent: '263 70% 50%',                 // #7C3AED - purple-600
    accentHover: '263 70% 60%',            // lighter purple
    border: '217 33% 25%',                 // slate-700
    borderSubtle: '217 33% 20%',           // darker border
  },
  
  typography: {
    headingFont: 'Inter, system-ui, sans-serif',
    bodyFont: 'Inter, system-ui, sans-serif',
    headingWeight: 700,
    letterSpacing: '-0.02em',
    lineHeight: 1.5,
  },
  
  shape: {
    radiusCard: '1rem',
    radiusButton: '0.75rem',
    shadowCard: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
    shadowButton: '0 0 20px hsla(263, 70%, 50%, 0.3)',
    borderCard: '1px solid hsla(217, 33%, 25%, 1)',
    blur: 'blur(12px)',
    glow: '0 0 40px hsla(263, 70%, 50%, 0.3)',
  },
  
  spacing: {
    sectionPadding: '96px',
    contentWidth: '1200px',
    cardPadding: '2rem',
    elementGap: '1.5rem',
  },
  
  sectionHeaders: {
    features: {
      title: 'Everything you need',
      subtitle: 'Built for teams who move fast',
      eyebrow: 'FEATURES',
    },
    process: {
      title: 'Get started in minutes',
      subtitle: 'Three simple steps to success',
    },
    proof: {
      title: 'Loved by teams everywhere',
      subtitle: 'See what our customers are saying',
    },
    testimonials: {
      title: 'What teams are saying',
      subtitle: 'Join thousands of satisfied users',
    },
    cta: {
      title: 'Ready to get started?',
      ctaText: 'Start your free trial',
      subtext: 'No credit card required • Cancel anytime',
    },
    faq: {
      title: 'Frequently asked questions',
      eyebrow: 'FAQ',
    },
  },
};

/**
 * Healthcare Industry Variant
 * 
 * Design Intent: Calm, trust, clinical precision.
 * - Light mode for cleanliness and trust
 * - Teal primary for clinical feel
 * - Navy secondary for authority
 * - Accessible typography
 * - No anxiety-inducing colors (no red accents)
 */
export const healthcareVariant: IndustryDesignTokens = {
  mode: 'light',
  
  colors: {
    bgPrimary: '0 0% 100%',              // #FFFFFF - pure white
    bgSecondary: '210 40% 98%',          // #F8FAFC - slate-50
    bgCard: '0 0% 100%',                 // #FFFFFF - white cards
    bgDark: '210 40% 17%',               // #1E3A5F - navy dark
    textPrimary: '222 47% 11%',          // #0F172A - slate-900
    textSecondary: '215 16% 47%',        // #64748B - slate-500
    textOnDark: '210 40% 98%',           // #F8FAFC - slate-50
    accent: '173 80% 40%',               // #0D9488 - teal-600
    accentHover: '173 80% 35%',          // Darker teal
    border: '214 32% 91%',               // #E2E8F0 - slate-200
    borderSubtle: '210 40% 96%',         // #F1F5F9 - slate-100
  },
  
  typography: {
    headingFont: 'Inter, system-ui, sans-serif',
    bodyFont: 'Inter, system-ui, sans-serif',
    headingWeight: 700,
    letterSpacing: '-0.01em',
    lineHeight: 1.7,
  },
  
  shape: {
    radiusCard: '0.75rem',        // 12px - slightly softer
    radiusButton: '0.5rem',       // 8px
    shadowCard: '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)',
    shadowButton: '0 1px 2px rgba(0, 0, 0, 0.05)',
    borderCard: '1px solid hsl(214 32% 91%)',
    blur: 'none',                 // No glassmorphism
    glow: 'none',                 // No button glow
  },
  
  spacing: {
    sectionPadding: '96px',
    contentWidth: '1024px',
    cardPadding: '2rem',
    elementGap: '1.5rem',
  },
  
  sectionHeaders: {
    features: {
      title: 'Why Organizations Trust Us',
      subtitle: 'Protecting what matters most',
      eyebrow: 'Our Expertise',
    },
    process: {
      title: 'How We Work',
      subtitle: 'A proven approach to security',
    },
    proof: {
      title: 'Results That Matter',
      subtitle: 'Trusted by healthcare organizations nationwide',
    },
    testimonials: {
      title: 'What Clients Say',
      subtitle: 'Real results from real organizations',
    },
    cta: {
      title: 'Ready to Secure Your Organization?',
      ctaText: 'Schedule Assessment',
      subtext: 'Free consultation • No obligation',
    },
    faq: {
      title: 'Frequently Asked Questions',
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
  creative: creativeVariant,
  saas: saasVariant,
  healthcare: healthcareVariant,
  finance: defaultVariant,    // TODO: Implement finance variant
  manufacturing: defaultVariant, // TODO: Implement manufacturing variant
  ecommerce: defaultVariant,  // TODO: Implement ecommerce variant
  legal: defaultVariant,      // TODO: Implement legal variant
  default: defaultVariant,
};

/**
 * Detect the industry variant from consultation data
 * 
 * IMPORTANT: Order matters! More specific patterns should be checked first.
 * Consulting/professional services should be checked BEFORE SaaS to avoid
 * misclassifying "HR consulting" as "tech" due to partial matches.
 */
export function detectIndustryVariant(
  industry?: string,
  serviceType?: string,
  pageType?: string
): IndustryVariant {
  const industryLower = (industry || '').toLowerCase();
  const serviceTypeLower = (serviceType || '').toLowerCase();
  const combined = `${industryLower} ${serviceTypeLower}`;
  
  // Consulting detection (MUST come before SaaS - more specific)
  // Includes: HR consulting, management consulting, professional services, etc.
  if (
    combined.includes('consulting') ||
    combined.includes('professional services') ||
    combined.includes('advisor') ||
    combined.includes('advisory') ||
    combined.includes('coach') ||
    combined.includes('coaching') ||
    combined.includes('strategy') ||
    combined.includes('consultant') ||
    // HR-specific terms
    combined.includes('human resources') ||
    combined.includes('hr ') ||
    combined.includes(' hr') ||
    combined.includes('talent') ||
    combined.includes('recruitment') ||
    combined.includes('staffing') ||
    combined.includes('workforce') ||
    // Management consulting terms
    combined.includes('management') ||
    combined.includes('operations') ||
    combined.includes('training') ||
    combined.includes('development') ||
    // B2B services
    combined.includes('agency') ||
    combined.includes('services')
  ) {
    return 'consulting';
  }
  
  // Legal detection (before general professional services)
  if (
    combined.includes('legal') ||
    combined.includes('law firm') ||
    combined.includes('law ') ||
    combined.includes('attorney') ||
    combined.includes('lawyer')
  ) {
    return 'legal';
  }
  
  // Finance detection
  if (
    combined.includes('finance') ||
    combined.includes('financial') ||
    combined.includes('banking') ||
    combined.includes('investment') ||
    combined.includes('accounting') ||
    combined.includes('cpa') ||
    combined.includes('wealth') ||
    combined.includes('insurance')
  ) {
    return 'finance';
  }
  
  // Healthcare detection
  if (
    combined.includes('health') ||
    combined.includes('medical') ||
    combined.includes('dental') ||
    combined.includes('wellness') ||
    combined.includes('clinic') ||
    combined.includes('therapy') ||
    combined.includes('healthcare')
  ) {
    return 'healthcare';
  }
  
  // Manufacturing detection
  if (
    combined.includes('manufacturing') ||
    combined.includes('industrial') ||
    combined.includes('factory') ||
    combined.includes('production')
  ) {
    return 'manufacturing';
  }
  
  // Ecommerce detection
  if (
    combined.includes('ecommerce') ||
    combined.includes('e-commerce') ||
    combined.includes('retail') ||
    combined.includes('shop') ||
    combined.includes('store')
  ) {
    return 'ecommerce';
  }
  
  // SaaS detection (LAST among business types - most generic tech terms)
  if (
    combined.includes('saas') ||
    combined.includes('software') ||
    combined.includes('tech') ||
    combined.includes('app') ||
    combined.includes('platform') ||
    combined.includes('startup') ||
    combined.includes('cloud') ||
    combined.includes('digital product')
  ) {
    return 'saas';
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
