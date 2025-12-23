import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface SectionLockOverlayProps {
  isLocked: boolean;
  requirement?: string;
  progress?: string;
  className?: string;
}

export function SectionLockOverlay({ 
  isLocked, 
  requirement, 
  progress,
  className 
}: SectionLockOverlayProps) {
  if (!isLocked) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        "absolute inset-0 bg-background/80 backdrop-blur-sm z-10",
        "flex flex-col items-center justify-center gap-2",
        className
      )}
    >
      <div className="p-3 rounded-full bg-muted">
        <Lock className="w-5 h-5 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground text-center px-4">
        {requirement ? `Add ${requirement} to unlock` : 'Locked'}
      </p>
      {progress && (
        <span className="text-xs text-muted-foreground/70">
          Progress: {progress}
        </span>
      )}
    </motion.div>
  );
}
