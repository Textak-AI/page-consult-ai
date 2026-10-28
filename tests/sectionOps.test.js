import { describe, it, expect } from 'vitest';
import { move, moveTo, insertAt, removeAt, canMove } from '../src/lib/editor/sectionOps';
import { buildSectionContent, ADDABLE_SECTION_TYPES } from '../src/lib/editor/sectionFactory';
const S = (...t) => t.map((type, order) => ({ type, order, visible: true, content: {} }));
const types = (l) => l.map((s) => s.type);
describe('section ops pinning', () => {
  const page = S('hero', 'features', 'faq', 'final-cta');
  it('hero cannot move', () => expect(canMove(page, 0, 1)).toBe(false));
  it('final CTA cannot move', () => expect(canMove(page, 3, -1)).toBe(false));
  it('nothing moves above hero', () => expect(types(move(page, 1, -1))).toEqual(['hero', 'features', 'faq', 'final-cta']));
  it('nothing moves below final CTA', () => expect(types(moveTo(page, 1, 3))).toEqual(['hero', 'faq', 'features', 'final-cta']));
  it('middle sections swap', () => expect(types(move(page, 1, 1))).toEqual(['hero', 'faq', 'features', 'final-cta']));
  it('insert clamps between hero and final CTA', () => {
    expect(types(insertAt(page, { type: 'x', visible: true, content: {} }, 0))[1]).toBe('x');
    expect(types(insertAt(page, { type: 'y', visible: true, content: {} }, 99)).slice(-2)).toEqual(['y', 'final-cta']);
  });
  it('order is renumbered to position', () => expect(removeAt(page, 1).map((s) => s.order)).toEqual([0, 1, 2]));
});
describe('added sections never invent numbers', () => {
  it('no digits in any empty-brief section content', () => {
    for (const { type } of ADDABLE_SECTION_TYPES) {
      const txt = JSON.stringify(buildSectionContent(type, null)).replace(/"number":\d+/g, '').replace(/\[[^\]]*\d[^\]]*\]/g, '');
      expect([type, /\d/.test(txt)]).toEqual([type, false]);
    }
  });
  it('testimonial uses the brief quote verbatim, no invented name', () => {
    const c = buildSectionContent('social-proof', { testimonials: [{ quote: 'They fixed our handoffs in a week.', author: null }] });
    expect(c.testimonial).toMatchObject({ quote: 'They fixed our handoffs in a week.', name: null });
  });
  it('steps come from the brief, not generic defaults', () => {
    const c = buildSectionContent('how-it-works', { processSteps: [{ step: 1, title: 'Walk the floor', description: 'We observe a shift.' }] });
    expect(c.steps).toEqual([{ number: 1, title: 'Walk the floor', description: 'We observe a shift.' }]);
  });
});
