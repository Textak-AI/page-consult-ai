/**
 * Page chat: one central conversation that edits existing sections and adds
 * new ones. Pure helpers shared by the page-chat edge function (Deno) and the
 * editor (Vite), so the contract and the guards have one source.
 *
 * ZERO FABRICATION: proposals are guarded against what the owner actually
 * said — consultation input, the copy already on their page, and their own
 * chat messages. A number, guarantee or offer term from nowhere drops its
 * whole sentence; a missing fact becomes a visible [bracket] the owner fills.
 */
import { guardCopyClaims } from './copyClaims.ts';

/** Section types the chat may add. Upload-only galleries stay in the Add Section menu. */
/** The editor controls Page Chat may point to. Keep in step with the editor; a test checks the claims it makes. */
export const EDITOR_CONTROLS = 'the section list in the left sidebar (move, hide, delete), Add Section, Style presets, the hero background (stock photo search, a generated image, or a background video upload), generated section images, logo upload, photo uploads in Work Samples and Photo Gallery, video (upload a file or paste a YouTube, Vimeo, Loom or Wistia link) as its own Video section or under any section using the section\'s Video button, SEO, Preview, Share and Publish';

export const CHAT_ADDABLE_TYPES = [
  'problem-solution', 'features', 'how-it-works', 'social-proof', 'faq',
  'differentiator-callout', 'audience-fit', 'the-real-challenge', 'our-approach',
  'expertise-areas', 'engagement-model',
] as const;
export const MAX_OPERATIONS = 4;

export interface EditOperation { op: 'edit'; index: number; content: Record<string, unknown> }
export interface AddOperation { op: 'add'; type: string; after: number; content: Record<string, unknown> }
export type PageChatOperation = EditOperation | AddOperation;
export interface PageChatPlan { reply: string; operations: PageChatOperation[]; dropped: string[] }

/** Keys that carry design/plumbing, never copy: kept out of the prompt and out of edits. */
const NON_COPY_KEY = /^(designIntelligence|sdi.*|mode|pageMode|sectionBackground|industryVariant|industry|composition|imageStyle|imagePrompt|signature.*|presentation|treatment|typography|tokens|layout.*|variant|order|visible|id|primaryColor|accentColor|.*(?:Color|Colors|Font|Image|Images|Url|URL|Link|Asset|Credit|Attribution)|logo.*|avatar.*|samples|images|video|backgroundVideo|attachedVideo|lowerThird|stats|statistics|trustBadges|credibility.*|testimonials|paraphrase|score)$/;
const isDataUri = (v: unknown) => typeof v === 'string' && /^data:|^https?:\/\//.test(v);

/** The copy-bearing subset of a section's content (strings, lists of copy). */
export function copyOnly(value: unknown, key = ''): unknown {
  if (key && NON_COPY_KEY.test(key)) return undefined;
  if (typeof value === 'string') return isDataUri(value) ? undefined : value;
  if (Array.isArray(value)) {
    const items = value.map((v) => copyOnly(v)).filter((v) => v !== undefined);
    return items.length ? items : undefined;
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      const c = copyOnly(v, k);
      if (c !== undefined && !(typeof c === 'object' && c !== null && !Array.isArray(c) && Object.keys(c).length === 0)) out[k] = c;
    }
    return Object.keys(out).length ? out : undefined;
  }
  return undefined;
}

/** Every string on the page — owner-visible copy counts as owner input. */
export function pageCopyStrings(sections: Array<{ content?: unknown }>): string[] {
  const out: string[] = [];
  const walk = (v: unknown) => {
    if (typeof v === 'string') { if (!isDataUri(v)) out.push(v); return; }
    if (Array.isArray(v)) { v.forEach(walk); return; }
    if (v && typeof v === 'object') Object.values(v).forEach(walk);
  };
  sections.forEach((s) => walk(copyOnly(s?.content)));
  return out;
}

/** Deep merge of proposed copy over the original: design keys and list-item extras (icons, numbers) survive. */
export function mergeCopy(original: unknown, next: unknown): unknown {
  if (Array.isArray(next)) {
    const orig = Array.isArray(original) ? original : [];
    return next.map((item, i) => mergeCopy(orig[i], item));
  }
  if (next && typeof next === 'object') {
    const base = original && typeof original === 'object' && !Array.isArray(original) ? original as Record<string, unknown> : {};
    const out: Record<string, unknown> = { ...base };
    for (const [k, v] of Object.entries(next as Record<string, unknown>)) {
      if (NON_COPY_KEY.test(k)) continue; // the chat never touches design or media
      out[k] = mergeCopy(base[k], v);
    }
    return out;
  }
  return next;
}

function pruneEmpty(value: unknown): unknown {
  if (typeof value === 'string') return value.trim() ? value : undefined;
  if (Array.isArray(value)) { const a = value.map(pruneEmpty).filter((v) => v !== undefined); return a.length ? a : undefined; }
  if (value && typeof value === 'object') {
    const o = Object.fromEntries(Object.entries(value).map(([k, v]) => [k, pruneEmpty(v)]).filter(([, v]) => v !== undefined));
    return Object.keys(o).length ? o : undefined;
  }
  return value;
}

