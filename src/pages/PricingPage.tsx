import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Loader2, Zap, Shield, Crown, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { STRIPE_PRICES } from "@/lib/stripe-config";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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
      "Standard generation speed",
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
      "Early access to new features",
      "Advanced analytics",
      "Custom domains",
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
      "Custom integrations",
    ],
    buttonText: "Start Agency Trial",
    priceId: STRIPE_PRICES.agency,
  },
];

const faqs = [
  {
    question: "What's included in the free trial?",
    answer: "All paid plans come with a 14-day free trial. You'll have full access to all features during the trial period. Your card will only be charged after the trial ends.",
  },
  {
    question: "What makes Founding Members special?",
    answer: "Founding Members lock in $69/mo forever, even as prices increase. You also get early access to new features and priority support. Only 500 spots available.",
  },
  {
    question: "Can I cancel anytime?",
    answer: "Yes! You can cancel your subscription at any time. You'll continue to have access until the end of your billing period.",
  },
  {
    question: "Do you offer refunds?",
    answer: "We offer a 30-day money-back guarantee on all paid plans. If you're not satisfied, contact us for a full refund.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, debit cards, and in some regions, local payment methods through Stripe.",
  },
];

const PricingPage = () => {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [foundingSpotsLeft] = useState(127);
  const navigate = useNavigate();

  const handlePlanSelect = async (plan: typeof plans[0]) => {
    setLoadingPlan(plan.id);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.info('Please sign up first to start your trial');
        navigate('/signup', { state: { returnTo: '/pricing', selectedPlan: plan.id } });
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          priceId: plan.priceId,
          successUrl: `${window.location.origin}/dashboard?checkout=success`,
          cancelUrl: `${window.location.origin}/pricing?checkout=canceled`,
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
    <div className="min-h-screen bg-slate-950">
      <Header />
      
      <main className="pt-24 pb-20">
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto px-4 mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Choose Your Plan
          </h1>
          <p className="text-xl text-slate-400 mb-8">
            Start building high-converting landing pages in minutes, not weeks.
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

        {/* Pricing Cards */}
        <div className="max-w-6xl mx-auto px-4 mb-20">
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => {
              const isLoading = loadingPlan === plan.id;
              const Icon = plan.icon;
              
              return (
                <div
                  key={plan.id}
                  className={cn(
                    "relative group",
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
                      "relative rounded-2xl p-6 h-full flex flex-col",
                      plan.popular
                        ? "bg-gradient-to-b from-slate-800/95 to-slate-900/95 border-2 border-cyan-500/50"
                        : "bg-slate-800/50 border border-slate-700/50 hover:border-slate-600"
                    )}
                  >
                    {/* Badge */}
                    {plan.badge && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-900 px-4 py-1 rounded-full text-xs font-bold tracking-wide">
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
                      <h3 className="text-xl font-bold text-white mb-1">
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
                          "text-4xl font-bold",
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
                    <ul className="space-y-3 mb-6 flex-grow">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2">
                          <Check className={cn(
                            "w-5 h-5 flex-shrink-0 mt-0.5",
                            plan.popular ? "text-cyan-400" : "text-cyan-400"
                          )} />
                          <span className="text-sm text-slate-300">{feature}</span>
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
                          ? "bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-900 shadow-lg shadow-cyan-500/30"
                          : "bg-slate-700 hover:bg-slate-600 text-white"
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
              );
            })}
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-6 text-slate-400 text-sm flex-wrap justify-center">
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-400" />
              14-day free trial
            </span>
            <span className="w-1 h-1 bg-slate-600 rounded-full hidden sm:block" />
            <span>Cancel anytime</span>
            <span className="w-1 h-1 bg-slate-600 rounded-full hidden sm:block" />
            <span>30-day money-back guarantee</span>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {faqs.map((faq) => (
              <div 
                key={faq.question}
                className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6"
              >
                <h3 className="text-lg font-semibold text-white mb-2">
                  {faq.question}
                </h3>
                <p className="text-slate-400">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PricingPage;
