import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Star, ArrowRight, Loader2, Zap } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { STRIPE_PRICES } from "@/lib/stripe-config";

const plans = [
  {
    id: "starter",
    name: "Starter",
    monthlyPrice: 0,
    annualPrice: 0,
    tagline: "Perfect for trying it out",
    popular: false,
    features: [
      "3 AI Actions/month",
      "1 landing page",
      "Basic templates",
      "Community support",
    ],
    buttonText: "Get Started Free",
    priceId: null,
    annualPriceId: null,
  },
  {
    id: "pro",
    name: "Pro",
    monthlyPrice: 29,
    annualPrice: 290,
    annualSavings: 58,
    tagline: "For growing businesses",
    popular: true,
    features: [
      "150 AI Actions/month",
      "15 published pages",
      "All calculator types",
      "AI optimization suggestions",
      "Custom domains",
      "Priority support",
    ],
    buttonText: "Start Pro Trial",
    priceId: STRIPE_PRICES.pro_monthly,
    annualPriceId: null, // Will be added when annual price is created
  },
  {
    id: "agency",
    name: "Agency",
    monthlyPrice: 99,
    annualPrice: 990,
    annualSavings: 198,
    tagline: "For agencies & teams",
    popular: false,
    features: [
      "Unlimited AI Actions",
      "Unlimited pages",
      "White-label option",
      "Client sub-accounts",
      "API access",
      "Advanced analytics",
    ],
    buttonText: "Start Agency Trial",
    priceId: STRIPE_PRICES.agency_monthly,
    annualPriceId: null, // Will be added when annual price is created
  },
];

const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const navigate = useNavigate();

  const handlePlanSelect = async (plan: typeof plans[0]) => {
    console.log('📋 Plan selected:', plan.id, { isAnnual });
    
    // Free plan - just navigate to signup
    if (!plan.priceId) {
      navigate('/wizard');
      return;
    }

    // Paid plan - check auth and start checkout
    setLoadingPlan(plan.id);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      console.log('🔐 Auth session:', session ? 'Authenticated' : 'Not authenticated');
      
      if (!session) {
        // Not logged in - go to signup first
        toast.info('Please sign up first to start your trial');
        navigate('/signup');
        return;
      }

      const priceId = isAnnual && plan.annualPriceId ? plan.annualPriceId : plan.priceId;
      console.log('📡 Calling stripe-checkout with priceId:', priceId);

      const { data, error } = await supabase.functions.invoke('stripe-checkout', {
        body: {
          priceId,
          mode: 'subscription',
          successUrl: `${window.location.origin}/generate?checkout=success`,
          cancelUrl: `${window.location.origin}/#pricing`,
        },
      });

      console.log('📥 Stripe response:', { data, error });

      if (error) throw error;

      if (data?.url) {
        console.log('✅ Redirecting to Stripe:', data.url);
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('❌ Checkout error:', error);
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
            No surprises. No hidden fees. Just results.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex bg-slate-800/80 rounded-full p-1 border border-slate-700">
            <button 
              className={cn(
                "px-5 py-2 rounded-full text-sm font-medium transition-all duration-200",
                !isAnnual 
                  ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg" 
                  : "text-slate-400 hover:text-white"
              )}
              onClick={() => setIsAnnual(false)}
            >
              Monthly
            </button>
            <button 
              className={cn(
                "px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center",
                isAnnual 
                  ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg" 
                  : "text-slate-400 hover:text-white"
              )}
              onClick={() => setIsAnnual(true)}
            >
              Annual
              <span className="ml-2 text-xs text-cyan-300">Save 17%</span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan, index) => {
            const isLoading = loadingPlan === plan.id;
            const displayPrice = isAnnual ? plan.annualPrice : plan.monthlyPrice;
            const period = isAnnual ? '/year' : '/mo';
            
            return (
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
                  className={cn(
                    "relative rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 h-full flex flex-col",
                    plan.popular
                      ? "bg-gradient-to-b from-slate-800/90 to-slate-900/90 backdrop-blur-sm border-2 border-cyan-400/50 hover:border-cyan-400"
                      : "bg-slate-800/40 backdrop-blur-sm border border-white/10 hover:border-white/20 hover:-translate-y-1"
                  )}
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
                    <p className="text-gray-400 mb-4">{plan.tagline}</p>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className={cn(
                        "text-5xl font-bold",
                        plan.popular ? "text-cyan-400" : "text-white"
                      )}>
                        ${displayPrice}
                      </span>
                      <span className="text-gray-400">{period}</span>
                    </div>
                    {isAnnual && plan.annualSavings && (
                      <p className="mt-2 text-sm text-emerald-400">
                        Save ${plan.annualSavings}/year
                      </p>
                    )}
                  </div>

                  {/* Actions highlight for paid plans */}
                  {plan.id !== 'starter' && (
                    <div className="flex items-center justify-center gap-2 mb-4 p-2 rounded-lg bg-white/5">
                      <Zap className="w-4 h-4 text-cyan-400" />
                      <span className="text-sm font-medium text-cyan-300">
                        {plan.id === 'agency' ? 'Unlimited' : '150'} AI Actions/mo
                      </span>
                    </div>
                  )}

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

                  <Button
                    variant={plan.popular ? "default" : "outline"}
                    size="lg"
                    disabled={isLoading || loadingPlan !== null}
                    onClick={() => handlePlanSelect(plan)}
                    className={cn(
                      "w-full transition-all duration-300 group/btn",
                      plan.popular 
                        ? "bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-105" 
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
        <div className="mt-16 text-center">
          <p className="text-gray-500 text-sm">
            14-day free trial on all paid plans • Cancel anytime • No credit card required to start
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;