import React from 'react';
import { motion } from 'framer-motion';
import { Target, XCircle, CheckCircle, Lightbulb, Loader2 } from 'lucide-react';
import { PredictedObjection } from '@/data/precomputedObjections';

// Re-export for backward compatibility
export type { PredictedObjection };

export interface AhaInsight {
  title: string;
  content: string;
}

interface ObjectionKillerPanelProps {
  objections: PredictedObjection[];
  ahaInsight?: AhaInsight;
  isLoading: boolean;
}

export const ObjectionKillerPanel: React.FC<ObjectionKillerPanelProps> = ({
  objections,
  ahaInsight,
  isLoading
}) => {
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50"
      >
        <div className="flex items-center gap-3 mb-4">
          <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
          <span className="text-slate-300">Researching your market's objections...</span>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-slate-700/50 rounded-lg animate-pulse" />
          ))}
        </div>
      </motion.div>
    );
  }

  if (objections.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/50 rounded-xl p-6 border border-cyan-500/20"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-cyan-500/20 rounded-lg">
          <Target className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">
            Objections Your Page Will Neutralize
          </h3>
          <p className="text-sm text-slate-400">
            Based on research of your target market
          </p>
        </div>
      </div>

      {/* Objections List */}
      <div className="space-y-4 mb-6">
        {objections.map((obj, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30"
          >
            {/* The Objection */}
            <div className="flex items-start gap-3 mb-3">
              <XCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-white font-medium">"{obj.objection}"</p>
                <p className="text-xs text-slate-500 mt-1">
                  {obj.frequency === 'very_common' && '🔴 Very common objection'}
                  {obj.frequency === 'common' && '🟠 Common objection'}
                  {obj.frequency === 'moderate' && '🟡 Moderate frequency'}
                  {obj.frequency === 'rare' && '🟢 Rare objection'}
                </p>
              </div>
            </div>

            {/* The Counter */}
            <div className="flex items-start gap-3 ml-8">
              <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-emerald-300 text-sm">{obj.counterStrategy}</p>
                {obj.proofNeeded && (
                  <p className="text-xs text-slate-500 mt-1">
                    Proof needed: {obj.proofNeeded}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Aha Insight */}
      {ahaInsight && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-lg p-4 border border-amber-500/20"
        >
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-amber-400 mt-0.5" />
            <div>
              <p className="text-amber-300 font-medium">{ahaInsight.title}</p>
              <p className="text-slate-300 text-sm mt-1">{ahaInsight.content}</p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
