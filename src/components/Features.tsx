import { Bot, Calculator, TrendingUp, Zap, Smartphone, DollarSign } from "lucide-react";

const features = [
  {
    icon: Bot,
    title: "AI-Powered Strategy",
    description: "Not templates—intelligent consultation based on your business",
  },
  {
    icon: Calculator,
    title: "Built-in Calculators",
    description: "ROI, pricing, savings calculators proven to boost conversions 40%+",
  },
  {
    icon: TrendingUp,
    title: "Conversion Optimized",
    description: "Every element backed by data and best practices",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "10 minutes from idea to published page",
  },
  {
    icon: Smartphone,
    title: "Mobile Perfect",
    description: "Responsive design automatically—looks perfect everywhere",
  },
  {
    icon: DollarSign,
    title: "Fair Pricing",
    description: "$47-397/mo vs $20K+ custom development",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-24 px-6 bg-background">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            What Makes PageConsult Different
          </h2>
          <p className="text-lg text-muted-foreground">
            Professional name. Powerful features. Beautiful design.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="bg-card rounded-xl p-6 shadow-md hover-lift border border-border animate-scale-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
