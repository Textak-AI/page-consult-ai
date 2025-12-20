import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Copy, Twitter, Linkedin, Mail, CheckCircle2, Circle, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';

interface RewardTier {
  referrals: number;
  reward: string;
}

interface Props {
  position: number;
  referralCode: string;
  referralCount: number;
  rewardTiers: RewardTier[];
  pageUrl: string;
}

export const WaitlistConfirmation: React.FC<Props> = ({
  position,
  referralCode,
  referralCount,
  rewardTiers,
  pageUrl,
}) => {
  const [copied, setCopied] = useState(false);

  const referralLink = `${pageUrl}?ref=${referralCode}`;
  const shareText = `I just joined the waitlist! Check it out:`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast({ title: 'Link copied!' });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({ title: 'Failed to copy', variant: 'destructive' });
    }
  };

  const shareOnTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(referralLink)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const shareOnLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent("Check this out!");
    const body = encodeURIComponent(`${shareText}\n\n${referralLink}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const hasReferralProgram = rewardTiers.length > 0;

  // Sort tiers by referrals required
  const sortedTiers = [...rewardTiers].sort((a, b) => a.referrals - b.referrals);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-md mx-auto"
    >
      {/* Success checkmark */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
        className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center"
      >
        <Check className="w-8 h-8 text-white" />
      </motion.div>

      {/* Position */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center mb-8"
      >
        <p className="text-slate-400 mb-2">You're in! 🎉</p>
        <p className="text-4xl font-bold text-white">
          You're #{position.toLocaleString()}
        </p>
      </motion.div>

      {/* Referral section */}
      {hasReferralProgram && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 mb-6"
        >
          <h4 className="text-lg font-semibold text-white mb-2 text-center">
            Skip the line & earn rewards
          </h4>
          <p className="text-sm text-slate-400 mb-4 text-center">
            Share your unique link to move up and unlock perks
          </p>

          {/* Referral link */}
          <div className="flex gap-2 mb-4">
            <Input
              value={referralLink}
              readOnly
              className="bg-slate-900 border-slate-600 text-slate-300 text-sm"
            />
            <Button
              onClick={copyLink}
              variant="outline"
              size="icon"
              className="shrink-0 bg-slate-700 border-slate-600 hover:bg-slate-600"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4 text-slate-300" />
              )}
            </Button>
          </div>

          {/* Share buttons */}
          <div className="flex justify-center gap-3 mb-6">
            <Button
              onClick={shareOnTwitter}
              variant="outline"
              size="icon"
              className="bg-slate-700 border-slate-600 hover:bg-[#1DA1F2] hover:border-[#1DA1F2]"
            >
              <Twitter className="w-4 h-4 text-slate-300" />
            </Button>
            <Button
              onClick={shareOnLinkedIn}
              variant="outline"
              size="icon"
              className="bg-slate-700 border-slate-600 hover:bg-[#0077B5] hover:border-[#0077B5]"
            >
              <Linkedin className="w-4 h-4 text-slate-300" />
            </Button>
            <Button
              onClick={shareViaEmail}
              variant="outline"
              size="icon"
              className="bg-slate-700 border-slate-600 hover:bg-slate-600"
            >
              <Mail className="w-4 h-4 text-slate-300" />
            </Button>
          </div>

          {/* Referral count */}
          <p className="text-center text-sm text-slate-400 mb-4">
            You've referred{' '}
            <span className="text-cyan-400 font-semibold">{referralCount}</span>{' '}
            {referralCount === 1 ? 'person' : 'people'}
          </p>

          {/* Reward tiers */}
          <div className="space-y-3">
            {sortedTiers.map((tier, index) => {
              const isUnlocked = referralCount >= tier.referrals;
              const isCurrent = !isUnlocked && (index === 0 || referralCount >= sortedTiers[index - 1].referrals);
              const toGo = tier.referrals - referralCount;

              return (
                <div
                  key={index}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    isUnlocked
                      ? 'bg-cyan-500/10 border border-cyan-500/30'
                      : isCurrent
                        ? 'bg-slate-700/50 border border-slate-600'
                        : 'bg-slate-800/30 border border-slate-700/50 opacity-60'
                  }`}
                >
                  {/* Number badge */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      isUnlocked
                        ? 'bg-gradient-to-br from-cyan-500 to-purple-500 text-white'
                        : 'bg-slate-700 text-slate-400'
                    }`}
                  >
                    {tier.referrals}
                  </div>

                  {/* Reward */}
                  <div className="flex-1">
                    <p className={`font-medium ${isUnlocked ? 'text-white' : 'text-slate-300'}`}>
                      {tier.reward}
                    </p>
                  </div>

                  {/* Status */}
                  <div className="shrink-0">
                    {isUnlocked ? (
                      <div className="flex items-center gap-1 text-cyan-400">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-xs font-medium">Unlocked!</span>
                      </div>
                    ) : isCurrent ? (
                      <span className="text-xs text-amber-400 font-medium">
                        {toGo} to go
                      </span>
                    ) : (
                      <Lock className="w-4 h-4 text-slate-500" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* What's next checklist */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4"
      >
        <h4 className="text-sm font-semibold text-white mb-3">What's next?</h4>
        <ul className="space-y-2 text-sm text-slate-400">
          <li className="flex items-center gap-2">
            <Circle className="w-3 h-3 text-slate-500" />
            Check your email for confirmation
          </li>
          {hasReferralProgram && (
            <li className="flex items-center gap-2">
              <Circle className="w-3 h-3 text-slate-500" />
              Share your link to move up
            </li>
          )}
          <li className="flex items-center gap-2">
            <Circle className="w-3 h-3 text-slate-500" />
            We'll email you when it's your turn
          </li>
        </ul>
      </motion.div>
    </motion.div>
  );
};
