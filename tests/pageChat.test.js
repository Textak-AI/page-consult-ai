import { test, expect } from 'bun:test';
import { copyOnly, mergeCopy, parsePlanText, validatePlan, pageCopyStrings, CHAT_ADDABLE_TYPES } from '../supabase/functions/_shared/pageChat';
import { applyPageChatOps } from '../src/lib/editor/pageChatOps';
import { ADDABLE_SECTION_TYPES } from '../src/lib/editor/sectionFactory';

const page = [
  { type: 'hero', order: 0, visible: true, content: { headline: 'Catch drift the moment it happens', ctaText: 'Book a Drift Walkthrough', backgroundImage: 'data:image/png;base64,AAA', sectionBackground: 'dark', primaryColor: '#6366f1' } },
  { type: 'features', order: 1, visible: true, content: { title: 'The payoff', features: [{ title: 'PRs, not diffs', description: 'Every drift gets a pull request.', icon: 'Zap' }] } },
  { type: 'final-cta', order: 2, visible: true, content: { headline: 'Git matches AWS', ctaText: 'Book a Drift Walkthrough' } },
];
const evidence = { ownerInput: { clientCount: '140 engineering teams', uniqueStrength: 'checks every 5 minutes' }, pageCopy: pageCopyStrings(page), ownerMessages: ['make the hero tighter'] };

test('the model only sees copy: no images, colors or design plumbing', () => {
  const c = copyOnly(page[0].content);
  expect(c).toEqual({ headline: 'Catch drift the moment it happens', ctaText: 'Book a Drift Walkthrough' });
});

test('edits keep design keys and list extras the chat never saw', () => {
  const merged = mergeCopy(page[1].content, { features: [{ title: 'Pull requests, not diffs', description: 'One PR per drifted resource.' }] });
  expect(merged.features[0]).toEqual({ title: 'Pull requests, not diffs', description: 'One PR per drifted resource.', icon: 'Zap' });
  expect(mergeCopy(page[0].content, { headline: 'x', sectionBackground: 'light' }).sectionBackground).toBe('dark');
});

test('invented numbers and guarantees are stripped; stated ones survive', () => {
  const plan = validatePlan(parsePlanText(JSON.stringify({ reply: 'Done.', operations: [
    { op: 'edit', index: 0, content: { headline: 'Trusted by 140 engineering teams. Drift checks every 5 minutes.' } },
    { op: 'edit', index: 1, content: { title: 'Cut outages by 73%. Results guaranteed.' } },
  ] })), page.length, evidence);
  expect(plan.operations).toHaveLength(1);
  expect(plan.operations[0].content.headline).toBe('Trusted by 140 engineering teams. Drift checks every 5 minutes.');
});

test('a number the owner states in chat is allowed', () => {
  const plan = validatePlan({ reply: '', operations: [{ op: 'edit', index: 0, content: { headline: 'Set up in 10 minutes.' } }] }, page.length,
    { ...evidence, ownerMessages: ['setup takes 10 minutes, add that'] });
  expect(plan.operations[0].content.headline).toBe('Set up in 10 minutes.');
});

test('bad operations are dropped: unknown types, galleries, out-of-range indices', () => {
  const plan = validatePlan({ reply: '', operations: [
    { op: 'add', type: 'stats-bar', after: 1, content: { title: 'x' } },
    { op: 'add', type: 'work-samples', after: 1, content: { title: 'x' } },
    { op: 'edit', index: 9, content: { headline: 'x' } },
    { op: 'delete', index: 1, content: { a: 'b' } },
  ] }, page.length, evidence);
  expect(plan.operations).toHaveLength(0);
});

test('chat-addable types are a subset of the Add Section menu, minus upload-only galleries', () => {
  const menu = ADDABLE_SECTION_TYPES.map((t) => t.type);
  for (const t of CHAT_ADDABLE_TYPES) expect(menu).toContain(t);
  expect(CHAT_ADDABLE_TYPES).not.toContain('work-samples');
  expect(CHAT_ADDABLE_TYPES).not.toContain('photo-gallery');
});

test('apply: edits merge, adds land after the named section and never below the final CTA', () => {
  const out = applyPageChatOps(page, [
    { op: 'edit', index: 0, content: { headline: 'Catch drift as it happens' } },
    { op: 'add', type: 'faq', after: 2, content: { items: [{ question: 'What does it cost?', answer: '[Your pricing]' }] } },
    { op: 'add', type: 'audience-fit', after: 0, content: { forWho: 'Platform teams on Terraform' } },
  ], null);
  expect(out.map((s) => s.type)).toEqual(['hero', 'audience-fit', 'features', 'faq', 'final-cta']);
  expect(out[0].content.backgroundImage).toBe(page[0].content.backgroundImage);
  expect(out[0].content.headline).toBe('Catch drift as it happens');
  expect(out[1].content.notForWho).toBe('[Who this is not for]');
  expect(out.map((s) => s.order)).toEqual([0, 1, 2, 3, 4]);
});

test('parse tolerates fences and prose; garbage yields a reply with no operations', () => {
  expect(parsePlanText('```json\n{"reply":"ok","operations":[]}\n```').reply).toBe('ok');
  expect(parsePlanText('I need your pricing first.')).toEqual({ reply: 'I need your pricing first.', operations: [] });
});
