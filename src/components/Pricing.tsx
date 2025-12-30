import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Loader2, Zap, Crown, Users } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { STRIPE_PRICES } from "@/lib/stripe-config";

const plans = [
  {
    id: "starter",
    name: "Starter",
    price: 29,
    tagline: "Perfect for getting started",
    icon: Zap,
    popular: false,
    features: [
      "3 landing pages per month",
      "AI strategy consultation",
      "Basic templates",
      "Email support",
    ],
    buttonText: "Start Free Trial",
    priceId: STRIPE_PRICES.starter,
  },
  {
    id: "founding",
    name: "Founding Member",
    price: 69,
    originalPrice: 99,
    tagline: "Limited to 500 spots",
    icon: Crown,
    popular: true,
    badge: "BEST VALUE",
    discountBadge: "🎉 30% off for life",
    features: [
      "Unlimited landing pages",
      "All premium templates",
      "Priority AI generation",
      "Priority support",
      "Lock in this price forever",
      "Advanced analytics",
    ],
    buttonText: "Claim Founding Spot",
    priceId: STRIPE_PRICES.founding_member,
  },
  {
    id: "agency",
    name: "Agency",
    price: 397,
    tagline: "For teams & agencies",
    icon: Users,
    popular: false,
    features: [
      "Everything in Founding Member",
      "White-label exports",
      "5 team seats",
      "Client sub-accounts",
      "API access",
      "Dedicated support",
    ],
    buttonText: "Start Agency Trial",
    priceId: STRIPE_PRICES.agency,
  },
];

const Pricing = () => {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [foundingSpotsLeft] = useState(127);
  const navigate = useNavigate();

  const handlePlanSelect = async (plan: typeof plans[0]) => {
    setLoadingPlan(plan.id);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.info('Please sign up first to start your trial');
        navigate('/signup');
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          priceId: plan.priceId,
          successUrl: `${window.location.origin}/dashboard?checkout=success`,
          cancelUrl: `${window.location.origin}/#pricing`,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to start checkout. Please try again.');
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <section id="pricing" className="py-24 bg-gradient-to-b from-slate-950 to-slate-900 relative overflow-hidden">
      {/* Decorative glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-gray-400 mb-8">
            Start with a 14-day free trial. No credit card required.
          </p>
          
          {/* Founding Member Banner */}
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-cyan-500/20 to-teal-500/20 border border-cyan-500/30 rounded-full px-6 py-3">
            <Crown className="w-5 h-5 text-cyan-400" />
            <span className="text-cyan-200 font-medium">
              🎉 Limited Time: Lock in Founding Member pricing forever
              <span className="text-cyan-400 ml-1">({foundingSpotsLeft} spots left)</span>
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 items-stretch max-w-5xl mx-auto">
          {plans.map((plan, index) => {
            const isLoading = loadingPlan === plan.id;
            const Icon = plan.icon;
            
            return (
              <div
                key={plan.id}
                className={cn(
                  "group relative animate-scale-in",
                  plan.popular && "md:scale-105 z-10"
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Glow effect for Founding Member card */}
                {plan.popular && (
                  <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-teal-500 to-cyan-500 rounded-2xl blur-lg opacity-50 group-hover:opacity-70 transition-opacity" />
                )}
                
                <div
                  className={cn(
                    "relative rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 h-full flex flex-col",
                    plan.popular
                      ? "bg-gradient-to-b from-slate-800/90 to-slate-900/90 backdrop-blur-sm border-2 border-cyan-400/50 hover:border-cyan-400"
                      : "bg-slate-800/40 backdrop-blur-sm border border-white/10 hover:border-white/20 hover:-translate-y-1"
                  )}
                >
                  {/* Badge */}
                  {plan.badge && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-900 px-4 py-1.5 rounded-full text-sm font-bold tracking-wide shadow-lg shadow-cyan-500/30">
                      {plan.badge}
                    </div>
                  )}

                  {/* Header */}
                  <div className="text-center mb-6 pt-2">
                    <div className={cn(
                      "inline-flex p-3 rounded-xl mb-4",
                      plan.popular 
                        ? "bg-cyan-500/20 text-cyan-400" 
                        : "bg-slate-700/50 text-slate-400"
                    )}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-1">
                      {plan.name}
                    </h3>
                    <p className="text-sm text-slate-400">{plan.tagline}</p>
                  </div>

                  {/* Price */}
                  <div className="text-center mb-4">
                    <div className="flex items-baseline justify-center gap-1">
                      {plan.originalPrice && (
                        <span className="text-lg text-slate-500 line-through mr-2">
                          ${plan.originalPrice}
                        </span>
                      )}
                      <span className={cn(
                        "text-5xl font-bold",
                        plan.popular ? "text-cyan-400" : "text-white"
                      )}>
                        ${plan.price}
                      </span>
                      <span className="text-slate-400">/mo</span>
                    </div>
                    {plan.discountBadge && (
                      <div className="mt-2 inline-block bg-cyan-500/20 text-cyan-300 text-sm font-medium px-3 py-1 rounded-full">
                        {plan.discountBadge}
                      </div>
                    )}
                  </div>

                  {/* Scarcity counter for Founding Member */}
                  {plan.popular && (
                    <div className="flex items-center justify-center gap-2 mb-4 p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                      <span className="text-sm font-medium text-cyan-300">
                        {foundingSpotsLeft} spots remaining
                      </span>
                    </div>
                  )}

                  {/* Features */}
                  <ul className="space-y-3 mb-8 flex-grow">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className={cn(
                          "w-5 h-5 flex-shrink-0 mt-0.5",
                          plan.popular ? "text-cyan-400" : "text-cyan-400/70"
                        )} />
                        <span className="text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <Button
                    size="lg"
                    disabled={isLoading || loadingPlan !== null}
                    onClick={() => handlePlanSelect(plan)}
                    className={cn(
                      "w-full transition-all duration-300 group/btn font-semibold",
                      plan.popular 
                        ? "bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-900 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-105" 
                        : "bg-slate-700/50 hover:bg-slate-700 text-white border-white/20 hover:border-white/40 hover:scale-105"
                    )}
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        {plan.buttonText}
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Trust indicators */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm mb-4">
            14-day free trial • Cancel anytime
          </p>
          <Link 
            to="/pricing" 
            className="text-cyan-400 hover:text-cyan-300 text-sm font-medium inline-flex items-center gap-1 transition-colors"
          >
            See full plan comparison
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
