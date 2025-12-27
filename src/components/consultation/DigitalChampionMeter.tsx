import { useEffect, useRef, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { CompletenessState } from '@/lib/pageCompleteness';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Trophy, Unlock, Sparkles, Palette, Award, Users, Shield } from 'lucide-react';
import { SCORE_CATEGORIES } from '@/lib/categoryColors';

interface DigitalChampionMeterProps {
  completeness: CompletenessState;
  brandName?: string;
  logoUrl?: string;
  className?: string;
}

export function DigitalChampionMeter({ 
  completeness, 
  brandName = 'YOUR BRAND',
  logoUrl,
  className 
}: DigitalChampionMeterProps) {
  const { score, unlockedSections, milestones } = completeness;
  
  const prevUnlockedRef = useRef<string[]>([]);
  const prevMilestonesRef = useRef<string[]>([]);

  // Calculate individual stats from completeness data
  const stats = useMemo(() => ({
    brand: Math.min(100, Math.round((score * 1.2) + (logoUrl ? 15 : 0))),
    authority: Math.min(100, Math.round(score * 0.9)),
    proof: Math.min(100, Math.round((milestones.filter(m => m.achieved).length / Math.max(milestones.length, 1)) * 100)),
    trust: Math.min(100, Math.round(score * 0.85)),
  }), [score, logoUrl, milestones]);

  // Toast on unlock (keeping existing behavior)
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
          <Unlock className="w-4 h-4 text-purple-400" />
          <span className="text-sm">{section.replace(/-/g, ' ')} unlocked!</span>
        </div>,
        { duration: 3000 }
      );
    });
    prevUnlockedRef.current = unlockedSections;
  }, [unlockedSections]);

  // Toast on milestone
  useEffect(() => {
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
          <span className="text-sm">Achievement: {milestone}</span>
        </div>,
        { duration: 4000 }
      );
    });
    prevMilestonesRef.current = achievedMilestones;
  }, [milestones]);

  const getScoreLabel = (s: number) => {
    if (s >= 90) return 'Conversion-Ready';
    if (s >= 75) return 'Strong Foundation';
    if (s >= 50) return 'Good Progress';
    if (s >= 25) return 'Building Up';
    return 'Getting Started';
  };

  const categories = [
    { 
      id: 'brand', 
      name: 'Brand Identity', 
      value: stats.brand, 
      color: SCORE_CATEGORIES.brand.color,
      Icon: Palette 
    },
    { 
      id: 'authority', 
      name: 'Authority', 
      value: stats.authority, 
      color: SCORE_CATEGORIES.authority.color,
      Icon: Award 
    },
    { 
      id: 'proof', 
      name: 'Social Proof', 
      value: stats.proof, 
      color: SCORE_CATEGORIES.proof.color,
      Icon: Users 
    },
    { 
      id: 'trust', 
      name: 'Trust Signals', 
      value: stats.trust, 
      color: SCORE_CATEGORIES.trust.color,
      Icon: Shield 
    },
  ];

  return (
    <div className={cn(
      "bg-slate-900/95 backdrop-blur-xl rounded-xl border border-slate-700/50 overflow-hidden",
      className
    )}>
      {/* Header */}
      <div className="p-4 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <span className="font-semibold text-white">Page Score</span>
          </div>
          <motion.span 
            className="text-2xl font-bold text-white"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            key={score}
          >
            {score}%
          </motion.span>
        </div>
        <p className={cn(
          "text-sm mt-1",
          score >= 75 ? "text-emerald-400" : score >= 50 ? "text-amber-400" : "text-slate-400"
        )}>
          {getScoreLabel(score)}
        </p>
      </div>

      {/* Score Bars */}
      <div className="p-4 space-y-3">
        {categories.map(({ id, name, value, color, Icon }) => (
          <div key={id}>
            <div className="flex items-center justify-between text-sm mb-1.5">
              <div className="flex items-center gap-2">
                <Icon className="w-3.5 h-3.5" style={{ color }} />
                <span className="text-slate-400">{name}</span>
              </div>
              <span className="text-white font-medium">{value}%</span>
            </div>
            
            {/* Edge-glow progress bar */}
            <div className="relative h-2.5 bg-slate-800 rounded-full overflow-visible">
              {/* The fill */}
              <motion.div 
                className="h-full bg-slate-600 rounded-full relative"
                initial={{ width: 0 }}
                animate={{ width: `${value}%` }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
              >
                {/* Right edge glow (at fill point) */}
                <div 
                  className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-4 rounded-full blur-sm opacity-80"
                  style={{ backgroundColor: color }}
                />
              </motion.div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-slate-800/30 border-t border-slate-700/30">
        <p className="text-[10px] text-slate-500 text-center">
          {brandName}
        </p>
      </div>
    </div>
  );
}
