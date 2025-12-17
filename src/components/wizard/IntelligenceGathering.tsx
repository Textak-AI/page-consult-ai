/**
 * Intelligence Gathering UI Component
 * Full-screen overlay with animated progress steps
 */

import { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Loader2, 
  Search, 
  Brain, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  User,
  Target,
  MessageSquare,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Stage = 'idle' | 'researching' | 'synthesizing' | 'complete' | 'error';

interface PersonaPreview {
  name?: string;
  primaryPain?: string;
  primaryDesire?: string;
  keyObjection?: string;
  confidenceScore?: number;
}

interface IntelligenceGatheringProps {
  stage: Stage;
  progress: number;
  error?: string;
  persona?: PersonaPreview;
  onComplete?: () => void;
  onContinue?: () => void;
}

const researchSteps = [
  { id: 'trends', label: 'Analyzing industry trends...', icon: TrendingUp, duration: 3000 },
  { id: 'audience', label: 'Understanding your audience...', icon: User, duration: 3000 },
  { id: 'persona', label: 'Building buyer persona...', icon: Brain, duration: 3000 },
];

export function IntelligenceGathering({ 
  stage, 
  progress, 
  error,
  persona,
  onComplete,
  onContinue 
}: IntelligenceGatheringProps) {
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  
  // Animate through research steps
  useEffect(() => {
    if (stage === 'researching' || stage === 'synthesizing') {
      setCompletedSteps([]);
      setCurrentStepIndex(0);
      
      // Animate each step
      const timers: NodeJS.Timeout[] = [];
      
      researchSteps.forEach((step, index) => {
        const delay = researchSteps.slice(0, index).reduce((sum, s) => sum + s.duration, 0);
        
        // Start step
        timers.push(setTimeout(() => {
          setCurrentStepIndex(index);
        }, delay));
        
        // Complete step
        timers.push(setTimeout(() => {
          setCompletedSteps(prev => [...prev, step.id]);
        }, delay + step.duration - 500));
      });
      
      return () => timers.forEach(t => clearTimeout(t));
    }
  }, [stage]);

  useEffect(() => {
    if (stage === 'complete' && onComplete) {
      const timer = setTimeout(onComplete, 1500);
      return () => clearTimeout(timer);
    }
  }, [stage, onComplete]);

  const isActive = stage === 'researching' || stage === 'synthesizing';
  const isComplete = stage === 'complete';
  const hasError = stage === 'error';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#0f0a1f]/95 via-[#1a1332]/95 to-[#0f0a1f]/95 backdrop-blur-lg">
      {/* Ambient effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-pink-500/10 rounded-full blur-[90px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 max-w-lg w-full mx-4 space-y-8">
        {/* Header with animated icon */}
        <div className="text-center space-y-4">
          <div className="relative inline-flex">
            <div className={cn(
              "w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-500",
              isActive && "bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 animate-pulse",
              isComplete && "bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30",
              hasError && "bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30"
            )}>
              {isActive && (
                <Brain className="w-10 h-10 text-cyan-400 animate-pulse" />
              )}
              {isComplete && (
                <Sparkles className="w-10 h-10 text-green-400" />
              )}
              {hasError && (
                <AlertCircle className="w-10 h-10 text-yellow-400" />
              )}
            </div>
            
            {/* Spinning ring around icon */}
            {isActive && (
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent border-t-cyan-500/50 animate-spin" style={{ animationDuration: '2s' }} />
            )}
          </div>

          <h2 className={cn(
            "text-2xl md:text-3xl font-bold transition-colors duration-300",
            isActive && "text-white",
            isComplete && "text-green-400",
            hasError && "text-yellow-400"
          )}>
            {isActive && "Researching Your Market..."}
            {isComplete && "Intelligence Ready!"}
            {hasError && "Research Unavailable"}
          </h2>

          <p className="text-gray-400 max-w-md mx-auto">
            {isActive && "Our AI is gathering real market data, analyzing your audience, and building a detailed customer persona."}
            {isComplete && "Your personalized content will be based on real market research and buyer psychology."}
            {hasError && (error || "We'll proceed with template-based generation instead.")}
          </p>
        </div>

        {/* Progress steps */}
        {(isActive || isComplete) && (
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 space-y-4">
            {researchSteps.map((step, index) => {
              const isStepComplete = completedSteps.includes(step.id) || isComplete;
              const isStepActive = currentStepIndex === index && !isStepComplete && isActive;
              const StepIcon = step.icon;

              return (
                <div 
                  key={step.id}
                  className={cn(
                    "flex items-center gap-4 transition-all duration-500",
                    isStepComplete && "opacity-100",
                    isStepActive && "opacity-100",
                    !isStepComplete && !isStepActive && "opacity-40"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
                    isStepComplete && "bg-green-500/20 text-green-400",
                    isStepActive && "bg-cyan-500/20 text-cyan-400",
                    !isStepComplete && !isStepActive && "bg-white/5 text-gray-500"
                  )}>
                    {isStepComplete ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : isStepActive ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <StepIcon className="w-5 h-5" />
                    )}
                  </div>
                  
                  <span className={cn(
                    "flex-1 text-sm font-medium transition-colors duration-300",
                    isStepComplete && "text-green-400",
                    isStepActive && "text-white",
                    !isStepComplete && !isStepActive && "text-gray-500"
                  )}>
                    {isStepComplete ? step.label.replace('...', ' ✓') : step.label}
                  </span>
                </div>
              );
            })}

            {/* Progress bar */}
            {isActive && (
              <div className="pt-4 border-t border-white/10">
                <Progress value={progress} className="h-2" />
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>Gathering intelligence...</span>
                  <span>{Math.round(progress)}%</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Persona preview card */}
        {isComplete && persona && (
          <div className="bg-gradient-to-br from-purple-500/10 to-cyan-500/10 backdrop-blur-xl rounded-2xl border border-purple-500/30 p-6 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Meet {persona.name || "Your Target Customer"}
                  </h3>
                  <p className="text-sm text-purple-300">
                    AI-Generated Buyer Persona
                  </p>
                </div>
              </div>
              
              {persona.confidenceScore !== undefined && persona.confidenceScore > 0 && (
                <div className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium",
                  persona.confidenceScore >= 0.8 ? "bg-green-500/20 text-green-400" :
                  persona.confidenceScore >= 0.5 ? "bg-yellow-500/20 text-yellow-400" :
                  "bg-red-500/20 text-red-400"
                )}>
                  {Math.round(persona.confidenceScore * 100)}% confidence
                </div>
              )}
            </div>

            <div className="grid gap-3">
              {persona.primaryPain && (
                <div className="flex items-start gap-2">
                  <Target className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-xs text-red-400 font-medium">Primary Pain:</span>
                    <p className="text-sm text-gray-300">{persona.primaryPain}</p>
                  </div>
                </div>
              )}
              
              {persona.primaryDesire && (
                <div className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-xs text-green-400 font-medium">Primary Desire:</span>
                    <p className="text-sm text-gray-300">{persona.primaryDesire}</p>
                  </div>
                </div>
              )}
              
              {persona.keyObjection && (
                <div className="flex items-start gap-2">
                  <MessageSquare className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-xs text-yellow-400 font-medium">Key Objection:</span>
                    <p className="text-sm text-gray-300">{persona.keyObjection}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Continue button */}
        {isComplete && onContinue && (
          <div className="text-center pt-4">
            <Button 
              onClick={onContinue}
              size="lg"
              className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white shadow-lg shadow-cyan-500/20 group"
            >
              Continue to Generate
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        )}

        {/* Error continue */}
        {hasError && onContinue && (
          <div className="text-center pt-4">
            <Button 
              onClick={onContinue}
              variant="outline"
              size="lg"
              className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
            >
              Continue Without Research
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Intelligence badges */}
        {isComplete && (
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            <IntelligenceBadge icon={<Search className="h-3 w-3" />} label="Pain Points" />
            <IntelligenceBadge icon={<Brain className="h-3 w-3" />} label="Buyer Persona" />
            <IntelligenceBadge icon={<TrendingUp className="h-3 w-3" />} label="Market Insights" />
          </div>
        )}
      </div>
    </div>
  );
}

function IntelligenceBadge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs">
      {icon}
      <span>{label}</span>
    </div>
  );
}

export default IntelligenceGathering;
