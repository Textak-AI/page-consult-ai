/**
 * STRATEGIC DESIGN INTELLIGENCE - MAIN ORCHESTRATOR
 * 
 * Combines all detection systems to produce a complete design recommendation.
 * The user never picks fonts, colors, or layouts - the system infers everything.
 */

import { detectTone, getTypographyRecommendation, ToneProfile, TypographyRecommendation } from './toneDetector';
import { detectIndustry, detectEmotionalDrivers, getColorPalette, ColorPalette, EmotionalDriver } from './colorIntelligence';
import { detectAwarenessLevel, getPageStructure, AwarenessLevel, PageStructure } from './awarenessDetector';
import { analyzeProofDensity, getVisualWeightConfig, extractProofPoints, ProofDensity, VisualWeightConfig, ProofPoints } from './proofDensityAnalyzer';
import { selectLayout, type LayoutSelectionResult } from '@/lib/layoutSelector';
import type { IndustryVariant } from '@/lib/industryDesignSystem';
import type { SDIPalette, SDISectionThemes, SDITypography } from './types';
import { resolveIndustry } from '@/lib/resolveIndustry';

// ============================================================================
// SDI HELPER FUNCTIONS & INDUSTRY DEFAULTS
// ============================================================================

/**
 * Convert hex color to rgba string
 */
