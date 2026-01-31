import { motion } from 'framer-motion';
import { MessageSquare, FileText, Palette, Map, Rocket, Lock, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFlowNavigation, type FlowStep, type FlowState } from '@/hooks/useFlowNavigation';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';

interface UnifiedNavBarProps {
  currentStep: FlowStep;
  flowState: FlowState;
  className?: string;
}

const STEP_ICONS: Record<FlowStep, React.ComponentType<{ className?: string }>> = {
  consultation: MessageSquare,
  brief: FileText,
  brand: Palette,
  strategy: Map,
  generate: Rocket,
};

// Check for reduced motion preference
const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

export function UnifiedNavBar({ 
  currentStep, 
  flowState, 
  className
}: UnifiedNavBarProps) {
  const { steps, stepStatuses, navigateToStep } = useFlowNavigation(currentStep, flowState);
  const isMobile = useIsMobile();

  return (
    <TooltipProvider delayDuration={200}>
      <div className={cn(
        'w-full bg-slate-900/80 border-b border-slate-800/60 flex-shrink-0',
        'h-14', // 56px height for unified bar
        className
      )}>
        <div className="h-full flex items-center justify-center">
          {/* Progress Rail nodes - centered */}
          <div className="flex items-center h-full px-4 lg:px-6 gap-2 lg:gap-3">
            {steps.map((step, index) => {
              const status = stepStatuses[step.id];
              const Icon = STEP_ICONS[step.id];
              const isLast = index === steps.length - 1;

              return (
                <div key={step.id} className="flex items-center">
                  {/* Step Node */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => !status.locked && navigateToStep(step.id)}
                        disabled={status.locked}
                        className={cn(
                          'relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium',
                          'transition-all duration-200 whitespace-nowrap',
                          status.locked && 'opacity-50 cursor-not-allowed',
                          status.current && 'bg-purple-500/20 text-purple-300 border border-purple-500/40',
                          status.completed && !status.current && 'text-cyan-400',
                          status.available && !status.current && !status.completed && 'text-slate-400 hover:text-white hover:bg-slate-700/50',
                          !status.locked && !status.current && 'cursor-pointer'
                        )}
                      >
                        {/* Icon */}
                        {status.locked ? (
                          <Lock className="w-3.5 h-3.5" />
                        ) : status.completed && !status.current ? (
                          <Check className="w-3.5 h-3.5" />
                        ) : (
                          <Icon className="w-3.5 h-3.5" />
                        )}
                        
                        {/* Label - hidden on mobile */}
                        {!isMobile && (
                          <span className="hidden sm:inline">{step.shortLabel}</span>
                        )}
                        
                        {/* Current indicator dot */}
                        {status.current && !prefersReducedMotion && (
                          <motion.span
                            className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-purple-400 rounded-full"
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                        )}
                      </button>
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

                  {/* Connecting line (except last) */}
                  {!isLast && (
                    <div className="w-4 lg:w-6 h-px mx-1">
                      <div className={cn(
                        'h-full rounded-full transition-colors duration-300',
                        status.completed ? 'bg-cyan-500/60' : 'bg-slate-700/50'
                      )} />
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
