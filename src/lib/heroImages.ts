import { supabase } from "@/integrations/supabase/client";
import { getPromptVariations } from "./industryPrompts";

export interface HeroImage {
  url: string;
  prompt: string;
}

export interface HeroImageResult {
  images: HeroImage[];
  fromCache: boolean;
  cacheKey: string;
}

/**
 * Generate hero images for a given industry and subcategory
 * Checks cache first, then generates new images via edge function
 */
export async function generateHeroImages(
  industry: string,
  subcategory?: string,
  count: number = 4
): Promise<HeroImageResult> {
  const cacheKey = `${industry.toLowerCase()}::${subcategory?.toLowerCase() || 'default'}`;
  
  // Check cache first
  const cachedResult = await checkCache(cacheKey);
  if (cachedResult) {
    return {
      images: cachedResult.map((url, i) => ({ url, prompt: '' })),
      fromCache: true,
      cacheKey,
    };
  }
  
  // Generate new images via edge function
  const prompts = getPromptVariations(industry, subcategory, count);
  
  const { data, error } = await supabase.functions.invoke('generate-hero-images', {
    body: {
      prompts,
      cacheKey,
    },
  });
  
  if (error) {
    console.error('Error generating hero images:', error);
    throw new Error('Failed to generate hero images');
  }
  
  return {
    images: data.images,
    fromCache: false,
    cacheKey,
  };
}

/**
 * Check if we have cached images for this industry/subcategory
 */
async function checkCache(cacheKey: string): Promise<string[] | null> {
  const { data, error } = await supabase
    .from('hero_image_cache')
    .select('images')
    .eq('cache_key', cacheKey)
    .single();
  
  if (error || !data) {
    return null;
  }
  
  // Check if cache is still valid (7 days)
  return data.images as string[];
}

/**
 * Force regenerate images (bypass cache)
 */
export async function regenerateHeroImages(
  industry: string,
  subcategory?: string,
  count: number = 4
): Promise<HeroImageResult> {
  const cacheKey = `${industry.toLowerCase()}::${subcategory?.toLowerCase() || 'default'}`;
  const prompts = getPromptVariations(industry, subcategory, count);
  
  const { data, error } = await supabase.functions.invoke('generate-hero-images', {
    body: {
      prompts,
      cacheKey,
      forceRegenerate: true,
    },
  });
  
  if (error) {
    console.error('Error regenerating hero images:', error);
    throw new Error('Failed to regenerate hero images');
  }
  
  return {
    images: data.images,
    fromCache: false,
    cacheKey,
  };
}
