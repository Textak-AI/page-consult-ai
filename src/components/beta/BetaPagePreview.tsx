import React, { useMemo } from 'react';
import { BetaPageRenderer } from './BetaPageRenderer';

interface BetaConfig {
  stage: string | null;
  timeline: { type: string; date?: string } | null;
  perks: string[];
  viral: { enabled: boolean; rewardTiers: Array<{ referrals: number; reward: string }> };
}

interface Props {
  betaConfig: BetaConfig;
  businessName: string;
  industry: string;
  description?: string;
  logoUrl?: string;
  founderName?: string;
  founderStory?: string;
}

export function BetaPagePreview({
  betaConfig,
  businessName,
  industry,
  description,
  logoUrl,
  founderName,
  founderStory,
}: Props) {
  const content = useMemo(() => {
    const getLaunchTiming = () => {
      if (!betaConfig.timeline) return 'Coming Soon';
      if (betaConfig.timeline.type === 'specific' && betaConfig.timeline.date) {
        return `Launching ${new Date(betaConfig.timeline.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
      }
      if (betaConfig.timeline.type === 'tbd') return 'Coming Soon';
      return `Coming ${betaConfig.timeline.type.toUpperCase().replace('-', ' ')}`;
    };

    const stageHeadlines: Record<string, string> = {
      'idea': `Something big is coming to ${industry || 'your industry'}`,
      'building': `We're building the future of ${industry || 'your industry'}`,
      'alpha': `${businessName || 'Our product'} is almost ready`,
      'private-beta': `Get exclusive early access to ${businessName || 'our product'}`,
      'public-beta': `Join the ${businessName || ''} beta`,
      'pre-launch': `${businessName || 'We'} launch${businessName ? 's' : ''} soon`,
    };

    return {
      hero: {
        headline: stageHeadlines[betaConfig.stage || 'pre-launch'] || `Join the ${businessName} waitlist`,
        subheadline: description || `Be the first to experience ${businessName || 'our product'}`,
        launchTiming: getLaunchTiming(),
        ctaText: 'Get Early Access',
        logoUrl,
      },
      perks: {
        headline: 'Why Join Early?',
        subheadline: 'Early supporters get exclusive benefits',
        perks: betaConfig.perks,
        scarcityMessage: betaConfig.perks.includes('founding-member') ? 'Limited founding member spots' : undefined,
      },
      founder: founderStory ? {
        name: founderName || 'Founder',
        story: founderStory,
      } : undefined,
      countdown: betaConfig.timeline?.type === 'specific' && betaConfig.timeline.date ? {
        headline: 'Launching In...',
        targetDate: betaConfig.timeline.date,
        postLaunchMessage: "🚀 We're Live!",
      } : undefined,
    };
  }, [betaConfig, businessName, industry, description, logoUrl, founderName, founderStory]);

  return (
    <div className="w-full h-full overflow-auto bg-slate-900">
      <div className="transform scale-[0.85] origin-top">
        <BetaPageRenderer
          pageId="preview"
          content={content}
          showProof={false}
          rewardTiers={betaConfig.viral.rewardTiers}
        />
      </div>
    </div>
  );
}