export function parsePlanText(text: string): { reply: string; operations: unknown[] } {
  let t = (text || '').trim();
  const fenced = t.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) t = fenced[1].trim();
  const start = t.indexOf('{');
  const end = t.lastIndexOf('}');
  if (start < 0 || end <= start) return { reply: t, operations: [] };
  try {
    const parsed = JSON.parse(t.slice(start, end + 1));
    return {
      reply: typeof parsed.reply === 'string' ? parsed.reply : '',
      operations: Array.isArray(parsed.operations) ? parsed.operations : [],
    };
  } catch {
    return { reply: t, operations: [] };
  }
}

/**
 * Keep only well-formed operations against real sections, then strip any
 * sentence the owner's input doesn't support. `sectionCount` is the page's
 * current length; `input` is consultation input + page copy + chat messages.
 */
export function validatePlan(raw: { reply: string; operations: unknown[] }, sectionCount: number, input: unknown): PageChatPlan {
  const dropped: string[] = [];
  const operations: PageChatOperation[] = [];
  for (const op of raw.operations.slice(0, MAX_OPERATIONS)) {
    const o = op as Record<string, unknown>;
    const content = o?.content && typeof o.content === 'object' && !Array.isArray(o.content) ? o.content as Record<string, unknown> : null;
    if (!content) { dropped.push('operation without content'); continue; }
    // A field whose every sentence was unsupported comes back empty: prune it,
    // so the original copy stays rather than being blanked.
    const guarded = pruneEmpty(guardCopyClaims(copyOnly(content) as Record<string, unknown> || {}, input, 'page-chat')) as Record<string, unknown> | undefined;
    if (!guarded || Object.keys(guarded).length === 0) { dropped.push(`${o.op} with no supported copy`); continue; }
    if (o.op === 'edit' && Number.isInteger(o.index) && (o.index as number) >= 0 && (o.index as number) < sectionCount) {
      operations.push({ op: 'edit', index: o.index as number, content: guarded });
    } else if (o.op === 'add' && typeof o.type === 'string' && (CHAT_ADDABLE_TYPES as readonly string[]).includes(o.type)) {
      const after = Number.isInteger(o.after) ? Math.max(0, Math.min(sectionCount - 1, o.after as number)) : sectionCount - 1;
      operations.push({ op: 'add', type: o.type, after, content: guarded });
    } else {
      dropped.push(`invalid ${String(o?.op)}`);
    }
  }
  return { reply: raw.reply.trim(), operations, dropped };
}

export function buildPageChatSystemPrompt(args: {
  businessName: string;
  sections: Array<{ index: number; type: string; content: unknown }>;
  addable: Array<{ type: string; label: string; description: string; shape: unknown }>;
  brief: unknown;
  ownerInput: unknown;
  focusIndex?: number | null;
}): string {
  const focus = Number.isInteger(args.focusIndex) && args.sections.some((s) => s.index === args.focusIndex)
    ? `\nFOCUS: the owner is asking about section ${args.focusIndex} (${args.sections.find((s) => s.index === args.focusIndex)?.type}). Unless they name another section, "this" and "it" mean that section.\n`
    : '';
  return `You are the page editor inside PageConsult, working with the owner of ${args.businessName || 'this business'} on their landing page. You change the page by proposing operations the owner reviews and applies.
${focus}
OUTPUT: one JSON object, nothing else:
{"reply": "1-2 plain sentences to the owner", "operations": [ ... ]}
The reply says what you changed, plainly. Never claim the copy uses "only" the owner's facts or input; name any wording you added beyond what they said only if asked.

Operations (at most ${MAX_OPERATIONS}):
- Edit an existing section: {"op":"edit","index":N,"content":{...}} — N is the section index below. Include only the fields you change, using the same keys and shape as the section's current content. A list you change must be returned complete.
- Add a section: {"op":"add","type":"<type>","after":N,"content":{...}} — type from ADDABLE TYPES, placed after section N, content in that type's shape.
- A question, opinion or missing information: reply only, "operations": [].

ZERO FABRICATION — absolute:
- Use only facts from OWNER INPUT, the STRATEGY BRIEF, the CURRENT PAGE, and what the owner says in this chat.
- Never invent numbers, percentages, prices, timelines, client names, testimonials, results, awards, certifications, integrations, guarantees, free trials or urgency.
- When a section needs a fact you don't have, write an obvious placeholder in square brackets (e.g. "[Your onboarding time]") and ask for it in the reply.
- Testimonials are only ever real quotes from the owner's input, word for word.
- Judgment lines count as facts too: who it is NOT for, what competitors do, what buyers feel, outcomes. Write them only when the owner stated them; otherwise use a [bracket] and ask.
- Keep CTA button text unless the owner asks to change it.
- You cannot delete, reorder or restyle sections, or add images; say so briefly if asked and point to the editor controls.
- The editor's controls are exactly: ${EDITOR_CONTROLS}. Never mention, describe or promise any other control or feature. If the owner asks for something not on that list (for example a booking calendar), say plainly that the editor doesn't support it yet. You never attach or upload media yourself: point the owner to the control.

CURRENT PAGE (index, type, copy):
${JSON.stringify(args.sections, null, 1)}

ADDABLE TYPES (type, label, content shape):
${JSON.stringify(args.addable, null, 1)}

STRATEGY BRIEF:
${JSON.stringify(args.brief ?? {}, null, 1)}

OWNER INPUT:
${JSON.stringify(args.ownerInput ?? {}, null, 1)}`;
}
