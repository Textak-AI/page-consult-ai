/**
 * Hero Image Resolution Hook
 * 
 * Implements the "minimal, intentional imagery" philosophy for hero sections.
 * Resolution order:
 * 1. User-selected hero image from consultation (highest priority)
 * 2. Cached AI-generated image for this consultation/page
 * 3. Generate fresh AI image, cache it, return the first result
 * 4. Fallback to industry-aware ambient gradient (CSS-first)
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { IndustryVariant } from '@/lib/industryDesignSystem';
import { getAmbientHeroGradient } from '@/lib/industryPatterns';

export interface HeroImageResolutionResult {
  imageUrl: string | null;
  ambientGradient: string;
  isLoading: boolean;
  isFromCache: boolean;
  isAIGenerated: boolean;
  error: string | null;
}

export interface HeroImageResolutionOptions {
  userSelectedUrl?: string | null;
  consultationId?: string;
  sessionId?: string;
  businessName?: string;
  industry?: string;
  industryVariant?: IndustryVariant;
  colorMode?: 'light' | 'dark';
}

/**
 * Industry-specific scene prompts for AI hero generation
 */
const INDUSTRY_SCENES: Record<string, string> = {
  'manufacturing': 'Modern industrial facility with clean lines, precision machinery, soft ambient lighting, professional manufacturing environment',
  'healthcare': 'Bright, clean medical environment with natural light, modern healthcare facility, calming atmosphere, white and teal tones',
  'healthtech': 'Clean modern medical technology office, digital health environment, professional and trustworthy',
  'consulting': 'Professional executive office space with city skyline view, warm natural lighting, sophisticated business environment',
  'coaching': 'Inspiring modern workspace with natural light, warm and inviting atmosphere, professional development setting',
  'fintech': 'Sleek modern office with subtle blue accents, financial technology environment, sophisticated and trustworthy',
  'finance': 'Modern financial office with city views, clean lines, professional and secure atmosphere',
  'saas': 'Modern tech workspace with ambient lighting, clean minimalist design, subtle purple and blue gradients in background',
  'saas-enterprise': 'Corporate technology environment with sophisticated lighting, enterprise-grade professional setting',
  'saas-startup': 'Dynamic startup office with creative energy, modern tech environment, vibrant yet professional',
  'devtools': 'Developer workspace with subtle code elements, modern tech environment, dark theme with accent lighting',
  'creative': 'Modern creative studio with dramatic lighting, artistic environment, bold and expressive atmosphere',
  'ecommerce': 'Clean product photography style, minimalist backdrop, professional commercial setting',
  'realestate': 'Beautiful architectural interior with natural light, modern luxury space, welcoming atmosphere',
  'legal': 'Traditional professional office with warm wood tones, law library aesthetic, sophisticated and trustworthy',
  'local-services': 'Clean professional service environment, trustworthy local business setting, warm and approachable',
  'investor': 'Bold futuristic tech environment, venture capital office aesthetic, cutting-edge innovation setting',
  'beta': 'Modern product launch environment, anticipation and innovation, sleek tech preview setting',
};

/**
 * Build an AI image generation prompt for the hero section
 */
function buildHeroPrompt(industry: string, businessContext?: string): string {
  const industryLower = industry.toLowerCase();
  
  // Find matching industry scene
  const baseScene = Object.entries(INDUSTRY_SCENES).find(([key]) => 
    industryLower.includes(key)
  )?.[1] || 'Professional modern business environment with clean design and ambient lighting';
  
  // Build the final prompt - optimized for text overlay
  const contextSuffix = businessContext ? ` ${businessContext} industry context.` : '';
  
  return `${baseScene}. Subtle, professional background suitable for text overlay. No people or faces. Soft focus on background elements. High quality photography style. 16:9 aspect ratio. Cinematic lighting.${contextSuffix}`;
}

/**
 * Generate a cache key for hero images
 */
function buildCacheKey(opts: HeroImageResolutionOptions): string {
  const parts: string[] = [];
  
  if (opts.consultationId) {
    parts.push(`consultation::${opts.consultationId}`);
  } else if (opts.sessionId) {
    parts.push(`session::${opts.sessionId}`);
  } else {
    parts.push('adhoc');
  }
  
  const industry = (opts.industryVariant || opts.industry || 'default').toLowerCase();
  parts.push(industry);
  
  if (opts.businessName) {
    const slug = opts.businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30);
    parts.push(slug);
  }
  
  return parts.join('::');
}

/**
 * Hook to resolve hero image with caching and fallback
 */
