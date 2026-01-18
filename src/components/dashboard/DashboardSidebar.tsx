import { Lightbulb, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface DashboardSidebarProps {
  credits: number;
  totalCredits: number;
  tier: string;
}

export function DashboardSidebar({ credits, totalCredits, tier }: DashboardSidebarProps) {
  const navigate = useNavigate();
  const creditPercentage = Math.min(100, (credits / totalCredits) * 100);

  const tips = [
    "Use Quick Pivot to create personalized pages for specific prospects in under 60 seconds.",
    "Add your brand colors and logo for consistent, professional pages.",
    "Include social proof and testimonials to boost conversions.",
    "A/B test different headlines to find what resonates best."
  ];

  const randomTip = tips[Math.floor(Math.random() * tips.length)];

  return (
    <div className="space-y-4">
      {/* Credits Meter */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Credits</span>
          <span className="text-sm font-medium text-foreground">{credits} remaining</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500"
            style={{ width: `${creditPercentage}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-muted-foreground capitalize">{tier} Plan</span>
          <Button 
            variant="link" 
            size="sm" 
            className="p-0 h-auto text-primary hover:text-primary/80"
            onClick={() => navigate('/settings')}
          >
            Get more credits <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </div>
      
      {/* Quick Tip */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center flex-shrink-0">
            <Lightbulb className="w-4 h-4 text-warning" />
          </div>
          <div>
            <p className="text-xs font-medium text-foreground mb-1">Pro Tip</p>
            <p className="text-sm text-muted-foreground">
              {randomTip}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
