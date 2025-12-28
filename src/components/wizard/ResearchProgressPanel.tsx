import { motion } from "framer-motion";
import { Loader2, CheckCircle, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResearchStep {
  label: string;
  done: boolean;
}

interface ResearchProgressPanelProps {
  steps: ResearchStep[];
}

export function ResearchProgressPanel({ steps }: ResearchProgressPanelProps) {
  const completedCount = steps.filter(s => s.done).length;
  const progress = (completedCount / steps.length) * 100;
  
  return (
    <div className="h-full flex flex-col bg-black/30 backdrop-blur-xl border-l border-white/10">
      {/* Header with animation */}
      <div className="p-6 border-b border-white/10 text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center"
        >
          <Search className="w-8 h-8 text-white" />
        </motion.div>
        <h2 className="text-xl font-semibold text-white">Researching Your Market</h2>
        <p className="text-sm text-white/50 mt-1">
          Analyzing competitive landscape...
        </p>
      </div>
      
      {/* Progress Steps */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-xs space-y-4">
          {steps.map((step, idx) => {
            const isActive = !step.done && steps.findIndex(s => !s.done) === idx;
            
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.15 }}
                className="flex items-center gap-3"
              >
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300",
                  step.done 
                    ? "bg-green-500" 
                    : isActive 
                      ? "bg-cyan-500" 
                      : "bg-white/10 border border-white/20"
                )}>
                  {step.done ? (
                    <CheckCircle className="w-4 h-4 text-white" />
                  ) : isActive ? (
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-white/30" />
                  )}
                </div>
                <span className={cn(
                  "text-sm transition-colors duration-300",
                  step.done 
                    ? "text-white" 
                    : isActive 
                      ? "text-cyan-400" 
                      : "text-white/40"
                )}>
                  {step.label}
                </span>
              </motion.div>
            );
          })}
        </div>
        
        {/* Progress bar */}
        <div className="w-full max-w-xs mt-8">
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="p-4 border-t border-white/10 text-center">
        <p className="text-sm text-white/40">
          Usually takes 30-60 seconds
        </p>
        <p className="text-xs text-white/30 mt-1">
          {completedCount} of {steps.length} steps complete
        </p>
      </div>
    </div>
  );
}
