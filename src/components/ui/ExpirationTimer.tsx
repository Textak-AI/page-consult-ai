import { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { getTimeRemaining } from '@/lib/guestSession';
import { cn } from '@/lib/utils';

interface ExpirationTimerProps {
  expiresAt: string;
  onExpire?: () => void;
  className?: string;
  showIcon?: boolean;
  variant?: 'default' | 'compact' | 'urgent';
}

export function ExpirationTimer({ 
  expiresAt, 
  onExpire, 
  className,
  showIcon = true,
  variant = 'default'
}: ExpirationTimerProps) {
  const [time, setTime] = useState(getTimeRemaining(expiresAt));

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = getTimeRemaining(expiresAt);
      setTime(remaining);
      
      if (remaining.expired) {
        onExpire?.();
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  if (time.expired) {
    return (
      <div className={cn(
        "flex items-center gap-2 text-red-400",
        className
      )}>
        <AlertTriangle className="w-4 h-4" />
        <span className="text-sm">Session expired</span>
      </div>
    );
  }

  // Determine urgency level
  const isUrgent = time.totalSeconds < 3600; // Less than 1 hour
  const isCritical = time.totalSeconds < 600; // Less than 10 minutes

  const formatTime = () => {
    if (variant === 'compact') {
      return `${time.hours}:${time.minutes.toString().padStart(2, '0')}:${time.seconds.toString().padStart(2, '0')}`;
    }
    return `${time.hours}h ${time.minutes.toString().padStart(2, '0')}m ${time.seconds.toString().padStart(2, '0')}s`;
  };

  return (
    <div className={cn(
      "flex items-center gap-2 text-sm",
      isCritical ? "text-red-400" : isUrgent ? "text-amber-400" : "text-slate-400",
      className
    )}>
      {showIcon && <Clock className={cn("w-4 h-4", isCritical && "animate-pulse")} />}
      <span>
        {variant === 'default' && "Preview expires in "}
        {formatTime()}
      </span>
    </div>
  );
}

export default ExpirationTimer;
