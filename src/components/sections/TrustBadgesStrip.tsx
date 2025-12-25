import { motion } from 'framer-motion';
import { 
  Shield, 
  Lock, 
  Clock, 
  RefreshCw, 
  Award, 
  CheckCircle,
  Star,
  Verified,
  BadgeCheck,
  Heart
} from 'lucide-react';

interface TrustBadge {
  id: string;
  icon: keyof typeof IconMap;
  label: string;
  description?: string;
}

const IconMap = {
  Shield,
  Lock,
  Clock,
  RefreshCw,
  Award,
  CheckCircle,
  Star,
  Verified,
  BadgeCheck,
  Heart
};

// Available trust badges users can choose from
export const AVAILABLE_TRUST_BADGES: TrustBadge[] = [
  { id: 'satisfaction', icon: 'CheckCircle', label: '100% Satisfaction Guarantee', description: 'Full refund if not satisfied' },
  { id: 'secure', icon: 'Lock', label: 'Secure & Private', description: 'Your data is protected' },
  { id: 'support', icon: 'Clock', label: '24/7 Support', description: 'Always here to help' },
  { id: 'money-back', icon: 'RefreshCw', label: 'Money-Back Guarantee', description: 'No questions asked' },
  { id: 'certified', icon: 'Award', label: 'Industry Certified', description: 'Recognized expertise' },
  { id: 'trusted', icon: 'Star', label: 'Trusted by 10,000+', description: 'Join our community' },
  { id: 'verified', icon: 'Verified', label: 'Verified Business', description: 'Legitimacy confirmed' },
  { id: 'insured', icon: 'Shield', label: 'Fully Insured', description: 'Peace of mind' },
  { id: 'quality', icon: 'BadgeCheck', label: 'Quality Guaranteed', description: 'We stand behind our work' },
  { id: 'care', icon: 'Heart', label: 'Customer First', description: 'Your success is our priority' },
];

interface TrustBadgesStripProps {
  selectedBadgeIds?: string[];
  variant?: 'strip' | 'grid' | 'compact';
  showDescriptions?: boolean;
}

export function TrustBadgesStrip({ 
  selectedBadgeIds = ['satisfaction', 'secure', 'support'],
  variant = 'strip',
  showDescriptions = false
}: TrustBadgesStripProps) {
  const badges = AVAILABLE_TRUST_BADGES.filter(b => selectedBadgeIds.includes(b.id));

  if (badges.length === 0) return null;

  if (variant === 'compact') {
    return (
      <div className="flex flex-wrap justify-center gap-4 py-6 px-4 bg-slate-800/50">
        {badges.map((badge, i) => {
          const Icon = IconMap[badge.icon];
          return (
            <motion.div 
              key={badge.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-2 text-slate-400"
            >
              <Icon className="w-4 h-4 text-green-400" />
              <span className="text-sm">{badge.label}</span>
            </motion.div>
          );
        })}
      </div>
    );
  }

  if (variant === 'grid') {
    return (
      <section className="py-12 bg-slate-800/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {badges.map((badge, i) => {
              const Icon = IconMap[badge.icon];
              return (
                <motion.div 
                  key={badge.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex flex-col items-center text-center p-4 rounded-lg bg-slate-700/30 border border-slate-700"
                >
                  <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mb-3">
                    <Icon className="w-6 h-6 text-green-400" />
                  </div>
                  <span className="text-sm font-medium text-white">{badge.label}</span>
                  {showDescriptions && badge.description && (
                    <span className="text-xs text-slate-400 mt-1">{badge.description}</span>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  // Default: strip variant
  return (
    <div className="py-8 bg-slate-800/50 border-y border-slate-700/50">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center gap-8 md:gap-12">
          {badges.map((badge, i) => {
            const Icon = IconMap[badge.icon];
            return (
              <motion.div 
                key={badge.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3 text-slate-300 group"
              >
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                  <Icon className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <span className="text-sm font-medium block">{badge.label}</span>
                  {showDescriptions && badge.description && (
                    <span className="text-xs text-slate-500">{badge.description}</span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
