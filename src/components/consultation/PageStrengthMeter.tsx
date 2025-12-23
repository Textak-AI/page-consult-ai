import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Lock, Unlock, Sparkles, ChevronRight, Trophy } from 'lucide-react';
import { CompletenessState, getStrengthLabel } from '@/lib/pageCompleteness';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface PageStrengthMeterProps {
  completeness: CompletenessState;
  className?: string;
  showMilestones?: boolean;
}

export function PageStrengthMeter({ 
  completeness, 
  className,
  showMilestones = true 
}: PageStrengthMeterProps) {
  const { score, unlockedSections, lockedSections, nextUnlock, milestones } = completeness;
  const strength = getStrengthLabel(score);
  
  const prevUnlockedRef = useRef<string[]>([]);
  const prevMilestonesRef = useRef<string[]>([]);

  // Toast on section unlock
  useEffect(() => {
    if (prevUnlockedRef.current.length === 0) {
      prevUnlockedRef.current = unlockedSections;
      return;
    }

    const newlyUnlocked = unlockedSections.filter(
      s => !prevUnlockedRef.current.includes(s)
    );

    newlyUnlocked.forEach(section => {
      toast.success(
        <div className="flex items-center gap-2">
          <Unlock className="w-4 h-4 text-primary" />
          <span className="capitalize">{section.replace(/-/g, ' ')} unlocked!</span>
        </div>,
        { duration: 3000 }
      );
    });

    prevUnlockedRef.current = unlockedSections;
  }, [unlockedSections]);

  // Toast on milestone achieved
  useEffect(() => {
    if (!showMilestones) return;
    
    const achievedMilestones = milestones.filter(m => m.achieved).map(m => m.name);
    
    if (prevMilestonesRef.current.length === 0) {
      prevMilestonesRef.current = achievedMilestones;
      return;
    }

    const newMilestones = achievedMilestones.filter(
      m => !prevMilestonesRef.current.includes(m)
    );

    newMilestones.forEach(milestone => {
      toast.success(
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-500" />
          <span>Milestone: {milestone}</span>
        </div>,
        { duration: 4000 }
      );
    });

    prevMilestonesRef.current = achievedMilestones;
  }, [milestones, showMilestones]);

  return (
    <div className={cn("rounded-lg border bg-card p-4 space-y-4", className)}>
      {/* Score Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-primary/10">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <span className="font-medium text-sm">Page Strength</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg">{strength.emoji}</span>
          <div className="text-right">
            <span className={cn("text-xl font-bold", strength.color)}>
              {score}%
            </span>
            <p className={cn("text-xs", strength.color)}>{strength.label}</p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className={cn(
            "h-full rounded-full",
            score >= 90 ? "bg-gradient-to-r from-green-500 to-emerald-400" :
            score >= 75 ? "bg-gradient-to-r from-emerald-500 to-teal-400" :
            score >= 50 ? "bg-gradient-to-r from-blue-500 to-cyan-400" :
            score >= 25 ? "bg-gradient-to-r from-amber-500 to-yellow-400" :
            "bg-gradient-to-r from-purple-500 to-pink-400"
          )}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      {/* Milestones */}
      {showMilestones && milestones.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {milestones.map((milestone) => (
            <span
              key={milestone.name}
              className={cn(
                "px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1",
                milestone.achieved 
                  ? "bg-primary/10 text-primary" 
                  : "bg-muted text-muted-foreground"
              )}
            >
              {milestone.achieved ? (
                <Trophy className="w-3 h-3" />
              ) : (
                <Lock className="w-3 h-3" />
              )}
              {milestone.name}
            </span>
          ))}
        </div>
      )}

      {/* Unlocked Sections */}
      <div className="space-y-1">
        <div className="flex flex-wrap gap-1.5">
          {unlockedSections.slice(0, 4).map((section) => (
            <span
              key={section}
              className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-xs flex items-center gap-1"
            >
              <Unlock className="w-3 h-3" />
              <span className="capitalize">{section.replace(/-/g, ' ')}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Locked Sections */}
      {lockedSections.slice(0, 2).map((locked) => (
        <div
          key={locked.section}
          className="flex items-center justify-between text-xs py-1.5 px-2 bg-muted/50 rounded"
        >
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Lock className="w-3 h-3" />
            <span className="capitalize">{locked.section.replace(/-/g, ' ')}</span>
          </div>
          {locked.progress && (
            <span className="text-muted-foreground/70">
              {locked.progress}
            </span>
          )}
        </div>
      ))}

      {/* Next Unlock Hint */}
      <AnimatePresence>
        {nextUnlock && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 text-xs text-primary bg-primary/5 p-2 rounded"
          >
            <ChevronRight className="w-3 h-3 flex-shrink-0" />
            <span>{nextUnlock.hint}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
