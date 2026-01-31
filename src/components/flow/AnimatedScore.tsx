import { motion, AnimatePresence } from 'framer-motion';
import { useScoreAnimation } from '@/hooks/useScoreAnimation';
import { cn } from '@/lib/utils';

interface AnimatedScoreProps {
  score: number;
  maxScore?: number;
  size?: 'sm' | 'md' | 'lg';
  showToasts?: boolean;
  className?: string;
}

export function AnimatedScore({ 
  score, 
  maxScore = 100, 
  size = 'md',
  showToasts = true,
  className 
}: AnimatedScoreProps) {
  const { displayScore, toasts, isAnimating } = useScoreAnimation(score);
  
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  const digits = String(Math.min(displayScore, maxScore)).padStart(2, '0').split('');

  return (
    <div className={cn('relative inline-flex items-baseline', className)}>
      {/* Odometer-style score display */}
      <div className={cn('flex font-bold tabular-nums', sizeClasses[size])}>
        {digits.map((digit, index) => (
          <div
            key={index}
            className="relative w-[0.7em] h-[1.2em] overflow-hidden"
          >
            <AnimatePresence mode="popLayout">
              <motion.span
                key={`${index}-${digit}`}
                initial={{ y: -24, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 24, opacity: 0 }}
                transition={{ 
                  type: 'spring', 
                  stiffness: 300, 
                  damping: 30,
                  mass: 0.8,
                }}
                className="absolute inset-0 flex items-center justify-center"
              >
                {digit}
              </motion.span>
            </AnimatePresence>
          </div>
        ))}
      </div>
      
      {/* Max score suffix */}
      <span className={cn(
        'text-slate-500 ml-0.5',
        size === 'sm' && 'text-xs',
        size === 'md' && 'text-sm',
        size === 'lg' && 'text-lg',
      )}>
        /{maxScore}
      </span>
      
      {/* Floating toasts */}
      {showToasts && (
        <AnimatePresence>
          {toasts.map((toast, index) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 0, x: 20 }}
              animate={{ opacity: 1, y: -20 - (index * 24), x: 20 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.4 }}
              className="absolute top-0 right-0 pointer-events-none"
            >
              <span className="text-sm font-bold text-cyan-400 whitespace-nowrap">
                +{toast.delta} pts
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      )}
      
      {/* Glow effect when animating */}
      {isAnimating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 -m-2 rounded-lg bg-cyan-500/20 blur-md pointer-events-none"
        />
      )}
    </div>
  );
}
