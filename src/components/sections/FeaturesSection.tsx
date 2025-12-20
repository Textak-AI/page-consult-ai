import { 
  Zap, Target, Shield, TrendingUp, Users, Award, Grid, List, Headset, 
  DollarSign, Tag, Clock, CheckCircle, Heart, Star, Lightbulb, Rocket, 
  BarChart3, Lock, Globe, Layers, Settings, MessageSquare, Briefcase,
  Calendar, FileText, Mail, Phone, Search, ShoppingCart, Truck, Wrench,
  Sparkles,
  type LucideIcon
} from "lucide-react";
import { motion } from "framer-motion";
import { PremiumCard, GradientIcon, EyebrowBadge } from "@/components/ui/PremiumCard";

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
  iconStyle?: "outline" | "solid" | "duotone";
}

// Comprehensive icon map
const iconMap: Record<string, LucideIcon> = {
  Zap, Target, Shield, TrendingUp, Users, Award, Grid, List, Headset,
  DollarSign, Tag, Clock, CheckCircle, Heart, Star, Lightbulb, Rocket,
  BarChart3, Lock, Globe, Layers, Settings, MessageSquare, Briefcase,
  Calendar, FileText, Mail, Phone, Search, ShoppingCart, Truck, Wrench,
  zap: Zap, target: Target, shield: Shield, trendingup: TrendingUp,
  users: Users, award: Award, grid: Grid, list: List, headset: Headset,
  dollarsign: DollarSign, tag: Tag, clock: Clock, checkcircle: CheckCircle,
  heart: Heart, star: Star, lightbulb: Lightbulb, rocket: Rocket,
  barchart3: BarChart3, lock: Lock, globe: Globe, layers: Layers,
  settings: Settings, messagesquare: MessageSquare, briefcase: Briefcase,
  calendar: Calendar, filetext: FileText, mail: Mail, phone: Phone,
  search: Search, shoppingcart: ShoppingCart, truck: Truck, wrench: Wrench,
};

const getIconComponent = (iconName: string): LucideIcon => {
  if (iconMap[iconName]) return iconMap[iconName];
  const lowerName = iconName.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (iconMap[lowerName]) return iconMap[lowerName];
  return CheckCircle;
};

export function FeaturesSection({ content, iconStyle = "outline" }: FeaturesSectionProps) {
  const { 
    title = "Why Choose Us", 
    subtitle = "Everything you need to succeed",
    features 
  } = content;

  if (!features || features.length === 0) return null;

  const getGridClass = () => {
    if (features.length <= 2) return "md:grid-cols-2";
    if (features.length === 3) return "md:grid-cols-3";
    if (features.length === 4) return "md:grid-cols-2 lg:grid-cols-4";
    if (features.length === 5) return "md:grid-cols-2 lg:grid-cols-3";
    return "md:grid-cols-2 lg:grid-cols-3";
  };

  return (
    <section 
      className="relative overflow-hidden"
      style={{ 
        backgroundColor: 'hsl(217, 33%, 6%)',
        padding: '120px 24px',
      }}
    >
      {/* Subtle Background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30" />
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full blur-[150px]"
        style={{ backgroundColor: 'hsla(189, 95%, 43%, 0.05)' }}
      />

      <div className="container mx-auto max-w-6xl relative z-10">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-20 mx-auto max-w-3xl"
        >
          <EyebrowBadge 
            icon={<Sparkles className="w-4 h-4" strokeWidth={1.5} />} 
            text="Features" 
            className="mb-6"
          />
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-white tracking-tight">
            {title}
          </h2>
          <p className="text-lg md:text-xl text-slate-400 leading-relaxed">
            {subtitle}
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className={`grid gap-6 ${getGridClass()}`}>
          {features.map((feature, i) => {
            const Icon = getIconComponent(feature.icon);
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
                  glowColor="cyan"
                  className="h-full group"
                >
                  {/* Gradient Icon */}
                  <GradientIcon className="mb-6">
                    <Icon className="w-7 h-7 text-white" strokeWidth={1.5} />
                  </GradientIcon>
                  
                  {/* Title */}
                  <h3 className="text-xl md:text-2xl font-semibold mb-4 text-white group-hover:text-cyan-400 transition-colors">
                    {feature.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-base md:text-lg text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </PremiumCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
