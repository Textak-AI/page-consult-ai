import { describe, it, expect } from 'vitest';
import { truncateAtBoundary } from '../src/lib/text/truncate';

const FERNHILL =
  'Every engagement starts on the shop floor with your leads, not in a conference room, so the fixes we propose have already been walked through the people who run them.';

describe('truncateAtBoundary', () => {
  it('returns text within the limit unchanged', () => {
    expect(truncateAtBoundary('Short copy.', 150)).toBe('Short copy.');
  });

  it('never cuts mid-word at 150 (Fernhill closing sentence)', () => {
    const out = truncateAtBoundary(FERNHILL, 150);
    expect(out.length).toBeLessThanOrEqual(150);
    expect(out).toBe('Every engagement starts on the shop floor with your leads, not in a conference room, so the fixes we propose have already been walked through the');
    expect(FERNHILL.startsWith(out)).toBe(true);
  });

  it('prefers a sentence end past half the limit', () => {
    const t = 'We run on-floor diagnostics across every shift in your plant. Then we coach supervisors until the routine sticks for good.';
    expect(truncateAtBoundary(t, 100)).toBe('We run on-floor diagnostics across every shift in your plant.');
  });

  it('ignores a sentence end before half the limit', () => {
    const t = 'Yes. We embed with your supervisors across all three shifts and rebuild the handoff routine together';
    const out = truncateAtBoundary(t, 60);
    expect(out).toBe('Yes. We embed with your supervisors across all three shifts');
  });

  it('keeps an over-long single word whole', () => {
    expect(truncateAtBoundary('Supercalifragilistic', 10)).toBe('Supercalifragilistic');
  });

  it('ellipsis is appended only on a word cut and fits the limit', () => {
    const out = truncateAtBoundary('Operations consulting for multi shift plants everywhere', 30, { ellipsis: true });
    expect(out).toBe('Operations consulting for...');
    expect(out.length).toBeLessThanOrEqual(30);
  });
});
