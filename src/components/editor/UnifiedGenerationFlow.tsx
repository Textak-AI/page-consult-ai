/**
 * Unified Generation Flow
 * Single loading experience with three phases: gathering, building, revealing
 * Fixes the double-loading bug
 */

import { useState, useEffect } from 'react';
import { Check, ArrowRight, Sparkles, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import logo from '/logo/whiteAsset_3combimark_darkmode.svg';

type GenerationPhase = 'gathering' | 'building' | 'revealing' | 'complete';

interface UnifiedGenerationFlowProps {
  consultation?: {
    industry?: string;
    goal?: string;
    target_audience?: string;
  };
  onComplete?: () => void;
  isGenerating?: boolean;
}

const gatheringSteps = [
  "Industry intelligence loaded",
  "Structural framework selected",
  "Initializing generation"
];

const buildingMessages = [
  "Setting up hero section...",
  "Applying trust signals...",
  "Calibrating voice...",
  "Structuring proof elements...",
  "Finalizing layout..."
];

export function UnifiedGenerationFlow({ 
  consultation, 
  onComplete,
  isGenerating = true
}: UnifiedGenerationFlowProps) {
  const [phase, setPhase] = useState<GenerationPhase>('gathering');
  
  // Phase 1 state
  const [visibleSteps, setVisibleSteps] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(0);
  
  // Phase 2 state
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  
  // Phase 1 timing - Gathering phase
  useEffect(() => {
    if (phase !== 'gathering') return;
    
    setVisibleSteps(1);
    const t1 = setTimeout(() => { setCompletedSteps(1); setVisibleSteps(2); }, 800);
    const t2 = setTimeout(() => { setCompletedSteps(2); setVisibleSteps(3); }, 1600);
    const t3 = setTimeout(() => { setCompletedSteps(3); }, 2400);
    const t4 = setTimeout(() => { setPhase('building'); }, 2800);
    
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [phase]);
  
  // Phase 2 timing - Building phase with message cycling
  useEffect(() => {
    if (phase !== 'building') return;
    
    let messageIndex = 0;
    const messageInterval = setInterval(() => {
      messageIndex++;
      if (messageIndex < buildingMessages.length) {
        setCurrentMessageIndex(messageIndex);
        setProgress((messageIndex / buildingMessages.length) * 90);
      }
    }, 1200);
    
    return () => clearInterval(messageInterval);
  }, [phase]);
  
  // Watch for generation completion
  useEffect(() => {
    if (!isGenerating && phase === 'building') {
      setProgress(100);
      setTimeout(() => setPhase('revealing'), 400);
    }
  }, [isGenerating, phase]);
  
  // Phase 3 complete - trigger onComplete
  useEffect(() => {
    if (phase === 'revealing') {
      setTimeout(() => {
        setPhase('complete');
        onComplete?.();
      }, 500);
    }
  }, [phase, onComplete]);
  
  // Render gathering phase
  if (phase === 'gathering') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f0a1f] via-[#1a1332] to-[#0f0a1f] relative overflow-hidden">
        {/* Ambient effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div 
            className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-500/15 rounded-full blur-[150px]"
            style={{ animation: 'pulse 4s ease-in-out infinite' }} 
          />
          <div 
            className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-500/15 rounded-full blur-[120px]"
            style={{ animation: 'pulse 4s ease-in-out infinite', animationDelay: '1s' }} 
          />
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 max-w-lg w-full mx-4 space-y-8"
        >
          {/* Logo with glow */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/30 to-purple-500/30 blur-2xl rounded-full scale-150 opacity-50" />
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <img src={logo} alt="PageConsult AI" className="h-10 relative z-10" />
              </motion.div>
            </div>
          </div>
          
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center">
            Preparing your strategy...
          </h2>
          
          {/* Checklist */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 space-y-4">
            {gatheringSteps.map((step, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: -20 }}
                animate={{ 
                  opacity: visibleSteps > i ? 1 : 0,
                  x: visibleSteps > i ? 0 : -20
                }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
                className="flex items-center gap-4"
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 flex-shrink-0",
                  completedSteps > i && "bg-green-500/20 text-green-400",
                  completedSteps <= i && visibleSteps > i && "bg-cyan-500/20 text-cyan-400"
                )}>
                  {completedSteps > i ? (
                    <Check className="w-4 h-4" />
                  ) : visibleSteps > i ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-slate-600" />
                  )}
                </div>
                <span className={cn(
                  "text-sm font-medium transition-colors duration-300",
                  completedSteps > i ? "text-green-400" : 
                  visibleSteps > i ? "text-white" : "text-slate-600"
                )}>
                  {step}
                </span>
              </motion.div>
            ))}
          </div>
          
          {/* Strategy card */}
          {consultation && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-white/[0.03] backdrop-blur-sm rounded-xl border border-white/[0.06] p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-medium text-gray-300">Your Strategy</h3>
              </div>
              <div className="space-y-1.5 text-xs">
                {consultation.industry && (
                  <p className="text-gray-400">
                    <span className="text-cyan-400/70">Industry:</span> {consultation.industry}
                  </p>
                )}
                {consultation.goal && (
                  <p className="text-gray-400">
                    <span className="text-cyan-400/70">Goal:</span> {consultation.goal}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    );
  }
  
  // Render building phase
  if (phase === 'building') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f0a1f] via-[#1a1332] to-[#0f0a1f] relative overflow-hidden">
        {/* Ambient effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div 
            className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-500/15 rounded-full blur-[150px]"
            style={{ animation: 'pulse 4s ease-in-out infinite' }} 
          />
          <div 
            className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-500/15 rounded-full blur-[120px]"
            style={{ animation: 'pulse 4s ease-in-out infinite', animationDelay: '1s' }} 
          />
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-pink-500/10 rounded-full blur-[100px]"
            style={{ animation: 'pulse 4s ease-in-out infinite', animationDelay: '2s' }} 
          />
        </div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative z-10 max-w-lg w-full mx-4 space-y-8"
        >
          {/* Logo with glow */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/30 to-purple-500/30 blur-2xl rounded-full scale-150 opacity-50" />
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <img src={logo} alt="PageConsult AI" className="h-10 relative z-10" />
              </motion.div>
            </div>
          </div>
          
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center">
            Building your page...
          </h2>
          
          {/* Single cycling message */}
          <div className="h-8 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={currentMessageIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="text-gray-400 text-center"
              >
                {buildingMessages[currentMessageIndex]}
              </motion.p>
            </AnimatePresence>
          </div>
          
          {/* Progress line (not percentage) */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-3 text-center">
              AI is crafting conversion-optimized content just for you
            </p>
          </div>
          
          {/* Strategy card */}
          {consultation && (
            <div className="bg-white/[0.03] backdrop-blur-sm rounded-xl border border-white/[0.06] p-4">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-medium text-gray-300">Your Strategy</h3>
              </div>
              <div className="space-y-1.5 text-xs">
                {consultation.industry && (
                  <p className="text-gray-400">
                    <span className="text-cyan-400/70">Industry:</span> {consultation.industry}
                  </p>
                )}
                {consultation.goal && (
                  <p className="text-gray-400">
                    <span className="text-cyan-400/70">Goal:</span> {consultation.goal}
                  </p>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    );
  }
  
  // Render revealing phase - fade out before page reveal
  return (
    <motion.div 
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f0a1f] via-[#1a1332] to-[#0f0a1f]"
    >
      <div className="text-center">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.4 }}
        >
          <Sparkles className="w-12 h-12 text-cyan-400 mx-auto" />
        </motion.div>
      </div>
    </motion.div>
  );
}

export default UnifiedGenerationFlow;
