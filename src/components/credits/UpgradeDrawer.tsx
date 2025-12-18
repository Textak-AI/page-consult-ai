import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Check, Star, ArrowRight, CreditCard, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Plan {
  id: string;
  name: string;
  price: number;
  priceLabel: string;
  actions: number | 'unlimited';
  actionsLabel: string;
  features: string[];
  recommended?: boolean;
  current?: boolean;
}

interface UpgradeDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPlan?: string;
  currentUsage?: { used: number; total: number };
  onSelectPlan?: (planId: string) => void;
  onPurchaseActions?: (amount: number) => void;
}

const plans: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 0,
    priceLabel: 'Free',
    actions: 30,
    actionsLabel: '30 actions/mo',
    features: [
      '1 landing page',
      'Basic AI generation',
      'Email support',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 29,
    priceLabel: '$29/mo',
    actions: 150,
    actionsLabel: '150 actions/mo',
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
    name: 'Agency',
    price: 99,
    priceLabel: '$99/mo',
    actions: 'unlimited',
    actionsLabel: 'Unlimited',
    features: [
      'Everything in Pro',
      'Unlimited AI actions',
      'White-label options',
      'Team access',
      'API access',
    ],
  },
];

const actionPacks = [
  { amount: 10, price: 5, savings: 0 },
  { amount: 25, price: 10, savings: 17 },
  { amount: 50, price: 18, savings: 28 },
];

export function UpgradeDrawer({
  open,
  onOpenChange,
  currentPlan = 'starter',
  currentUsage,
  onSelectPlan,
  onPurchaseActions,
}: UpgradeDrawerProps) {
  const [selectedTab, setSelectedTab] = useState<'plans' | 'actions'>('plans');

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={() => onOpenChange(false)}
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 max-h-[90vh] overflow-hidden rounded-t-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 border-t border-white/10 shadow-2xl"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 rounded-full bg-white/20" />
            </div>
            
            {/* Header */}
            <div className="px-6 pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
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
                          disabled={isCurrent}
                          onClick={() => onSelectPlan?.(plan.id)}
                        >
                          {isCurrent ? (
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
                    {actionPacks.map((pack) => (
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
                          onClick={() => onPurchaseActions?.(pack.amount)}
                        >
                          <CreditCard className="w-4 h-4 mr-2" />
                          Purchase
                        </Button>
                      </div>
                    ))}
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
