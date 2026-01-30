/**
 * Industry-Aware Background Patterns
 * 
 * Provides subtle, professional CSS patterns and gradients for interior sections
 * based on industry variant. Supports the "minimal, intentional imagery" philosophy:
 * - Professional AI-generated hero scenes OR ambient gradients
 * - Interior sections use industry-specific patterns, not stock photos
 */

import type { IndustryVariant } from './industryDesignSystem';

export interface PatternConfig {
  type: 'mesh-gradient' | 'grid' | 'dots' | 'geometric' | 'waves' | 'radial' | 'solid' | 'subtle-texture';
  css: string;
  overlayOpacity?: number;
}

/**
 * Get industry-specific background pattern for interior sections
 * These are subtle, non-distracting patterns that support visual hierarchy
 */
export function getIndustryPattern(
  industry: IndustryVariant,
  mode: 'light' | 'dark' = 'dark',
  sectionType?: 'features' | 'how-it-works' | 'social-proof' | 'faq' | 'problem-solution' | 'final-cta'
): PatternConfig {
  // Section-specific patterns (final-cta and social-proof get darker/contrasting)
  const isDarkSection = sectionType === 'final-cta' || sectionType === 'social-proof';
  
  switch (industry) {
    case 'manufacturing':
      // Geometric precision patterns - industrial feel
      return {
        type: 'geometric',
        css: isDarkSection
          ? `
            background: linear-gradient(135deg, #1E3A5F 0%, #0F1729 100%);
            background-image: 
              linear-gradient(30deg, rgba(245, 158, 11, 0.03) 12%, transparent 12.5%, transparent 87%, rgba(245, 158, 11, 0.03) 87.5%, rgba(245, 158, 11, 0.03)),
              linear-gradient(150deg, rgba(245, 158, 11, 0.03) 12%, transparent 12.5%, transparent 87%, rgba(245, 158, 11, 0.03) 87.5%, rgba(245, 158, 11, 0.03));
            background-size: 60px 100px;
          `
          : mode === 'light'
          ? `
            background: linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%);
            background-image: 
              linear-gradient(90deg, rgba(30, 58, 95, 0.02) 1px, transparent 1px),
              linear-gradient(rgba(30, 58, 95, 0.02) 1px, transparent 1px);
            background-size: 40px 40px;
          `
          : `
            background: linear-gradient(180deg, #0F172A 0%, #1E293B 100%);
            background-image: 
              linear-gradient(90deg, rgba(245, 158, 11, 0.03) 1px, transparent 1px),
              linear-gradient(rgba(245, 158, 11, 0.03) 1px, transparent 1px);
            background-size: 40px 40px;
          `,
        overlayOpacity: 0.02,
      };

    case 'healthcare':
    case 'healthtech':
      // Clean, calming patterns - whites/teals
      return {
        type: 'radial',
        css: isDarkSection
          ? `
            background: linear-gradient(135deg, #0C4A6E 0%, #134E4A 100%);
            background-image: radial-gradient(circle at 20% 80%, rgba(14, 165, 233, 0.1) 0%, transparent 50%),
                              radial-gradient(circle at 80% 20%, rgba(20, 184, 166, 0.1) 0%, transparent 50%);
          `
          : `
            background: linear-gradient(180deg, #FFFFFF 0%, #F0FDFA 50%, #F0F9FF 100%);
            background-image: radial-gradient(circle at 30% 70%, rgba(14, 165, 233, 0.05) 0%, transparent 40%),
                              radial-gradient(circle at 70% 30%, rgba(20, 184, 166, 0.05) 0%, transparent 40%);
          `,
        overlayOpacity: 0.01,
      };

    case 'consulting':
      // Sophisticated subtle patterns - professional/trustworthy
      return {
        type: 'subtle-texture',
        css: isDarkSection
          ? `
            background: linear-gradient(135deg, #1E3A5F 0%, #1E293B 100%);
            background-image: 
              radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.08) 0%, transparent 50%),
              radial-gradient(circle at 75% 75%, rgba(124, 58, 237, 0.06) 0%, transparent 50%);
          `
          : `
            background: linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%);
            background-image: 
              radial-gradient(ellipse at 0% 0%, rgba(30, 64, 175, 0.03) 0%, transparent 50%),
              radial-gradient(ellipse at 100% 100%, rgba(124, 58, 237, 0.02) 0%, transparent 50%);
          `,
        overlayOpacity: 0.01,
      };

    case 'fintech':
      // Stripe-inspired subtle gradients
      return {
        type: 'mesh-gradient',
        css: isDarkSection
          ? `
            background: linear-gradient(135deg, #262C62 0%, #292C2F 100%);
            background-image: 
              radial-gradient(circle at 10% 20%, rgba(81, 103, 252, 0.15) 0%, transparent 40%),
              radial-gradient(circle at 90% 80%, rgba(77, 182, 172, 0.1) 0%, transparent 40%);
          `
          : `
            background: linear-gradient(180deg, #FCFCFC 0%, #F8FAFC 100%);
            background-image: 
              radial-gradient(circle at 0% 50%, rgba(81, 103, 252, 0.05) 0%, transparent 50%),
              radial-gradient(circle at 100% 50%, rgba(77, 182, 172, 0.03) 0%, transparent 50%);
          `,
        overlayOpacity: 0.02,
      };

    case 'saas':
    case 'saas-enterprise':
    case 'saas-startup':
      // Modern tech gradients with subtle mesh
      return {
        type: 'mesh-gradient',
        css: isDarkSection
          ? `
            background: linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%);
            background-image: 
              radial-gradient(ellipse at 20% 30%, rgba(99, 102, 241, 0.15) 0%, transparent 50%),
              radial-gradient(ellipse at 80% 70%, rgba(6, 182, 212, 0.1) 0%, transparent 50%);
          `
          : `
            background: linear-gradient(180deg, #0F172A 0%, #1E293B 100%);
            background-image: 
              radial-gradient(ellipse at 30% 20%, rgba(99, 102, 241, 0.2) 0%, transparent 50%),
              radial-gradient(ellipse at 70% 80%, rgba(6, 182, 212, 0.15) 0%, transparent 50%);
          `,
        overlayOpacity: 0.03,
      };

    case 'devtools':
      // Matrix-style subtle grid
      return {
        type: 'grid',
        css: isDarkSection
          ? `
            background: #050816;
            background-image: 
              linear-gradient(rgba(59, 130, 246, 0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.03) 1px, transparent 1px);
            background-size: 20px 20px;
          `
          : `
            background: linear-gradient(180deg, #050816 0%, #111827 100%);
            background-image: 
              linear-gradient(rgba(34, 197, 94, 0.02) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.02) 1px, transparent 1px);
            background-size: 24px 24px;
          `,
        overlayOpacity: 0.01,
      };

    case 'creative':
      // Bold, expressive gradients
      return {
        type: 'mesh-gradient',
        css: isDarkSection
          ? `
            background: linear-gradient(135deg, #0A0A0A 0%, #171717 100%);
            background-image: 
              radial-gradient(circle at 10% 90%, rgba(236, 72, 153, 0.2) 0%, transparent 40%),
              radial-gradient(circle at 90% 10%, rgba(6, 182, 212, 0.15) 0%, transparent 40%);
          `
          : `
            background: linear-gradient(180deg, #0A0A0A 0%, #171717 100%);
            background-image: 
              radial-gradient(circle at 20% 80%, rgba(236, 72, 153, 0.15) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(245, 158, 11, 0.1) 0%, transparent 50%);
          `,
        overlayOpacity: 0.02,
      };

    case 'ecommerce':
      // Clean, conversion-focused - minimal distraction
      return {
        type: 'solid',
        css: isDarkSection
          ? `
            background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
            background-image: radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.05) 0%, transparent 70%);
          `
          : `
            background: linear-gradient(180deg, #FFFFFF 0%, #FAFAFA 100%);
          `,
        overlayOpacity: 0.01,
      };

    case 'coaching':
      // Warm, inviting gradients
      return {
        type: 'mesh-gradient',
        css: isDarkSection
          ? `
            background: linear-gradient(135deg, #5B21B6 0%, #1E1B4B 100%);
            background-image: 
              radial-gradient(circle at 30% 70%, rgba(205, 174, 136, 0.15) 0%, transparent 40%),
              radial-gradient(circle at 70% 30%, rgba(167, 139, 250, 0.1) 0%, transparent 40%);
          `
          : `
            background: linear-gradient(180deg, #FFFFFF 0%, #FAF5FF 50%, #FEF3C7 100%);
            background-image: 
              radial-gradient(circle at 20% 80%, rgba(124, 58, 237, 0.03) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(205, 174, 136, 0.05) 0%, transparent 50%);
          `,
        overlayOpacity: 0.01,
      };

    case 'realestate':
      // Elegant, trustworthy
      return {
        type: 'subtle-texture',
        css: isDarkSection
          ? `
            background: linear-gradient(135deg, #047857 0%, #064E3B 100%);
            background-image: radial-gradient(circle at 50% 50%, rgba(212, 175, 55, 0.1) 0%, transparent 60%);
          `
          : `
            background: linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 50%, #ECFDF5 100%);
            background-image: radial-gradient(circle at 80% 20%, rgba(5, 150, 105, 0.03) 0%, transparent 50%);
          `,
        overlayOpacity: 0.01,
      };

    case 'investor':
    case 'beta':
      // Bold, forward-looking
      return {
        type: 'mesh-gradient',
        css: isDarkSection
          ? `
            background: linear-gradient(135deg, #1E1B4B 0%, #0F0F23 100%);
            background-image: 
              radial-gradient(circle at 10% 20%, rgba(124, 58, 237, 0.2) 0%, transparent 40%),
              radial-gradient(circle at 90% 80%, rgba(6, 182, 212, 0.15) 0%, transparent 40%);
          `
          : `
            background: linear-gradient(180deg, #0F0F23 0%, #1E1B4B 100%);
            background-image: 
              radial-gradient(ellipse at 20% 30%, rgba(124, 58, 237, 0.15) 0%, transparent 50%),
              radial-gradient(ellipse at 80% 70%, rgba(6, 182, 212, 0.1) 0%, transparent 50%);
          `,
        overlayOpacity: 0.03,
      };

    default:
      // Fallback - modern SaaS gradient
      return {
        type: 'mesh-gradient',
        css: isDarkSection
          ? `
            background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
            background-image: 
              radial-gradient(ellipse at 20% 30%, rgba(99, 102, 241, 0.1) 0%, transparent 50%),
              radial-gradient(ellipse at 80% 70%, rgba(6, 182, 212, 0.08) 0%, transparent 50%);
          `
          : `
            background: linear-gradient(180deg, #0F172A 0%, #1E293B 100%);
            background-image: 
              radial-gradient(ellipse at 30% 20%, rgba(99, 102, 241, 0.15) 0%, transparent 50%),
              radial-gradient(ellipse at 70% 80%, rgba(6, 182, 212, 0.1) 0%, transparent 50%);
          `,
        overlayOpacity: 0.02,
      };
  }
}

