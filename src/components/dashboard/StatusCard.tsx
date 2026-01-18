import { useState } from 'react';
import { Clock, Globe, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatusCardProps {
  title: string;
  count: number;
  status: 'in-progress' | 'published';
  children: React.ReactNode;
  emptyMessage?: string;
  defaultExpanded?: boolean;
}

const statusStyles = {
  'in-progress': {
    border: 'border-amber-500/30',
    bg: 'bg-amber-500/5',
    icon: 'text-amber-400',
    badge: 'bg-amber-500/20 text-amber-300'
  },
  'published': {
    border: 'border-emerald-500/30', 
    bg: 'bg-emerald-500/5',
    icon: 'text-emerald-400',
    badge: 'bg-emerald-500/20 text-emerald-300'
  }
};

export function StatusCard({ 
  title, 
  count, 
  status, 
  children, 
  emptyMessage = "Nothing here yet",
  defaultExpanded = true 
}: StatusCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const styles = statusStyles[status];
  const Icon = status === 'in-progress' ? Clock : Globe;

  return (
    <div className={cn(
      "rounded-xl border transition-all",
      styles.border,
      styles.bg
    )}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4"
      >
        <div className="flex items-center gap-3">
          <Icon className={cn("w-5 h-5", styles.icon)} />
          <span className="font-medium text-foreground">{title}</span>
          <span className={cn(
            "text-xs px-2 py-0.5 rounded-full",
            styles.badge
          )}>
            {count}
          </span>
        </div>
        <ChevronDown className={cn(
          "w-4 h-4 text-muted-foreground transition-transform",
          expanded && "rotate-180"
        )} />
      </button>
      
      {expanded && (
        count > 0 ? (
          <div className="px-4 pb-4 space-y-2">
            {children}
          </div>
        ) : (
          <div className="px-4 pb-4 text-center text-muted-foreground text-sm py-6">
            {emptyMessage}
          </div>
        )
      )}
    </div>
  );
}
