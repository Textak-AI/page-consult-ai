import { supabase } from "@/integrations/supabase/client";

export interface BrandSceneResult {
  images: string[];
  prompt: string;
  type: 'brand-scene';
  fromCache?: boolean;
}

/**
 * Generate a brand scene with the user's logo placed in an industry-appropriate setting
 * Uses Gemini's image generation with logo as input
 * Includes caching and rate limiting
 */
export async function generateBrandScene(
  logoUrl: string,
  industry: string,
  subcategory?: string,
  styleKeywords?: string
): Promise<BrandSceneResult> {
  console.log('🎨 [brandSceneGeneration] Generating brand scene for:', {
    logoUrl: logoUrl.substring(0, 50) + '...',
    industry,
    subcategory,
    styleKeywords
  });

  // Get current user for rate limiting
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase.functions.invoke('generate-brand-scene', {
    body: {
      logoUrl,
      industry,
      subcategory,
      styleKeywords,
      userId: user?.id
    }
  });

  if (error) {
    console.error('❌ [brandSceneGeneration] Error:', error);
    throw new Error(error.message || 'Failed to generate brand scene');
  }

  // Handle rate limiting errors
  if (data?.error) {
    if (data.limitType) {
      console.warn('⚠️ [brandSceneGeneration] Rate limited:', data.limitType);
      throw new Error(data.error);
    }
    throw new Error(data.error);
  }

  const fromCache = data.fromCache || false;
  console.log('✅ [brandSceneGeneration] Generated brand scene:', {
    imageCount: data.images?.length,
    fromCache
  });

  return {
    images: data.images || [],
    prompt: data.prompt || '',
    type: 'brand-scene',
    fromCache
  };
}
