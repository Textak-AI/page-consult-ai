import { motion } from 'framer-motion';
import { 
  DollarSign,
  Zap,
  MessageSquare,
  Vote,
  Gift,
  Users,
  Shirt,
  Star,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PerkOption {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

export type PerkId = 
  | 'lifetime-discount' 
  | 'early-access' 
  | 'founder-access' 
  | 'feature-input' 
  | 'free-period' 
  | 'exclusive-community' 
  | 'swag' 
  | 'founding-member';

const PERK_OPTIONS: PerkOption[] = [
  { id: 'lifetime-discount', icon: DollarSign, title: 'Lifetime Discount', description: 'Lock in a permanent discount' },
  { id: 'early-access', icon: Zap, title: 'Early Access', description: 'Get access before public launch' },
  { id: 'founder-access', icon: MessageSquare, title: 'Founder Access', description: 'Direct line to the founder' },
  { id: 'feature-input', icon: Vote, title: 'Feature Input', description: 'Vote on roadmap priorities' },
  { id: 'free-period', icon: Gift, title: 'Free Period', description: 'Free usage at launch' },
  { id: 'exclusive-community', icon: Users, title: 'Exclusive Community', description: 'Founding member community' },
  { id: 'swag', icon: Shirt, title: 'Swag', description: 'Limited edition merchandise' },
  { id: 'founding-member', icon: Star, title: 'Founding Member Status', description: 'Permanent badge/recognition' },
];

interface Props {
  value: string[];
  onChange: (perks: string[]) => void;
  onContinue: () => void;
  onBack: () => void;
}

export function BetaPerksStep({ value, onChange, onContinue, onBack }: Props) {
  const togglePerk = (perkId: string) => {
    if (value.includes(perkId)) {
      onChange(value.filter(id => id !== perkId));
    } else {
      onChange([...value, perkId]);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">
          What do early adopters get?
        </h2>
        <p className="text-slate-400">
          Select all the perks you'll offer
        </p>
      </div>

      {/* Perks Grid - 2x4 */}
      <div className="grid grid-cols-2 gap-3">
        {PERK_OPTIONS.map((perk) => {
          const Icon = perk.icon;
          const isSelected = value.includes(perk.id);

          return (
            <motion.button
              key={perk.id}
              onClick={() => togglePerk(perk.id)}
              className={cn(
                "relative p-4 rounded-xl border-2 text-left transition-all",
                isSelected
                  ? "border-cyan-500 bg-cyan-500/10"
                  : "border-slate-700 hover:border-slate-500 bg-slate-800/50"
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Checkmark in top-right when selected */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-cyan-500 flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
              
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-lg shrink-0",
                  isSelected ? "bg-cyan-500/20 text-cyan-400" : "bg-slate-700 text-slate-400"
                )}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-white text-sm">{perk.title}</h3>
                  <p className="text-xs text-slate-400">{perk.description}</p>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Selection count */}
      {value.length > 0 && (
        <p className="text-center text-sm text-slate-400">
          {value.length} perk{value.length !== 1 ? 's' : ''} selected
        </p>
      )}
    </div>
  );
}

export { PERK_OPTIONS };
