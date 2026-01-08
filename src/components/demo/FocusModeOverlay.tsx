import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight } from 'lucide-react';
import { useIntelligence } from '@/contexts/IntelligenceContext';
import { IntelligenceTabs } from './IntelligenceTabs';
import { Button } from '@/components/ui/button';
import { calculateIntelligenceScore } from '@/lib/intelligenceScoreCalculator';

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
              <span className="text-sm font-medium">Exit Strategy Session</span>
            </button>
            
            {/* Spacer for layout balance */}
            <div />
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
          
          {/* Footer - simplified, no redundant progress bar */}
          <motion.footer
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="relative z-10 px-6 py-3 border-t border-white/10"
          >
            {(() => {
              const score = calculateIntelligenceScore(state.extracted);
              const canGenerate = score.totalScore >= 70;
              
              return (
                <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 text-sm">
                      Intelligence Score: <span className="text-white font-medium">{score.totalScore}/100</span>
                    </span>
                    {!canGenerate && (
                      <span className="text-slate-500 text-xs">
                        • Generation unlocks at 70
                      </span>
                    )}
                    {canGenerate && (
                      <span className="text-emerald-400 text-xs font-medium flex items-center gap-1">
                        • Ready to generate
                      </span>
                    )}
                  </div>
                  
                  {canGenerate && (
                    <Button
                      onClick={onContinue}
                      className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white gap-2"
                    >
                      Generate Your Page
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              );
            })()}
          </motion.footer>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
