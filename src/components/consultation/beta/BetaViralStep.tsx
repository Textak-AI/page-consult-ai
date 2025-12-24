import { motion, AnimatePresence } from 'framer-motion';
import { 
  Share2,
  Plus,
  Trash2,
  Gift
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export interface RewardTier {
  referrals: number;
  reward: string;
}

const DEFAULT_TIERS: RewardTier[] = [
  { referrals: 3, reward: 'Early Access' },
  { referrals: 10, reward: '50% Lifetime Discount' },
  { referrals: 25, reward: 'Founding Member Status' },
];

interface Props {
  enabled: boolean;
  tiers: RewardTier[];
  onEnabledChange: (enabled: boolean) => void;
  onTiersChange: (tiers: RewardTier[]) => void;
  onContinue: () => void;
  onBack: () => void;
}

export function BetaViralStep({ 
  enabled, 
  tiers, 
  onEnabledChange, 
  onTiersChange, 
  onContinue, 
  onBack 
}: Props) {
  const addTier = () => {
    const lastTier = tiers[tiers.length - 1];
    const newReferrals = lastTier ? lastTier.referrals + 10 : 5;
    onTiersChange([...tiers, { referrals: newReferrals, reward: '' }]);
  };

  const removeTier = (index: number) => {
    onTiersChange(tiers.filter((_, i) => i !== index));
  };

  const updateTier = (index: number, field: keyof RewardTier, value: string | number) => {
    const updated = [...tiers];
    updated[index] = { ...updated[index], [field]: value };
    onTiersChange(updated);
  };

  const initializeDefaults = () => {
    if (tiers.length === 0) {
      onTiersChange(DEFAULT_TIERS);
    }
  };

  const handleToggle = (checked: boolean) => {
    onEnabledChange(checked);
    if (checked && tiers.length === 0) {
      initializeDefaults();
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">
          Enable Viral Referral System?
        </h2>
        <p className="text-slate-400">
          Let signups share a unique link to move up and unlock perks
        </p>
      </div>

      {/* Toggle */}
      <div className="flex items-center justify-center gap-4 p-6 rounded-xl border-2 border-slate-700 bg-slate-800/50">
        <Share2 className="w-6 h-6 text-slate-400" />
        <div className="flex-1">
          <Label htmlFor="viral-toggle" className="text-white font-medium">
            Enable Viral Waitlist
          </Label>
          <p className="text-sm text-slate-400">
            Let signups share a unique link to earn rewards and move up the waitlist
          </p>
        </div>
        <Switch
          id="viral-toggle"
          checked={enabled}
          onCheckedChange={handleToggle}
          className="data-[state=checked]:bg-cyan-500"
        />
      </div>

      {/* Reward Tiers */}
      <AnimatePresence>
        {enabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-white font-medium">Reward Tiers</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={addTier}
                className="text-cyan-400 hover:text-cyan-300"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Tier
              </Button>
            </div>

            <div className="space-y-3">
              {tiers.map((tier, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center gap-3 p-4 rounded-xl border border-slate-700 bg-slate-800/30"
                >
                  {/* Circular number badge with gradient */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center shrink-0">
                    <span className="text-white font-bold text-sm">{index + 1}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={1}
                      value={tier.referrals}
                      onChange={(e) => updateTier(index, 'referrals', parseInt(e.target.value) || 0)}
                      className="w-20 bg-slate-900 border-slate-600 text-white text-center"
                    />
                    <span className="text-slate-400 text-sm">referrals</span>
                  </div>

                  <span className="text-slate-500">=</span>

                  <Input
                    value={tier.reward}
                    onChange={(e) => updateTier(index, 'reward', e.target.value)}
                    placeholder="Reward description"
                    className="flex-1 bg-slate-900 border-slate-600 text-white"
                  />

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeTier(index)}
                    className="text-slate-400 hover:text-red-400 shrink-0"
                    disabled={tiers.length <= 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </motion.div>
              ))}
            </div>

            {tiers.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                <p>No tiers configured.</p>
                <Button
                  variant="link"
                  onClick={initializeDefaults}
                  className="text-cyan-400"
                >
                  Use default tiers
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export { DEFAULT_TIERS };
