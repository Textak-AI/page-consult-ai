import { motion } from 'framer-motion';
import { User, Target, Zap, Star, Sparkles, Check, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StrategicLevel, STRATEGIC_LEVELS } from '@/types/strategicLevels';
import type { LevelCheckResult } from '@/types/strategicLevels';
import { formatFieldName } from '@/lib/strategicLevelCalculator';
import { Button } from '@/components/ui/button';

const LEVEL_CONFIG = [
  { id: 'identified' as const, name: 'IDENTIFIED', color: 'blue', icon: User },
  { id: 'positioned' as const, name: 'POSITIONED', color: 'green', icon: Target },
  { id: 'armed' as const, name: 'ARMED', color: 'purple', icon: Zap },
  { id: 'proven' as const, name: 'PROVEN', color: 'amber', icon: Star },
];

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
  
  const currentConfig = LEVEL_CONFIG.find(l => l.id === currentLevel);
  const isGettingStarted = currentLevel === 'unqualified';
  
  return (
    <motion.div 
      className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-5 space-y-5 shadow-[0_0_40px_rgba(6,182,212,0.08)]"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <motion.div 
          className={cn(
            "relative w-14 h-14 rounded-xl flex items-center justify-center overflow-hidden",
            isGettingStarted 
              ? "bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.2)]"
              : currentLevel === 'identified'
              ? "bg-gradient-to-br from-blue-500/30 to-blue-600/20 border border-blue-400/40 shadow-[0_0_20px_rgba(59,130,246,0.25)]"
              : currentLevel === 'positioned'
              ? "bg-gradient-to-br from-green-500/30 to-emerald-600/20 border border-green-400/40 shadow-[0_0_20px_rgba(34,197,94,0.25)]"
              : currentLevel === 'armed'
              ? "bg-gradient-to-br from-purple-500/30 to-violet-600/20 border border-purple-400/40 shadow-[0_0_20px_rgba(147,51,234,0.25)]"
              : "bg-gradient-to-br from-amber-500/30 to-orange-600/20 border border-amber-400/40 shadow-[0_0_20px_rgba(245,158,11,0.25)]"
          )}
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', bounce: 0.4 }}
        >
          {isGettingStarted ? (
            <Sparkles className="w-6 h-6 text-cyan-400" />
          ) : currentLevel === 'proven' ? (
            <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
          ) : currentConfig?.icon ? (
            <currentConfig.icon className={cn(
              "w-6 h-6",
              currentLevel === 'identified' && "text-blue-400",
              currentLevel === 'positioned' && "text-green-400",
              currentLevel === 'armed' && "text-purple-400"
            )} />
          ) : null}
        </motion.div>
        
        <div className="flex-1">
          {!isGettingStarted && (
            <motion.span 
              className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-400 uppercase tracking-wider"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Check className="w-3 h-3" />
              Level Achieved
            </motion.span>
          )}
          <h3 className="text-lg font-bold text-white">{levelDef.name}</h3>
          <p className="text-sm text-slate-400">"{levelDef.tagline}"</p>
        </div>
      </div>

      {/* Level Progress Steps */}
      <div className="flex items-start justify-between gap-1">
        {LEVEL_CONFIG.map((level, idx) => {
          const isReached = isLevelReached(currentLevel, level.id);
          const isCurrent = currentLevel === level.id;
          const isNext = nextLevel === level.id;
          const LevelIcon = level.icon;
          
          return (
            <div key={level.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <motion.div 
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                    isReached
                      ? level.color === 'blue'
                        ? "bg-gradient-to-br from-blue-500 to-blue-600 border-2 border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.4)]"
                        : level.color === 'green'
                        ? "bg-gradient-to-br from-green-500 to-emerald-600 border-2 border-green-400 shadow-[0_0_15px_rgba(34,197,94,0.4)]"
                        : level.color === 'purple'
                        ? "bg-gradient-to-br from-purple-500 to-violet-600 border-2 border-purple-400 shadow-[0_0_15px_rgba(147,51,234,0.4)]"
                        : "bg-gradient-to-br from-amber-500 to-orange-500 border-2 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                      : isNext
                      ? "bg-slate-800/80 border-2 border-slate-500 shadow-[0_0_10px_rgba(100,116,139,0.2)]"
                      : "bg-slate-800/50 border-2 border-slate-700"
                  )}
                  animate={isCurrent ? { scale: [1, 1.05, 1] } : {}}
                  transition={{ duration: 2, repeat: isCurrent ? Infinity : 0, ease: "easeInOut" }}
                >
                  {isReached ? (
                    level.id === 'proven' ? (
                      <Star className="w-4 h-4 text-white fill-white" />
                    ) : (
                      <Check className="w-4 h-4 text-white" />
                    )
                  ) : (
                    <span className={cn(
                      "text-sm font-bold",
                      isNext ? "text-slate-400" : "text-slate-600"
                    )}>
                      {idx + 1}
                    </span>
                  )}
                </motion.div>
                
                <span className={cn(
                  "text-[9px] mt-1.5 font-bold uppercase tracking-wide",
                  isReached
                    ? level.color === 'blue' ? "text-blue-400"
                    : level.color === 'green' ? "text-green-400"
                    : level.color === 'purple' ? "text-purple-400"
                    : "text-amber-400"
                    : isNext ? "text-slate-400" : "text-slate-600"
                )}>
                  {level.name.slice(0, 3)}
                </span>
              </div>
              
              {/* Connector line */}
              {idx < LEVEL_CONFIG.length - 1 && (
                <div className={cn(
                  "flex-1 h-0.5 mx-1.5 -mt-3 rounded-full transition-all duration-500",
                  isLevelReached(currentLevel, LEVEL_CONFIG[idx + 1].id)
                    ? "bg-gradient-to-r from-cyan-500 to-purple-500"
                    : "bg-slate-700"
                )} />
              )}
            </div>
          );
        })}
      </div>

      {/* Captured Fields */}
      {capturedFields.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 rounded-full bg-gradient-to-b from-cyan-400 to-cyan-600" />
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Captured</span>
          </div>
          
          <div className="space-y-1.5">
            {capturedFields.map(({ field, value }) => (
              <div 
                key={field} 
                className="flex items-center justify-between bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
                    <Check className="w-3 h-3 text-cyan-400" />
                  </div>
                  <span className="text-sm text-slate-300">{formatFieldName(field)}</span>
                </div>
                <span className="text-sm text-cyan-400 font-medium truncate max-w-[100px]">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Missing for Next Level */}
      {nextLevelDef && missingForNext.length > 0 && (
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 space-y-3">
          <p className="text-sm font-medium text-slate-300">
            To reach{' '}
            <span className={cn(
              "font-bold",
              nextLevel === 'identified' && "text-blue-400",
              nextLevel === 'positioned' && "text-green-400",
              nextLevel === 'armed' && "text-purple-400",
              nextLevel === 'proven' && "text-amber-400"
            )}>
              {nextLevelDef.name}
            </span>
            :
          </p>
          
          <div className="space-y-1.5">
            {missingForNext.map((field) => (
              <div 
                key={field} 
                className="flex items-center gap-2.5 text-sm text-slate-500"
              >
                <div className="w-5 h-5 rounded-full bg-slate-700/50 border border-slate-600/50 flex items-center justify-center">
                  <Lock className="w-3 h-3 text-slate-500" />
                </div>
                <span>{formatFieldName(field)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA Buttons */}
      {result.canUnlock('trial_signup') && !result.canUnlock('page_generation') && onContinue && (
        <Button
          onClick={onContinue}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all hover:scale-[1.02]"
        >
          Start Free Trial →
        </Button>
      )}
      
      {result.canUnlock('page_generation') && !result.canUnlock('premium_generation') && onContinue && (
        <Button
          onClick={onContinue}
          className="w-full bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white font-semibold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all hover:scale-[1.02]"
        >
          Generate Page →
        </Button>
      )}
      
      {result.canUnlock('premium_generation') && onContinue && (
        <Button
          onClick={onContinue}
          className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all hover:scale-[1.02]"
        >
          ⭐ Generate Premium Page
        </Button>
      )}
    </motion.div>
  );
}
