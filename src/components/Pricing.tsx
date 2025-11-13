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
    <section id="pricing" className="py-24 px-6 bg-gradient-to-b from-slate-950 to-slate-900 relative overflow-hidden">
      {/* Decorative glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-gray-400">
            No surprises. No hidden fees. Just results.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`group bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 animate-scale-in ${
                plan.popular
                  ? "border-2 border-cyan-400 relative md:-mt-4 md:mb-4 hover:border-cyan-300"
                  : "border border-white/10 hover:border-white/20"
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-cyan-400 text-slate-900 px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1 shadow-lg">
                  <Star className="w-3 h-3 fill-current" />
                  Most Popular
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">
                  {plan.name}
                </h3>
                <p className="text-gray-400 mb-4">{plan.description}</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-bold text-white">
                    {plan.price}
                  </span>
                  <span className="text-gray-400">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.popular ? "default" : "outline"}
                size="lg"
                className={`w-full transition-all duration-300 ${
                  plan.popular 
                    ? "bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50" 
                    : "bg-slate-700/50 hover:bg-slate-700 text-white border-white/20 hover:border-white/40"
                }`}
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
