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
    console.warn('⚠️ [brandSceneGeneration] Error (non-blocking):', error);
    // Return empty result instead of throwing - don't block the flow
    return {
      images: [],
      prompt: '',
      type: 'brand-scene',
      fromCache: false
    };
  }

  // Handle rate limiting errors - log but don't throw
  if (data?.error) {
    console.warn('⚠️ [brandSceneGeneration] API error (non-blocking):', data.error, data.limitType || '');
    return {
      images: [],
      prompt: '',
      type: 'brand-scene',
      fromCache: false
    };
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
