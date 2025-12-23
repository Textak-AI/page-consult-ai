/**
 * Development Toolbar for testing consultation flow
 * Only visible when dev mode is active
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wrench, ChevronRight, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DevToolbarProps {
  onJumpToLoading: () => void;
  onJumpToBriefReview: () => void;
  onJumpToPageBuilder: () => void;
  onJumpToStep: (step: number) => void;
  currentStep?: number;
  totalSteps?: number;
}

export function useDevMode(): [boolean, (enabled: boolean) => void] {
  const [isDevMode, setIsDevMode] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check URL param
    const urlParams = new URLSearchParams(window.location.search);
    const devParam = urlParams.get('dev') === 'true';
    
    // Check localStorage
    const storedDevMode = localStorage.getItem('pageconsult_dev_mode') === 'true';
    
    if (devParam || storedDevMode) {
      setIsDevMode(true);
    }

    // Keyboard shortcut: Ctrl/Cmd + Shift + D
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        toggleDevMode(!isDevMode);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toast, isDevMode]);

  const toggleDevMode = (enabled: boolean) => {
    setIsDevMode(enabled);
    if (enabled) {
      localStorage.setItem('pageconsult_dev_mode', 'true');
      toast({
        title: "🛠️ Dev mode enabled",
        description: "Development tools are now visible",
      });
    } else {
      localStorage.removeItem('pageconsult_dev_mode');
      localStorage.removeItem('dev_test_panel_data');
      toast({
        title: "Dev mode disabled",
        description: "Development tools hidden",
      });
    }
  };

  return [isDevMode, toggleDevMode];
}

export function DevToolbar({
  onJumpToLoading,
  onJumpToBriefReview,
  onJumpToPageBuilder,
  onJumpToStep,
  currentStep = 1,
  totalSteps = 6,
}: DevToolbarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDevMode] = useDevMode();

  if (!isDevMode) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <AnimatePresence>
        {isExpanded ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: -20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: -20 }}
            className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-700">
              <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5" />
                Dev Tools
              </span>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Jump Buttons */}
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Jump to</p>
              
              <button
                onClick={onJumpToLoading}
                className="w-full text-left text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-2 rounded transition-colors flex items-center gap-2"
              >
                <ChevronRight className="w-3 h-3 text-cyan-400" />
                Loading Screen
              </button>
              
              <button
                onClick={onJumpToBriefReview}
                className="w-full text-left text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-2 rounded transition-colors flex items-center gap-2"
              >
                <ChevronRight className="w-3 h-3 text-emerald-400" />
                Brief Review
              </button>
              
              <button
                onClick={onJumpToPageBuilder}
                className="w-full text-left text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-2 rounded transition-colors flex items-center gap-2"
              >
                <ChevronRight className="w-3 h-3 text-purple-400" />
                Page Builder
              </button>

              {/* Step Jumpers */}
              <div className="pt-2 mt-2 border-t border-slate-700">
                <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">Steps</p>
                <div className="grid grid-cols-6 gap-1">
                  {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
                    <button
                      key={step}
                      onClick={() => onJumpToStep(step)}
                      className={`text-xs px-2 py-1.5 rounded transition-colors ${
                        step === currentStep
                          ? 'bg-cyan-500 text-white'
                          : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                      }`}
                    >
                      {step}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Keyboard hint */}
            <p className="text-[10px] text-slate-500 mt-3 pt-2 border-t border-slate-700">
              Press <kbd className="px-1 py-0.5 bg-slate-700 rounded text-slate-400">⌘⇧D</kbd> to toggle
            </p>
          </motion.div>
        ) : (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={() => setIsExpanded(true)}
            className="bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg p-2 shadow-lg transition-colors"
            title="Open Dev Tools (⌘⇧D)"
          >
            <Wrench className="w-4 h-4 text-slate-400" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

export default DevToolbar;
