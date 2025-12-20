import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Check, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { WaitlistConfirmation } from './WaitlistConfirmation';

interface SignupResponse {
  position: number;
  referralCode: string;
  referralCount: number;
  totalSignups: number;
  rewardTiers: Array<{ referrals: number; reward: string }>;
}

interface HeroTeaserContent {
  headline: string;
  subheadline: string;
  launchTiming: string;
  ctaText: string;
  logoUrl?: string;
  backgroundStyle?: 'gradient' | 'image';
  backgroundImage?: string;
}

interface Props {
  content: HeroTeaserContent;
  pageId: string;
  currentSignups?: number;
  onSignupSuccess?: (data: SignupResponse) => void;
}

export const HeroTeaserSection: React.FC<Props> = ({
  content,
  pageId,
  currentSignups = 0,
  onSignupSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signupData, setSignupData] = useState<SignupResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      // Get UTM params from URL
      const urlParams = new URLSearchParams(window.location.search);
      const referredBy = urlParams.get('ref');

      const { data, error: fnError } = await supabase.functions.invoke('beta-signup', {
        body: {
          pageId,
          email: email.trim(),
          referredBy,
          utmSource: urlParams.get('utm_source'),
          utmMedium: urlParams.get('utm_medium'),
          utmCampaign: urlParams.get('utm_campaign'),
        },
      });

      if (fnError) throw fnError;

      if (data.error) {
        if (data.error === 'Email already registered') {
          setError("You're already on the list! Check your email for your referral link.");
        } else {
          setError(data.error);
        }
        return;
      }

      const response: SignupResponse = {
        position: data.signup.position,
        referralCode: data.signup.referralCode,
        referralCount: data.signup.referralCount || 0,
        totalSignups: data.totalSignups,
        rewardTiers: data.rewardTiers || [],
      };

      setSignupData(response);
      onSignupSuccess?.(response);
    } catch (err) {
      console.error('Signup error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const displaySignups = signupData?.totalSignups || currentSignups;

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-900">
      {/* Animated gradient background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] rounded-full bg-cyan-500/20 blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-1/4 w-[500px] h-[500px] rounded-full bg-purple-500/20 blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-cyan-400/10 blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Background image overlay */}
      {content.backgroundStyle === 'image' && content.backgroundImage && (
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${content.backgroundImage})` }}
        />
      )}

      <div className="relative z-10 container mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          {/* Logo */}
          {content.logoUrl && (
            <motion.img
              src={content.logoUrl}
              alt="Logo"
              className="h-12 md:h-16 mx-auto mb-8"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            />
          )}

          {/* Launch timing badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/80 border border-slate-700 mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-sm text-slate-300">{content.launchTiming}</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {content.headline}
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {content.subheadline}
          </motion.p>

          {/* Email capture or confirmation */}
          <AnimatePresence mode="wait">
            {signupData ? (
              <motion.div
                key="confirmation"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <WaitlistConfirmation
                  position={signupData.position}
                  referralCode={signupData.referralCode}
                  referralCount={signupData.referralCount}
                  rewardTiers={signupData.rewardTiers}
                  pageUrl={window.location.origin + window.location.pathname}
                />
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: 0.6 }}
              >
                <form onSubmit={handleSubmit} className="max-w-md mx-auto">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-12 pl-12 bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:border-cyan-500 focus:ring-cyan-500/20"
                        disabled={isLoading}
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="h-12 px-8 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-semibold shadow-lg shadow-cyan-500/25"
                    >
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        content.ctaText
                      )}
                    </Button>
                  </div>

                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 text-sm text-amber-400"
                    >
                      {error}
                    </motion.p>
                  )}

                  <p className="mt-4 text-sm text-slate-500">
                    No spam, ever. Unsubscribe anytime.
                  </p>
                </form>

                {/* Live counter */}
                {displaySignups > 0 && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-8 text-slate-400"
                  >
                    Join{' '}
                    <span className="text-cyan-400 font-semibold">
                      {displaySignups.toLocaleString()}
                    </span>{' '}
                    others on the waitlist
                  </motion.p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
};
