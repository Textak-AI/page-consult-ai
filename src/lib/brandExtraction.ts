import { supabase } from '@/integrations/supabase/client';

export interface ExtractedBrand {
  companyName: string | null;
  faviconUrl: string | null;
  description: string | null;
  tagline: string | null;
  themeColor: string | null;
  ogImage: string | null;
  domain: string;
}

export async function extractBrandFromUrl(url: string): Promise<{
  success: boolean;
  brand?: ExtractedBrand;
  error?: string;
}> {
  try {
    const { data, error } = await supabase.functions.invoke('extract-brand', {
      body: { url }
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Brand extraction error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to extract brand'
    };
  }
}
