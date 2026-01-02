import { motion } from 'framer-motion';
import { User, Target, Zap, Star, Circle, Lock, Check, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StrategicLevel, STRATEGIC_LEVELS } from '@/types/strategicLevels';
import type { LevelCheckResult } from '@/types/strategicLevels';
import { formatFieldName } from '@/lib/strategicLevelCalculator';
import { Button } from '@/components/ui/button';

const levelIcons: Record<StrategicLevel, typeof Circle> = {
  unqualified: Circle,
  identified: User,
  positioned: Target,
  armed: Zap,
  proven: Star,
};

interface Props {
  result: LevelCheckResult;
  onContinue?: () => void;
}

function isLevelReached(current: StrategicLevel, check: StrategicLevel): boolean {
  const order: StrategicLevel[] = ['unqualified', 'identified', 'positioned', 'armed', 'proven'];
  return order.indexOf(current) >= order.indexOf(check);
}

export function StrategicLevelIndicator({ result, onContinue }: Props) {
  const { currentLevel, levelDef, nextLevel, nextLevelDef, missingForNext, capturedFields } = result;
  const Icon = levelIcons[currentLevel];
  
  const isMaxLevel = currentLevel === 'proven';
  const isUnqualified = currentLevel === 'unqualified';
  
  return (
    <motion.div 
      className="relative overflow-hidden rounded-2xl"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Gradient background with animated glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
      <div className={cn(
        "absolute inset-0 opacity-30",
        isUnqualified && "bg-gradient-to-br from-slate-600/20 via-transparent to-slate-600/10",
        currentLevel === 'identified' && "bg-gradient-to-br from-blue-600/30 via-transparent to-blue-600/10",
        currentLevel === 'positioned' && "bg-gradient-to-br from-green-600/30 via-transparent to-emerald-600/10",
        currentLevel === 'armed' && "bg-gradient-to-br from-purple-600/30 via-transparent to-violet-600/10",
        currentLevel === 'proven' && "bg-gradient-to-br from-amber-500/30 via-transparent to-orange-500/10"
      )} />
      
      {/* Animated border glow for higher levels */}
      {!isUnqualified && (
        <motion.div 
          className={cn(
            "absolute inset-0 rounded-2xl",
            currentLevel === 'identified' && "shadow-[inset_0_0_30px_rgba(59,130,246,0.15)]",
            currentLevel === 'positioned' && "shadow-[inset_0_0_30px_rgba(34,197,94,0.15)]",
            currentLevel === 'armed' && "shadow-[inset_0_0_30px_rgba(147,51,234,0.2)]",
            currentLevel === 'proven' && "shadow-[inset_0_0_30px_rgba(245,158,11,0.2)]"
          )}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      
      <div className="relative border border-slate-700/50 rounded-2xl p-5 space-y-5 backdrop-blur-sm">
        {/* Header with Level Badge */}
        <div className="flex items-center gap-4">
          <motion.div 
            className={cn(
              "relative w-14 h-14 rounded-xl flex items-center justify-center overflow-hidden",
              isUnqualified && "bg-slate-800 border border-slate-600/50",
              currentLevel === 'identified' && "bg-gradient-to-br from-blue-500/20 to-blue-600/30 border border-blue-500/40",
              currentLevel === 'positioned' && "bg-gradient-to-br from-green-500/20 to-emerald-600/30 border border-green-500/40",
              currentLevel === 'armed' && "bg-gradient-to-br from-purple-500/20 to-violet-600/30 border border-purple-500/40",
              currentLevel === 'proven' && "bg-gradient-to-br from-amber-500/20 to-orange-600/30 border border-amber-400/50"
            )}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', bounce: 0.4 }}
          >
            {/* Inner glow */}
            {!isUnqualified && (
              <div className={cn(
                "absolute inset-0",
                currentLevel === 'identified' && "bg-blue-400/10",
                currentLevel === 'positioned' && "bg-green-400/10",
                currentLevel === 'armed' && "bg-purple-400/10",
                currentLevel === 'proven' && "bg-amber-400/10"
              )} />
            )}
            
            {isUnqualified ? (
              <Sparkles className="w-6 h-6 text-slate-400" />
            ) : currentLevel === 'proven' ? (
              <Star className="w-6 h-6 text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
            ) : (
              <Icon className={cn(
                "w-6 h-6 relative z-10",
                currentLevel === 'identified' && "text-blue-400 drop-shadow-[0_0_6px_rgba(59,130,246,0.5)]",
                currentLevel === 'positioned' && "text-green-400 drop-shadow-[0_0_6px_rgba(34,197,94,0.5)]",
                currentLevel === 'armed' && "text-purple-400 drop-shadow-[0_0_6px_rgba(147,51,234,0.5)]"
              )} />
            )}
          </motion.div>

          <div className="flex-1">
            {!isUnqualified && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider mb-0.5",
                  isMaxLevel ? "text-amber-400" : "text-cyan-400"
                )}
              >
                <Check className="w-3 h-3" />
                {isMaxLevel ? 'Full Arsenal' : 'Level Achieved'}
              </motion.div>
            )}
            <h3 className={cn(
              "text-lg font-bold",
              isUnqualified ? "text-slate-200" : "text-white"
            )}>{levelDef.name}</h3>
            <p className="text-sm text-slate-400">"{levelDef.tagline}"</p>
          </div>
        </div>

        {/* Level Progress Steps - Horizontal Stepper */}
        <div className="bg-slate-800/50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            {(['identified', 'positioned', 'armed', 'proven'] as StrategicLevel[]).map((lvl, idx) => {
              const LvlIcon = levelIcons[lvl];
              const isReached = isLevelReached(currentLevel, lvl);
              const isCurrent = currentLevel === lvl;
              
              return (
                <div key={lvl} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <motion.div 
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 relative",
                        isReached
                          ? lvl === 'proven'
                            ? "bg-gradient-to-br from-amber-500/40 to-orange-500/40 border-2 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                            : lvl === 'armed'
                            ? "bg-gradient-to-br from-purple-500/40 to-violet-500/40 border-2 border-purple-400 shadow-[0_0_15px_rgba(147,51,234,0.3)]"
                            : lvl === 'positioned'
                            ? "bg-gradient-to-br from-green-500/40 to-emerald-500/40 border-2 border-green-400 shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                            : "bg-gradient-to-br from-blue-500/40 to-cyan-500/40 border-2 border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                          : "bg-slate-800 border-2 border-dashed border-slate-600"
                      )}
                      initial={false}
                      animate={isCurrent ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                      transition={{ duration: 2, repeat: isCurrent ? Infinity : 0, ease: "easeInOut" }}
                    >
                      {isReached ? (
                        lvl === 'proven' ? (
                          <Star className="w-4 h-4 text-amber-300 fill-amber-300" />
                        ) : lvl === 'armed' ? (
                          <Zap className="w-4 h-4 text-purple-300" />
                        ) : lvl === 'positioned' ? (
                          <Target className="w-4 h-4 text-green-300" />
                        ) : (
                          <User className="w-4 h-4 text-blue-300" />
                        )
                      ) : (
                        <span className="text-xs text-slate-500 font-bold">
                          {idx + 1}
                        </span>
                      )}
                    </motion.div>
                    <span className={cn(
                      "text-[10px] mt-2 font-semibold uppercase tracking-tight text-center leading-tight",
                      isReached 
                        ? lvl === 'proven' ? "text-amber-400" 
                        : lvl === 'armed' ? "text-purple-400"
                        : lvl === 'positioned' ? "text-green-400"
                        : "text-blue-400"
                        : "text-slate-500"
                    )}>
                      {lvl === 'identified' ? 'ID' : lvl === 'positioned' ? 'POS' : lvl === 'armed' ? 'ARM' : 'PRO'}
                    </span>
                  </div>
                  
                  {/* Connector line */}
                  {idx < 3 && (
                    <div className="flex-1 h-0.5 mx-2 -mt-5">
                      <div className={cn(
                        "h-full rounded-full transition-all duration-500",
                        isLevelReached(currentLevel, (['identified', 'positioned', 'armed', 'proven'] as StrategicLevel[])[idx + 1])
                          ? "bg-gradient-to-r from-cyan-500/60 to-purple-500/60"
                          : "bg-slate-700"
                      )} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Captured Fields */}
        {capturedFields.length > 0 && (
          <motion.div 
            className="space-y-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">✓ Captured</p>
            <div className="grid gap-1.5">
              {capturedFields.map(({ field, value }, idx) => (
                <motion.div 
                  key={field} 
                  className="flex items-center justify-between text-xs bg-slate-800/50 rounded-lg px-3 py-2"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * idx }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-cyan-500/20 flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-cyan-400" />
                    </div>
                    <span className="text-slate-300">{formatFieldName(field)}</span>
                  </div>
                  <span className="text-cyan-400 truncate max-w-[100px] font-medium">{value}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Missing for Next Level */}
        {nextLevelDef && missingForNext.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium">
              <span className="text-slate-400">To reach </span>
              <span className={cn(
                "font-semibold",
                nextLevel === 'identified' && "text-blue-400",
                nextLevel === 'positioned' && "text-green-400",
                nextLevel === 'armed' && "text-purple-400",
                nextLevel === 'proven' && "text-amber-400"
              )}>{nextLevelDef.name}</span>
              <span className="text-slate-400">:</span>
            </p>
            <div className="grid gap-1">
              {missingForNext.map((field, idx) => (
                <motion.div 
                  key={field} 
                  className="flex items-center gap-2 text-xs text-slate-500 bg-slate-800/30 rounded-lg px-3 py-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.05 * idx }}
                >
                  <Lock className="w-3 h-3 text-slate-600" />
                  <span>{formatFieldName(field)}</span>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* CTA based on unlocks */}
        {result.canUnlock('trial_signup') && !result.canUnlock('page_generation') && onContinue && (
          <Button
            onClick={onContinue}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium shadow-lg shadow-green-500/20"
          >
            Start Free Trial →
          </Button>
        )}
        
        {result.canUnlock('page_generation') && !result.canUnlock('premium_generation') && onContinue && (
          <Button
            onClick={onContinue}
            className="w-full bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white font-medium shadow-lg shadow-purple-500/20"
          >
            Generate Page →
          </Button>
        )}
        
        {result.canUnlock('premium_generation') && onContinue && (
          <Button
            onClick={onContinue}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-medium shadow-lg shadow-amber-500/20"
          >
            ⭐ Generate Premium Page
          </Button>
        )}
      </div>
    </motion.div>
  );
}
