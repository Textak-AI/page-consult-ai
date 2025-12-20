import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface GlowButtonProps extends ButtonProps {
  glowColor?: string;
}

export const GlowButton = forwardRef<HTMLButtonElement, GlowButtonProps>(
  ({ children, className, glowColor = 'rgba(34, 211, 238, 0.5)', disabled, ...props }, ref) => {
    return (
      <motion.div
        className="relative inline-block"
        whileHover={disabled ? undefined : { scale: 1.02 }}
        whileTap={disabled ? undefined : { scale: 0.98 }}
      >
        <motion.div
          className="absolute -inset-1 rounded-lg blur-md opacity-75"
          style={{ backgroundColor: glowColor }}
          animate={disabled ? { opacity: 0 } : { opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        
        <Button
          ref={ref}
          className={cn(
            'relative bg-gradient-to-r from-cyan-500 to-purple-500 text-white border-0',
            'hover:from-cyan-400 hover:to-purple-400',
            className
          )}
          disabled={disabled}
          {...props}
        >
          {children}
        </Button>
      </motion.div>
    );
  }
);

GlowButton.displayName = 'GlowButton';
