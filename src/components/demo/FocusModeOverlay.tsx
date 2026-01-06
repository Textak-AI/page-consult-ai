import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Sparkles } from 'lucide-react';
import { useIntelligence } from '@/contexts/IntelligenceContext';
import { IntelligenceTabs } from './IntelligenceTabs';
import { Button } from '@/components/ui/button';

interface FocusModeOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
  onReopenEmailGate: () => void;
  chatContent: React.ReactNode;
}

export function FocusModeOverlay({ 
  isOpen, 
  onClose, 
  onContinue,
  onReopenEmailGate,
  chatContent 
}: FocusModeOverlayProps) {
  const { state } = useIntelligence();
  
  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] bg-slate-950 flex flex-col"
        >
          {/* Background effects */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px]" />
          </div>
          
          {/* Header */}
          <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/10"
          >
            <button
              onClick={onClose}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
              <span className="text-sm font-medium">Exit Focus Mode</span>
            </button>
            
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="hidden sm:block">
                <p className="text-white font-semibold text-sm">PageConsult AI</p>
                <p className="text-slate-500 text-xs">Strategy Session</p>
              </div>
            </div>
            
            <Button
              onClick={onContinue}
              className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white text-sm gap-2"
            >
              <span className="hidden sm:inline">Continue to Full Consultation</span>
              <span className="sm:hidden">Continue</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.header>
          
          {/* Main Content */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="relative z-10 flex-1 flex gap-6 p-6 overflow-hidden"
          >
            {/* Chat Panel - Left */}
            <div className="flex-1 min-w-0 bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden flex flex-col">
              {chatContent}
            </div>
            
            {/* Intelligence Panel - Right */}
            <div className="hidden lg:flex w-[500px] xl:w-[540px] flex-shrink-0 bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
              <IntelligenceTabs 
                onContinue={onContinue}
                onReopenEmailGate={onReopenEmailGate}
              />
            </div>
          </motion.div>
          
          {/* Footer with Progress */}
          <motion.footer
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="relative z-10 px-6 py-4 border-t border-white/10"
          >
            <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                <span className="text-slate-400 text-sm whitespace-nowrap">Strategy Readiness</span>
                <div className="flex-1 max-w-xs h-2 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${state.readiness}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"
                  />
                </div>
                <span className="text-cyan-400 font-semibold text-sm">{state.readiness}%</span>
              </div>
              
              {state.readiness >= 60 && (
                <Button
                  onClick={onContinue}
                  className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white gap-2"
                >
                  Generate Your Page
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </motion.footer>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
