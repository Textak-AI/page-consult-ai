import { motion } from "framer-motion";
import { CheckCircle, Sparkles, ArrowRight, FileSearch, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ReadyToGeneratePanelProps {
  researchHighlights?: string[];
  onGenerate: () => void;
  onReviewResearch?: () => void;
}

export function ReadyToGeneratePanel({ 
  researchHighlights = [], 
  onGenerate, 
  onReviewResearch 
}: ReadyToGeneratePanelProps) {
  // Default highlights if none provided
  const highlights = researchHighlights.length > 0 
    ? researchHighlights.slice(0, 3)
    : [
        "Competitive positioning identified",
        "Target audience pain points analyzed",
        "Industry best practices researched"
      ];
  
  return (
    <div className="h-full flex flex-col bg-black/30 backdrop-blur-xl border-l border-white/10">
      {/* Success Header */}
      <div className="p-6 border-b border-white/10 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative w-20 h-20 mx-auto mb-4"
        >
          {/* Animated rings */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-green-500/30"
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-green-500/20"
            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
          />
          <div className="absolute inset-0 bg-green-500/20 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
        </motion.div>
        <h2 className="text-xl font-semibold text-white">Strategy Complete!</h2>
        <p className="text-sm text-white/50 mt-1">
          Your landing page brief is ready
        </p>
      </div>
      
      {/* Research Highlights */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl p-4 border border-white/10">
          <h4 className="text-sm font-medium text-cyan-400 mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Key Insights
          </h4>
          <ul className="space-y-3">
            {highlights.map((insight, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-2 text-sm text-white/80"
              >
                <Sparkles className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                {insight}
              </motion.li>
            ))}
          </ul>
        </div>
        
        {/* What you'll get */}
        <div className="mt-4 p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
          <h4 className="text-sm font-medium text-purple-400 mb-2">
            Your page will include:
          </h4>
          <ul className="space-y-1 text-xs text-white/60">
            <li>• Compelling hero section with your value prop</li>
            <li>• Social proof and credibility elements</li>
            <li>• Problem-solution messaging framework</li>
            <li>• Optimized CTAs based on your goals</li>
          </ul>
        </div>
      </div>
      
      {/* CTAs */}
      <div className="p-4 border-t border-white/10 space-y-3">
        {/* Primary CTA */}
        <Button
          onClick={onGenerate}
          className={cn(
            "w-full py-6 text-lg font-semibold gap-2",
            "bg-gradient-to-r from-cyan-500 to-purple-500",
            "hover:from-cyan-400 hover:to-purple-400",
            "shadow-lg shadow-cyan-500/25 transition-all"
          )}
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <Sparkles className="w-5 h-5" />
          </motion.div>
          Generate Your Landing Page
          <ArrowRight className="w-5 h-5" />
        </Button>
        
        {/* Secondary CTA */}
        {onReviewResearch && (
          <Button
            variant="ghost"
            onClick={onReviewResearch}
            className="w-full py-2 text-white/50 hover:text-white hover:bg-white/5 gap-2"
          >
            <FileSearch className="w-4 h-4" />
            Review full research first
          </Button>
        )}
        
        {/* Urgency text */}
        <p className="text-center text-xs text-white/30">
          Your strategy brief is ready to build
        </p>
      </div>
    </div>
  );
}
