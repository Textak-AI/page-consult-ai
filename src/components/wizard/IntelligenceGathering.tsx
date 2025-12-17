/**
 * Intelligence Gathering UI Component
 * Shows progress of market research and persona synthesis
 */

import { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Loader2, Search, Brain, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

type Stage = 'idle' | 'researching' | 'synthesizing' | 'complete' | 'error';

interface IntelligenceGatheringProps {
  stage: Stage;
  progress: number;
  error?: string;
  onComplete?: () => void;
}

const stageConfig = {
  idle: {
    icon: Search,
    title: 'Ready to Research',
    description: 'Gathering market intelligence...',
    color: 'text-muted-foreground'
  },
  researching: {
    icon: Search,
    title: 'Researching Your Market',
    description: 'Finding pain points, statistics, and competitor insights...',
    color: 'text-cyan-400'
  },
  synthesizing: {
    icon: Brain,
    title: 'Building Customer Persona',
    description: 'Creating a detailed profile of your ideal customer...',
    color: 'text-purple-400'
  },
  complete: {
    icon: CheckCircle2,
    title: 'Intelligence Ready',
    description: 'Your personalized content will be based on real market data.',
    color: 'text-green-400'
  },
  error: {
    icon: AlertCircle,
    title: 'Research Unavailable',
    description: 'Proceeding with template-based generation.',
    color: 'text-yellow-400'
  }
};

export function IntelligenceGathering({ 
  stage, 
  progress, 
  error,
  onComplete 
}: IntelligenceGatheringProps) {
  const config = stageConfig[stage];
  const Icon = config.icon;
  
  const [dots, setDots] = useState('');
  
  useEffect(() => {
    if (stage === 'researching' || stage === 'synthesizing') {
      const interval = setInterval(() => {
        setDots(prev => prev.length >= 3 ? '' : prev + '.');
      }, 500);
      return () => clearInterval(interval);
    }
  }, [stage]);

  useEffect(() => {
    if (stage === 'complete' && onComplete) {
      const timer = setTimeout(onComplete, 1500);
      return () => clearTimeout(timer);
    }
  }, [stage, onComplete]);

  return (
    <div className="rounded-xl border border-border/40 bg-card/30 backdrop-blur-sm p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg bg-background/50 ${config.color}`}>
          {(stage === 'researching' || stage === 'synthesizing') ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Icon className="h-5 w-5" />
          )}
        </div>
        <div>
          <h3 className={`font-medium ${config.color}`}>
            {config.title}{(stage === 'researching' || stage === 'synthesizing') ? dots : ''}
          </h3>
          <p className="text-sm text-muted-foreground">
            {error || config.description}
          </p>
        </div>
      </div>
      
      {(stage === 'researching' || stage === 'synthesizing') && (
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              {stage === 'researching' ? 'Market Research' : 'Persona Synthesis'}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>
      )}
      
      {stage === 'complete' && (
        <div className="flex flex-wrap gap-2 pt-2">
          <IntelligenceBadge icon={<Search className="h-3 w-3" />} label="Pain Points" />
          <IntelligenceBadge icon={<Brain className="h-3 w-3" />} label="Customer Persona" />
          <IntelligenceBadge icon={<Sparkles className="h-3 w-3" />} label="Market Insights" />
        </div>
      )}
    </div>
  );
}

function IntelligenceBadge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs">
      {icon}
      <span>{label}</span>
    </div>
  );
}

export default IntelligenceGathering;
