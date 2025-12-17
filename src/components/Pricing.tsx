import { Button } from "@/components/ui/button";
import { Check, Star, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

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
    <section id="pricing" className="py-24 bg-gradient-to-b from-slate-950 to-slate-900 relative overflow-hidden">
      {/* Decorative glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-gray-400">
            No surprises. No hidden fees. Just results.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 items-center">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`group relative animate-scale-in ${
                plan.popular ? "md:scale-105 z-10" : ""
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Glow effect for Pro card */}
              {plan.popular && (
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-2xl blur-lg opacity-50 group-hover:opacity-70 transition-opacity" />
              )}
              
              <div
                className={`relative rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 ${
                  plan.popular
                    ? "bg-gradient-to-b from-slate-800/90 to-slate-900/90 backdrop-blur-sm border-2 border-cyan-400/50 hover:border-cyan-400"
                    : "bg-slate-800/40 backdrop-blur-sm border border-white/10 hover:border-white/20 hover:-translate-y-1"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-cyan-400 text-slate-900 px-4 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1.5 shadow-lg shadow-cyan-500/30">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    Most Popular
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-400 mb-4">{plan.description}</p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className={`text-5xl font-bold ${plan.popular ? "text-cyan-400" : "text-white"}`}>
                      {plan.price}
                    </span>
                    <span className="text-gray-400">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${plan.popular ? "text-cyan-400" : "text-cyan-400/70"}`} />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  variant={plan.popular ? "default" : "outline"}
                  size="lg"
                  className={`w-full transition-all duration-300 group/btn ${
                    plan.popular 
                      ? "bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 animate-pulse-glow hover:scale-105" 
                      : "bg-slate-700/50 hover:bg-slate-700 text-white border-white/20 hover:border-white/40 hover:scale-105"
                  }`}
                >
                  <Link to="/wizard">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;