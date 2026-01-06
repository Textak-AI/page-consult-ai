import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, X, Sparkles } from 'lucide-react';

interface FocusModeSuggestionProps {
  isVisible: boolean;
  onEnterFocusMode: () => void;
  onDismiss: () => void;
}

export function FocusModeSuggestion({
  isVisible,
  onEnterFocusMode,
  onDismiss
}: FocusModeSuggestionProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="flex items-center gap-3 px-5 py-3 bg-slate-900/95 backdrop-blur-md border border-cyan-500/30 rounded-full shadow-lg shadow-cyan-500/10">
            <div className="flex items-center gap-2 text-slate-300">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-medium">Ready for a deeper session?</span>
            </div>
            
            <button
              onClick={onEnterFocusMode}
              className="flex items-center gap-2 px-4 py-1.5 bg-cyan-500 text-white text-sm font-medium rounded-full hover:bg-cyan-400 transition-colors"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              Focus Mode
            </button>
            
            <button
              onClick={onDismiss}
              className="p-1.5 text-slate-500 hover:text-white transition-colors rounded-full hover:bg-slate-800"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
