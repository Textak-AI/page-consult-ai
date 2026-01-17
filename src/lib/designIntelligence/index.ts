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

export interface DesignIntelligenceInput {
  conversationText: string;
  extractedIntelligence: any;
  targetMarket?: string;
  // Pre-detected industry from consultation (avoids re-detection)
  industryCategory?: string;
  industryConfidence?: 'high' | 'medium' | 'low';
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
  
  // Summary for brief
  summary: {
    designRationale: string;
    keyDecisions: string[];
  };
}

export function generateDesignIntelligence(input: DesignIntelligenceInput): DesignIntelligenceOutput {
  console.log('🎨 [SDI] Starting design intelligence analysis...');
  
  const { conversationText, extractedIntelligence, targetMarket, industryCategory, industryConfidence } = input;
  
  // 1. Detect tone from conversation
  const tone = detectTone(conversationText);
  const typography = getTypographyRecommendation(tone);
  
  // 2. Use pre-detected industry if available (already intelligently detected during consultation)
  let industry: string;
  if (industryCategory && industryConfidence !== 'low') {
    industry = industryCategory;
    console.log(`🎨 [SDI] Using pre-detected industry: ${industry} (confidence: ${industryConfidence})`);
  } else {
    industry = detectIndustry(conversationText);
    console.log(`🎨 [SDI] Industry detected from text: ${industry}`);
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
  
  // 5. Generate summary
  const keyDecisions = [
    `Typography: ${typography.headingFont}/${typography.bodyFont} - ${typography.reasoning}`,
    `Colors: ${colors.mode} mode with ${colors.primary} primary - ${colors.reasoning}`,
    `Layout: ${pageStructure.heroStyle} hero, ${pageStructure.ctaStrategy} CTA strategy - ${pageStructure.reasoning}`,
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
    summary: {
      designRationale: `Detected ${tone.primary} tone in ${industry} context with ${awarenessLevel} buyer awareness. ${proofDensity} proof density available.`,
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
