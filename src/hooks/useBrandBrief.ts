import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface BrandBrief {
  id: string;
  name: string;
  logo_url?: string;
  logo_storage_path?: string;
  website_url?: string;
  colors: {
    primary?: { hex: string; name?: string };
    secondary?: { hex: string; name?: string };
    accent?: { hex: string; name?: string };
  };
  typography: {
    headlineFont?: string;
    headlineWeight?: string;
    bodyFont?: string;
    bodyWeight?: string;
  };
  voice_tone: {
    personality?: string[];
    description?: string;
    doSay?: string[];
    dontSay?: string[];
  };
  source_file_name?: string;
  is_active: boolean;
}

export const useBrandBrief = () => {
  const [brandBrief, setBrandBrief] = useState<BrandBrief | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('brand_briefs')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error('[useBrandBrief] Error loading:', error);
        }

        if (data) {
          setBrandBrief(data as unknown as BrandBrief);
        }
      } catch (err) {
        console.error('[useBrandBrief] Error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  /**
   * Get brand context string for injection into AI prompts
   */
  const getBrandContext = (): string => {
    if (!brandBrief) return '';

    let context = '\n\nBRAND GUIDELINES (Apply strictly):\n';

    // Colors
    if (brandBrief.colors?.primary?.hex) {
      context += `\nCOLORS:\n`;
      context += `- Primary: ${brandBrief.colors.primary.hex}${brandBrief.colors.primary.name ? ` (${brandBrief.colors.primary.name})` : ''}\n`;
      if (brandBrief.colors.secondary?.hex) {
        context += `- Secondary: ${brandBrief.colors.secondary.hex}${brandBrief.colors.secondary.name ? ` (${brandBrief.colors.secondary.name})` : ''}\n`;
      }
      if (brandBrief.colors.accent?.hex) {
        context += `- Accent: ${brandBrief.colors.accent.hex}${brandBrief.colors.accent.name ? ` (${brandBrief.colors.accent.name})` : ''}\n`;
      }
    }

    // Typography
    if (brandBrief.typography?.headlineFont) {
      context += `\nTYPOGRAPHY:\n`;
      context += `- Headlines: ${brandBrief.typography.headlineFont}`;
      if (brandBrief.typography.headlineWeight) {
        context += ` (weight: ${brandBrief.typography.headlineWeight})`;
      }
      context += '\n';
      if (brandBrief.typography.bodyFont) {
        context += `- Body: ${brandBrief.typography.bodyFont}`;
        if (brandBrief.typography.bodyWeight) {
          context += ` (weight: ${brandBrief.typography.bodyWeight})`;
        }
        context += '\n';
      }
    }

    // Voice & Tone
    if (brandBrief.voice_tone) {
      const vt = brandBrief.voice_tone;
      if (vt.personality?.length || vt.description || vt.doSay?.length || vt.dontSay?.length) {
        context += `\nVOICE & TONE:\n`;
        
        if (vt.personality?.length) {
          context += `- Personality: ${vt.personality.join(', ')}\n`;
        }
        if (vt.description) {
          context += `- ${vt.description}\n`;
        }
        if (vt.doSay?.length) {
          context += `- DO use phrases like: "${vt.doSay.join('", "')}"\n`;
        }
        if (vt.dontSay?.length) {
          context += `- DON'T use: "${vt.dontSay.join('", "')}"\n`;
        }
      }
    }

    return context;
  };

  /**
   * Refresh brand brief from database
   */
  const refresh = async () => {
    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setIsLoading(false);
      return;
    }

    const { data } = await supabase
      .from('brand_briefs')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) {
      setBrandBrief(data as unknown as BrandBrief);
    }
    setIsLoading(false);
  };

  return { brandBrief, isLoading, getBrandContext, refresh };
};
