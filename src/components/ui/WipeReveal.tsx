import { motion, useAnimation } from 'framer-motion';
import { useEffect } from 'react';

interface WipeRevealProps {
  isRevealing: boolean;
  oldContent: React.ReactNode;
  newContent: React.ReactNode;
  direction?: 'left-to-right' | 'right-to-left';
  duration?: number;
  onRevealComplete?: () => void;
}

export function WipeReveal({
  isRevealing,
  oldContent,
  newContent,
  direction = 'left-to-right',
  duration = 0.8,
  onRevealComplete
}: WipeRevealProps) {
  const controls = useAnimation();

  useEffect(() => {
    if (isRevealing) {
      controls.start('revealed').then(() => {
        onRevealComplete?.();
      });
    }
  }, [isRevealing, controls, onRevealComplete]);

  const clipVariants = {
    hidden: { clipPath: 'inset(0 0 0 0)' },
    revealed: {
      clipPath: direction === 'left-to-right' 
        ? 'inset(0 100% 0 0)' 
        : 'inset(0 0 0 100%)',
      transition: { duration, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }
    }
  };

  const lineVariants = {
    hidden: { left: '0%', opacity: 0 },
    revealed: {
      left: '100%',
      opacity: [0, 1, 1, 0],
      transition: { duration, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* New content - full size, underneath */}
      <div className="absolute inset-0">
        {newContent}
      </div>

      {/* Old content - clips away */}
      <motion.div
        initial="hidden"
        animate={controls}
        variants={clipVariants}
        className="absolute inset-0 z-10"
      >
        {oldContent}
      </motion.div>

      {/* The glowing wipe line */}
      <motion.div
        initial="hidden"
        animate={controls}
        variants={lineVariants}
        className="absolute top-0 bottom-0 w-[3px] z-20 wipe-line-glow"
      />
    </div>
  );
}
