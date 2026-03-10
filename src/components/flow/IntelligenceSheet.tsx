import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { ChevronUp, Brain, Sparkles } from 'lucide-react';
import { AnimatedScore } from './AnimatedScore';
import { cn } from '@/lib/utils';

interface IntelligenceSheetProps {
  score: number;
  maxScore?: number;
  isNewDataCaptured?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

export function IntelligenceSheet({
  score,
  maxScore = 100,
  isNewDataCaptured = false,
  onExpandedChange,
  children,
  className,
}: IntelligenceSheetProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPeeking, setIsPeeking] = useState(false);
  const [lastScore, setLastScore] = useState(score);
  const peekTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragControls = useDragControls();

  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

  // Auto-peek when new data is captured
  useEffect(() => {
    if (isNewDataCaptured && !isExpanded) {
      setIsPeeking(true);
      
      // Clear any existing timeout
      if (peekTimeoutRef.current) {
        clearTimeout(peekTimeoutRef.current);
      }
      
      // Settle back after 2 seconds
      peekTimeoutRef.current = setTimeout(() => {
        setIsPeeking(false);
      }, 2000);
    }
    
    return () => {
      if (peekTimeoutRef.current) {
        clearTimeout(peekTimeoutRef.current);
      }
    };
  }, [isNewDataCaptured, isExpanded]);

  // Track score changes for peek animation
  useEffect(() => {
    if (score > lastScore && !isExpanded) {
      setIsPeeking(true);
      
      if (peekTimeoutRef.current) {
        clearTimeout(peekTimeoutRef.current);
      }
      
      peekTimeoutRef.current = setTimeout(() => {
        setIsPeeking(false);
      }, 2000);
    }
    setLastScore(score);
  }, [score, lastScore, isExpanded]);

  const handleToggle = () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    setIsPeeking(false);
    onExpandedChange?.(newExpanded);
  };

  const scoreDelta = score - lastScore;

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={handleToggle}
          />
        )}
      </AnimatePresence>

      {/* Bottom Bar / Sheet */}
      <motion.div
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50 bg-slate-900 border-t border-slate-700/50',
          isExpanded && 'rounded-t-2xl',
          className
        )}
        initial={false}
        animate={{
          height: isExpanded ? '85vh' : isPeeking ? 76 : 56,
          y: 0,
        }}
        transition={prefersReducedMotion ? { duration: 0 } : {
          type: 'spring',
          stiffness: 300,
          damping: 30,
        }}
      >
        {/* Drag Handle */}
        {isExpanded && (
          <div className="flex justify-center py-2">
            <div className="w-12 h-1.5 bg-slate-600 rounded-full" />
          </div>
        )}

        {/* Collapsed Bar / Header */}
        <button
          onClick={handleToggle}
          className={cn(
            'w-full flex items-center justify-between px-4 py-3',
            'transition-colors hover:bg-slate-800/50',
            isExpanded && 'border-b border-slate-700/50'
          )}
        >
          <div className="flex items-center gap-3">
            {/* Brain icon with glow on peek */}
            <motion.div
              animate={{
                scale: isPeeking ? [1, 1.1, 1] : 1,
              }}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              <Brain className={cn(
                'w-5 h-5',
                isPeeking ? 'text-cyan-400' : 'text-slate-400'
              )} />
              {isPeeking && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 0.5, scale: 1.5 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-cyan-400 rounded-full blur-md"
                />
              )}
            </motion.div>
            
            <span className="text-sm font-medium text-slate-200">
              Intelligence Profile
            </span>
            
            {/* Score badge with delta during peek */}
            <div className="relative">
              <AnimatedScore score={score} maxScore={maxScore} size="sm" showToasts={false} />
              
              {/* Delta badge */}
              <AnimatePresence>
                {isPeeking && scoreDelta > 0 && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute -right-8 top-0 text-xs font-bold text-cyan-400"
                  >
                    +{scoreDelta}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Expand indicator */}
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronUp className="w-5 h-5 text-slate-400" />
          </motion.div>
        </button>

        {/* Expanded Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 overflow-y-auto"
              style={{ height: 'calc(85vh - 80px)' }}
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
