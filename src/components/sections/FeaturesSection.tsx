import { Zap, Target, Shield, TrendingUp, Users, Award } from "lucide-react";

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
};

export function FeaturesSection({ content }: FeaturesSectionProps) {
  return (
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-2">Key Features</h2>
          <p className="text-muted-foreground">
            Everything you need to succeed
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {content.features.map((feature, i) => {
            const Icon = iconMap[feature.icon] || Zap;
            return (
              <div
                key={i}
                className="p-6 rounded-lg border bg-card hover:shadow-lg transition-shadow"
              >
                <Icon className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">
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
