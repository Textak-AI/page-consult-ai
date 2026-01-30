/**
 * STYLE INTELLIGENCE API
 * 
 * Client-side functions to interact with the style extraction edge function.
 * Supports database persistence and Vision AI analysis.
 */

import { supabase } from '@/integrations/supabase/client';
import type { StyleInspiration, BrandColors, BlendedStyle, StyleInspirationResult, InspirationSiteRecord } from './types';
import { blendStyleWithBrand } from './blender';

/**
 * Extract visual DNA from an inspiration website
 */
export async function extractStyleInspiration(
  url: string, 
  options: { useVisionAI?: boolean } = {}
): Promise<StyleInspirationResult> {
  try {
    console.log('[StyleIntelligence] Extracting from:', url);
    
    const { data, error } = await supabase.functions.invoke('extract-style-inspiration', {
      body: { url, useVisionAI: options.useVisionAI ?? true }
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
      visionAnalysis: data.visionAnalysis,
      sourceUrl: data.sourceUrl,
      screenshotUrl: data.screenshotUrl,
      extractionConfidence: data.extractionConfidence,
    };
    
    console.log('[StyleIntelligence] Extracted:', {
      mood: inspiration.mood.primary,
      primaryColor: inspiration.colors.primary,
      headingFont: inspiration.typography.headingFont,
      visionPatterns: inspiration.visionAnalysis?.patterns,
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
  options: { prioritizeInspirationColors?: boolean; useVisionAI?: boolean } = {}
): Promise<StyleInspirationResult> {
  const extractResult = await extractStyleInspiration(inspirationUrl, { 
    useVisionAI: options.useVisionAI 
  });
  
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
 * Save inspiration site to database
 */
export async function saveInspirationSite(
  url: string,
  extractedStyle: StyleInspiration,
  brandId?: string
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Must be logged in to save inspiration sites' };
    }

    const insertData = {
      user_id: user.id,
      brand_id: brandId || null,
      url: url,
      screenshot_url: extractedStyle.screenshotUrl || null,
      extracted_style: extractedStyle as unknown as Record<string, unknown>,
      extraction_confidence: extractedStyle.extractionConfidence,
    };

    // Use 'any' cast since the table was just created and types haven't regenerated yet
    const { data, error } = await (supabase
      .from('inspiration_sites') as any)
      .insert(insertData)
      .select('id')
      .single();

    if (error) {
      console.error('[StyleIntelligence] Save error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data.id };
  } catch (error) {
    console.error('[StyleIntelligence] Save error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to save' 
    };
  }
}

/**
 * Get saved inspiration sites for the current user
 */
export async function getInspirationSites(
  brandId?: string
): Promise<{ success: boolean; sites?: InspirationSiteRecord[]; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Must be logged in' };
    }

    // Use 'any' cast since the table was just created and types haven't regenerated yet
    let query = (supabase
      .from('inspiration_sites') as any)
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (brandId) {
      query = query.eq('brand_id', brandId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[StyleIntelligence] Fetch error:', error);
      return { success: false, error: error.message };
    }

    // Map the database response to our interface
    const sites: InspirationSiteRecord[] = (data || []).map((row) => ({
      id: row.id,
      user_id: row.user_id,
      brand_id: row.brand_id,
      url: row.url,
      screenshot_url: row.screenshot_url,
      extracted_style: row.extracted_style as unknown as StyleInspiration | null,
      extraction_confidence: row.extraction_confidence as 'high' | 'medium' | 'low' | null,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));

    return { success: true, sites };
  } catch (error) {
    console.error('[StyleIntelligence] Fetch error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch' 
    };
  }
}

/**
 * Delete an inspiration site
 */
export async function deleteInspirationSite(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Use 'any' cast since the table was just created and types haven't regenerated yet
    const { error } = await (supabase
      .from('inspiration_sites') as any)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[StyleIntelligence] Delete error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('[StyleIntelligence] Delete error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete' 
    };
  }
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
