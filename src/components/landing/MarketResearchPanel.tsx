import { motion } from 'framer-motion';
import { Loader2, TrendingUp, Users, AlertCircle, Lightbulb } from 'lucide-react';
import type { MarketResearch } from '@/contexts/IntelligenceContext';

interface MarketResearchPanelProps {
  market: MarketResearch;
  industry: string | null;
  className?: string;
}

export default function MarketResearchPanel({ market, industry, className = '' }: MarketResearchPanelProps) {
  // Loading state
  if (market.isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-4 ${className}`}
      >
        <div className="flex items-center gap-3 text-cyan-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <div>
            <p className="text-sm font-medium">Researching your market...</p>
            <p className="text-xs text-slate-400 mt-0.5">Analyzing {industry || 'your industry'}</p>
          </div>
        </div>
        
        {/* Shimmer placeholders */}
        <div className="mt-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-lg bg-slate-800/50 animate-pulse" />
          ))}
        </div>
      </motion.div>
    );
  }

  // Check if we have any data
  const hasData = market.marketSize || market.buyerPersona || 
                  market.commonObjections.length > 0 || 
                  market.industryInsights.length > 0;

  if (!hasData) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 space-y-3 ${className}`}
    >
      <div className="flex items-center gap-2 text-sm font-medium text-cyan-400 mb-3">
        <TrendingUp className="w-4 h-4" />
        <span>Market Research</span>
        <span className="ml-auto text-xs text-slate-500">+10 pts</span>
      </div>

      {/* Market Size */}
      {market.marketSize && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="p-3 rounded-lg bg-gradient-to-r from-purple-500/10 to-transparent border border-purple-500/20"
        >
          <div className="flex items-start gap-2">
            <TrendingUp className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-purple-400 font-medium">Market Size</p>
              <p className="text-sm text-white/90 mt-0.5">{market.marketSize}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Buyer Persona */}
      {market.buyerPersona && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="p-3 rounded-lg bg-gradient-to-r from-cyan-500/10 to-transparent border border-cyan-500/20"
        >
          <div className="flex items-start gap-2">
            <Users className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-cyan-400 font-medium">Buyer Persona</p>
              <p className="text-sm text-white/90 mt-0.5">{market.buyerPersona}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Common Objections */}
      {market.commonObjections.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="p-3 rounded-lg bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/20"
        >
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-amber-400 font-medium">Common Objections</p>
              <ul className="text-sm text-white/90 mt-1 space-y-1">
                {market.commonObjections.slice(0, 3).map((objection, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-amber-400/60">•</span>
                    <span>{objection}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      )}

      {/* Industry Insights */}
      {market.industryInsights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="p-3 rounded-lg bg-gradient-to-r from-emerald-500/10 to-transparent border border-emerald-500/20"
        >
          <div className="flex items-start gap-2">
            <Lightbulb className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-emerald-400 font-medium">Industry Insights</p>
              <ul className="text-sm text-white/90 mt-1 space-y-1">
                {market.industryInsights.slice(0, 3).map((insight, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-emerald-400/60">•</span>
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
