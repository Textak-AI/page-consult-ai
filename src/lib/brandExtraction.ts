import { supabase } from '@/integrations/supabase/client';
import { auditLogo } from '@/lib/logoAudit';

export interface ExtractedBrand {
  domain: string;
  companyName: string | null;
  tagline: string | null;
  description: string | null;
  faviconUrl: string | null;
  ogImage: string | null;
  logoUrl: string | null;
  themeColor: string | null;
  secondaryColor: string | null;
  accentColor: string | null;
  websiteUrl?: string | null;
  isMinimalBrand?: boolean;
  extractionConfidence?: 'high' | 'medium' | 'low';
  /** Set once logoUrl has passed (or been cleared by) the logo audit. */
  logoAudited?: boolean;
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
    // Logo audit: the first candidate (logo, then favicon) that passes is kept; failures are discarded.
    if (data?.brand) {
      const candidates = [data.brand.logoUrl, data.brand.faviconUrl].filter(Boolean) as string[];
      let accepted: string | null = null;
      for (const c of candidates) {
        if ((await auditLogo(c)).ok) { accepted = c; break; }
      }
      data.brand = { ...data.brand, logoUrl: accepted, logoAudited: true };
    }
    return data;
  } catch (error) {
    console.error('Brand extraction error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to extract brand'
    };
  }
}
