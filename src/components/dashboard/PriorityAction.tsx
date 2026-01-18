import { useNavigate } from 'react-router-dom';
import { Edit3, Sparkles, Target, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SimplePage {
  id: string;
  title?: string;
  status?: string;
}

interface PriorityActionProps {
  drafts: SimplePage[];
  pages: SimplePage[];
  inProgressConsultation?: {
    id: string;
    industry?: string;
    existingPage?: { id: string; title?: string } | null;
  } | null;
  onQuickPivot: () => void;
}

export function PriorityAction({ 
  drafts, 
  pages, 
  inProgressConsultation,
  onQuickPivot 
}: PriorityActionProps) {
  const navigate = useNavigate();

  // Priority 1: In-progress consultation with existing page
  if (inProgressConsultation?.existingPage) {
    return (
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/30 rounded-xl p-6 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
              <Edit3 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Continue Your Draft</h3>
              <p className="text-muted-foreground text-sm">
                "{inProgressConsultation.existingPage.title || inProgressConsultation.industry}" is ready for editing
              </p>
            </div>
          </div>
          <Button onClick={() => navigate(`/generate?id=${inProgressConsultation.existingPage!.id}`)}>
            Continue Editing <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  // Priority 2: Unfinished consultation (no page yet)
  if (inProgressConsultation) {
    return (
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/30 rounded-xl p-6 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Continue Your Strategy Session</h3>
              <p className="text-muted-foreground text-sm">
                {inProgressConsultation.industry || 'Your session'} — pick up where you left off
              </p>
            </div>
          </div>
          <Button onClick={() => navigate('/new', { state: { resumeConsultationId: inProgressConsultation.id } })}>
            Continue <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  // Priority 3: No pages yet
  if (pages.length === 0) {
    return (
      <div className="bg-gradient-to-r from-secondary/10 to-accent/10 border border-secondary/30 rounded-xl p-6 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-secondary/20 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Create Your First Page</h3>
              <p className="text-muted-foreground text-sm">Start a strategy session — takes about 10 minutes</p>
            </div>
          </div>
          <Button variant="premium" onClick={() => navigate('/new')}>
            Start Strategy Session <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  // Priority 4: Has published pages - suggest new target or quick pivot
  return (
    <div className="bg-gradient-to-r from-success/10 to-primary/10 border border-success/30 rounded-xl p-6 mb-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-success/20 flex items-center justify-center">
            <Target className="w-6 h-6 text-success" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Ready for More?</h3>
            <p className="text-muted-foreground text-sm">Create a variant for a new audience or personalize for a prospect</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onQuickPivot}>Quick Pivot</Button>
          <Button onClick={() => navigate('/new')}>New Page</Button>
        </div>
      </div>
    </div>
  );
}
