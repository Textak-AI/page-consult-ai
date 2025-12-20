import React, { useState } from 'react';
import {
  HeroTeaserSection,
  WaitlistProofSection,
  BetaPerksSection,
  FounderCredibilitySection,
  LaunchCountdownSection,
  WaitlistConfirmation,
} from '@/components/sections/beta';

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

interface SignupResponse {
  position: number;
  referralCode: string;
  referralCount: number;
  rewardTiers: Array<{ referrals: number; reward: string }>;
}

interface Props {
  pageId: string;
  content: BetaPageContent;
  showProof?: boolean;
  spotsRemaining?: number;
  pageUrl?: string;
  rewardTiers?: Array<{ referrals: number; reward: string }>;
}

export function BetaPageRenderer({
  pageId,
  content,
  showProof = true,
  spotsRemaining,
  pageUrl = typeof window !== 'undefined' ? window.location.href : '',
  rewardTiers = [],
}: Props) {
  const [signupData, setSignupData] = useState<SignupResponse | null>(null);
  const [currentSignups, setCurrentSignups] = useState(0);

  const handleSignupSuccess = (data: SignupResponse) => {
    setSignupData(data);
    setCurrentSignups(prev => prev + 1);
  };

  // If user has signed up, show confirmation
  if (signupData) {
    return (
      <div className="min-h-screen bg-slate-900">
        <WaitlistConfirmation
          position={signupData.position}
          referralCode={signupData.referralCode}
          referralCount={signupData.referralCount}
          rewardTiers={signupData.rewardTiers.length > 0 ? signupData.rewardTiers : rewardTiers}
          pageUrl={pageUrl}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Hero with email capture */}
      <HeroTeaserSection
        content={content.hero}
        pageId={pageId}
        currentSignups={currentSignups}
        onSignupSuccess={handleSignupSuccess}
      />

      {/* Social proof stats */}
      {showProof && (
        <WaitlistProofSection
          pageId={pageId}
          showRecentSignups={true}
          spotsRemaining={spotsRemaining}
        />
      )}

      {/* Early adopter perks */}
      {content.perks.perks.length > 0 && (
        <BetaPerksSection content={content.perks} />
      )}

      {/* Founder story */}
      {content.founder && (
        <FounderCredibilitySection content={content.founder} />
      )}

      {/* Countdown timer */}
      {content.countdown && (
        <LaunchCountdownSection content={content.countdown} />
      )}

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
