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
import { getIndustryTokens, type IndustryVariant } from "@/config/designSystem/industryVariants";

interface FeaturesSectionProps {
  content: {
    title?: string;
    subtitle?: string;
    eyebrow?: string;
    features: Array<{
      title: string;
      description: string;
      icon: string;
    }>;
    industryVariant?: IndustryVariant;
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
    eyebrow = "Features",
    features,
    industryVariant = 'default',
  } = content;

  // Debug logging
  console.log('🎨 [FeaturesSection] content.industryVariant:', content.industryVariant);
  console.log('🎨 [FeaturesSection] industryVariant (destructured):', industryVariant);

  if (!features || features.length === 0) return null;
  
  // Get industry-specific tokens
  const tokens = getIndustryTokens(industryVariant);
  const isLightMode = tokens.mode === 'light';
  console.log('🎨 [FeaturesSection] tokens.mode:', tokens.mode, 'isLightMode:', isLightMode);

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
        backgroundColor: isLightMode ? `hsl(${tokens.colors.bgPrimary})` : 'hsl(217, 33%, 6%)',
        padding: `${tokens.spacing.sectionPadding} 24px`,
      }}
    >
      {/* Subtle Background */}
      {!isLightMode && (
        <>
          <div className="absolute inset-0 bg-grid-pattern opacity-30" />
          <div 
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full blur-[150px]"
            style={{ backgroundColor: 'hsla(189, 95%, 43%, 0.05)' }}
          />
        </>
      )}

      <div className="container mx-auto relative z-10" style={{ maxWidth: tokens.spacing.contentWidth }}>
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
            text={eyebrow} 
            className="mb-6"
          />
          
          <h2 
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 tracking-tight"
            style={{ 
              color: isLightMode ? `hsl(${tokens.colors.textPrimary})` : 'white',
              fontFamily: tokens.typography.headingFont,
              fontWeight: tokens.typography.headingWeight,
              letterSpacing: tokens.typography.letterSpacing,
            }}
          >
            {title}
          </h2>
          <p 
            className="text-lg md:text-xl leading-relaxed"
            style={{ 
              color: isLightMode ? `hsl(${tokens.colors.textSecondary})` : 'hsl(215, 20%, 65%)',
            }}
          >
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
                {isLightMode ? (
                  // Consulting-style: white cards, subtle shadow, no glassmorphism
                  <div 
                    className="h-full p-8 transition-all duration-300 hover:shadow-lg group"
                    style={{
                      backgroundColor: `hsl(${tokens.colors.bgCard})`,
                      borderRadius: tokens.shape.radiusCard,
                      boxShadow: tokens.shape.shadowCard,
                      border: tokens.shape.borderCard,
                    }}
                  >
                    {/* Icon */}
                    <div 
                      className="w-14 h-14 rounded-xl flex items-center justify-center mb-6"
                      style={{ 
                        backgroundColor: 'hsl(174 84% 95%)',
                      }}
                    >
                      <Icon className="w-7 h-7" style={{ color: `hsl(${tokens.colors.accent})` }} strokeWidth={1.5} />
                    </div>
                    
                    {/* Title */}
                    <h3 
                      className="text-xl md:text-2xl mb-4 transition-colors"
                      style={{ 
                        color: `hsl(${tokens.colors.textPrimary})`,
                        fontFamily: tokens.typography.headingFont,
                        fontWeight: tokens.typography.headingWeight,
                      }}
                    >
                      {feature.title}
                    </h3>
                    
                    {/* Description */}
                    <p 
                      className="text-base md:text-lg leading-relaxed"
                      style={{ 
                        color: `hsl(${tokens.colors.textSecondary})`,
                        lineHeight: tokens.typography.lineHeight,
                      }}
                    >
                      {feature.description}
                    </p>
                  </div>
                ) : (
                  // SaaS-style: glass cards with glow
                  <PremiumCard 
                    variant="glass" 
                    glow 
                    glowColor="cyan"
                    className="h-full group"
                  >
                    <GradientIcon className="mb-6">
                      <Icon className="w-7 h-7 text-white" strokeWidth={1.5} />
                    </GradientIcon>
                    
                    <h3 className="text-xl md:text-2xl font-semibold mb-4 text-white group-hover:text-cyan-400 transition-colors">
                      {feature.title}
                    </h3>
                    
                    <p className="text-base md:text-lg text-slate-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </PremiumCard>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
