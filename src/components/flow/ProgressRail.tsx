import { useMemo, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Palette, Map, Rocket, Lock, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFlowNavigation, type FlowStep, type FlowState } from '@/hooks/useFlowNavigation';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';
import confetti from 'canvas-confetti';

interface ProgressRailProps {
  currentStep: FlowStep;
  flowState: FlowState;
  className?: string;
  onMilestone?: (type: 'brief_unlocked' | 'complete') => void;
}

const STEP_ICONS: Record<FlowStep, React.ComponentType<{ className?: string }>> = {
  brand: Palette,
  wizard: MessageSquare,
  huddle: Map,
  generate: Rocket,
};

// Check for reduced motion preference
const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

export function ProgressRail({ currentStep, flowState, className, onMilestone }: ProgressRailProps) {
  const { steps, stepStatuses, navigateToStep, sessionIdentifier } = useFlowNavigation(currentStep, flowState);
  const isMobile = useIsMobile();
  const isTablet = typeof window !== 'undefined' && window.innerWidth >= 768 && window.innerWidth < 1024;
  
  // Track previous state to detect unlocks
  const [prevUnlockedSteps, setPrevUnlockedSteps] = useState<Set<FlowStep>>(new Set());
  const [celebratingStep, setCelebratingStep] = useState<FlowStep | null>(null);
  const [shakingStep, setShakingStep] = useState<FlowStep | null>(null);
  const briefNodeRef = useRef<HTMLButtonElement>(null);
  const hasTriggeredBriefMilestone = useRef(false);

  // Calculate which steps are unlocked
  const unlockedSteps = useMemo(() => {
    return new Set(
      steps.filter(step => !stepStatuses[step.id].locked).map(step => step.id)
    );
  }, [steps, stepStatuses]);

  // Detect new unlocks and trigger celebrations
  useEffect(() => {
    if (prevUnlockedSteps.size === 0) {
      setPrevUnlockedSteps(unlockedSteps);
      return;
    }

    // Find newly unlocked steps
    const newlyUnlocked = [...unlockedSteps].filter(step => !prevUnlockedSteps.has(step));
    
    if (newlyUnlocked.includes('huddle') && !hasTriggeredBriefMilestone.current) {
      hasTriggeredBriefMilestone.current = true;
      setCelebratingStep('huddle');
      onMilestone?.('brief_unlocked');

      // Trigger confetti from the huddle node
      if (briefNodeRef.current && !prefersReducedMotion) {
        const rect = briefNodeRef.current.getBoundingClientRect();
        const x = (rect.left + rect.width / 2) / window.innerWidth;
        const y = (rect.top + rect.height / 2) / window.innerHeight;
        
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { x, y },
          colors: ['#06b6d4', '#8b5cf6', '#22d3ee'],
          disableForReducedMotion: true,
        });
      }
      
      // Clear celebration after animation
      setTimeout(() => setCelebratingStep(null), 1500);
    }
    
    setPrevUnlockedSteps(unlockedSteps);
  }, [unlockedSteps, prevUnlockedSteps, onMilestone]);

  // Handle locked step click (shake animation)
  const handleLockedClick = (stepId: FlowStep) => {
    if (prefersReducedMotion) return;
    setShakingStep(stepId);
    setTimeout(() => setShakingStep(null), 400);
  };

  // Content-driven height — avoids padding stealing from a fixed height and
  // clipping the label/score badge below the circle.
  const railMinHeight = isMobile ? 'min-h-28' : isTablet ? 'min-h-32' : 'min-h-36';

  return (
    <TooltipProvider delayDuration={200}>
      <div className={cn(
        'w-full bg-gradient-to-b from-slate-900/80 to-transparent flex-shrink-0',
        'pt-6 pb-10 md:pt-8 md:pb-12 lg:pt-10 lg:pb-14',
        railMinHeight,
        className
      )}>
        <div className="max-w-3xl mx-auto px-6 md:px-8 flex items-center">
          <div className="flex items-center justify-between w-full">
            {steps.map((step, index) => {
              const status = stepStatuses[step.id];
              const Icon = STEP_ICONS[step.id];
              const isLast = index === steps.length - 1;
              const isFirst = index === 0;
              const prevStep = index > 0 ? steps[index - 1] : null;
              const prevStatus = prevStep ? stepStatuses[prevStep.id] : null;
              const isCelebrating = celebratingStep === step.id;
              const isShaking = shakingStep === step.id;

              return (
                <div key={step.id} className="flex items-center flex-1">
                  {/* Connecting Line (before node, except first) */}
                  {!isFirst && (
                    <div className="flex-1 mx-2 md:mx-3 lg:mx-4 relative h-0.5">
                      {/* Background line - subtle */}
                      <div className="absolute inset-0 bg-slate-700/40 rounded-full" />
                      
                      {/* Progress fill - animates when previous step is completed */}
                      <motion.div
                        className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500/80 to-cyan-400/80"
                        initial={{ scaleX: 0 }}
                        animate={{ 
                          scaleX: prevStatus?.completed ? 1 : 0,
                        }}
                        transition={prefersReducedMotion ? { duration: 0 } : {
                          duration: 0.6,
                          ease: 'easeOut',
                          delay: 0.1,
                        }}
                        style={{ transformOrigin: 'left' }}
                      />
                    </div>
                  )}

                  {/* Step Node */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.button
                        ref={step.id === 'huddle' ? briefNodeRef : undefined}
                        onClick={() => {
                          if (status.locked) {
                            handleLockedClick(step.id);
                          } else {
                            navigateToStep(step.id);
                          }
                        }}
                        disabled={false} // Allow click for shake effect
                        className={cn(
                          'relative flex flex-col items-center group',
                          'transition-all duration-200',
                          status.locked ? 'cursor-not-allowed' : 'cursor-pointer'
                        )}
                        animate={isShaking ? {
                          x: [0, -3, 3, -3, 3, 0],
                        } : {}}
                        transition={{ duration: 0.4 }}
                      >
                        {/* Circle/Icon Container */}
                        <motion.div 
                          className={cn(
                            'relative flex items-center justify-center rounded-full border-2',
                            'transition-all duration-300',
                            // Size varies by viewport
                            isMobile ? 'w-10 h-10' : 'w-11 h-11 md:w-12 md:h-12',
                            // Completed state
                            status.completed && !status.current && 'bg-cyan-500/20 border-cyan-500 text-cyan-400',
                            // Current state with glow
                            status.current && 'bg-purple-500/20 border-purple-500 text-purple-400',
                            // Available but not current/completed
                            status.available && !status.current && !status.completed && 'bg-slate-800 border-slate-500 text-white hover:border-slate-400 hover:bg-slate-700/50',
                            // Locked state
                            status.locked && 'bg-slate-800/50 border-slate-600/50 text-slate-500 opacity-60'
                          )}
                          animate={isCelebrating ? {
                            scale: [1, 1.3, 1],
                          } : status.current && !prefersReducedMotion ? {
                            boxShadow: [
                              '0 0 0 0 rgba(139, 92, 246, 0.4)',
                              '0 0 20px 4px rgba(139, 92, 246, 0.2)',
                              '0 0 0 0 rgba(139, 92, 246, 0.4)',
                            ],
                          } : {}}
                          transition={isCelebrating ? {
                            duration: 0.5,
                            ease: 'easeOut',
                          } : {
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                        >
                          {/* Celebration glow burst */}
                          <AnimatePresence>
                            {isCelebrating && !prefersReducedMotion && (
                              <motion.div
                                initial={{ scale: 0.5, opacity: 1 }}
                                animate={{ scale: 2, opacity: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.6 }}
                                className="absolute inset-0 rounded-full bg-cyan-400"
                              />
                            )}
                          </AnimatePresence>
                          
                          {/* Icon */}
                          {status.locked ? (
                            <Lock className="w-4 h-4 md:w-5 md:h-5" />
                          ) : status.completed && !status.current ? (
                            <motion.div
                              initial={false}
                              animate={isCelebrating ? { scale: [0, 1.2, 1] } : { scale: 1 }}
                              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                            >
                              <Check className="w-4 h-4 md:w-5 md:h-5" />
                            </motion.div>
                          ) : (
                            <Icon className="w-4 h-4 md:w-5 md:h-5" />
                          )}
                        </motion.div>

                        {/* Label - Desktop: always visible, Tablet: always visible, Mobile: current only */}
                        <span className={cn(
                          'mt-2 text-xs font-medium transition-colors whitespace-nowrap',
                          status.current && 'text-purple-300',
                          status.completed && !status.current && 'text-cyan-400',
                          status.available && !status.current && !status.completed && 'text-slate-300 group-hover:text-white',
                          status.locked && 'text-slate-500',
                          // Visibility
                          isMobile ? (status.current ? 'block' : 'hidden') : 'block'
                        )}>
                          {isMobile ? step.shortLabel : step.label}
                        </span>

                        {/* Score badge for completed consultation */}
                        {step.id === 'wizard' && status.score && !status.current && (
                          <motion.span 
                            className={cn(
                              'mt-0.5 text-[10px] font-medium',
                              status.completed ? 'text-cyan-400/80' : 'text-slate-400'
                            )}
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            {status.score}
                          </motion.span>
                        )}
                      </motion.button>
                    </TooltipTrigger>
                    <TooltipContent 
                      side="bottom" 
                      className="bg-slate-800 border-slate-700 text-slate-200"
                    >
                      {status.locked ? (
                        <span className="text-amber-400">{status.lockReason}</span>
                      ) : status.current ? (
                        <span>You are here</span>
                      ) : status.completed ? (
                        <span>Click to return to {step.label}</span>
                      ) : (
                        <span>Continue to {step.label}</span>
                      )}
                    </TooltipContent>
                  </Tooltip>

                  {/* Connecting Line (after node, except last) */}
                  {!isLast && (
                    <div className="flex-1 mx-2 md:mx-3 lg:mx-4 relative h-0.5">
                      {/* Background line - subtle */}
                      <div className="absolute inset-0 bg-slate-700/40 rounded-full" />
                      
                      {/* Progress fill */}
                      <motion.div
                        className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400/80 to-cyan-500/80"
                        initial={{ scaleX: 0 }}
                        animate={{ 
                          scaleX: status.completed ? 1 : 0,
                        }}
                        transition={prefersReducedMotion ? { duration: 0 } : {
                          duration: 0.6,
                          ease: 'easeOut',
                        }}
                        style={{ transformOrigin: 'left' }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
