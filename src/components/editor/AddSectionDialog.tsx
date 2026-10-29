import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ADDABLE_SECTION_TYPES } from "@/lib/editor/sectionFactory";
import { movableRange, type EditorSection } from "@/lib/editor/sectionOps";
import { Button } from '@/components/ui/button';
import { slotOf } from '@/lib/composition/arc';

interface AddSectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sections: EditorSection[];
  /** Preselected insert index, if opened from a specific spot. */
  defaultInsertAt?: number;
  titleFor: (type: string) => string;
  onAdd: (type: string, insertAt: number) => void;
}

export function AddSectionDialog({ open, onOpenChange, sections, defaultInsertAt, titleFor, onAdd }: AddSectionDialogProps) {
  const { min, max } = movableRange(sections);
  const lastSlot = max + 1;
  const [insertAt, setInsertAt] = useState<number>(lastSlot);
  const [positionChosen, setPositionChosen] = useState(false);
  const proofIndex = sections.findIndex(s => slotOf(s.type) === 'proof');

  useEffect(() => {
    if (open) { setInsertAt(Math.max(min, Math.min(lastSlot, defaultInsertAt ?? lastSlot))); setPositionChosen(false); }
  }, [open, defaultInsertAt, min, lastSlot]);

  // Position options: "after <section>" for each slot in the movable range.
  const positions = Array.from({ length: lastSlot - min + 1 }, (_, k) => min + k).map((idx) => ({
    idx,
    label: idx === 0 ? "At the top" : `After ${titleFor(sections[idx - 1]?.type || "")}`,
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-card border-border">
        <DialogHeader>
          <DialogTitle>Add a section</DialogTitle>
          <DialogDescription>
            Content comes from your strategy brief where it exists. Anything in [brackets] is a placeholder for you to replace.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <label className="text-sm text-muted-foreground" htmlFor="add-section-position">Position</label>
          <Select value={String(insertAt)} onValueChange={(v) => { setInsertAt(Number(v)); setPositionChosen(true); }}>
            <SelectTrigger id="add-section-position" aria-label="Position">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {positions.map((p) => (
                <SelectItem key={p.idx} value={String(p.idx)}>{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-2 max-h-[50vh] overflow-y-auto" role="list">
          {ADDABLE_SECTION_TYPES.map((t) => (
            <Button variant="outline"
              key={t.type}
              role="listitem"
              data-add-type={t.type}
              onClick={() => onAdd(t.type, t.type === 'work-samples' && !positionChosen && defaultInsertAt === undefined ? Math.max(min, proofIndex >= 0 ? proofIndex : lastSlot) : insertAt)}
              className="text-left h-auto block whitespace-normal px-3 py-2"
            >
              <div className="text-sm font-medium text-foreground">{t.label}</div>
              <div className="text-xs text-muted-foreground">{t.description}</div>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
