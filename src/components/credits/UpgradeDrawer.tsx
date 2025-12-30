import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Check, ArrowRight, Sparkles, Loader2, Crown, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { STRIPE_PRICES } from '@/lib/stripe-config';

interface UpgradeDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPlan?: string;
  currentUsage?: { used: number; total: number };
  onSelectPlan?: (planId: string) => void;
  onPurchaseActions?: (amount: number) => void;
}

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    price: 29,
    priceLabel: '$29/mo',
    actionsLabel: '3 pages/mo',
    priceId: STRIPE_PRICES.starter,
    icon: Zap,
    features: [
      '3 landing pages per month',
      'AI strategy consultation',
      'Basic templates',
      'Email support',
    ],
  },
  {
    id: 'founding',
    name: 'Founding Member',
    price: 69,
    originalPrice: 99,
    priceLabel: '$69/mo',
    actionsLabel: 'Unlimited pages',
    priceId: STRIPE_PRICES.founding_member,
    icon: Crown,
    features: [
      'Unlimited landing pages',
      'All premium templates',
      'Priority AI generation',
      'Priority support',
      'Lock in price forever',
    ],
    recommended: true,
    discountBadge: '30% off for life',
  },
  {
    id: 'agency',
    name: 'Agency',
    price: 397,
    priceLabel: '$397/mo',
    actionsLabel: 'Team access',
    priceId: STRIPE_PRICES.agency,
    icon: Users,
    features: [
      'Everything in Founding Member',
      'White-label exports',
      '5 team seats',
      'Client sub-accounts',
      'API access',
    ],
  },
];

export function UpgradeDrawer({
  open,
  onOpenChange,
  currentPlan = 'starter',
  currentUsage,
  onSelectPlan,
}: UpgradeDrawerProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  // Handle escape key to close
  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && open) {
      onOpenChange(false);
    }
  }, [open, onOpenChange]);

  // Lock body scroll and add escape listener when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleEscape);
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, handleEscape]);

  const handleCheckout = async (priceId: string) => {
    console.log('🛒 Starting checkout:', { priceId });
    setIsLoading(priceId);
    try {
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      console.log('🔐 Auth session:', session ? 'Authenticated' : 'Not authenticated');
      
      if (!session) {
        toast.error('Please sign in to upgrade your plan');
        setIsLoading(null);
        return;
      }

      console.log('📡 Calling create-checkout-session function...');
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          priceId,
          successUrl: `${window.location.origin}/dashboard?checkout=success`,
          cancelUrl: `${window.location.origin}/dashboard?checkout=cancelled`,
        },
      });

      console.log('📥 Stripe checkout response:', { data, error });

      if (error) {
        console.error('❌ Edge function error:', error);
        throw error;
      }

      if (data?.url) {
        console.log('✅ Redirecting to Stripe:', data.url);
        window.location.href = data.url;
      } else {
        console.error('❌ No checkout URL in response:', data);
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('❌ Checkout error:', error);
      toast.error('Failed to start checkout. Please try again.');
    } finally {
      setIsLoading(null);
    }
  };

  const handlePlanSelect = async (planId: string, priceId: string) => {
    console.log('📋 Plan selected:', { planId, priceId });
    onSelectPlan?.(planId);
    await handleCheckout(priceId);
  };

  return (
    <AnimatePresence mode="wait">
      {open && (
        <>
          {/* Backdrop - z-40 */}
          <motion.div
            key="upgrade-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
            onClick={() => onOpenChange(false)}
            aria-hidden="true"
          />
          
          {/* Drawer - z-50 */}
          <motion.div
            key="upgrade-drawer"
            initial={{ y: '100%', opacity: 0.5 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 350 }}
            className="fixed bottom-0 left-0 right-0 z-50 max-h-[90vh] overflow-hidden rounded-t-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 border-t border-white/10 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="upgrade-drawer-title"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 rounded-full bg-white/20" />
            </div>
            
            {/* Header */}
            <div className="px-6 pb-4 flex items-center justify-between">
              <div>
              <h2 id="upgrade-drawer-title" className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                  Upgrade Your Plan
                </h2>
                {currentUsage && (
                  <p className="text-sm text-slate-400 mt-1">
                    Currently using {currentUsage.used} of {currentUsage.total} pages
                  </p>
                )}
              </div>
              <button
                onClick={() => onOpenChange(false)}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            
            {/* Content */}
            <div className="px-6 pb-8 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {plans.map((plan) => {
                  const isCurrent = plan.id === currentPlan;
                  const isLoadingThis = isLoading === plan.priceId;
                  const Icon = plan.icon;
                  
                  return (
                    <div
                      key={plan.id}
                      className={cn(
                        'relative p-5 rounded-xl border transition-all',
                        plan.recommended
                          ? 'border-cyan-500/50 bg-gradient-to-br from-cyan-500/10 to-teal-500/10'
                          : 'border-white/10 bg-white/5',
                        isCurrent && 'ring-2 ring-cyan-400'
                      )}
                    >
                      {plan.recommended && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full text-xs font-semibold text-slate-900">
                          BEST VALUE
                        </div>
                      )}
                      
                      <div className="mb-4">
                        <div className={cn(
                          "inline-flex p-2 rounded-lg mb-2",
                          plan.recommended 
                            ? "bg-cyan-500/20 text-cyan-400" 
                            : "bg-slate-700/50 text-slate-400"
                        )}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                        <div className="flex items-baseline gap-1 mt-1">
                          {plan.originalPrice && (
                            <span className="text-sm text-slate-500 line-through mr-1">
                              ${plan.originalPrice}
                            </span>
                          )}
                          <span className={cn(
                            "text-2xl font-bold",
                            plan.recommended ? "text-cyan-400" : "text-white"
                          )}>
                            {plan.priceLabel}
                          </span>
                        </div>
                        {plan.discountBadge && (
                          <div className="mt-1 inline-block bg-cyan-500/20 text-cyan-300 text-xs font-medium px-2 py-0.5 rounded-full">
                            🎉 {plan.discountBadge}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 mb-4 p-2 rounded-lg bg-white/5">
                        <Zap className="w-4 h-4 text-cyan-400" />
                        <span className="text-sm font-medium text-cyan-300">{plan.actionsLabel}</span>
                      </div>
                      
                      <ul className="space-y-2 mb-4">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                            <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      
                      <Button
                        className={cn(
                          'w-full',
                          isCurrent
                            ? 'bg-slate-600 cursor-default'
                            : plan.recommended
                            ? 'bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-900'
                            : 'bg-white/10 hover:bg-white/20'
                        )}
                        disabled={isCurrent || isLoading !== null}
                        onClick={() => handlePlanSelect(plan.id, plan.priceId)}
                      >
                        {isLoadingThis ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : isCurrent ? (
                          'Current Plan'
                        ) : (
                          <>
                            {plan.recommended ? 'Claim Founding Spot' : 'Upgrade'}
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </>
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>
              
              <p className="text-xs text-slate-500 text-center mt-6">
                14-day free trial • Cancel anytime • 30-day money-back guarantee
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default UpgradeDrawer;
