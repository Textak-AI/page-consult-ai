import { motion } from 'framer-motion';
import { User, Target, Zap, Star, Circle, Lock, Check } from 'lucide-react';
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

const levelColors: Record<StrategicLevel, string> = {
  unqualified: 'slate',
  identified: 'blue',
  positioned: 'green',
  armed: 'purple',
  proven: 'amber',
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
  const color = levelColors[currentLevel];
  
  const isMaxLevel = currentLevel === 'proven';
  
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-5 space-y-5">
      {/* Current Level Badge */}
      <div className="flex items-center gap-4">
        <motion.div 
          className={cn(
            "w-14 h-14 rounded-xl flex items-center justify-center",
            currentLevel === 'unqualified' && "bg-slate-700/50 border border-slate-600",
            currentLevel === 'identified' && "bg-blue-500/20 border border-blue-500/40",
            currentLevel === 'positioned' && "bg-green-500/20 border border-green-500/40",
            currentLevel === 'armed' && "bg-purple-500/20 border border-purple-500/40",
            currentLevel === 'proven' && "bg-amber-500/20 border border-amber-500/40"
          )}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', bounce: 0.4 }}
        >
          {currentLevel === 'unqualified' ? (
            <Circle className="w-6 h-6 text-slate-500" />
          ) : currentLevel === 'proven' ? (
            <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
          ) : (
            <Icon className={cn(
              "w-6 h-6",
              currentLevel === 'identified' && "text-blue-400",
              currentLevel === 'positioned' && "text-green-400",
              currentLevel === 'armed' && "text-purple-400"
            )} />
          )}
        </motion.div>

        <div className="flex-1">
          {currentLevel !== 'unqualified' && (
            <motion.span 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "text-xs font-medium uppercase tracking-wider",
                isMaxLevel ? "text-amber-400" : "text-cyan-400"
              )}
            >
              {isMaxLevel ? '⭐ Full Arsenal' : '✓ Achieved'}
            </motion.span>
          )}
          <h3 className="text-lg font-bold text-white">{levelDef.name}</h3>
          <p className="text-sm text-slate-400">"{levelDef.tagline}"</p>
        </div>
      </div>

      {/* Level Progress Steps */}
      <div className="flex items-center justify-between px-2">
        {(['identified', 'positioned', 'armed', 'proven'] as StrategicLevel[]).map((lvl, idx) => {
          const LvlIcon = levelIcons[lvl];
          const lvlColor = levelColors[lvl];
          const isReached = isLevelReached(currentLevel, lvl);
          const isCurrent = currentLevel === lvl;
          const isNext = nextLevel === lvl;
          
          return (
            <div key={lvl} className="flex items-center">
              <div className="flex flex-col items-center">
                <motion.div 
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
                    isReached
                      ? lvl === 'proven'
                        ? "bg-amber-500/30 border-2 border-amber-400"
                        : lvl === 'armed'
                        ? "bg-purple-500/30 border-2 border-purple-400"
                        : lvl === 'positioned'
                        ? "bg-green-500/30 border-2 border-green-400"
                        : "bg-blue-500/30 border-2 border-blue-400"
                      : "bg-slate-700/50 border-2 border-dashed border-slate-600"
                  )}
                  initial={false}
                  animate={isCurrent ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {isReached ? (
                    lvl === 'proven' ? (
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    ) : (
                      <Check className={cn(
                        "w-4 h-4",
                        lvl === 'armed' && "text-purple-400",
                        lvl === 'positioned' && "text-green-400",
                        lvl === 'identified' && "text-blue-400"
                      )} />
                    )
                  ) : (
                    <span className="text-xs text-slate-500 font-medium">
                      {idx + 1}
                    </span>
                  )}
                </motion.div>
                <span className={cn(
                  "text-[10px] mt-1 font-medium uppercase tracking-tight",
                  isReached 
                    ? lvl === 'proven' ? "text-amber-400" 
                    : lvl === 'armed' ? "text-purple-400"
                    : lvl === 'positioned' ? "text-green-400"
                    : "text-blue-400"
                    : "text-slate-600"
                )}>
                  {STRATEGIC_LEVELS[lvl].name}
                </span>
              </div>
              
              {idx < 3 && (
                <div className={cn(
                  "w-6 h-0.5 mx-1 -mt-4",
                  isLevelReached(currentLevel, (['identified', 'positioned', 'armed', 'proven'] as StrategicLevel[])[idx + 1])
                    ? "bg-gradient-to-r from-cyan-500/50 to-purple-500/50"
                    : "bg-slate-700"
                )} />
              )}
            </div>
          );
        })}
      </div>

      {/* Captured Fields */}
      {capturedFields.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-slate-700/50">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Captured:</p>
          <div className="space-y-1.5">
            {capturedFields.map(({ field, value }) => (
              <div key={field} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-cyan-400" />
                  <span className="text-slate-400">{formatFieldName(field)}</span>
                </div>
                <span className="text-slate-300 truncate max-w-[120px]">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Missing for Next Level */}
      {nextLevelDef && missingForNext.length > 0 && (
        <div className="space-y-2 bg-slate-900/30 rounded-lg p-3">
          <p className="text-xs font-medium text-slate-400">
            To reach <span className={cn(
              nextLevel === 'identified' && "text-blue-400",
              nextLevel === 'positioned' && "text-green-400",
              nextLevel === 'armed' && "text-purple-400",
              nextLevel === 'proven' && "text-amber-400"
            )}>{nextLevelDef.name}</span>:
          </p>
          <div className="space-y-1">
            {missingForNext.map(field => (
              <div key={field} className="flex items-center gap-2 text-xs text-slate-500">
                <Lock className="w-3 h-3" />
                <span>{formatFieldName(field)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Voice */}
      <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-lg p-3">
        <p className="text-sm text-slate-300 italic">"{levelDef.aiVoice}"</p>
      </div>

      {/* CTA based on unlocks */}
      {result.canUnlock('trial_signup') && !result.canUnlock('page_generation') && onContinue && (
        <Button
          onClick={onContinue}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium"
        >
          Start Free Trial →
        </Button>
      )}
      
      {result.canUnlock('page_generation') && !result.canUnlock('premium_generation') && onContinue && (
        <Button
          onClick={onContinue}
          className="w-full bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white font-medium"
        >
          Generate Page →
        </Button>
      )}
      
      {result.canUnlock('premium_generation') && onContinue && (
        <Button
          onClick={onContinue}
          className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-medium"
        >
          ⭐ Generate Premium Page
        </Button>
      )}
    </div>
  );
}
