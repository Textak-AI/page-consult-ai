/**
 * Premium Page Generation Loading Screen
 * Shows sequential steps with ambient effects
 */

import { useEffect, useState } from 'react';
import { 
  Loader2, 
  Check,
  Brain,
  Sparkles,
  FileText,
  MessageSquare,
  Target,
  Layout
} from 'lucide-react';
import { cn } from '@/lib/utils';
import logo from '/logo/whiteAsset_3combimark_darkmode.svg';

interface GenerationStep {
  id: string;
  label: string;
  completedLabel: string;
  icon: React.ElementType;
  duration: number;
}

const generationSteps: GenerationStep[] = [
  { 
    id: 'intelligence', 
    label: 'Analyzing market intelligence...', 
    completedLabel: 'Analyzing market intelligence',
    icon: Brain, 
    duration: 2500 
  },
  { 
    id: 'headline', 
    label: 'Crafting your headline...', 
    completedLabel: 'Crafting your headline',
    icon: FileText, 
    duration: 2000 
  },
  { 
    id: 'features', 
    label: 'Building feature sections...', 
    completedLabel: 'Building feature sections',
    icon: Layout, 
    duration: 2500 
  },
  { 
    id: 'social', 
    label: 'Generating social proof...', 
    completedLabel: 'Generating social proof',
    icon: MessageSquare, 
    duration: 2000 
  },
  { 
    id: 'finalize', 
    label: 'Finalizing your page...', 
    completedLabel: 'Complete',
    icon: Target, 
    duration: 1500 
  },
];

interface PageGenerationLoaderProps {
  consultation?: {
    industry?: string;
    goal?: string;
    target_audience?: string;
  };
  onComplete?: () => void;
}

export function PageGenerationLoader({ consultation, onComplete }: PageGenerationLoaderProps) {
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  // Animate through generation steps
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    let cumulativeTime = 0;
    
    generationSteps.forEach((step, index) => {
      // Start step
      timers.push(setTimeout(() => {
        setCurrentStepIndex(index);
        // Update progress smoothly
        const targetProgress = ((index + 1) / generationSteps.length) * 100;
        setProgress(prev => Math.max(prev, targetProgress - 15));
      }, cumulativeTime));
      
      // Complete step
      timers.push(setTimeout(() => {
        setCompletedSteps(prev => [...prev, step.id]);
        const targetProgress = ((index + 1) / generationSteps.length) * 100;
        setProgress(targetProgress);
      }, cumulativeTime + step.duration - 300));
      
      cumulativeTime += step.duration;
    });

    // Call onComplete when all steps done
    if (onComplete) {
      timers.push(setTimeout(() => {
        onComplete();
      }, cumulativeTime + 500));
    }
    
    return () => timers.forEach(t => clearTimeout(t));
  }, [onComplete]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0f0a1f] via-[#1a1332] to-[#0f0a1f] relative overflow-hidden">
      {/* Ambient background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated radial gradients */}
        <div 
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-500/15 rounded-full blur-[150px]"
          style={{ 
            animation: 'pulse 4s ease-in-out infinite',
          }} 
        />
        <div 
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-500/15 rounded-full blur-[120px]"
          style={{ 
            animation: 'pulse 4s ease-in-out infinite',
            animationDelay: '1s',
          }} 
        />
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-pink-500/10 rounded-full blur-[100px]"
          style={{ 
            animation: 'pulse 4s ease-in-out infinite',
            animationDelay: '2s',
          }} 
        />
        
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-lg w-full mx-4 space-y-8">
        {/* Logo with subtle glow - static, no spin */}
        <div className="flex justify-center">
          <div className="relative">
            {/* Glow behind logo */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/30 to-purple-500/30 blur-2xl rounded-full scale-150 opacity-50" />
            <img 
              src={logo} 
              alt="PageConsult AI" 
              className="h-10 relative z-10"
            />
          </div>
        </div>

        {/* Header */}
        <div className="text-center space-y-3">
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            Generating Your Page
          </h2>
          <p className="text-gray-400">
            AI is crafting conversion-optimized content just for you
          </p>
        </div>

        {/* Progress steps card */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 space-y-4">
          {generationSteps.map((step, index) => {
            const isComplete = completedSteps.includes(step.id);
            const isActive = currentStepIndex === index && !isComplete;
            const isPending = index > currentStepIndex;
            const StepIcon = step.icon;

            return (
              <div 
                key={step.id}
                className={cn(
                  "flex items-center gap-4 transition-all duration-500",
                  isComplete && "opacity-100",
                  isActive && "opacity-100",
                  isPending && "opacity-30"
                )}
              >
                {/* Step icon/status */}
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 flex-shrink-0",
                  isComplete && "bg-green-500/20 text-green-400",
                  isActive && "bg-cyan-500/20 text-cyan-400",
                  isPending && "bg-white/5 text-gray-600"
                )}>
                  {isComplete ? (
                    <Check className="w-4 h-4" />
                  ) : isActive ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <StepIcon className="w-4 h-4" />
                  )}
                </div>
                
                {/* Step label */}
                <span className={cn(
                  "flex-1 text-sm font-medium transition-colors duration-300",
                  isComplete && "text-green-400",
                  isActive && "text-white",
                  isPending && "text-gray-600"
                )}>
                  {isComplete ? step.completedLabel : step.label}
                </span>

                {/* Checkmark for completed */}
                {isComplete && (
                  <Check className="w-4 h-4 text-green-400 animate-fade-in" />
                )}
              </div>
            );
          })}

          {/* Progress bar */}
          <div className="pt-4 border-t border-white/10 space-y-2">
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Building your page...</span>
              <span className="text-cyan-400 font-medium">{Math.round(progress)}% complete</span>
            </div>
          </div>
        </div>

        {/* Strategy card - smaller, glassmorphic */}
        {consultation && (
          <div className="bg-white/[0.03] backdrop-blur-sm rounded-xl border border-white/[0.06] p-4 animate-fade-in">
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
              {consultation.target_audience && (
                <p className="text-gray-400">
                  <span className="text-cyan-400/70">Audience:</span>{' '}
                  {consultation.target_audience.length > 60 
                    ? consultation.target_audience.slice(0, 60) + '...' 
                    : consultation.target_audience
                  }
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PageGenerationLoader;
