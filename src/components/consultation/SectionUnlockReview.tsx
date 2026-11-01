import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Sparkles } from 'lucide-react';
import { missingSections, unansweredBuyerPrompts, FAQ_MIN_ANSWERS, type SectionUnlock } from '@/lib/sectionUnlocks';
import { answeredObjections, type BuyerObjection } from '../../../supabase/functions/_shared/buyerObjections';

interface Props {
  open: boolean;
  data: Record<string, any>;
  onChange: (updates: Record<string, any>) => void;
  onGenerate: () => void;
  onClose: () => void;
}

/**
 * Last check before the brief is written: the sections this page will skip
 * because the facts behind them are missing, each with the one question that
 * adds it. Optional - generating without them is one click.
 */
export function SectionUnlockReview({ open, data, onChange, onGenerate, onClose }: Props) {
  // Computed from the answers as they stand when the dialog opened, so a
  // section doesn't vanish from the list while the owner is typing into it.
  const [missing, setMissing] = useState<SectionUnlock[]>([]);
  const [faqPrompts, setFaqPrompts] = useState<ReturnType<typeof unansweredBuyerPrompts>>([]);
  useEffect(() => {
    if (!open) return;
    setMissing(missingSections(data));
    setFaqPrompts(unansweredBuyerPrompts(data).slice(0, 3));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  const objections = (Array.isArray(data.objections) ? data.objections : []) as BuyerObjection[];
  const setObjection = (topic: string, question: string, answer: string) => {
    const others = objections.filter((o) => o.topic !== topic);
    const next = answer.trim() ? [...others, { topic, question, answer } as BuyerObjection] : others;
    onChange({ objections: next, objectionsToOvercome: answeredObjections(next).map((o) => `${o.question}\n${o.answer}`).join('\n\n') });
  };
  const answerFor = (topic: string) => objections.find((o) => o.topic === topic)?.answer || '';
  const nowMissing = missingSections(data).length;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Your page will skip {missing.length === 1 ? 'one section' : `${missing.length} sections`}</DialogTitle>
          <DialogDescription>
            PageConsult never makes these up. Answer a question to add its section, or generate without it.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {missing.map((m) => (
            <div key={m.section} className="space-y-2" data-unlock={m.section}>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{m.label}</p>
              {m.section === 'faq' ? (
                <>
                  <Label className="text-sm">{m.question}</Label>
                  {faqPrompts.map((p) => (
                    <div key={p.topic} className="space-y-1">
                      <Label className="text-xs text-muted-foreground" htmlFor={`unlock-${p.topic}`}>{p.question}</Label>
                      <Textarea id={`unlock-${p.topic}`} className="min-h-14" value={answerFor(p.topic)} onChange={(e) => setObjection(p.topic, p.question, e.target.value)} />
                    </div>
                  ))}
                  <p className="text-xs text-muted-foreground">{answeredObjections(objections).length} of {FAQ_MIN_ANSWERS} answered</p>
                </>
              ) : (
                <>
                  <Label className="text-sm" htmlFor={`unlock-${m.section}`}>{m.question}</Label>
                  <Textarea
                    id={`unlock-${m.section}`}
                    className="min-h-16"
                    placeholder={m.placeholder}
                    value={m.section === 'how-it-works' ? data.processDescription || '' : data.testimonialText || ''}
                    onChange={(e) => onChange(m.section === 'how-it-works' ? { processDescription: e.target.value } : { testimonialText: e.target.value })}
                  />
                </>
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-2 pt-4 border-t">
          <Button variant="ghost" onClick={onGenerate} className="sm:flex-1">
            Generate without {nowMissing === missing.length ? 'them' : 'the rest'}
          </Button>
          <Button onClick={onGenerate} disabled={nowMissing === missing.length} className="sm:flex-1 bg-gradient-to-r from-cyan-500 to-purple-600 text-white">
            <Sparkles className="w-4 h-4 mr-2" />
            Add {missing.length - nowMissing > 0 ? missing.length - nowMissing : ''} and generate
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
