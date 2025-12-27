import { useRef, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { CompletenessState } from '@/lib/pageCompleteness';
import { DigitalChampionMeter } from './DigitalChampionMeter';
import { Download, Linkedin, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ShareableAchievementCardProps {
  completeness: CompletenessState;
  brandName?: string;
  logoUrl?: string;
  className?: string;
}

// Helper to get missing items for improvement summary
function getMissingItems(scores: { brand: number; authority: number; proof: number; trust: number }): string[] {
  const missing: string[] = [];
  
  if (scores.proof < 100) {
    missing.push('another testimonial');
  }
  if (scores.trust < 100) {
    missing.push('a guarantee statement');
  }
  if (scores.authority < 100) {
    missing.push('more statistics or credentials');
  }
  if (scores.brand < 100) {
    missing.push('brand customization');
  }
  
  return missing.slice(0, 2); // Max 2 suggestions
}

export function ShareableAchievementCard({
  completeness,
  brandName = 'YOUR BRAND',
  logoUrl,
  className
}: ShareableAchievementCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { score, milestones } = completeness;

  // Calculate category scores
  const scores = useMemo(() => ({
    brand: Math.min(100, Math.round((score * 1.2) + (logoUrl ? 15 : 0))),
    authority: Math.min(100, Math.round(score * 0.9)),
    proof: Math.min(100, Math.round((milestones.filter(m => m.achieved).length / Math.max(milestones.length, 1)) * 100)),
    trust: Math.min(100, Math.round(score * 0.85)),
  }), [score, logoUrl, milestones]);

  const missingItems = useMemo(() => getMissingItems(scores), [scores]);

  const getShareText = () => {
    const powerLevel = score >= 90 ? 'LEGENDARY' : score >= 75 ? 'POWERFUL' : score >= 50 ? 'GROWING' : 'BUILDING';
    return `🎮 My ${brandName} page just hit ${score}% Power Level! ${powerLevel} status achieved. Built with @lovaborai`;
  };

  const handleTwitterShare = useCallback(() => {
    const text = encodeURIComponent(getShareText());
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank', 'width=550,height=420');
    toast.success('Opening Twitter to share!');
  }, [score, brandName]);

  const handleLinkedInShare = useCallback(() => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank', 'width=550,height=420');
    toast.success('Opening LinkedIn to share!');
  }, [score, brandName]);

  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return;
    
    try {
      const html2canvas = (await import('html2canvas')).default;
      
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
      });
      
      const link = document.createElement('a');
      link.download = `${brandName.toLowerCase().replace(/\s+/g, '-')}-achievement-${score}pct.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      toast.success('Achievement card downloaded!');
    } catch (error) {
      console.error('Failed to download:', error);
      toast.error('Failed to download. Try again.');
    }
  }, [brandName, score]);

  return (
    <div className={cn("space-y-4", className)}>
      {/* The Card to Share */}
      <div ref={cardRef}>
        <DigitalChampionMeter
          completeness={completeness}
          brandName={brandName}
          logoUrl={logoUrl}
        />
      </div>

      {/* Share Controls */}
      <div className="rounded-lg border bg-card p-4 space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Share2 className="w-4 h-4 text-primary" />
          Share Your Achievement
        </div>

        {/* Share Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleTwitterShare}
            className="flex-1 gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            Twitter
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleLinkedInShare}
            className="flex-1 gap-2"
          >
            <Linkedin className="w-4 h-4" />
            LinkedIn
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="flex-1 gap-2"
          >
            <Download className="w-4 h-4" />
            Download
          </Button>
        </div>

        {/* Improvement Summary - shown only when not at 100% */}
        {score < 100 && missingItems.length > 0 && (
          <div className="pt-2 border-t border-border">
            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
              <p className="text-sm text-slate-300">
                <span className="text-white font-medium">Almost there!</span>
                {' '}To reach 100%, try adding{' '}
                {missingItems.join(' and ')}.
                {' '}These small additions can significantly boost conversions.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Professional version without mascot
function ProfessionalStatsCard({
  completeness,
  brandName,
  logoUrl
}: {
  completeness: CompletenessState;
  brandName: string;
  logoUrl?: string;
}) {
  const { score, milestones } = completeness;
  
  const stats = {
    brand: Math.min(100, Math.round((score * 1.2) + (logoUrl ? 15 : 0))),
    authority: Math.min(100, Math.round(score * 0.9)),
    proof: Math.min(100, Math.round((milestones.filter(m => m.achieved).length / Math.max(milestones.length, 1)) * 100)),
    trust: Math.min(100, Math.round(score * 0.85)),
  };

  const getScoreLabel = () => {
    if (score >= 90) return 'Conversion-Ready';
    if (score >= 75) return 'High Performance';
    if (score >= 50) return 'Growing Strong';
    if (score >= 25) return 'Building';
    return 'Getting Started';
  };

  return (
    <div className="rounded-lg border bg-gradient-to-br from-background to-muted/30 p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {logoUrl && (
            <img src={logoUrl} alt="" className="w-10 h-10 object-contain rounded" />
          )}
          <div>
            <h3 className="font-semibold text-lg">{brandName}</h3>
            <p className="text-xs text-muted-foreground">Page Performance Report</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-primary">{score}%</div>
          <div className="text-xs text-muted-foreground">{getScoreLabel()}</div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-border" />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatItem label="Brand Identity" value={stats.brand} />
        <StatItem label="Authority" value={stats.authority} />
        <StatItem label="Social Proof" value={stats.proof} />
        <StatItem label="Trust Signals" value={stats.trust} />
      </div>

      {/* Overall Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Overall Page Strength</span>
          <span className="font-medium">{score}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              score >= 90 ? "bg-gradient-to-r from-green-500 to-emerald-400" :
              score >= 75 ? "bg-gradient-to-r from-emerald-500 to-teal-400" :
              score >= 50 ? "bg-gradient-to-r from-blue-500 to-cyan-400" :
              "bg-gradient-to-r from-amber-500 to-yellow-400"
            )}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      {/* Milestones */}
      {milestones.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {milestones.filter(m => m.achieved).map((milestone) => (
            <span
              key={milestone.name}
              className="px-2 py-0.5 bg-primary/10 text-primary rounded text-[10px] font-medium"
            >
              ✓ {milestone.name}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="pt-2 border-t border-border/50 text-center">
        <span className="text-[10px] text-muted-foreground">
          Built with PageConsult
        </span>
      </div>
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value}%</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary/70 rounded-full transition-all duration-500"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
