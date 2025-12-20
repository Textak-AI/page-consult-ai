import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface BetaPageConfig {
  pageType: string;
  stage: string;
  timeline: { type: string; date?: string };
  perks: string[];
  viral: { enabled: boolean; rewardTiers: Array<{ referrals: number; reward: string }> };
  businessName: string;
  industry: string;
  description: string;
  logoUrl?: string;
  founderName?: string;
  founderTitle?: string;
  founderPhoto?: string;
  founderStory?: string;
  founderCredentials?: string[];
  founderSocials?: { twitter?: string; linkedin?: string; website?: string };
}

interface BetaPageContent {
  hero: {
    headline: string;
    subheadline: string;
    launchTiming: string;
    ctaText: string;
    logoUrl?: string;
  };
  perks: {
    headline: string;
    subheadline: string;
    perks: string[];
    scarcityMessage?: string;
  };
  founder?: {
    name: string;
    title?: string;
    photo?: string;
    story: string;
    credentials?: string[];
    socialLinks?: { twitter?: string; linkedin?: string; website?: string };
  };
  countdown?: {
    headline: string;
    targetDate: string;
    postLaunchMessage: string;
  };
}

export function useBetaPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [betaPageId, setBetaPageId] = useState<string | null>(null);

  const generateContent = async (config: BetaPageConfig): Promise<BetaPageContent> => {
    const getLaunchTiming = () => {
      if (config.timeline.type === 'specific' && config.timeline.date) {
        return `Launching ${new Date(config.timeline.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
      }
      if (config.timeline.type === 'tbd') {
        return 'Coming Soon';
      }
      return `Coming ${config.timeline.type.toUpperCase().replace('-', ' ')}`;
    };

    const getHeadline = () => {
      const headlines: Record<string, string> = {
        'idea': `Something big is coming to ${config.industry}`,
        'building': `We're building the future of ${config.industry}`,
        'alpha': `${config.businessName} is almost ready`,
        'private-beta': `Get exclusive early access to ${config.businessName}`,
        'public-beta': `Join the ${config.businessName} beta`,
        'pre-launch': `${config.businessName} launches soon`,
      };
      return headlines[config.stage] || `Join the ${config.businessName} waitlist`;
    };

    const content: BetaPageContent = {
      hero: {
        headline: getHeadline(),
        subheadline: config.description || `Be the first to experience ${config.businessName}`,
        launchTiming: getLaunchTiming(),
        ctaText: 'Get Early Access',
        logoUrl: config.logoUrl,
      },
      perks: {
        headline: 'Why Join Early?',
        subheadline: 'Early supporters get exclusive benefits',
        perks: config.perks,
        scarcityMessage: config.perks.includes('founding-member') ? 'Limited founding member spots' : undefined,
      },
    };

    if (config.founderStory) {
      content.founder = {
        name: config.founderName || 'Founder',
        title: config.founderTitle,
        photo: config.founderPhoto,
        story: config.founderStory,
        credentials: config.founderCredentials,
        socialLinks: config.founderSocials,
      };
    }

    if (config.timeline.type === 'specific' && config.timeline.date) {
      content.countdown = {
        headline: 'Launching In...',
        targetDate: config.timeline.date,
        postLaunchMessage: "🚀 We're Live!",
      };
    }

    return content;
  };

  const createBetaPage = async (
    userId: string,
    consultationId: string,
    config: BetaPageConfig
  ): Promise<string> => {
    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase
        .from('beta_pages')
        .insert({
          user_id: userId,
          consultation_id: consultationId,
          page_type: 'waitlist',
          launch_stage: config.stage,
          launch_date: config.timeline.date || null,
          perks: config.perks,
          referral_enabled: config.viral.enabled,
          reward_tiers: config.viral.rewardTiers,
          status: 'draft',
        })
        .select()
        .single();

      if (error) throw error;
      
      setBetaPageId(data.id);
      return data.id;
    } finally {
      setIsGenerating(false);
    }
  };

  const getStats = async (pageId: string) => {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/beta-stats?pageId=${pageId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch stats');
    }
    
    return response.json();
  };

  const publishPage = async (pageId: string) => {
    const { error } = await supabase
      .from('beta_pages')
      .update({ status: 'published' })
      .eq('id', pageId);

    if (error) throw error;
  };

  return {
    isGenerating,
    betaPageId,
    generateContent,
    createBetaPage,
    getStats,
    publishPage,
  };
}
