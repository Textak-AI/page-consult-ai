import { cn } from '@/lib/utils';
import { MascotSVG } from './MascotSVG';

interface DigitalChampionMascotProps {
  score?: number;
  brandColor?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  sm: 64,
  md: 96,
  lg: 128,
};

export function DigitalChampionMascot({ 
  score, 
  brandColor = '#7C3AED',
  size = 'md',
  className 
}: DigitalChampionMascotProps) {
  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div className="relative">
        {/* Glow effect */}
        <div 
          className="absolute inset-0 blur-xl rounded-full opacity-50"
          style={{ 
            background: `radial-gradient(circle, ${brandColor}40 0%, transparent 70%)`,
          }}
        />
        
        {/* Float animation wrapper */}
        <div className="relative animate-float">
          <MascotSVG 
            size={sizes[size]} 
            accentColor={brandColor}
          />
          
          {/* Sparkle on hover */}
          <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity text-sm">
            ✨
          </div>
        </div>
      </div>
      
      {/* Score display */}
      {score !== undefined && (
        <div className="text-center">
          <div 
            className="text-2xl font-bold"
            style={{ color: brandColor }}
          >
            {score}%
          </div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider">
            Page Strength
          </div>
        </div>
      )}
    </div>
  );
}
