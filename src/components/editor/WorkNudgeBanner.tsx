import { useState } from 'react';
import { Images, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const dismissKey = (pageKey: string) => `pc_work_nudge_dismissed_${pageKey}`;

/** Editor-only suggestion to add the owner's own work photos. Never shown on published pages. */
export function WorkNudgeBanner({ pageKey, onAddGallery }: { pageKey: string; onAddGallery: () => void }) {
  const [dismissed, setDismissed] = useState(() => {
    try { return localStorage.getItem(dismissKey(pageKey)) === '1'; } catch { return false; }
  });
  if (dismissed) return null;
  const dismiss = () => {
    setDismissed(true);
    try { localStorage.setItem(dismissKey(pageKey), '1'); } catch { /* storage unavailable: dismiss for this session only */ }
  };
  return (
    <div role="region" aria-label="Suggestion: add photos of your work" className="mx-3 mt-3 mb-1 flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
      <Images className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">Show your real work</p>
        <p className="text-xs text-muted-foreground">Buyers trust photos of work you've actually done. Add 3–6 of yours — this gallery only takes your own photos.</p>
      </div>
      <Button size="sm" onClick={onAddGallery} className="shrink-0">Add a gallery</Button>
      <Button size="icon" variant="ghost" onClick={dismiss} aria-label="Dismiss suggestion" className="h-8 w-8 shrink-0">
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