export function useHeroImageResolution() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  /**
   * Resolve the hero image for a page
   * @returns The resolved image URL or null (with ambient gradient fallback)
   */
  const resolveHeroImage = useCallback(async (
    opts: HeroImageResolutionOptions
  ): Promise<HeroImageResolutionResult> => {
    const variant = opts.industryVariant || 'default';
    const mode = opts.colorMode || 'dark';
    const ambientGradient = getAmbientHeroGradient(variant as any, mode);
    
    // Priority 1: User-selected hero image
    if (opts.userSelectedUrl) {
      console.log('🖼️ [HeroResolution] Using user-selected image');
      return {
        imageUrl: opts.userSelectedUrl,
        ambientGradient,
        isLoading: false,
        isFromCache: false,
        isAIGenerated: false,
        error: null,
      };
    }
    
    setIsLoading(true);
    setError(null);
    
    const cacheKey = buildCacheKey(opts);
    console.log('🖼️ [HeroResolution] Resolving hero for cacheKey:', cacheKey);
    
    try {
      // Priority 2 & 3: Generate (with internal caching in edge function)
      const prompt = buildHeroPrompt(
        opts.industryVariant || opts.industry || 'professional services',
        opts.businessName
      );
      
      console.log('🖼️ [HeroResolution] Calling generate-hero-images with prompt:', prompt.slice(0, 100) + '...');
      
      const { data, error: invokeError } = await supabase.functions.invoke('generate-hero-images', {
        body: {
          prompts: [prompt],
          cacheKey,
        },
      });
      
      if (invokeError) {
        console.error('❌ [HeroResolution] Edge function error:', invokeError);
        throw new Error(invokeError.message);
      }
      
      if (data?.images?.[0]?.url) {
        const isFromCache = data.fromCache === true;
        console.log(`✅ [HeroResolution] Got image (${isFromCache ? 'from cache' : 'freshly generated'})`);
        
        setIsLoading(false);
        return {
          imageUrl: data.images[0].url,
          ambientGradient,
          isLoading: false,
          isFromCache,
          isAIGenerated: true,
          error: null,
        };
      }
      
      // No image returned - fall back to ambient gradient
      console.warn('⚠️ [HeroResolution] No image returned, using ambient gradient');
      setIsLoading(false);
      return {
        imageUrl: null,
        ambientGradient,
        isLoading: false,
        isFromCache: false,
        isAIGenerated: false,
        error: 'No image generated',
      };
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('❌ [HeroResolution] Error:', errorMessage);
      
      setIsLoading(false);
      setError(errorMessage);
      
      // Return ambient gradient as fallback
      return {
        imageUrl: null,
        ambientGradient,
        isLoading: false,
        isFromCache: false,
        isAIGenerated: false,
        error: errorMessage,
      };
    }
  }, []);
  
  return {
    resolveHeroImage,
    isLoading,
    error,
  };
}

/**
 * Standalone function for use in non-hook contexts (e.g., page generation)
 */
export async function resolveHeroImageUrl(
  opts: HeroImageResolutionOptions
): Promise<{ imageUrl: string | null; ambientGradient: string; isFromCache: boolean }> {
  const variant = opts.industryVariant || 'default';
  const mode = opts.colorMode || 'dark';
  const ambientGradient = getAmbientHeroGradient(variant as any, mode);
  
  // Priority 1: User-selected
  if (opts.userSelectedUrl) {
    console.log('🖼️ [resolveHeroImageUrl] Using user-selected image');
    return { imageUrl: opts.userSelectedUrl, ambientGradient, isFromCache: false };
  }
  
  const cacheKey = buildCacheKey(opts);
  
  try {
    const prompt = buildHeroPrompt(
      opts.industryVariant || opts.industry || 'professional services',
      opts.businessName
    );
    
    console.log('🖼️ [resolveHeroImageUrl] Generating hero for:', cacheKey);
    
    const { data, error } = await supabase.functions.invoke('generate-hero-images', {
      body: {
        prompts: [prompt],
        cacheKey,
      },
    });
    
    if (!error && data?.images?.[0]?.url) {
      console.log(`✅ [resolveHeroImageUrl] Success (cached: ${data.fromCache})`);
      return { 
        imageUrl: data.images[0].url, 
        ambientGradient, 
        isFromCache: data.fromCache === true 
      };
    }
    
    console.warn('⚠️ [resolveHeroImageUrl] No image, using ambient gradient');
    return { imageUrl: null, ambientGradient, isFromCache: false };
    
  } catch (err) {
    console.error('❌ [resolveHeroImageUrl] Error:', err);
    return { imageUrl: null, ambientGradient, isFromCache: false };
  }
}
