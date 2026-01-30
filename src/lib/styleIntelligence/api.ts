/**
 * STYLE INTELLIGENCE API
 * 
 * Client-side functions to interact with the style extraction edge function.
 */

import { supabase } from '@/integrations/supabase/client';
import type { StyleInspiration, BrandColors, BlendedStyle, StyleInspirationResult } from './types';
import { blendStyleWithBrand } from './blender';

/**
 * Extract visual DNA from an inspiration website
 */
export async function extractStyleInspiration(url: string): Promise<StyleInspirationResult> {
  try {
    console.log('[StyleIntelligence] Extracting from:', url);
    
    const { data, error } = await supabase.functions.invoke('extract-style-inspiration', {
      body: { url }
    });
    
    if (error) {
      console.error('[StyleIntelligence] Edge function error:', error);
      return { success: false, error: error.message };
    }
    
    if (!data.success) {
      return { success: false, error: data.error || 'Failed to extract style' };
    }
    
    // Extract the StyleInspiration from response
    const inspiration: StyleInspiration = {
      colors: data.colors,
      typography: data.typography,
      spacing: data.spacing,
      components: data.components,
      effects: data.effects,
      mood: data.mood,
      sourceUrl: data.sourceUrl,
      extractionConfidence: data.extractionConfidence,
    };
    
    console.log('[StyleIntelligence] Extracted:', {
      mood: inspiration.mood.primary,
      primaryColor: inspiration.colors.primary,
      headingFont: inspiration.typography.headingFont,
      confidence: inspiration.extractionConfidence,
    });
    
    return { success: true, inspiration };
  } catch (error) {
    console.error('[StyleIntelligence] Error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Extract style and blend with brand colors in one call
 */
export async function extractAndBlendStyle(
  inspirationUrl: string,
  brandColors: BrandColors,
  options: { prioritizeInspirationColors?: boolean } = {}
): Promise<StyleInspirationResult> {
  const extractResult = await extractStyleInspiration(inspirationUrl);
  
  if (!extractResult.success || !extractResult.inspiration) {
    return extractResult;
  }
  
  const blendedStyle = blendStyleWithBrand(
    extractResult.inspiration,
    brandColors,
    options
  );
  
  return {
    success: true,
    inspiration: extractResult.inspiration,
    blendedStyle,
  };
}

/**
 * Store inspiration URL in localStorage for persistence across navigation
 */
export function saveInspirationUrl(url: string): void {
  try {
    const existing = getInspirationUrls();
    if (!existing.includes(url)) {
      existing.unshift(url);
      localStorage.setItem('pageconsult_inspiration_urls', JSON.stringify(existing.slice(0, 5)));
    }
  } catch (e) {
    console.warn('[StyleIntelligence] Failed to save inspiration URL:', e);
  }
}

/**
 * Get saved inspiration URLs from localStorage
 */
export function getInspirationUrls(): string[] {
  try {
    const saved = localStorage.getItem('pageconsult_inspiration_urls');
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
}

/**
 * Store extracted style in localStorage
 */
export function saveExtractedStyle(style: StyleInspiration): void {
  try {
    localStorage.setItem('pageconsult_inspiration_style', JSON.stringify(style));
  } catch (e) {
    console.warn('[StyleIntelligence] Failed to save style:', e);
  }
}

/**
 * Get saved style from localStorage
 */
export function getSavedStyle(): StyleInspiration | null {
  try {
    const saved = localStorage.getItem('pageconsult_inspiration_style');
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    return null;
  }
}

/**
 * Clear saved inspiration data
 */
export function clearInspirationData(): void {
  localStorage.removeItem('pageconsult_inspiration_urls');
  localStorage.removeItem('pageconsult_inspiration_style');
}
