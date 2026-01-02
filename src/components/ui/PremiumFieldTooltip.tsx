import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface PremiumFieldTooltipProps {
  value: string;
  className?: string;
  children?: ReactNode;
}

export function PremiumFieldTooltip({ value, className }: PremiumFieldTooltipProps) {
  const shouldShowTooltip = value && value.length > 20;
  
  return (
    <div className="group relative">
      {/* Truncated display value */}
      <span className={cn(
        "block text-xs truncate max-w-[140px] cursor-pointer",
        className
      )}>
        {value}
      </span>
      
      {/* High-tech tooltip - appears on hover */}
      {shouldShowTooltip && (
        <div className="
          absolute right-0 top-full mt-1 z-50
          opacity-0 invisible group-hover:opacity-100 group-hover:visible
          transition-all duration-200 ease-out
          transform scale-95 translate-y-1 group-hover:scale-100 group-hover:translate-y-0
          pointer-events-none group-hover:pointer-events-auto
        ">
          {/* Glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-lg blur-md" />
          
          {/* Tooltip container */}
          <div className="
            relative
            bg-slate-900/95 backdrop-blur-xl
            border border-cyan-500/30
            rounded-lg
            px-3 py-2
            min-w-[180px] max-w-[280px]
            shadow-[0_0_20px_rgba(0,255,255,0.15)]
          ">
            {/* Scanline effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent rounded-lg pointer-events-none" />
            
            {/* Content */}
            <p className="text-sm text-cyan-300 font-medium relative z-10 break-words">
              {value}
            </p>
            
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-2 h-2 border-l border-t border-cyan-400/50 rounded-tl" />
            <div className="absolute top-0 right-0 w-2 h-2 border-r border-t border-cyan-400/50 rounded-tr" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-l border-b border-cyan-400/50 rounded-bl" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-cyan-400/50 rounded-br" />
          </div>
        </div>
      )}
    </div>
  );
}
