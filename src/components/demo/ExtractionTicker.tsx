import { motion, AnimatePresence } from 'framer-motion';
import { Check, TrendingUp, Sparkles } from 'lucide-react';

interface ExtractionToast {
  id: string;
  type: 'extraction' | 'score' | 'milestone';
  category?: string;
  value?: string;
  scoreDelta?: number;
  newScore?: number;
}

interface ExtractionTickerProps {
  extractions: ExtractionToast[];
  onDismiss: (id: string) => void;
}

export function ExtractionTicker({ extractions, onDismiss }: ExtractionTickerProps) {
  return (
    <div className="fixed bottom-24 left-4 right-4 z-40 flex flex-col gap-2 pointer-events-none lg:hidden">
      <AnimatePresence mode="popLayout">
        {extractions.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: -100, scale: 0.9 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="pointer-events-auto"
            onClick={() => onDismiss(toast.id)}
          >
            {toast.type === 'extraction' && (
              <div className="flex items-center gap-3 px-4 py-3 bg-slate-800/95 backdrop-blur-sm border border-slate-700/50 rounded-xl shadow-lg">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-slate-400">Captured:</span>
                  <p className="text-sm text-white font-medium truncate">
                    {toast.value}
                  </p>
                </div>
                <span className="text-xs text-cyan-400 flex-shrink-0">
                  → {toast.category}
                </span>
              </div>
            )}
            
            {toast.type === 'score' && (
              <div className="flex items-center gap-3 px-4 py-3 bg-slate-800/95 backdrop-blur-sm border border-cyan-500/30 rounded-xl shadow-lg">
                <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <span className="text-xs text-slate-400">Intelligence:</span>
                <span className="text-sm text-cyan-400 font-medium">
                  +{toast.scoreDelta} → {toast.newScore}/100
                </span>
              </div>
            )}
            
            {toast.type === 'milestone' && (
              <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 backdrop-blur-sm border border-emerald-500/30 rounded-xl shadow-lg">
                <div className="w-6 h-6 rounded-full bg-emerald-500/30 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <span className="text-sm text-white font-medium">
                  {toast.value}
                </span>
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
