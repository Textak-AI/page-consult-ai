import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Check, ArrowRight, CreditCard, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PLAN_DETAILS, ACTION_PACKS, STRIPE_PRICES } from '@/lib/stripe-config';

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
    name: PLAN_DETAILS.starter.name,
    price: PLAN_DETAILS.starter.price,
    priceLabel: 'Free',
    actions: PLAN_DETAILS.starter.actions,
    actionsLabel: `${PLAN_DETAILS.starter.actions} actions/mo`,
    priceId: PLAN_DETAILS.starter.priceId,
    features: [
      '1 landing page',
      'Basic AI generation',
      'Email support',
    ],
  },
  {
    id: 'pro',
    name: PLAN_DETAILS.pro.name,
    price: PLAN_DETAILS.pro.price,
    priceLabel: `$${PLAN_DETAILS.pro.price}/mo`,
    actions: PLAN_DETAILS.pro.actions,
    actionsLabel: `${PLAN_DETAILS.pro.actions} actions/mo`,
    priceId: PLAN_DETAILS.pro.priceId,
    features: [
      'Unlimited pages',
      'Advanced AI features',
      'Priority support',
      'Rollover up to 50 unused',
      'Free AI suggestions',
    ],
    recommended: true,
  },
  {
    id: 'agency',
    name: PLAN_DETAILS.agency.name,
    price: PLAN_DETAILS.agency.price,
    priceLabel: `$${PLAN_DETAILS.agency.price}/mo`,
    actions: PLAN_DETAILS.agency.actions,
    actionsLabel: 'Unlimited',
    priceId: PLAN_DETAILS.agency.priceId,
    features: [
      'Everything in Pro',
      'Unlimited AI actions',
      'White-label options',
      'Team access',
      'API access',
    ],
  },
];

const actionPacks = ACTION_PACKS.map(pack => ({
  ...pack,
  savings: pack.amount === 10 ? 0 : pack.amount === 25 ? 17 : 28,
}));

export function UpgradeDrawer({
  open,
  onOpenChange,
  currentPlan = 'starter',
  currentUsage,
  onSelectPlan,
  onPurchaseActions,
}: UpgradeDrawerProps) {
  const [selectedTab, setSelectedTab] = useState<'plans' | 'actions'>('plans');
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

  const handleCheckout = async (priceId: string, mode: 'subscription' | 'payment') => {
    console.log('🛒 Starting checkout:', { priceId, mode });
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

      console.log('📡 Calling stripe-checkout function...');
      const { data, error } = await supabase.functions.invoke('stripe-checkout', {
        body: {
          priceId,
          mode,
          successUrl: `${window.location.origin}/generate?checkout=success`,
          cancelUrl: `${window.location.origin}/generate?checkout=cancelled`,
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

  const handlePlanSelect = async (planId: string, priceId: string | null) => {
    console.log('📋 Plan selected:', { planId, priceId });
    if (!priceId) {
      // Starter plan - no checkout needed
      console.log('ℹ️ Starter plan - no checkout needed');
      onSelectPlan?.(planId);
      return;
    }
    await handleCheckout(priceId, 'subscription');
  };

  const handleActionPackPurchase = async (pack: typeof actionPacks[0]) => {
    console.log('💰 Action pack purchase:', pack);
    await handleCheckout(pack.priceId, 'payment');
    onPurchaseActions?.(pack.amount);
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
                  Get More AI Actions
                </h2>
                {currentUsage && (
                  <p className="text-sm text-slate-400 mt-1">
                    Currently using {currentUsage.used} of {currentUsage.total} actions
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
            
            {/* Tabs */}
            <div className="px-6 pb-4">
              <div className="flex gap-2 p-1 bg-white/5 rounded-lg">
                <button
                  onClick={() => setSelectedTab('plans')}
                  className={cn(
                    'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all',
                    selectedTab === 'plans'
                      ? 'bg-white/10 text-white'
                      : 'text-slate-400 hover:text-white'
                  )}
                >
                  Upgrade Plan
                </button>
                <button
                  onClick={() => setSelectedTab('actions')}
                  className={cn(
                    'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all',
                    selectedTab === 'actions'
                      ? 'bg-white/10 text-white'
                      : 'text-slate-400 hover:text-white'
                  )}
                >
                  Buy Actions
                </button>
              </div>
            </div>
            
            {/* Content */}
            <div className="px-6 pb-8 overflow-y-auto max-h-[60vh]">
              {selectedTab === 'plans' ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {plans.map((plan) => {
                    const isCurrent = plan.id === currentPlan;
                    const isLoadingThis = isLoading === plan.priceId;
                    return (
                      <div
                        key={plan.id}
                        className={cn(
                          'relative p-5 rounded-xl border transition-all',
                          plan.recommended
                            ? 'border-cyan-500/50 bg-gradient-to-br from-cyan-500/10 to-purple-500/10'
                            : 'border-white/10 bg-white/5',
                          isCurrent && 'ring-2 ring-cyan-400'
                        )}
                      >
                        {plan.recommended && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full text-xs font-semibold text-white">
                            Recommended
                          </div>
                        )}
                        
                        <div className="mb-4">
                          <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                          <div className="flex items-baseline gap-1 mt-1">
                            <span className="text-2xl font-bold text-white">{plan.priceLabel}</span>
                          </div>
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
                              ? 'bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600'
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
                              {plan.id === 'starter' ? 'Downgrade' : 'Upgrade'}
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </>
                          )}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-slate-400 mb-4">
                    Need a few more actions? Purchase an action pack and use them anytime.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {actionPacks.map((pack) => {
                      const isLoadingThis = isLoading === pack.priceId;
                      return (
                        <div
                          key={pack.amount}
                          className="p-5 rounded-xl border border-white/10 bg-white/5 hover:border-cyan-500/50 transition-all"
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <div className="p-2 rounded-lg bg-cyan-500/20">
                              <Zap className="w-5 h-5 text-cyan-400" />
                            </div>
                            <div>
                              <span className="text-2xl font-bold text-white">{pack.amount}</span>
                              <span className="text-sm text-slate-400 ml-1">actions</span>
                            </div>
                          </div>
                          
                          <div className="mb-4">
                            <span className="text-xl font-bold text-white">${pack.price}</span>
                            {pack.savings > 0 && (
                              <span className="ml-2 text-xs text-emerald-400 font-medium">
                                Save {pack.savings}%
                              </span>
                            )}
                          </div>
                          
                          <Button
                            className="w-full bg-white/10 hover:bg-white/20"
                            disabled={isLoading !== null}
                            onClick={() => handleActionPackPurchase(pack)}
                          >
                            {isLoadingThis ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <CreditCard className="w-4 h-4 mr-2" />
                                Purchase
                              </>
                            )}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                  
                  <p className="text-xs text-slate-500 text-center mt-4">
                    Action packs never expire. Use them across all your pages.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default UpgradeDrawer;