/**
 * Get ambient hero gradient when no AI image is available
 * These are more dramatic gradients suitable for hero sections
 */
export function getAmbientHeroGradient(
  industry: IndustryVariant,
  mode: 'light' | 'dark' = 'dark'
): string {
  switch (industry) {
    case 'manufacturing':
      return mode === 'light'
        ? `linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 25%, #F1F5F9 50%, #FFFFFF 100%)`
        : `linear-gradient(135deg, #1E3A5F 0%, #0F172A 50%, #1E293B 100%)`;

    case 'healthcare':
    case 'healthtech':
      return `linear-gradient(135deg, #F0FDFA 0%, #CCFBF1 25%, #E0F2FE 50%, #FFFFFF 100%)`;

    case 'consulting':
      return mode === 'light'
        ? `linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 30%, #EFF6FF 60%, #FFFFFF 100%)`
        : `linear-gradient(135deg, #1E3A5F 0%, #1E293B 50%, #0F172A 100%)`;

    case 'fintech':
      return `linear-gradient(135deg, #262C62 0%, #1E1B4B 30%, #292C2F 60%, #1F2937 100%)`;

    case 'saas':
    case 'saas-enterprise':
    case 'saas-startup':
    case 'devtools':
      return `linear-gradient(135deg, #0F172A 0%, #1E293B 30%, #312E81 60%, #0F172A 100%)`;

    case 'creative':
      return `linear-gradient(135deg, #0A0A0A 0%, #171717 30%, #1F1F1F 60%, #0A0A0A 100%)`;

    case 'coaching':
      return mode === 'light'
        ? `linear-gradient(135deg, #FFFFFF 0%, #FAF5FF 30%, #FEF3C7 60%, #FFFFFF 100%)`
        : `linear-gradient(135deg, #5B21B6 0%, #3B0764 50%, #1E1B4B 100%)`;

    case 'ecommerce':
      return `linear-gradient(180deg, #FFFFFF 0%, #FAFAFA 50%, #F5F5F5 100%)`;

    case 'realestate':
      return `linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 30%, #ECFDF5 60%, #FFFFFF 100%)`;

    case 'investor':
    case 'beta':
      return `linear-gradient(135deg, #0F0F23 0%, #1E1B4B 30%, #312E81 60%, #0F0F23 100%)`;

    default:
      return mode === 'dark'
        ? `linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)`
        : `linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)`;
  }
}

/**
 * Generate CSS variables for industry patterns
 * Can be injected into a section's style attribute
 */
export function getPatternCSSVariables(pattern: PatternConfig): Record<string, string> {
  return {
    '--section-background': pattern.css,
    '--section-overlay-opacity': String(pattern.overlayOpacity || 0.02),
  };
}
