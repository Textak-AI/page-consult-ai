import { Button } from "@/components/ui/button";
import { Check, Star } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "$47",
    period: "/mo",
    description: "Perfect for solopreneurs",
    popular: false,
    features: [
      "3 published pages",
      "All templates & styles",
      "1 calculator type",
      "Basic analytics",
      "Export HTML",
    ],
  },
  {
    name: "Pro",
    price: "$147",
    period: "/mo",
    description: "For growing businesses",
    popular: true,
    features: [
      "15 published pages",
      "All calculator types",
      "AI optimization suggestions",
      "Custom domains",
      "A/B testing",
      "Remove branding",
    ],
  },
  {
    name: "Agency",
    price: "$397",
    period: "/mo",
    description: "For agencies & teams",
    popular: false,
    features: [
      "Unlimited pages",
      "White-label option",
      "Client sub-accounts",
      "API access",
      "Priority support",
      "Advanced analytics",
    ],
  },
];

const Pricing = () => {
  return (
    <section id="pricing" className="py-24 px-6 bg-background">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-muted-foreground">
            No surprises. No hidden fees. Just results.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`bg-card rounded-2xl p-8 shadow-lg hover-lift animate-scale-in ${
                plan.popular
                  ? "border-2 border-secondary relative md:-mt-4 md:mb-4"
                  : "border border-border"
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-secondary text-secondary-foreground px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1 shadow-md">
                  <Star className="w-3 h-3 fill-current" />
                  Most Popular
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  {plan.name}
                </h3>
                <p className="text-muted-foreground mb-4">{plan.description}</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-bold text-foreground">
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.popular ? "hero" : "outline"}
                size="lg"
                className="w-full"
              >
                Start Free Trial
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
