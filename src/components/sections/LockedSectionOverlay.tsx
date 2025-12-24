import { motion } from 'framer-motion';
import { Lock, Quote, Calculator, FileText, Users, Star, TrendingUp, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface LockedSectionConfig {
  sectionTypeName: string;
  sectionIcon: 'Quote' | 'Calculator' | 'FileText' | 'Users' | 'Star' | 'TrendingUp' | 'Zap';
  unlockAction: string;
  points: number;
  scoreCategory: string;
  currentScore: number;
  estimatedNewScore: number;
  actionButtonText: string;
  benefitHint?: string;
}

interface LockedSectionOverlayProps {
  sectionType: string;
  currentScore?: number;
  onUnlockAction?: () => void;
  children?: React.ReactNode;
  className?: string;
}

// Section configurations for different locked section types
const SECTION_CONFIGS: Record<string, LockedSectionConfig> = {
  'testimonials': {
    sectionTypeName: 'Social Proof',
    sectionIcon: 'Quote',
    unlockAction: 'Add Testimonials to Unlock',
    points: 15,
    scoreCategory: 'Proof',
    currentScore: 65,
    estimatedNewScore: 85,
    actionButtonText: 'Add Testimonials',
    benefitHint: 'Social proof increases conversions by 34% on average'
  },
  'social-proof': {
    sectionTypeName: 'Social Proof',
    sectionIcon: 'Quote',
    unlockAction: 'Add Testimonials to Unlock',
    points: 15,
    scoreCategory: 'Proof',
    currentScore: 65,
    estimatedNewScore: 85,
    actionButtonText: 'Add Testimonials',
    benefitHint: 'Social proof increases conversions by 34% on average'
  },
  'calculator': {
    sectionTypeName: 'ROI Calculator',
    sectionIcon: 'Calculator',
    unlockAction: 'Complete ROI Context to Unlock',
    points: 12,
    scoreCategory: 'Trust',
    currentScore: 70,
    estimatedNewScore: 86,
    actionButtonText: 'Add ROI Data',
    benefitHint: 'Interactive calculators boost engagement by 2x'
  },
  'case-study': {
    sectionTypeName: 'Case Study',
    sectionIcon: 'FileText',
    unlockAction: 'Share a Client Success Story',
    points: 10,
    scoreCategory: 'Authority',
    currentScore: 72,
    estimatedNewScore: 89,
    actionButtonText: 'Add Case Study',
    benefitHint: 'Case studies build trust and demonstrate real results'
  },
  'team': {
    sectionTypeName: 'Team Section',
    sectionIcon: 'Users',
    unlockAction: 'Add Team Members',
    points: 8,
    scoreCategory: 'Credibility',
    currentScore: 68,
    estimatedNewScore: 82,
    actionButtonText: 'Add Team',
    benefitHint: 'Showing your team builds personal connection'
  },
  'credibility-strip': {
    sectionTypeName: 'Credibility Strip',
    sectionIcon: 'Star',
    unlockAction: 'Add Key Stats & Metrics',
    points: 10,
    scoreCategory: 'Authority',
    currentScore: 60,
    estimatedNewScore: 78,
    actionButtonText: 'Add Stats',
    benefitHint: 'Numbers and metrics create instant credibility'
  },
  'audience-fit': {
    sectionTypeName: 'Audience Fit',
    sectionIcon: 'Users',
    unlockAction: 'Define Your Ideal Customer',
    points: 8,
    scoreCategory: 'Clarity',
    currentScore: 65,
    estimatedNewScore: 80,
    actionButtonText: 'Define Audience',
    benefitHint: 'Clear targeting increases conversion quality'
  },
  'default': {
    sectionTypeName: 'Section',
    sectionIcon: 'Zap',
    unlockAction: 'Complete Required Fields to Unlock',
    points: 10,
    scoreCategory: 'Power Level',
    currentScore: 70,
    estimatedNewScore: 85,
    actionButtonText: 'Unlock Section',
    benefitHint: 'Each section boosts your page effectiveness'
  }
};

const IconMap = {
  Quote,
  Calculator,
  FileText,
  Users,
  Star,
  TrendingUp,
  Zap
};

export function LockedSectionOverlay({
  sectionType,
  currentScore: propCurrentScore,
  onUnlockAction,
  children,
  className
}: LockedSectionOverlayProps) {
  const config = SECTION_CONFIGS[sectionType] || SECTION_CONFIGS['default'];
  const Icon = IconMap[config.sectionIcon];
  
  // Use prop score if provided, otherwise use default from config
  const currentScore = propCurrentScore ?? config.currentScore;
  const estimatedNewScore = Math.min(100, currentScore + config.points);

  return (
    <div className={cn("relative", className)}>
      {/* Blurred preview of what section would look like */}
      {children && (
        <div className="blur-sm opacity-40 pointer-events-none select-none">
          {children}
        </div>
      )}
      
      {/* Placeholder if no children */}
      {!children && (
        <div className="h-64 bg-gradient-to-br from-slate-800/50 to-slate-900/50 blur-sm opacity-40" />
      )}
      
      {/* Overlay */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/60 to-slate-900/90 flex items-center justify-center p-4"
      >
        {/* Unlock Card */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 25 }}
          whileHover={{ scale: 1.02 }}
          className="bg-slate-800/95 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 max-w-sm text-center shadow-2xl cursor-pointer group"
          onClick={onUnlockAction}
        >
          {/* Section Type Badge */}
          <div className="inline-flex items-center gap-2 bg-slate-700/50 px-3 py-1.5 rounded-full text-xs text-slate-300 mb-4">
            <Icon className="w-3.5 h-3.5" />
            <span>{config.sectionTypeName} Section</span>
          </div>
          
          {/* Lock Icon with glow */}
          <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-amber-500/20 transition-colors">
            <Lock className="w-7 h-7 text-amber-400" />
          </div>
          
          {/* Unlock Prompt */}
          <h3 className="text-lg font-semibold text-white mb-3">
            {config.unlockAction}
          </h3>
          
          {/* Points & Score Impact */}
          <div className="flex items-center justify-center gap-3 mb-4 flex-wrap">
            <span className="text-amber-400 font-bold text-sm">+{config.points} points</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400 text-sm">
              Boosts {config.scoreCategory} to ~{estimatedNewScore}%
            </span>
          </div>
          
          {/* Current → After visualization */}
          <div className="bg-slate-900/60 rounded-lg p-3 mb-5">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-slate-400">{config.scoreCategory}</span>
              <span className="text-slate-300">
                {currentScore}% → <span className="text-emerald-400 font-medium">{estimatedNewScore}%</span>
              </span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div className="relative h-full">
                {/* Current score bar */}
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${currentScore}%` }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="absolute h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full"
                />
                {/* Estimated new score preview (pulsing) */}
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${estimatedNewScore}%` }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="absolute h-full bg-gradient-to-r from-cyan-500/30 via-emerald-500/30 to-emerald-400/30 rounded-full"
                />
              </div>
            </div>
          </div>
          
          {/* Benefit hint */}
          {config.benefitHint && (
            <p className="text-xs text-slate-500 mb-4 italic">
              "{config.benefitHint}"
            </p>
          )}
          
          {/* Action Button */}
          <Button 
            className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white font-medium py-3 px-4 rounded-lg transition-all group-hover:shadow-lg group-hover:shadow-purple-500/20"
            onClick={(e) => {
              e.stopPropagation();
              onUnlockAction?.();
            }}
          >
            <Zap className="w-4 h-4 mr-2" />
            {config.actionButtonText}
          </Button>
          
          {/* Hover hint */}
          <p className="text-xs text-slate-600 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
            Click to unlock
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

// Export section configs for use elsewhere
export { SECTION_CONFIGS };
export type { LockedSectionConfig };
