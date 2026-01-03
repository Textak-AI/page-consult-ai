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
    buttonText: "Get Started",
    priceId: STRIPE_PRICES.starter,
  },
  {
    id: "founding",
    name: "Founding Member",
    price: 69,
    originalPrice: 149,
    tagline: "Limited to 500 spots",
    icon: Crown,
    popular: true,
    badge: "Most Popular",
    features: [
      "Unlimited landing pages",
      "All premium templates",
      "Priority AI generation",
      "Priority support",
      "Lock in this price forever",
      "Advanced analytics",
    ],
    buttonText: "Lock In Founding Price",
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
    buttonText: "Contact Sales",
    priceId: STRIPE_PRICES.agency,
  },
];

const Pricing = () => {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
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
    <section id="pricing" className="py-24 bg-slate-900 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-purple-500/10 to-transparent blur-[100px]" />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16 animate-fade-in">
          <p className="text-cyan-400 text-sm font-semibold tracking-wide uppercase mb-3">
            Pricing
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-white/50 text-lg">
            Start free. Scale when you're ready.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 items-stretch max-w-5xl mx-auto">
          {plans.map((plan, index) => {
            const isLoading = loadingPlan === plan.id;
            const Icon = plan.icon;
            
            return (
              <div
                key={plan.id}
                className={cn(
                  "relative animate-scale-in h-full",
                  plan.popular && "z-10"
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Glow for featured plan */}
                {plan.popular && (
                  <div className="absolute -inset-[1px] bg-gradient-to-b from-purple-500 via-cyan-500 to-purple-500 rounded-3xl blur-sm opacity-50" />
                )}
                
                {/* Badge */}
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                    <span className="px-4 py-1.5 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full text-white text-xs font-semibold shadow-lg">
                      {plan.badge}
                    </span>
                  </div>
                )}
                
                <div className={cn(
                  "relative rounded-3xl p-8 h-full flex flex-col",
                  plan.popular
                    ? "bg-slate-900 border border-white/10"
                    : "bg-slate-800/50 backdrop-blur-sm border border-white/5 hover:border-white/10 transition-all duration-300"
                )}>
                  {/* Inner gradient for featured */}
                  {plan.popular && (
                    <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 via-transparent to-cyan-500/10 rounded-3xl" />
                  )}
                  
                  <div className="relative z-10 flex flex-col h-full">
                    {/* Header */}
                    <p className={cn(
                      "text-sm font-medium uppercase tracking-wide mb-2",
                      plan.popular ? "text-purple-400" : "text-white/60"
                    )}>
                      {plan.name}
                    </p>
                    
                    {/* Price */}
                    <div className="flex items-baseline gap-1 mb-1">
                      {plan.originalPrice && (
                        <span className="text-lg text-white/30 line-through mr-2">
                          ${plan.originalPrice}
                        </span>
                      )}
                      <span className={cn(
                        "font-bold",
                        plan.popular ? "text-5xl text-white" : "text-4xl text-white"
                      )}>
                        ${plan.price}
                      </span>
                      <span className="text-white/40">/month</span>
                    </div>
                    
                    {plan.originalPrice && (
                      <p className="text-white/40 text-sm mb-6">
                        ${plan.originalPrice}/month after beta
                      </p>
                    )}
                    {!plan.originalPrice && (
                      <p className="text-white/40 text-sm mb-6">{plan.tagline}</p>
                    )}
                    
                    {/* Features */}
                    <ul className="space-y-4 mb-8 flex-grow">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3">
                          <Check className={cn(
                            "w-5 h-5 flex-shrink-0 mt-0.5",
                            plan.popular ? "text-cyan-400" : "text-emerald-400"
                          )} />
                          <span className={cn(
                            plan.popular ? "text-white" : "text-white/70"
                          )}>
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                    
                    {/* CTA Button */}
                    <Button
                      size="lg"
                      disabled={isLoading || loadingPlan !== null}
                      onClick={() => handlePlanSelect(plan)}
                      className={cn(
                        "w-full font-semibold transition-all",
                        plan.popular 
                          ? "bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-400 hover:to-cyan-400 text-white shadow-lg shadow-purple-500/25 border-0" 
                          : "bg-transparent border border-white/10 text-white hover:bg-white/5"
                      )}
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          {plan.buttonText}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Trust indicators */}
        <div className="mt-12 text-center">
          <p className="text-white/30 text-sm mb-4">
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
