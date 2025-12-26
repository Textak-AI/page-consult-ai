import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { CompletenessState, getStrengthLabel } from '@/lib/pageCompleteness';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Trophy, Unlock } from 'lucide-react';
import { MascotSVG } from '@/components/ui/MascotSVG';

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
  const strength = getStrengthLabel(score);
  
  const prevUnlockedRef = useRef<string[]>([]);
  const prevMilestonesRef = useRef<string[]>([]);

  // Calculate individual stats from completeness data
  const stats = {
    brand: Math.min(100, Math.round((score * 1.2) + (logoUrl ? 15 : 0))),
    authority: Math.min(100, Math.round(score * 0.9)),
    proof: Math.min(100, Math.round((milestones.filter(m => m.achieved).length / Math.max(milestones.length, 1)) * 100)),
    trust: Math.min(100, Math.round(score * 0.85)),
  };

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
        <div className="flex items-center gap-2 font-mono">
          <Unlock className="w-4 h-4 text-primary" />
          <span className="uppercase text-xs">{section.replace(/-/g, ' ')} unlocked!</span>
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
        <div className="flex items-center gap-2 font-mono">
          <Trophy className="w-4 h-4 text-amber-500" />
          <span className="uppercase text-xs">Achievement: {milestone}</span>
        </div>,
        { duration: 4000 }
      );
    });
    prevMilestonesRef.current = achievedMilestones;
  }, [milestones]);

  const getPowerMessage = () => {
    if (score >= 90) return '"LEGENDARY STATUS!"';
    if (score >= 75) return '"Looking powerful!"';
    if (score >= 50) return '"Growing stronger..."';
    if (score >= 25) return '"Keep building!"';
    return '"Just getting started"';
  };

  return (
    <div className={cn(
      "relative overflow-hidden rounded-lg border-4 border-primary/30 bg-background font-mono text-xs",
      "shadow-[0_0_20px_rgba(168,85,247,0.2)]",
      className
    )}>
      {/* Scanline overlay effect */}
      <div className="absolute inset-0 pointer-events-none bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.03)_2px,rgba(0,0,0,0.03)_4px)] z-10" />
      
      {/* Header */}
      <div className="bg-primary/10 border-b-2 border-primary/30 px-3 py-2 flex items-center justify-between">
        <span className="text-primary font-bold tracking-wider">★ DIGITAL CHAMPION ★</span>
        <span className="text-muted-foreground text-[10px]">32-BIT</span>
      </div>

      <div className="p-4 space-y-4">
        {/* Mascot Character */}
        <div className="flex justify-center">
          <div className="relative">
            {/* Glow effect based on power level */}
            <div 
              className="absolute inset-0 -z-10 blur-xl rounded-full"
              style={{
                background: `radial-gradient(circle, hsl(var(--primary) / ${score / 200}) 0%, transparent 70%)`,
              }}
            />
            
            {/* Float animation wrapper */}
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <MascotSVG 
                size={80} 
                accentColor="hsl(var(--primary))"
                className="drop-shadow-[0_0_10px_rgba(168,85,247,0.3)]"
              />
            </motion.div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t-2 border-dashed border-primary/20" />

        {/* Brand Name */}
        <div className="text-center">
          <div className="text-primary font-bold text-sm tracking-widest uppercase truncate">
            {brandName}
          </div>
          <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-primary/40 to-transparent mt-1" />
        </div>

        {/* Stat Bars */}
        <div className="space-y-2">
          <StatBar label="BRAND" value={stats.brand} color="from-purple-500 to-pink-500" />
          <StatBar label="AUTHORITY" value={stats.authority} color="from-blue-500 to-cyan-500" />
          <StatBar label="PROOF" value={stats.proof} color="from-green-500 to-emerald-500" />
          <StatBar label="TRUST" value={stats.trust} color="from-amber-500 to-yellow-500" />
        </div>

        {/* Divider */}
        <div className="border-t-2 border-primary/20" />

        {/* Power Level */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary">
            <span className="text-base">⚡</span>
            <span className="font-bold tracking-wider">POWER LEVEL</span>
          </div>
          
          <div className="relative h-4 bg-muted/50 rounded overflow-hidden border border-primary/20">
            <motion.div
              className={cn(
                "absolute inset-y-0 left-0 rounded",
                score >= 90 ? "bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500" :
                score >= 75 ? "bg-gradient-to-r from-green-500 to-emerald-400" :
                score >= 50 ? "bg-gradient-to-r from-blue-500 to-cyan-400" :
                "bg-gradient-to-r from-purple-500 to-pink-400"
              )}
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
            {/* Pixel block effect overlay */}
            <div className="absolute inset-0 flex">
              {Array.from({ length: 20 }).map((_, i) => (
                <div 
                  key={i} 
                  className="flex-1 border-r border-background/20 last:border-r-0"
                />
              ))}
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className={cn(
              "font-bold text-lg",
              score >= 90 ? "text-yellow-500" :
              score >= 75 ? "text-green-500" :
              score >= 50 ? "text-blue-500" :
              "text-purple-500"
            )}>
              {score}%
            </span>
          </div>
        </div>

        {/* Status Message */}
        <div className="text-center text-muted-foreground italic text-[11px] pt-1">
          {getPowerMessage()}
        </div>
      </div>
    </div>
  );
}

// Stat bar component
function StatBar({ 
  label, 
  value, 
  color 
}: { 
  label: string; 
  value: number; 
  color: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-20 text-[10px] text-muted-foreground tracking-wider">{label}</span>
      <div className="flex-1 h-2 bg-muted/30 rounded-sm overflow-hidden border border-primary/10">
        <motion.div
          className={cn("h-full bg-gradient-to-r rounded-sm", color)}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
        />
      </div>
      <span className="w-8 text-right text-[10px] text-muted-foreground">{value}%</span>
    </div>
  );
}
