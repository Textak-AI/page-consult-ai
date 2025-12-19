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
  iconStyle?: "outline" | "solid" | "duotone";
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

export function FeaturesSection({ content, iconStyle = "outline" }: FeaturesSectionProps) {
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

  // Get stroke width based on icon style
  const getStrokeWidth = () => {
    switch (iconStyle) {
      case "solid": return 2.5;
      case "duotone": return 1.5;
      default: return 1.5; // outline
    }
  };

  return (
    <section 
      style={{ 
        backgroundColor: 'var(--color-background-alt)',
        padding: 'var(--spacing-section-y) var(--spacing-section-x)',
      }}
    >
      <div className="container mx-auto max-w-6xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16 md:mb-20 mx-auto max-w-3xl"
        >
          <h2 
            className="text-3xl sm:text-4xl md:text-5xl mb-5"
            style={{ 
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-heading)',
              fontWeight: 'var(--font-weight-heading)',
              lineHeight: 'var(--line-height-heading)',
              letterSpacing: 'var(--letter-spacing-heading)',
            }}
          >
            {title}
          </h2>
          <p 
            className="text-lg md:text-xl"
            style={{ 
              color: 'var(--color-text-secondary)',
              fontFamily: 'var(--font-body)',
              lineHeight: 'var(--line-height-body)',
            }}
          >
            {subtitle}
          </p>
        </motion.div>

        <div className={`grid ${getGridClass()}`} style={{ gap: 'var(--spacing-card-gap)' }}>
          {features.map((feature, i) => {
            const Icon = getIconComponent(feature.icon);
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="group flex flex-col hover:-translate-y-1 transition-all duration-300"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                  borderWidth: 'var(--border-width)',
                  borderStyle: 'solid',
                  borderRadius: 'var(--radius-medium)',
                  padding: 'var(--spacing-card-padding)',
                  boxShadow: 'var(--shadow-small)',
                }}
              >
                {/* Icon with style from design system */}
                <div 
                  className="w-14 h-14 md:w-16 md:h-16 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300"
                  style={{ 
                    backgroundColor: 'var(--color-primary-muted)',
                    borderRadius: 'var(--radius-medium)',
                  }}
                >
                  <Icon 
                    className="w-7 h-7 md:w-8 md:h-8" 
                    style={{ color: 'var(--color-primary)' }}
                    strokeWidth={getStrokeWidth()} 
                  />
                </div>
                <h3 
                  className="text-xl md:text-2xl mb-4"
                  style={{ 
                    color: 'var(--color-text-primary)',
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 'var(--font-weight-heading)',
                  }}
                >
                  {feature.title}
                </h3>
                <p 
                  className="text-base md:text-lg"
                  style={{ 
                    color: 'var(--color-text-secondary)',
                    fontFamily: 'var(--font-body)',
                    lineHeight: 'var(--line-height-body)',
                  }}
                >
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
