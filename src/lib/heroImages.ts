import { supabase } from "@/integrations/supabase/client";
import { getPromptVariations } from "./industryPrompts";
import { generateBrandScene } from "./brandSceneGeneration";

export interface HeroImage {
  url: string;
  prompt: string;
  type: 'industry' | 'brand';
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
      images: cachedResult.map((url, i) => ({ url, prompt: '', type: 'industry' as const })),
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
    images: data.images.map((img: { url: string; prompt: string }) => ({
      ...img,
      type: 'industry' as const
    })),
    fromCache: false,
    cacheKey,
  };
}

/**
 * Generate combined hero images: industry scenes + brand scenes (logo in scene)
 * Brand scenes are prioritized when logo is available
 */
export async function generateCombinedHeroImages(
  industry: string,
  subcategory?: string,
  logoUrl?: string | null,
  styleKeywords?: string
): Promise<HeroImageResult> {
  const cacheKey = `combined::${industry.toLowerCase()}::${subcategory?.toLowerCase() || 'default'}::${logoUrl ? 'with-logo' : 'no-logo'}`;
  
  const allImages: HeroImage[] = [];
  
  // Generate industry scenes (FLUX) - 2 images
  try {
    const industryResult = await generateHeroImages(industry, subcategory, 2);
    allImages.push(...industryResult.images);
  } catch (error) {
    console.error('Failed to generate industry scenes:', error);
  }
  
  // Generate brand scenes (Gemini with logo) - 2 images if logo available
  if (logoUrl) {
    try {
      console.log('🎨 Generating brand scenes with logo...');
      
      // Generate 2 brand scenes
      const brandPromises = [
        generateBrandScene(logoUrl, industry, subcategory, styleKeywords),
        generateBrandScene(logoUrl, industry, subcategory, styleKeywords ? `${styleKeywords}, different angle` : 'different angle')
      ];
      
      const brandResults = await Promise.allSettled(brandPromises);
      
      brandResults.forEach((result, i) => {
        if (result.status === 'fulfilled' && result.value.images.length > 0) {
          allImages.unshift({ // Add brand scenes at the beginning (prioritized)
            url: result.value.images[0],
            prompt: result.value.prompt,
            type: 'brand' as const
          });
        } else if (result.status === 'rejected') {
          console.error(`Brand scene ${i + 1} failed:`, result.reason);
        }
      });
    } catch (error) {
      console.error('Failed to generate brand scenes:', error);
    }
  }
  
  return {
    images: allImages,
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
    images: data.images.map((img: { url: string; prompt: string }) => ({
      ...img,
      type: 'industry' as const
    })),
    fromCache: false,
    cacheKey,
  };
}

/**
 * Force regenerate combined images (bypass cache)
 */
export async function regenerateCombinedHeroImages(
  industry: string,
  subcategory?: string,
  logoUrl?: string | null,
  styleKeywords?: string
): Promise<HeroImageResult> {
  // Just call the combined function - it doesn't use cache currently
  return generateCombinedHeroImages(industry, subcategory, logoUrl, styleKeywords);
}
