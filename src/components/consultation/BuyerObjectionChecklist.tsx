import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { BUYER_OBJECTION_PROMPTS, answeredObjections, materialsRelevant, type BuyerObjection } from '../../../supabase/functions/_shared/buyerObjections';

export function BuyerObjectionChecklist({ value, context, onChange }: { value?: BuyerObjection[]; context: Record<string, any>; onChange: (items: BuyerObjection[]) => void }) {
  const items = answeredObjections(value);
  const [expanded, setExpanded] = useState<string[]>([]);
  const prompts = BUYER_OBJECTION_PROMPTS.filter(p => p.topic !== 'materials' || materialsRelevant(context));
  return <fieldset className="space-y-3" aria-label="Buyer questions">
    <legend className="text-sm font-medium text-foreground mb-3">Buyer questions · optional</legend>
    {prompts.map(p => {
      const existing = items.find(i => i.topic === p.topic);
      const open = expanded.includes(p.topic) || !!existing;
      return <div key={p.topic} className="border-b border-border pb-3">
        <div className="flex items-start gap-2">
          <label className="flex items-start gap-2 text-sm text-foreground flex-1"><input type="checkbox" aria-label={p.question} checked={open} onChange={e => { setExpanded(s => e.target.checked ? [...s, p.topic] : s.filter(t => t !== p.topic)); if (!e.target.checked) onChange(items.filter(i => i.topic !== p.topic)); }} />{p.question}</label>
          <Button type="button" variant="ghost" size="sm" onClick={() => { setExpanded(s => s.filter(t => t !== p.topic)); onChange(items.filter(i => i.topic !== p.topic)); }}>Skip</Button>
        </div>
        {open && <Textarea aria-label={`Answer: ${p.question}`} className="mt-2 min-h-16" value={existing?.answer || ''} onChange={e => onChange([...items.filter(i => i.topic !== p.topic), { ...p, answer: e.target.value }])} />}
      </div>;
    })}
  </fieldset>;
}