function hexToRgba(hex: string, alpha: number): string {
  // Handle shorthand hex
  let fullHex = hex;
  if (hex.length === 4) {
    fullHex = '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
  }
  const r = parseInt(fullHex.slice(1, 3), 16);
  const g = parseInt(fullHex.slice(3, 5), 16);
  const b = parseInt(fullHex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Industry-specific default colors (used when no brand color is extracted)
 */
const industryDefaults: Record<string, { primary: string; darkBg: string }> = {
  consulting: { primary: '#1e3a5f', darkBg: '#1e3a5f' },     // Navy - authority
  saas: { primary: '#6366f1', darkBg: '#1e1b4b' },           // Indigo - innovative
  technology: { primary: '#6366f1', darkBg: '#1e1b4b' },     // Indigo
  healthcare: { primary: '#0d9488', darkBg: '#134e4a' },     // Teal - trust
  medical: { primary: '#0d9488', darkBg: '#134e4a' },        // Teal
  finance: { primary: '#1e40af', darkBg: '#1e3a8a' },        // Blue - stability
  manufacturing: { primary: '#374151', darkBg: '#1f2937' },  // Gray - industrial
  industrial: { primary: '#374151', darkBg: '#1f2937' },     // Gray
  ecommerce: { primary: '#7c3aed', darkBg: '#4c1d95' },      // Purple - creative
  retail: { primary: '#7c3aed', darkBg: '#4c1d95' },         // Purple
  coaching: { primary: '#b45309', darkBg: '#78350f' },       // Amber - warm
  creative: { primary: '#db2777', darkBg: '#831843' },       // Pink - bold
  realestate: { primary: '#0369a1', darkBg: '#0c4a6e' },     // Sky - aspirational
  legal: { primary: '#1e3a5f', darkBg: '#1e3a5f' },          // Navy - trust
  education: { primary: '#0891b2', darkBg: '#164e63' },      // Cyan - approachable
  nonprofit: { primary: '#059669', darkBg: '#065f46' },      // Emerald - growth
  hospitality: { primary: '#be185d', darkBg: '#831843' },    // Rose - welcoming
  default: { primary: '#475569', darkBg: '#334155' },        // Slate - neutral
};

/**
 * Generate SDI color palette from brand color and industry
 */
export function generateSDIPalette(
  brandPrimaryColor: string | null | undefined,
  industry: string
): SDIPalette {
  const normalizedIndustry = industry?.toLowerCase() || 'default';
  const defaults = industryDefaults[normalizedIndustry] || industryDefaults.default;
  const primary = brandPrimaryColor || defaults.primary;
  const darkBg = brandPrimaryColor || defaults.darkBg;
  
  const palette: SDIPalette = {
    primary,
    primaryTint: hexToRgba(primary, 0.06),
    darkSection: darkBg,
    lightSection: '#ffffff',
    iconBg: hexToRgba(primary, 0.12),
    iconColor: primary,
    text: {
      onLight: '#1e293b',
      onDark: '#ffffff',
      muted: '#64748b',
    },
  };
  
  console.log('🎨 [SDI] Generated palette:', palette);
  return palette;
}

/**
 * Compute section themes based on industry vertical
 */
export function computeSectionThemes(industry: string): SDISectionThemes {
  const normalizedIndustry = industry?.toLowerCase() || 'default';
  
  let themes: SDISectionThemes;
  
  // Consulting/Finance/Legal: authority positioning
  if (['consulting', 'finance', 'legal'].includes(normalizedIndustry)) {
    themes = {
      'hero': 'image',
      'credentials-bar': 'light',
      'the-real-challenge': 'tinted',
      'our-approach': 'dark',
      'expertise-areas': 'light',
      'client-results': 'tinted',
      'engagement-model': 'light',
      'faq': 'tinted',
      'final-cta': 'dark',
    };
  }
  // SaaS/Technology: modern, clean
  else if (['saas', 'technology'].includes(normalizedIndustry)) {
    themes = {
      'hero': 'image',
      'credentials-bar': 'light',
      'the-real-challenge': 'light',
      'our-approach': 'tinted',
      'expertise-areas': 'light',
      'client-results': 'dark',
      'engagement-model': 'light',
      'faq': 'tinted',
      'final-cta': 'dark',
    };
  }
  // Healthcare/Medical: trust-focused
  else if (['healthcare', 'medical'].includes(normalizedIndustry)) {
    themes = {
      'hero': 'image',
      'credentials-bar': 'tinted',
      'the-real-challenge': 'light',
      'our-approach': 'tinted',
      'expertise-areas': 'light',
      'client-results': 'tinted',
      'engagement-model': 'light',
      'faq': 'light',
      'final-cta': 'dark',
    };
  }
  // Coaching/Creative: warm, energetic
  else if (['coaching', 'creative'].includes(normalizedIndustry)) {
    themes = {
      'hero': 'image',
      'credentials-bar': 'light',
      'the-real-challenge': 'dark',
      'our-approach': 'light',
      'expertise-areas': 'tinted',
      'client-results': 'light',
      'engagement-model': 'tinted',
      'faq': 'light',
      'final-cta': 'dark',
    };
  }
  // E-commerce/Retail: conversion-focused
  else if (['ecommerce', 'retail'].includes(normalizedIndustry)) {
    themes = {
      'hero': 'image',
      'credentials-bar': 'light',
      'the-real-challenge': 'tinted',
      'our-approach': 'light',
      'expertise-areas': 'tinted',
      'client-results': 'dark',
      'engagement-model': 'light',
      'faq': 'tinted',
      'final-cta': 'dark',
    };
  }
  // Manufacturing/Industrial: solid, grounded
  else if (['manufacturing', 'industrial'].includes(normalizedIndustry)) {
    themes = {
      'hero': 'image',
      'credentials-bar': 'tinted',
      'the-real-challenge': 'light',
      'our-approach': 'dark',
      'expertise-areas': 'tinted',
      'client-results': 'light',
      'engagement-model': 'tinted',
      'faq': 'light',
      'final-cta': 'dark',
    };
  }
  // Default: balanced rhythm
  else {
    themes = {
      'hero': 'image',
      'credentials-bar': 'light',
      'the-real-challenge': 'tinted',
      'our-approach': 'light',
      'expertise-areas': 'tinted',
      'client-results': 'light',
      'engagement-model': 'tinted',
      'faq': 'light',
      'final-cta': 'dark',
    };
  }
  
  console.log('🎨 [SDI] Section themes for', industry, ':', themes);
  return themes;
}

/**
 * Compute typography classes based on industry vertical
 */
export function computeSDITypography(industry: string): SDITypography {
  const normalizedIndustry = industry?.toLowerCase() || 'default';
  
  // Consulting/Finance/Legal: larger, more commanding
  if (['consulting', 'finance', 'legal'].includes(normalizedIndustry)) {
    return {
      heroHeadline: 'text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.1]',
      sectionTitle: 'text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight',
      sectionSubtitle: 'text-lg md:text-xl',
      cardTitle: 'text-xl font-semibold',
      body: 'text-base md:text-lg leading-relaxed',
    };
  }
  
  // SaaS/Technology: modern, slightly smaller
  if (['saas', 'technology'].includes(normalizedIndustry)) {
    return {
      heroHeadline: 'text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight leading-[1.15]',
      sectionTitle: 'text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight',
      sectionSubtitle: 'text-base md:text-lg',
      cardTitle: 'text-lg font-semibold',
      body: 'text-base leading-relaxed',
    };
  }
  
  // Default
  return {
    heroHeadline: 'text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight leading-[1.15]',
    sectionTitle: 'text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight',
    sectionSubtitle: 'text-base md:text-lg',
    cardTitle: 'text-lg font-semibold',
    body: 'text-base leading-relaxed',
  };
}

// ============================================================================
// DESIGN INTELLIGENCE INTERFACES
// ============================================================================

export interface DesignIntelligenceInput {
  conversationText: string;
  extractedIntelligence: any;
  targetMarket?: string;
  // Pre-detected industry from consultation (avoids re-detection)
  industryCategory?: string;
  industryConfidence?: 'high' | 'medium' | 'low';
  // BUG 3 FIX: Consultation industry field takes PRIORITY over text detection
  // This is the explicit industry field from consultation (e.g., "venture studio")
  consultationIndustry?: string;
  // Page type for layout selection
  pageType?: 'standard' | 'beta-prelaunch' | 'demo' | 'sales' | null;
}

export interface DesignIntelligenceOutput {
  // Detection results
  tone: ToneProfile;
  industry: string;
  emotionalDrivers: EmotionalDriver[];
  awarenessLevel: AwarenessLevel;
  proofDensity: ProofDensity;
  proofPoints: ProofPoints;
  
  // Design recommendations
  typography: TypographyRecommendation;
  colors: ColorPalette;
  pageStructure: PageStructure;
  visualWeight: VisualWeightConfig;
  
  // NEW: Layout template selection
  layoutId: string;
  layoutSections: string[];
  layoutConfidence: 'high' | 'medium' | 'low';
  layoutReasoning: string;
  
  // NEW: SDI Dynamic Design System (optional for backward compatibility)
  palette?: SDIPalette;
  sectionThemes?: SDISectionThemes;
  sdiTypography?: SDITypography;
  
  // Summary for brief
  summary: {
    designRationale: string;
    keyDecisions: string[];
  };
}

export function generateDesignIntelligence(input: DesignIntelligenceInput): DesignIntelligenceOutput {
  console.log('🎨 [SDI] Starting design intelligence analysis...');
  
  const { conversationText, extractedIntelligence, targetMarket, industryCategory, industryConfidence, consultationIndustry, pageType } = input;
  
  // 1. Detect tone from conversation
  const tone = detectTone(conversationText);
  const typography = getTypographyRecommendation(tone);
  
  // 2. Industry resolution via unified resolveIndustry utility
  const textDetectedIndustry = detectIndustry(conversationText); // Always compute for logging
  
  const resolution = resolveIndustry(
    consultationIndustry || industryCategory || textDetectedIndustry,
    industryCategory || textDetectedIndustry,
    industryConfidence || 'medium'
  );
  const industry = resolution.industry;
  
  console.log(`🎨 [SDI] Industry resolution: {resolved: '${industry}', source: '${resolution.source}', confidence: '${resolution.confidence}', inputs: {consultation: '${consultationIndustry}', category: '${industryCategory}', textDetected: '${textDetectedIndustry}'}}`);
  
  const emotionalDrivers = detectEmotionalDrivers(conversationText);
  const colors = getColorPalette(industry, targetMarket, emotionalDrivers);
  
  // 3. Detect buyer awareness level
  const awarenessLevel = detectAwarenessLevel(conversationText);
  const pageStructure = getPageStructure(awarenessLevel);
  
  // 4. Analyze proof density
  const proofPoints = extractProofPoints(extractedIntelligence);
  const proofDensity = analyzeProofDensity(proofPoints);
  const visualWeight = getVisualWeightConfig(proofDensity);
  
  // 5. NEW: Select layout template based on industry + awareness + proof density
  const layoutResult = selectLayout({
    industry: industry as IndustryVariant,
    awarenessLevel: awarenessLevel as any,
    pageType: pageType || 'standard',
    proofDensity,
    availableProof: {
      hasTestimonials: (proofPoints.testimonials?.length || 0) > 0,
      hasStats: !!(proofPoints.clientCount || proofPoints.yearsInBusiness || 
                   (proofPoints.percentageStats?.length || 0) > 0),
      hasProcess: false, // Would need to detect from intelligence
      hasFAQ: true,
      hasCredentials: (proofPoints.certifications?.length || 0) > 0,
      hasCaseStudies: (proofPoints.caseStudies?.length || 0) > 0,
    },
  });
  
  console.log('📐 [SDI] Layout selection:', {
    layoutId: layoutResult.layoutId,
    sections: layoutResult.sections,
    confidence: layoutResult.confidence,
    reasoning: layoutResult.reasoning,
  });
  
  // 6. Generate summary
  const keyDecisions = [
    `Typography: ${typography.headingFont}/${typography.bodyFont} - ${typography.reasoning}`,
    `Colors: ${colors.mode} mode with ${colors.primary} primary - ${colors.reasoning}`,
    `Layout: ${layoutResult.layoutId} (${layoutResult.confidence} confidence) - ${layoutResult.reasoning}`,
    `Visual Weight: ${visualWeight.statsBar} stats, ${visualWeight.testimonialStyle} testimonials - ${visualWeight.reasoning}`
  ];
  
  // 7. NEW: Generate dynamic SDI design system
  // Brand color priority: explicit brandSettings > extractedIntelligence > industry default
  const brandColor = extractedIntelligence?.brandSettings?.primaryColor || 
                     extractedIntelligence?.primaryColor ||
                     extractedIntelligence?.brandColors?.primary ||
                     (extractedIntelligence?.colors as string[] | undefined)?.[0] ||
                     null;
  
  const brandSource = extractedIntelligence?.brandSettings?.primaryColor ? 'brandSettings'
    : extractedIntelligence?.primaryColor ? 'extractedIntelligence.primaryColor'
    : extractedIntelligence?.brandColors?.primary ? 'extractedIntelligence.brandColors'
    : (extractedIntelligence?.colors as string[] | undefined)?.[0] ? 'extractedIntelligence.colors[0]'
    : 'industry-default';
  
  const palette = generateSDIPalette(brandColor, industry);
  const sectionThemes = computeSectionThemes(industry);
  const sdiTypographyConfig = computeSDITypography(industry);
  
  console.log('🎨 [SDI] Dynamic design system generated:', {
    brandColor,
    brandSource,
    industry,
    paletteGenerated: !!palette,
    themesGenerated: !!sectionThemes,
    typographyGenerated: !!sdiTypographyConfig,
  });
  
  const output: DesignIntelligenceOutput = {
    tone,
    industry,
    emotionalDrivers,
    awarenessLevel,
    proofDensity,
    proofPoints,
    typography,
    colors,
    pageStructure,
    visualWeight,
    // Layout template fields
    layoutId: layoutResult.layoutId,
    layoutSections: layoutResult.sections as string[],
    layoutConfidence: layoutResult.confidence,
    layoutReasoning: layoutResult.reasoning,
    // NEW: SDI Dynamic Design System
    palette,
    sectionThemes,
    sdiTypography: sdiTypographyConfig,
    summary: {
      designRationale: `Detected ${tone.primary} tone in ${industry} context with ${awarenessLevel} buyer awareness. ${proofDensity} proof density. Using ${layoutResult.layoutId} layout.`,
      keyDecisions
    }
  };
  
  console.log('🎨 [SDI] Design intelligence complete:', output.summary);
  
  return output;
}

// Re-export types for consumers
export type { ToneProfile, TypographyRecommendation } from './toneDetector';
export type { ColorPalette, EmotionalDriver } from './colorIntelligence';
export type { AwarenessLevel, PageStructure } from './awarenessDetector';
export type { ProofDensity, VisualWeightConfig, ProofPoints } from './proofDensityAnalyzer';
export type { SDIPalette, SDISectionThemes, SDITypography, SectionTheme, SDIDesignConfig } from './types';
