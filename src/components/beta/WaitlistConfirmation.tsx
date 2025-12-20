import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Check, 
  Copy, 
  CheckCircle2, 
  Twitter, 
  Linkedin, 
  Mail, 
  Gift,
  Users,
  Bell,
  Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface RewardTier {
  referrals: number;
  reward: string;
}

interface WaitlistConfirmationProps {
  position: number;
  referralCode: string;
  referralCount: number;
  rewardTiers: RewardTier[];
  pageUrl: string;
  primaryColor?: string;
  headingFont?: string;
  bodyFont?: string;
}

const WaitlistConfirmation: React.FC<WaitlistConfirmationProps> = ({
  position,
  referralCode,
  referralCount,
  rewardTiers,
  pageUrl,
  primaryColor = '#6366f1',
  headingFont = 'inherit',
  bodyFont = 'inherit',
}) => {
  const [copied, setCopied] = useState(false);
  const [showContent, setShowContent] = useState(false);

  const referralLink = `${pageUrl}?ref=${referralCode}`;

  useEffect(() => {
    // Delay content reveal for animation
    const timer = setTimeout(() => setShowContent(true), 600);
    return () => clearTimeout(timer);
  }, []);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "Share it with friends to move up the waitlist.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please copy the link manually.",
        variant: "destructive",
      });
    }
  };

  const shareOnTwitter = () => {
    const text = encodeURIComponent(`I just joined the waitlist! Join me and get early access 🚀`);
    const url = encodeURIComponent(referralLink);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  const shareOnLinkedIn = () => {
    const url = encodeURIComponent(referralLink);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent("Join me on this waitlist!");
    const body = encodeURIComponent(`Hey! I just signed up for early access and thought you'd be interested too.\n\nJoin here: ${referralLink}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  // Find current and next reward tier
  const sortedTiers = [...rewardTiers].sort((a, b) => a.referrals - b.referrals);
  const currentTierIndex = sortedTiers.findIndex(tier => referralCount < tier.referrals);
  const nextTier = currentTierIndex >= 0 ? sortedTiers[currentTierIndex] : null;
  const prevTier = currentTierIndex > 0 ? sortedTiers[currentTierIndex - 1] : null;

  const progressToNext = nextTier 
    ? ((referralCount - (prevTier?.referrals || 0)) / (nextTier.referrals - (prevTier?.referrals || 0))) * 100
    : 100;

  const whatsNextItems = [
    { icon: Bell, text: "We'll email you when it's your turn", done: true },
    { icon: Users, text: "Invite friends to move up the list", done: false },
    { icon: Gift, text: "Unlock rewards with referrals", done: false },
  ];

  return (
    <div className="max-w-lg mx-auto px-4 py-8 text-center" style={{ fontFamily: bodyFont }}>
      {/* Success Animation */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ 
          type: "spring", 
          stiffness: 200, 
          damping: 15,
          delay: 0.1 
        }}
        className="relative inline-flex items-center justify-center w-20 h-20 rounded-full mb-6"
        style={{ backgroundColor: `${primaryColor}20` }}
      >
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.3 }}
          className="absolute inset-0 rounded-full"
          style={{ 
            background: `conic-gradient(${primaryColor} 0deg, transparent 0deg)`,
            animation: 'spin 1s ease-out forwards'
          }}
        />
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{ backgroundColor: primaryColor }}
        >
          <Check className="w-8 h-8 text-white" strokeWidth={3} />
        </motion.div>
      </motion.div>

      {/* Heading */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="text-2xl sm:text-3xl font-bold text-foreground mb-2"
        style={{ fontFamily: headingFont }}
      >
        You're on the list!
      </motion.h2>

      {/* Position */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mb-8"
      >
        <p className="text-muted-foreground mb-1">Your position</p>
        <p 
          className="text-4xl sm:text-5xl font-bold"
          style={{ color: primaryColor }}
        >
          #{position.toLocaleString()}
        </p>
      </motion.div>

      {showContent && (
        <>
          {/* Referral Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border border-border rounded-xl p-5 mb-6"
          >
            <div className="flex items-center justify-center gap-2 mb-3">
              <Share2 className="w-5 h-5" style={{ color: primaryColor }} />
              <h3 className="font-semibold text-foreground">Move up the list</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Share your unique link to skip ahead
            </p>

            {/* Referral Link */}
            <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-2 mb-4">
              <input
                type="text"
                value={referralLink}
                readOnly
                className="flex-1 bg-transparent text-sm text-foreground truncate outline-none px-2"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={copyToClipboard}
                className="shrink-0"
              >
                {copied ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>

            {/* Share Buttons */}
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={shareOnTwitter}
                className="gap-2"
              >
                <Twitter className="w-4 h-4" />
                Twitter
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={shareOnLinkedIn}
                className="gap-2"
              >
                <Linkedin className="w-4 h-4" />
                LinkedIn
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={shareViaEmail}
                className="gap-2"
              >
                <Mail className="w-4 h-4" />
                Email
              </Button>
            </div>

            {/* Referral Count */}
            {referralCount > 0 && (
              <p className="text-sm text-muted-foreground mt-4">
                You've referred <span className="font-semibold text-foreground">{referralCount}</span> {referralCount === 1 ? 'friend' : 'friends'}!
              </p>
            )}
          </motion.div>

          {/* Reward Tiers */}
          {sortedTiers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card border border-border rounded-xl p-5 mb-6"
            >
              <div className="flex items-center justify-center gap-2 mb-4">
                <Gift className="w-5 h-5" style={{ color: primaryColor }} />
                <h3 className="font-semibold text-foreground">Unlock rewards</h3>
              </div>

              <div className="space-y-3">
                {sortedTiers.map((tier, index) => {
                  const isUnlocked = referralCount >= tier.referrals;
                  const isNext = nextTier?.referrals === tier.referrals;
                  
                  return (
                    <div 
                      key={index}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                        isUnlocked 
                          ? 'bg-green-500/10 border border-green-500/30' 
                          : isNext 
                            ? 'bg-muted/50 border border-border'
                            : 'bg-muted/30'
                      }`}
                    >
                      <div 
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          isUnlocked ? 'bg-green-500' : 'bg-muted'
                        }`}
                      >
                        {isUnlocked ? (
                          <Check className="w-4 h-4 text-white" />
                        ) : (
                          <span className="text-sm font-medium text-muted-foreground">
                            {tier.referrals}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <p className={`text-sm font-medium ${isUnlocked ? 'text-green-600' : 'text-foreground'}`}>
                          {tier.reward}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {tier.referrals} {tier.referrals === 1 ? 'referral' : 'referrals'}
                        </p>
                      </div>
                      {isNext && (
                        <div className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10" style={{ color: primaryColor }}>
                          {tier.referrals - referralCount} to go
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Progress bar */}
              {nextTier && (
                <div className="mt-4">
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(progressToNext, 100)}%` }}
                      transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: primaryColor }}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* What's Next */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card border border-border rounded-xl p-5"
          >
            <h3 className="font-semibold text-foreground mb-4">What's next?</h3>
            <div className="space-y-3">
              {whatsNextItems.map((item, index) => (
                <div key={index} className="flex items-center gap-3 text-left">
                  <div 
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                      item.done ? 'bg-green-500' : 'bg-muted'
                    }`}
                  >
                    {item.done ? (
                      <Check className="w-3 h-3 text-white" />
                    ) : (
                      <item.icon className="w-3 h-3 text-muted-foreground" />
                    )}
                  </div>
                  <span className={`text-sm ${item.done ? 'text-muted-foreground' : 'text-foreground'}`}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
};

export default WaitlistConfirmation;
