// Applies page-chat proposals to the editor's section list. Edits merge copy
// over the existing content (design, media and list extras survive); adds are
// seeded from sectionFactory (brief-verbatim or [bracket] placeholders) and
// inserted through sectionOps, so pinned hero/final CTA and undo/autosave
// behave exactly like the Add Section menu.
import { mergeCopy, type PageChatOperation } from '../../../supabase/functions/_shared/pageChat';
import { insertAt, normalize, type EditorSection } from './sectionOps';
import { buildSectionContent, type BriefSource } from './sectionFactory';

export function applyPageChatOps(
  sections: EditorSection[],
  ops: PageChatOperation[],
  brief: BriefSource | null | undefined,
  extra: { uniqueValue?: string | null } = {},
): EditorSection[] {
  // Indices in the plan refer to the page as the chat saw it: edits first,
  // then adds from the bottom up so earlier positions stay valid.
  let list = normalize(sections).map((s, i) => {
    const edits = ops.filter((o): o is Extract<PageChatOperation, { op: 'edit' }> => o.op === 'edit' && o.index === i);
    if (!edits.length) return s;
    const content = edits.reduce((c, o) => mergeCopy(c, o.content), s.content);
    return { ...s, content };
  });
  const adds = ops
    .filter((o): o is Extract<PageChatOperation, { op: 'add' }> => o.op === 'add')
    .sort((a, b) => b.after - a.after);
  for (const add of adds) {
    const seed = buildSectionContent(add.type, brief, extra);
    list = insertAt(list, { type: add.type, visible: true, content: mergeCopy(seed, add.content) }, add.after + 1);
  }
  return list;
}

/** One line per operation for the review card. */
export function describeOp(op: PageChatOperation, sections: Array<{ type: string }>, titleFor: (type: string) => string): string {
  if (op.op === 'edit') return `Edit ${titleFor(sections[op.index]?.type || 'section')}`;
  return `Add ${titleFor(op.type)} after ${titleFor(sections[op.after]?.type || 'section')}`;
}

/** First readable line of proposed copy, for the card preview. */
export function previewOf(content: unknown): string {
  const seen: string[] = [];
  const walk = (v: unknown) => {
    if (seen.length >= 2) return;
    if (typeof v === 'string' && v.trim()) seen.push(v.trim());
    else if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === 'object') Object.values(v).forEach(walk);
  };
  walk(content);
  return seen.join(' — ').slice(0, 180);
}
