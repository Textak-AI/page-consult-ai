import { motion, AnimatePresence } from 'framer-motion';
import { User, Target, Zap, Star, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StrategicLevel, STRATEGIC_LEVELS } from '@/types/strategicLevels';
import { formatFieldName } from '@/lib/strategicLevelCalculator';
import { Button } from '@/components/ui/button';

interface ExtractedQuote {
  userMessage: string;
  extractedFields: {
    field: string;
    value: string;
  }[];
}

interface Props {
  level: StrategicLevel;
  quotes: ExtractedQuote[];
  unlocks: string[];
  onContinue: () => void;
  onDismiss: () => void;
}

const levelIcons: Record<StrategicLevel, typeof User | null> = {
  unqualified: null,
  identified: User,
  positioned: Target,
  armed: Zap,
  proven: Star,
};

const unlockLabels: Record<string, string> = {
  'continue_demo': 'Continue Consultation',
  'trial_signup': 'Free Trial Signup',
  'page_generation': 'Page Generation',
  'premium_generation': 'Premium Page Generation',
  'export_brief': 'Export Strategy Brief',
};

export function LevelUpCelebration({ level, quotes, unlocks, onContinue, onDismiss }: Props) {
  const Icon = levelIcons[level];
  const levelDef = STRATEGIC_LEVELS[level];
  
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onDismiss}
        />
        
        {/* Card */}
        <motion.div 
          className="relative bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', bounce: 0.4, delay: 0.1 }}
        >
          {/* Close button */}
          <button 
            onClick={onDismiss}
            className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Level Badge */}
          <div className="flex flex-col items-center text-center mb-6">
            <motion.div 
              className={cn(
                "w-20 h-20 rounded-2xl flex items-center justify-center mb-4",
                level === 'identified' && "bg-blue-500/20 border-2 border-blue-400",
                level === 'positioned' && "bg-green-500/20 border-2 border-green-400",
                level === 'armed' && "bg-purple-500/20 border-2 border-purple-400",
                level === 'proven' && "bg-amber-500/20 border-2 border-amber-400"
              )}
              initial={{ scale: 0.5, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
            >
              {level === 'proven' ? (
                <Star className="w-10 h-10 text-amber-400 fill-amber-400" />
              ) : Icon ? (
                <Icon className={cn(
                  "w-10 h-10",
                  level === 'identified' && "text-blue-400",
                  level === 'positioned' && "text-green-400",
                  level === 'armed' && "text-purple-400"
                )} />
              ) : null}
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <span className={cn(
                "text-xs font-semibold uppercase tracking-wider",
                level === 'identified' && "text-blue-400",
                level === 'positioned' && "text-green-400",
                level === 'armed' && "text-purple-400",
                level === 'proven' && "text-amber-400"
              )}>
                ✨ Level Achieved
              </span>
              <h2 className="text-2xl font-bold text-white mt-1">{levelDef.name}</h2>
              <p className="text-slate-400 mt-1">"{levelDef.tagline}"</p>
            </motion.div>
          </div>

          {/* Quotes Section */}
          {quotes.length > 0 && (
            <div className="space-y-4 mb-6">
              {quotes.slice(0, 2).map((quote, idx) => (
                <motion.div 
                  key={idx} 
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + idx * 0.1 }}
                >
                  {/* What they said */}
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <span className="text-xs text-slate-500 uppercase tracking-wider block mb-1">
                      You said:
                    </span>
                    <p className="text-sm text-slate-300 italic">
                      "{quote.userMessage.length > 150 
                        ? quote.userMessage.substring(0, 150) + '...' 
                        : quote.userMessage}"
                    </p>
                  </div>
                  
                  {/* What we extracted */}
                  <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-3">
                    <span className="text-xs text-cyan-400 uppercase tracking-wider block mb-1">
                      I heard:
                    </span>
                    <div className="space-y-1">
                      {quote.extractedFields.slice(0, 3).map((field, fieldIdx) => (
                        <motion.div 
                          key={fieldIdx} 
                          className="flex items-start gap-2 text-sm"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5 + idx * 0.1 + fieldIdx * 0.05 }}
                        >
                          <span className="text-cyan-400">→</span>
                          <span className="text-slate-400">{formatFieldName(field.field)}:</span>
                          <span className="text-white truncate">{field.value}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Unlocks */}
          {unlocks.length > 0 && (
            <motion.div 
              className="text-center mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <span className="text-sm text-green-400">
                🔓 Unlocked: {unlocks.map(u => unlockLabels[u] || u).join(', ')}
              </span>
            </motion.div>
          )}

          {/* AI Next Prompt */}
          <motion.div 
            className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-lg p-3 mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <p className="text-sm text-slate-300 italic text-center">"{levelDef.aiVoice}"</p>
          </motion.div>

          {/* CTAs */}
          <motion.div 
            className="flex gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            {unlocks.includes('trial_signup') && !unlocks.includes('page_generation') && (
              <>
                <Button
                  variant="outline"
                  onClick={onDismiss}
                  className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800"
                >
                  Keep Chatting
                </Button>
                <Button
                  onClick={onContinue}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                >
                  Start Free Trial →
                </Button>
              </>
            )}
            
            {unlocks.includes('page_generation') && !unlocks.includes('premium_generation') && (
              <>
                <Button
                  variant="outline"
                  onClick={onDismiss}
                  className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800"
                >
                  Keep Chatting
                </Button>
                <Button
                  onClick={onContinue}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white"
                >
                  Generate Page →
                </Button>
              </>
            )}
            
            {unlocks.includes('premium_generation') && (
              <Button
                onClick={onContinue}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
              >
                ⭐ Generate Premium Page
              </Button>
            )}
            
            {!unlocks.includes('trial_signup') && (
              <Button
                onClick={onDismiss}
                className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white"
              >
                Continue →
              </Button>
            )}
          </motion.div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
