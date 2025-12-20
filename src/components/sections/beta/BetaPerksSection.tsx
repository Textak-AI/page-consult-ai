import { motion } from "framer-motion";
import { 
  DollarSign, 
  Zap, 
  MessageSquare, 
  Vote, 
  Gift, 
  Users, 
  Shirt, 
  Star,
  CheckCircle,
  Sparkles,
  type LucideIcon
} from "lucide-react";
import { PremiumCard, EyebrowBadge, GradientIcon } from "@/components/ui/PremiumCard";

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

interface BetaPerksSectionProps {
  content: {
    headline?: string;
    subheadline?: string;
    perks?: string[] | Array<{ title: string; description: string; icon?: string }>;
    scarcityMessage?: string;
  };
  onUpdate?: (content: any) => void;
}

export function BetaPerksSection({ content }: BetaPerksSectionProps) {
  const { 
    headline = "Early Adopter Perks",
    subheadline = "Exclusive benefits for joining early",
    perks = [],
    scarcityMessage 
  } = content;

  // Handle both string[] and object[] formats
  const normalizedPerks = perks.map((perk) => {
    if (typeof perk === 'string') {
      return PERK_DISPLAY[perk] || { icon: CheckCircle, title: perk, description: '' };
    }
    return {
      icon: CheckCircle,
      title: perk.title,
      description: perk.description,
    };
  }).filter(p => p.title);

  if (normalizedPerks.length === 0) return null;

  const getGridClass = () => {
    if (normalizedPerks.length <= 2) return "md:grid-cols-2";
    if (normalizedPerks.length === 3) return "md:grid-cols-3";
    if (normalizedPerks.length === 4) return "md:grid-cols-2 lg:grid-cols-4";
    return "md:grid-cols-2 lg:grid-cols-4";
  };

  return (
    <section 
      className="relative overflow-hidden"
      style={{ 
        backgroundColor: 'hsl(217, 33%, 6%)',
        padding: '120px 24px',
      }}
    >
      {/* Background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30" />
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full blur-[150px]"
        style={{ backgroundColor: 'hsla(270, 95%, 60%, 0.05)' }}
      />

      <div className="container mx-auto max-w-6xl relative z-10">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16 mx-auto max-w-3xl"
        >
          <EyebrowBadge 
            icon={<Gift className="w-4 h-4" strokeWidth={1.5} />} 
            text="Early Adopter Exclusive" 
            className="mb-6"
          />
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-white tracking-tight">
            {headline}
          </h2>
          <p className="text-lg md:text-xl text-slate-400 leading-relaxed">
            {subheadline}
          </p>
        </motion.div>

        {/* Perks Grid */}
        <div className={`grid gap-6 ${getGridClass()}`}>
          {normalizedPerks.map((perk, i) => {
            const Icon = perk.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <PremiumCard 
                  variant="glass" 
                  glow 
                  glowColor="purple"
                  className="h-full group text-center"
                >
                  {/* Icon */}
                  <GradientIcon colorFrom="hsl(270, 95%, 60%)" colorTo="hsl(189, 95%, 43%)" className="mb-6 mx-auto">
                    <Icon className="w-7 h-7 text-white" strokeWidth={1.5} />
                  </GradientIcon>
                  
                  {/* Title */}
                  <h3 className="text-xl md:text-2xl font-semibold mb-3 text-white group-hover:text-purple-400 transition-colors">
                    {perk.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-base text-slate-400 leading-relaxed">
                    {perk.description}
                  </p>
                </PremiumCard>
              </motion.div>
            );
          })}
        </div>

        {/* Scarcity Message */}
        {scarcityMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-12 flex justify-center"
          >
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-amber-500/10 border border-amber-500/30">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
              </span>
              <span className="text-amber-400 font-medium">
                {scarcityMessage}
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
