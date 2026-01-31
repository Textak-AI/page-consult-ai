import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Palette, FileText, Rocket, Lock, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFlowNavigation, type FlowStep, type FlowState, FLOW_STEPS } from '@/hooks/useFlowNavigation';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';

interface ProgressRailProps {
  currentStep: FlowStep;
  flowState: FlowState;
  className?: string;
}

const STEP_ICONS: Record<FlowStep, React.ComponentType<{ className?: string }>> = {
  consultation: MessageSquare,
  brand: Palette,
  strategy: FileText,
  generate: Rocket,
};

export function ProgressRail({ currentStep, flowState, className }: ProgressRailProps) {
  const { steps, stepStatuses, navigateToStep, sessionIdentifier } = useFlowNavigation(currentStep, flowState);
  const isMobile = useIsMobile();

  return (
    <TooltipProvider delayDuration={200}>
      <div className={cn(
        "w-full bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50",
        className
      )}>
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const status = stepStatuses[step.id];
              const Icon = STEP_ICONS[step.id];
              const isLast = index === steps.length - 1;

              return (
                <div key={step.id} className="flex items-center flex-1">
                  {/* Step Circle */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => !status.locked && navigateToStep(step.id)}
                        disabled={status.locked}
                        className={cn(
                          "relative flex flex-col items-center group",
                          "transition-all duration-300",
                          status.locked ? "cursor-not-allowed opacity-60" : "cursor-pointer"
                        )}
                      >
                        {/* Circle/Icon Container */}
                        <div className={cn(
                          "relative w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center",
                          "transition-all duration-300 border-2",
                          // Completed state
                          status.completed && !status.current && "bg-cyan-500/20 border-cyan-500 text-cyan-400",
                          // Current state with glow
                          status.current && "bg-purple-500/20 border-purple-500 text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.4)]",
                          // Available but not current/completed
                          status.available && !status.current && !status.completed && "bg-slate-800 border-slate-500 text-white hover:border-slate-400",
                          // Locked state
                          status.locked && "bg-slate-800/50 border-slate-600/50 text-slate-500"
                        )}>
                          {/* Current step pulse animation */}
                          {status.current && (
                            <motion.div
                              className="absolute inset-0 rounded-full bg-purple-500/30"
                              animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0, 0.5] }}
                              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            />
                          )}
                          
                          {/* Icon */}
                          {status.locked ? (
                            <Lock className="w-4 h-4 md:w-5 md:h-5" />
                          ) : status.completed && !status.current ? (
                            <Check className="w-4 h-4 md:w-5 md:h-5" />
                          ) : (
                            <Icon className="w-4 h-4 md:w-5 md:h-5" />
                          )}
                        </div>

                        {/* Label - visible on desktop, hidden on mobile unless current */}
                        <span className={cn(
                          "mt-1.5 text-xs font-medium transition-colors",
                          status.current && "text-purple-300",
                          status.completed && !status.current && "text-cyan-400",
                          status.available && !status.current && !status.completed && "text-slate-300 group-hover:text-white",
                          status.locked && "text-slate-500",
                          !isMobile ? "block" : status.current ? "block" : "hidden"
                        )}>
                          {isMobile ? step.shortLabel : step.label}
                        </span>

                        {/* Score badge for completed steps */}
                        {status.score && !status.current && (
                          <span className={cn(
                            "mt-0.5 text-[10px] font-medium",
                            status.completed ? "text-cyan-400/80" : "text-slate-400"
                          )}>
                            {status.score}
                          </span>
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

                  {/* Connector Line */}
                  {!isLast && (
                    <div className="flex-1 mx-2 md:mx-4">
                      <div className={cn(
                        "h-0.5 rounded-full transition-all duration-500",
                        status.completed 
                          ? "bg-gradient-to-r from-cyan-500 to-cyan-500/30" 
                          : "bg-slate-700"
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
