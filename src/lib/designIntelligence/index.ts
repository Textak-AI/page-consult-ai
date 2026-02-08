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
  
  // 2. Industry resolution with CLEAR PRIORITY ORDER:
  // Priority 1: consultationIndustry (explicit field from consultation - user confirmed)
  // Priority 2: industryCategory from extraction (with confidence check)
  // Priority 3: localStorage detection (from IntelligenceContext)
  // Priority 4: Text-based detection (last resort)
  let industry: string;
  const textDetectedIndustry = detectIndustry(conversationText); // Always compute for logging
  
  if (consultationIndustry && consultationIndustry !== 'default' && consultationIndustry.length > 2) {
    // BUG 3 FIX: Consultation industry ALWAYS takes priority
    industry = consultationIndustry;
    console.log(`🎨 [SDI] Industry resolution: {fromConsultation: '${consultationIndustry}', fromTextDetection: '${textDetectedIndustry}', resolved: '${industry}'}`);
  } else if (industryCategory && industryCategory !== 'default' && industryConfidence !== 'low') {
    industry = industryCategory;
    console.log(`🎨 [SDI] Industry resolution: {fromConsultation: null, fromIndustryCategory: '${industryCategory}', fromTextDetection: '${textDetectedIndustry}', resolved: '${industry}'}`);
  } else {
    // detectIndustry now checks localStorage first before text detection
    industry = textDetectedIndustry;
    console.log(`🎨 [SDI] Industry resolution: {fromConsultation: null, fromTextDetection: '${textDetectedIndustry}', resolved: '${industry}'}`);
  }
  
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
    // NEW: Layout template fields
    layoutId: layoutResult.layoutId,
    layoutSections: layoutResult.sections as string[],
    layoutConfidence: layoutResult.confidence,
    layoutReasoning: layoutResult.reasoning,
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
