import { FileText, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardHeaderProps {
  userName: string;
  pageCount: number;
  draftCount: number;
  credits: number;
}

const QuickStat = ({ 
  icon: Icon, 
  label, 
  value, 
  highlight 
}: { 
  icon: React.ElementType; 
  label: string; 
  value: number; 
  highlight?: boolean;
}) => (
  <div className={cn(
    "text-center px-4 py-2 rounded-lg transition-colors",
    highlight 
      ? "bg-warning/10 border border-warning/30" 
      : "bg-muted/50"
  )}>
    <Icon className={cn(
      "w-5 h-5 mx-auto mb-1", 
      highlight ? "text-warning" : "text-muted-foreground"
    )} />
    <div className={cn(
      "text-xl font-semibold", 
      highlight ? "text-warning" : "text-foreground"
    )}>
      {value}
    </div>
    <div className="text-xs text-muted-foreground">{label}</div>
  </div>
);

export function DashboardHeader({ 
  userName, 
  pageCount, 
  draftCount, 
  credits 
}: DashboardHeaderProps) {
  const getGreeting = () => {
    if (pageCount === 0) return `Let's build your first page, ${userName}`;
    if (draftCount > 0) return `Welcome back, ${userName} — you have work in progress`;
    return `Welcome back, ${userName}`;
  };

  const getSubtext = () => {
    if (pageCount === 0) return "Start a strategy session and watch your page come to life";
    if (draftCount > 0) return `${draftCount} draft${draftCount > 1 ? 's' : ''} waiting to be finished`;
    return `${pageCount} page${pageCount > 1 ? 's' : ''} created`;
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">{getGreeting()}</h1>
        <p className="text-muted-foreground mt-1">{getSubtext()}</p>
      </div>
      
      {/* Quick Stats */}
      <div className="flex gap-4">
        <QuickStat icon={FileText} label="Pages" value={pageCount} />
        <QuickStat 
          icon={Sparkles} 
          label="Credits" 
          value={credits} 
          highlight={credits < 10} 
        />
      </div>
    </div>
  );
}
