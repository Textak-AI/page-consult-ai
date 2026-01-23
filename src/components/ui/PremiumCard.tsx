import { cn } from "@/lib/utils";
import { motion, type HTMLMotionProps } from "framer-motion";
import React from "react";

interface PremiumCardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  variant?: 'glass' | 'solid' | 'outlined' | 'elevated' | 'industry-aware';
  glow?: boolean;
  glowColor?: 'cyan' | 'purple' | 'gradient';
  hover?: boolean;
  children: React.ReactNode;
  className?: string;
}

const variantStyles = {
  glass: `
    bg-white/[0.03] 
    backdrop-blur-xl 
    border border-white/[0.08]
    shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]
  `,
  solid: `
    bg-slate-800/80
    border border-slate-700/50
  `,
  outlined: `
    bg-transparent
    border border-slate-700
    hover:border-slate-600
  `,
  elevated: `
    bg-slate-800
    shadow-[0_20px_50px_rgba(0,0,0,0.3)]
    border border-slate-700/30
  `,
  // Industry-aware: Uses CSS custom properties from data-industry
  'industry-aware': `
    border border-border
  `,
};

const glowStyles = {
  cyan: 'before:from-cyan-500/20 before:to-cyan-400/10',
  purple: 'before:from-purple-500/20 before:to-purple-400/10',
  gradient: 'before:from-cyan-500/20 before:via-purple-500/15 before:to-blue-500/10',
};

export const PremiumCard = React.forwardRef<HTMLDivElement, PremiumCardProps>(({ 
  variant = 'glass', 
  glow = false,
  glowColor = 'cyan',
  hover = true,
  children,
  className = '',
  ...props
}: PremiumCardProps, ref) => {
  const glowClasses = glow ? `
    relative
    before:absolute before:inset-0 before:rounded-2xl before:-z-10
    before:bg-gradient-to-br ${glowStyles[glowColor]}
    before:blur-xl before:opacity-0
    hover:before:opacity-100 before:transition-opacity before:duration-500
  ` : '';
  
  const hoverClasses = hover ? 'hover:-translate-y-1 hover:shadow-xl' : '';
  
  // For industry-aware variant, use CSS custom properties
  const isIndustryAware = variant === 'industry-aware';
  const industryStyles = isIndustryAware ? {
    borderRadius: 'var(--card-radius, 1rem)',
    backdropFilter: 'blur(var(--card-blur, 0))',
    backgroundColor: 'var(--card-bg, hsl(var(--card)))',
  } : {};
  
  return (
    <motion.div
      ref={ref}
      className={cn(
        'p-8 transition-all duration-300',
        // Use dynamic radius only for non-industry-aware variants
        !isIndustryAware && 'rounded-2xl',
        variantStyles[variant],
        glowClasses,
        hoverClasses,
        className
      )}
      style={industryStyles}
      {...props}
    >
      {children}
    </motion.div>
  );
});

PremiumCard.displayName = "PremiumCard";

// Gradient Icon Container for features/benefits
interface GradientIconProps {
  children: React.ReactNode;
  colorFrom?: string;
  colorTo?: string;
  className?: string;
}

export const GradientIcon = ({ 
  children, 
  colorFrom = 'hsl(189, 95%, 43%)', 
  colorTo = 'hsl(270, 95%, 60%)',
  className = ''
}: GradientIconProps) => (
  <div 
    className={cn(
      "w-14 h-14 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110",
      className
    )}
    style={{
      background: `linear-gradient(135deg, ${colorFrom}, ${colorTo})`,
      boxShadow: `0 8px 20px -4px ${colorFrom}40`,
    }}
  >
    {children}
  </div>
);

// Eyebrow badge component for section headers
interface EyebrowBadgeProps {
  icon?: React.ReactNode;
  text: string;
  className?: string;
}

export const EyebrowBadge = ({ icon, text, className = '' }: EyebrowBadgeProps) => (
  <div 
    className={cn(
      "inline-flex items-center gap-2 px-4 py-2 rounded-full",
      "bg-cyan-500/10 border border-cyan-500/20",
      "backdrop-blur-sm",
      className
    )}
  >
    {icon && <span className="text-cyan-400">{icon}</span>}
    <span className="text-sm font-medium text-cyan-400 tracking-wide uppercase">
      {text}
    </span>
  </div>
);

// Shimmer button overlay
export const ShimmerOverlay = ({ className = '' }: { className?: string }) => (
  <div 
    className={cn(
      "absolute inset-0 -translate-x-full",
      "bg-gradient-to-r from-transparent via-white/20 to-transparent",
      "group-hover:translate-x-full transition-transform duration-1000",
      className
    )}
  />
);
