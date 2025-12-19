import { 
  Zap, Target, Shield, TrendingUp, Users, Award, Grid, List, Headset, 
  DollarSign, Tag, Clock, CheckCircle, Heart, Star, Lightbulb, Rocket, 
  BarChart3, Lock, Globe, Layers, Settings, MessageSquare, Briefcase,
  Calendar, FileText, Mail, Phone, Search, ShoppingCart, Truck, Wrench,
  type LucideIcon
} from "lucide-react";
import { motion } from "framer-motion";

interface FeaturesSectionProps {
  content: {
    title?: string;
    subtitle?: string;
    features: Array<{
      title: string;
      description: string;
      icon: string;
    }>;
  };
  onUpdate?: (content: any) => void;
}

// Comprehensive icon map - maps string names to Lucide components
const iconMap: Record<string, LucideIcon> = {
  // Original icons
  Zap, Target, Shield, TrendingUp, Users, Award, Grid, List, Headset,
  DollarSign, Tag, Clock, CheckCircle, Heart, Star, Lightbulb, Rocket,
  BarChart3, Lock, Globe, Layers, Settings, MessageSquare, Briefcase,
  Calendar, FileText, Mail, Phone, Search, ShoppingCart, Truck, Wrench,
  // Lowercase versions for flexibility
  zap: Zap, target: Target, shield: Shield, trendingup: TrendingUp,
  users: Users, award: Award, grid: Grid, list: List, headset: Headset,
  dollarsign: DollarSign, tag: Tag, clock: Clock, checkcircle: CheckCircle,
  heart: Heart, star: Star, lightbulb: Lightbulb, rocket: Rocket,
  barchart3: BarChart3, lock: Lock, globe: Globe, layers: Layers,
  settings: Settings, messagesquare: MessageSquare, briefcase: Briefcase,
  calendar: Calendar, filetext: FileText, mail: Mail, phone: Phone,
  search: Search, shoppingcart: ShoppingCart, truck: Truck, wrench: Wrench,
};

/**
 * Get the Lucide icon component for a feature
 * Falls back to CheckCircle if icon name not found
 */
const getIconComponent = (iconName: string): LucideIcon => {
  // Try exact match first
  if (iconMap[iconName]) {
    return iconMap[iconName];
  }
  
  // Try lowercase
  const lowerName = iconName.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (iconMap[lowerName]) {
    return iconMap[lowerName];
  }
  
  // Default fallback
  return CheckCircle;
};

export function FeaturesSection({ content }: FeaturesSectionProps) {
  const { 
    title = "Why Choose Us", 
    subtitle = "Everything you need to succeed",
    features 
  } = content;

  // NO FABRICATION: Only render features that exist in the brief
  // Don't pad with defaults, don't cap at arbitrary numbers
  if (!features || features.length === 0) {
    return null; // Don't render empty section
  }

  // Dynamic grid based on actual feature count
  const getGridClass = () => {
    if (features.length <= 2) return "md:grid-cols-2";
    if (features.length === 3) return "md:grid-cols-3";
    if (features.length === 4) return "md:grid-cols-2 lg:grid-cols-4";
    if (features.length === 5) return "md:grid-cols-2 lg:grid-cols-3";
    return "md:grid-cols-2 lg:grid-cols-3"; // 6+
  };

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
            {title}
          </h2>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400">
            {subtitle}
          </p>
        </motion.div>

        <div className={`grid gap-6 md:gap-8 ${getGridClass()}`}>
          {features.map((feature, i) => {
            const Icon = getIconComponent(feature.icon);
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="group p-8 md:p-10 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-slate-900/30 hover:border-cyan-500/30 dark:hover:border-cyan-500/30 transition-all duration-300 hover:-translate-y-1 flex flex-col"
              >
                {/* Icon with outline style (not filled squares) */}
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-cyan-500/10 dark:bg-cyan-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-7 h-7 md:w-8 md:h-8 text-cyan-500 dark:text-cyan-400" strokeWidth={1.5} />
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
