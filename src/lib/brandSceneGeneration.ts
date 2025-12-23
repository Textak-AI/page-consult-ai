import { supabase } from "@/integrations/supabase/client";

export interface BrandSceneResult {
  images: string[];
  prompt: string;
  type: 'brand-scene';
}

/**
 * Generate a brand scene with the user's logo placed in an industry-appropriate setting
 * Uses Gemini's image generation with logo as input
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

  const { data, error } = await supabase.functions.invoke('generate-brand-scene', {
    body: {
      logoUrl,
      industry,
      subcategory,
      styleKeywords
    }
  });

  if (error) {
    console.error('❌ [brandSceneGeneration] Error:', error);
    throw new Error(error.message || 'Failed to generate brand scene');
  }

  console.log('✅ [brandSceneGeneration] Generated brand scene:', data?.images?.length, 'images');

  return {
    images: data.images || [],
    prompt: data.prompt || '',
    type: 'brand-scene'
  };
}
