import { describe, it, expect } from 'vitest';
import * as H from '../src/lib/editor/history';
describe('editor history', () => {
  it('keeps at least 50 undo steps', () => {
    let h = H.resetHistory('0');
    for (let i = 1; i <= 60; i++) h = H.record(h, String(i));
    let n = 0; while (H.canUndo(h)) { h = H.undo(h); n++; }
    expect(n).toBeGreaterThanOrEqual(50);
  });
  it('undo then redo returns to the same state', () => {
    let h = H.record(H.resetHistory('a'), 'b');
    h = H.undo(h); expect(h.present).toBe('a');
    h = H.redo(h); expect(h.present).toBe('b');
  });
  it('a new edit after undo clears redo', () => {
    let h = H.undo(H.record(H.resetHistory('a'), 'b'));
    h = H.record(h, 'c');
    expect(H.canRedo(h)).toBe(false);
  });
  it('identical state is not a new step', () => {
    const h = H.record(H.resetHistory('a'), 'a');
    expect(H.canUndo(h)).toBe(false);
  });
});
