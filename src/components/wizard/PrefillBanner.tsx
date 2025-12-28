import { motion } from 'framer-motion';
import { CheckCircle2, Sparkles, AlertCircle } from 'lucide-react';
import { GapAnalysis } from '@/lib/consultationPrefill';
import { cn } from '@/lib/utils';

interface PrefillBannerProps {
  gapAnalysis: GapAnalysis;
  onDismiss?: () => void;
}

export default function PrefillBanner({ gapAnalysis, onDismiss }: PrefillBannerProps) {
  const { percentComplete, requiredActions } = gapAnalysis;
  
  const priorityCounts = {
    required: requiredActions.filter(a => a.priority === 'required').length,
    recommended: requiredActions.filter(a => a.priority === 'recommended').length,
    optional: requiredActions.filter(a => a.priority === 'optional').length,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-cyan-500/10 border border-cyan-500/30 rounded-xl p-4 mb-6"
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-white mb-1">
            We've pre-filled based on your consultation
          </h3>
          <p className="text-sm text-slate-400 mb-3">
            Review and add your brand assets to complete your page.
          </p>

          {/* Progress */}
          <div className="flex items-center gap-4 mb-3">
            <div className="flex-1 h-2 bg-slate-700/50 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${percentComplete}%` }}
                transition={{ duration: 0.8, delay: 0.2 }}
              />
            </div>
            <span className="text-sm font-medium text-cyan-400">
              {percentComplete}% complete
            </span>
          </div>

          {/* Missing items */}
          {requiredActions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {priorityCounts.required > 0 && (
                <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-red-500/10 border border-red-500/30 rounded text-xs text-red-400">
                  <AlertCircle className="w-3 h-3" />
                  {priorityCounts.required} required
                </span>
              )}
              {priorityCounts.recommended > 0 && (
                <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-amber-500/10 border border-amber-500/30 rounded text-xs text-amber-400">
                  {priorityCounts.recommended} recommended
                </span>
              )}
              {priorityCounts.optional > 0 && (
                <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-slate-500/10 border border-slate-500/30 rounded text-xs text-slate-400">
                  {priorityCounts.optional} optional
                </span>
              )}
            </div>
          )}

          {/* All complete */}
          {requiredActions.length === 0 && (
            <div className="flex items-center gap-2 text-green-400 text-sm">
              <CheckCircle2 className="w-4 h-4" />
              All fields complete — ready to generate!
            </div>
          )}
        </div>

        {/* Dismiss button */}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-slate-500 hover:text-white transition-colors"
          >
            ×
          </button>
        )}
      </div>
    </motion.div>
  );
}
