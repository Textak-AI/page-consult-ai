import { Zap, Target, Shield, TrendingUp, Users, Award, Grid, List, Headset, DollarSign, Tag, Clock } from "lucide-react";
import { motion } from "framer-motion";

interface FeaturesSectionProps {
  content: {
    features: Array<{
      title: string;
      description: string;
      icon: string;
    }>;
  };
  onUpdate: (content: any) => void;
}

const iconMap: { [key: string]: any } = {
  Zap,
  Target,
  Shield,
  TrendingUp,
  Users,
  Award,
  Grid,
  List,
  Headset,
  DollarSign,
  Tag,
  Clock,
};

const getIconForFeature = (feature: { title: string; description: string; icon: string }) => {
  const text = `${feature.title} ${feature.description}`.toLowerCase();
  
  // Quality/Premium
  if (text.match(/quality|premium|excellence|best|top|superior/)) return Shield;
  if (text.match(/award|certified|professional|expert/)) return Award;
  
  // Selection/Variety
  if (text.match(/selection|variety|range|options|choice/)) return Grid;
  if (text.match(/collection|catalog|inventory/)) return List;
  
  // Experience/Support
  if (text.match(/support|help|service|assist|care/)) return Headset;
  if (text.match(/experience|team|community|people/)) return Users;
  
  // Pricing
  if (text.match(/price|cost|afford|budget|value/)) return DollarSign;
  if (text.match(/deal|discount|sale|offer/)) return Tag;
  
  // Speed/Efficiency
  if (text.match(/fast|quick|speed|instant|rapid/)) return Zap;
  if (text.match(/time|efficient|save|delivery/)) return Clock;
  
  // Goals/Targeting
  if (text.match(/goal|target|focus|aim|result/)) return Target;
  if (text.match(/growth|improve|increase|boost/)) return TrendingUp;
  
  // Fallback to provided icon or default
  return iconMap[feature.icon] || Zap;
};

export function FeaturesSection({ content }: FeaturesSectionProps) {
  return (
    <section className="py-20 md:py-28 px-4 bg-slate-50 dark:bg-slate-900/50">
      <div className="container mx-auto max-w-6xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16 md:mb-20 mx-auto max-w-3xl"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-5 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Why Choose Us
          </h2>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400">
            Everything you need to succeed, all in one place
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {content.features.map((feature, i) => {
            const Icon = getIconForFeature(feature);
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="group p-8 md:p-10 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-slate-900/30 hover:border-cyan-500/30 dark:hover:border-cyan-500/30 transition-all duration-300 hover:-translate-y-1 flex flex-col"
              >
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-cyan-500/20">
                  <Icon className="w-7 h-7 md:w-8 md:h-8 text-white" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold mb-4 text-slate-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
