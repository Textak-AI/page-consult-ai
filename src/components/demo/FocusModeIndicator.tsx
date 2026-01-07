import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';

interface FocusModeIndicatorProps {
  isActive: boolean;
  onExit: () => void;
}

export function FocusModeIndicator({ isActive, onExit }: FocusModeIndicatorProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Auto-minimize after 4 seconds
  useEffect(() => {
    if (isActive && isExpanded) {
      const timer = setTimeout(() => {
        setIsExpanded(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isActive, isExpanded]);

  // Reset to expanded when activated
  useEffect(() => {
    if (isActive) {
      setIsExpanded(true);
    }
  }, [isActive]);

  // Handle Escape key to exit focus mode
  const handleEscKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onExit();
    }
  }, [onExit]);

  useEffect(() => {
    if (isActive) {
      window.addEventListener('keydown', handleEscKey);
      return () => window.removeEventListener('keydown', handleEscKey);
    }
  }, [isActive, handleEscKey]);

  if (!isActive) return null;

  return (
    <AnimatePresence mode="wait">
      {isExpanded ? (
        // Expanded state
        <motion.div
          key="expanded"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-4 left-4 z-40 max-w-xs"
        >
          <div className="bg-slate-900/90 backdrop-blur-sm border border-cyan-500/20 rounded-lg px-4 py-3 shadow-lg shadow-cyan-500/5">
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-cyan-500/10 rounded-md flex-shrink-0">
                <Sparkles className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">Focus Mode Active</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Distraction-free strategy session
                </p>
              </div>
              <button
                onClick={onExit}
                className="text-slate-500 hover:text-slate-300 transition-colors flex-shrink-0"
                aria-label="Exit focus mode"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Exit hint */}
            <p className="text-[10px] text-slate-500 mt-2 flex items-center gap-1">
              <span>Press</span>
              <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-[10px] font-mono border border-slate-700">Esc</kbd>
              <span>or click × to exit</span>
            </p>
          </div>
        </motion.div>
      ) : (
        // Minimized state
        <motion.div
          key="minimized"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-4 left-4 z-40"
        >
          <button
            onClick={onExit}
            onMouseEnter={() => setIsExpanded(true)}
            className="bg-slate-900/80 backdrop-blur-sm border border-cyan-500/20 rounded-full p-2.5 cursor-pointer hover:bg-slate-800 transition-colors group"
            aria-label="Focus Mode active - click to exit"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            
            {/* Tooltip on hover */}
            <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-slate-900 px-2 py-1 rounded text-xs text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-slate-700">
              Focus Mode · Click to exit
            </div>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
