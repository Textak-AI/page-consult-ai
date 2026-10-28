// Pure undo/redo history for the page editor.
// Snapshots are JSON strings so they are deep-copied and cheap to compare.
export const HISTORY_LIMIT = 100;

export interface History {
  past: string[];
  present: string | null;
  future: string[];
}

export const emptyHistory = (): History => ({ past: [], present: null, future: [] });

export const resetHistory = (snap: string): History => ({ past: [], present: snap, future: [] });

/** Record a new state. No-op when identical to the present state. */
export function record(h: History, snap: string, limit = HISTORY_LIMIT): History {
  if (h.present === null) return resetHistory(snap);
  if (snap === h.present) return h;
  return { past: [...h.past, h.present].slice(-limit), present: snap, future: [] };
}

export function undo(h: History): History {
  if (!h.past.length || h.present === null) return h;
  return { past: h.past.slice(0, -1), present: h.past[h.past.length - 1], future: [h.present, ...h.future] };
}

export function redo(h: History): History {
  if (!h.future.length || h.present === null) return h;
  return { past: [...h.past, h.present], present: h.future[0], future: h.future.slice(1) };
}

export const canUndo = (h: History) => h.past.length > 0;
export const canRedo = (h: History) => h.future.length > 0;
