import { Zap, Target, Shield, TrendingUp, Users, Award, Grid, List, Headset, DollarSign, Tag, Clock } from "lucide-react";

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
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16 mx-auto max-w-3xl">
          <h2 className="text-4xl font-bold mb-4">Key Features</h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to succeed
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {content.features.map((feature, i) => {
            const Icon = getIconForFeature(feature);
            return (
              <div
                key={i}
                className="p-8 rounded-lg border bg-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col"
              >
                <Icon className="w-12 h-12 text-primary mb-6" />
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-base text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
