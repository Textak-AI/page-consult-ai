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
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Perk configuration matching the consultation step
const PERK_CONFIG: Record<string, { icon: React.ComponentType<{ className?: string }>; title: string; description: string }> = {
  'lifetime-discount': { icon: DollarSign, title: 'Lifetime Discount', description: 'Lock in a permanent discount on all plans' },
  'early-access': { icon: Zap, title: 'Early Access', description: 'Get access before the public launch' },
  'founder-access': { icon: MessageSquare, title: 'Founder Access', description: 'Direct line to the founding team' },
  'feature-input': { icon: Vote, title: 'Feature Input', description: 'Vote on roadmap priorities' },
  'free-period': { icon: Gift, title: 'Free Period', description: 'Enjoy free usage when we launch' },
  'exclusive-community': { icon: Users, title: 'Exclusive Community', description: 'Join our founding member community' },
  'swag': { icon: Shirt, title: 'Exclusive Swag', description: 'Limited edition merchandise' },
  'founding-member': { icon: Star, title: 'Founding Member Status', description: 'Permanent recognition and badge' },
};

interface BetaPerksContent {
  headline: string;
  subheadline: string;
  perks: string[];
  scarcityMessage?: string;
}

interface Props {
  content: BetaPerksContent;
  styles?: {
    primaryColor?: string;
    headingFont?: string;
    bodyFont?: string;
  };
}

export function BetaPerksSection({ content, styles }: Props) {
  const primaryColor = styles?.primaryColor || '#06b6d4';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    },
  };

  return (
    <section className="py-20 bg-slate-950">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          {/* Scarcity Badge */}
          {content.scarcityMessage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 mb-6"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
              </span>
              <span className="text-sm font-medium text-amber-400">
                {content.scarcityMessage}
              </span>
            </motion.div>
          )}

          <h2 
            className="text-3xl md:text-4xl font-bold text-white mb-4"
            style={{ fontFamily: styles?.headingFont }}
          >
            {content.headline}
          </h2>
          <p 
            className="text-lg text-slate-400 max-w-2xl mx-auto"
            style={{ fontFamily: styles?.bodyFont }}
          >
            {content.subheadline}
          </p>
        </motion.div>

        {/* Perks Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {content.perks.map((perkId) => {
            const perk = PERK_CONFIG[perkId];
            if (!perk) return null;

            const Icon = perk.icon;

            return (
              <motion.div
                key={perkId}
                variants={itemVariants}
                className="group relative p-6 rounded-2xl border border-slate-800 bg-slate-900/50 hover:border-slate-700 transition-colors"
              >
                {/* Glow effect on hover */}
                <div 
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl"
                  style={{ background: `radial-gradient(circle at center, ${primaryColor}10, transparent 70%)` }}
                />

                <div className="relative">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: `${primaryColor}15` }}
                  >
                    <Icon className="w-6 h-6 text-cyan-400" />
                  </div>

                  <h3 className="font-semibold text-white mb-2">
                    {perk.title}
                  </h3>
                  <p className="text-sm text-slate-400">
                    {perk.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom CTA hint */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="flex items-center justify-center gap-2 mt-10 text-slate-400"
        >
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span className="text-sm">All perks are yours when you join the waitlist</span>
        </motion.div>
      </div>
    </section>
  );
}
