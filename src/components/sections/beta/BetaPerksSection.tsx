import React from 'react';
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
  LucideIcon
} from 'lucide-react';

interface PerkDisplay {
  icon: LucideIcon;
  title: string;
  description: string;
}

const PERK_DISPLAY: Record<string, PerkDisplay> = {
  'lifetime-discount': { 
    icon: DollarSign, 
    title: 'Lifetime Discount', 
    description: 'Lock in a permanent discount on all plans' 
  },
  'early-access': { 
    icon: Zap, 
    title: 'Early Access', 
    description: 'Get access weeks before public launch' 
  },
  'founder-access': { 
    icon: MessageSquare, 
    title: 'Founder Access', 
    description: 'Direct line to the founder for feedback' 
  },
  'feature-input': { 
    icon: Vote, 
    title: 'Feature Input', 
    description: 'Vote on roadmap priorities' 
  },
  'free-period': { 
    icon: Gift, 
    title: 'Free Period', 
    description: 'Enjoy free usage when we launch' 
  },
  'exclusive-community': { 
    icon: Users, 
    title: 'Exclusive Community', 
    description: 'Join our founding member community' 
  },
  'swag': { 
    icon: Shirt, 
    title: 'Limited Swag', 
    description: 'Exclusive merch for early supporters' 
  },
  'founding-member': { 
    icon: Star, 
    title: 'Founding Member', 
    description: 'Permanent founding member badge' 
  },
};

interface Props {
  content: {
    headline: string;
    subheadline: string;
    perks: string[];
    scarcityMessage?: string;
  };
}

export const BetaPerksSection: React.FC<Props> = ({ content }) => {
  const validPerks = content.perks
    .filter((perkId) => PERK_DISPLAY[perkId])
    .map((perkId) => ({ id: perkId, ...PERK_DISPLAY[perkId] }));

  if (validPerks.length === 0) return null;

  // Determine grid columns based on perk count
  const gridCols = validPerks.length <= 3 
    ? 'md:grid-cols-3' 
    : validPerks.length <= 4 
      ? 'md:grid-cols-2 lg:grid-cols-4' 
      : 'md:grid-cols-2 lg:grid-cols-4';

  return (
    <section className="py-20 bg-slate-900">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {content.headline}
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            {content.subheadline}
          </p>
        </motion.div>

        {/* Perks grid */}
        <div className={`grid grid-cols-1 ${gridCols} gap-6 max-w-5xl mx-auto`}>
          {validPerks.map((perk, index) => (
            <motion.div
              key={perk.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="relative overflow-hidden rounded-2xl bg-slate-800/50 border border-slate-700 p-6 text-center hover:border-cyan-500/50 transition-colors"
            >
              {/* Icon container */}
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 mb-4">
                <perk.icon className="w-7 h-7 text-cyan-400" />
              </div>

              {/* Title */}
              <h3 className="text-lg font-semibold text-white mb-2">
                {perk.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-slate-400">
                {perk.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Scarcity message */}
        {content.scarcityMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-10 flex justify-center"
          >
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-amber-500/10 border border-amber-500/30">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
              </span>
              <span className="text-amber-400 font-medium">
                {content.scarcityMessage}
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};
