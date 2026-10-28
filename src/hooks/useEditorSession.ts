import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import * as H from '@/lib/editor/history';
import { stylePresets, type StylePresetName } from '@/styles/presets';

export type SaveStatus = 'saved' | 'unsaved' | 'saving' | 'failed';

interface Snapshot {
  sections: any[];
  pageStyle: StylePresetName;
}

const HISTORY_COALESCE_MS = 400;
const AUTOSAVE_MS = 1500;

export const isPreset = (v: unknown): v is StylePresetName =>
  typeof v === 'string' && Object.prototype.hasOwnProperty.call(stylePresets, v);

/**
 * One editing session: a single undo history over {sections, pageStyle}
 * (every mutation path is captured by observing state, not by callers opting in),
 * plus autosave that always serializes the latest state from a ref.
 */
export function useEditorSession(opts: {
  active: boolean;
  pageId: string | undefined;
  baseStyles: any;
  sections: any[];
  setSections: (s: any[]) => void;
  pageStyle: StylePresetName;
  setPageStyle: (s: StylePresetName) => void;
}) {
  const { active, pageId, sections, pageStyle } = opts;

  // ---- latest state (read by save; updated synchronously by setSectionsNow) ----
  const latest = useRef<Snapshot>({ sections, pageStyle });
  latest.current = { sections, pageStyle };
  const baseStylesRef = useRef(opts.baseStyles);
  baseStylesRef.current = opts.baseStyles;
  const pageIdRef = useRef(pageId);
  pageIdRef.current = pageId;

  // ---- history ----
  const [history, setHistory] = useState<H.History>(H.emptyHistory);
  const historyRef = useRef(history);
  historyRef.current = history;
  const pendingRecord = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initializedFor = useRef<string | null>(null);

  const serialize = (s: Snapshot) => JSON.stringify({ sections: s.sections, pageStyle: s.pageStyle });

  const flushRecord = useCallback(() => {
    if (pendingRecord.current) clearTimeout(pendingRecord.current);
    pendingRecord.current = null;
    const next = H.record(historyRef.current, serialize(latest.current));
    historyRef.current = next;
    setHistory(next);
  }, []);

  // ---- saving ----
  const [status, setStatus] = useState<SaveStatus>('saved');
  const lastSaved = useRef<string | null>(null);
  const inFlight = useRef<Promise<void> | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const saveNow = useCallback(async (): Promise<boolean> => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = null;
    const id = pageIdRef.current;
    if (!id) return false;
    if (inFlight.current) await inFlight.current;
    const snap = latest.current;
    const json = serialize(snap);
    if (json === lastSaved.current) {
      setStatus('saved');
      return true;
    }
    let ok = false;
    const run = (async () => {
      setStatus('saving');
      try {
        const { data, error } = await supabase
          .from('landing_pages')
          .update({
            sections: snap.sections,
            styles: { ...(baseStylesRef.current || {}), pagePreset: snap.pageStyle },
            updated_at: new Date().toISOString(),
          })
          .eq('id', id)
          .select('id');
        if (error || !data?.length) throw error || new Error('No row updated');
        lastSaved.current = json;
        ok = true;
        // Newer edits may have arrived while saving.
        setStatus(serialize(latest.current) === json ? 'saved' : 'unsaved');
      } catch (e) {
        console.error('[Editor] Save failed:', e);
        setStatus('failed');
      }
    })();
    inFlight.current = run;
    await run;
    inFlight.current = null;
    return ok;
  }, []);

  // Initialize once per loaded page: restore saved preset, seed history and save baseline.
  useEffect(() => {
    if (!active || !pageId || !sections.length || initializedFor.current === pageId) return;
    initializedFor.current = pageId;
    const saved = opts.baseStyles?.pagePreset;
    const style = isPreset(saved) ? saved : pageStyle;
    if (style !== pageStyle) opts.setPageStyle(style);
    latest.current = { sections, pageStyle: style };
    const json = serialize(latest.current);
    lastSaved.current = json;
    const h = H.resetHistory(json);
    historyRef.current = h;
    setHistory(h);
    setStatus('saved');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, pageId, sections.length]);

  // Observe every state change: coalesce into history, schedule autosave.
  useEffect(() => {
    if (!active || initializedFor.current !== pageId) return;
    const json = serialize(latest.current);
    if (json !== historyRef.current.present) {
      if (pendingRecord.current) clearTimeout(pendingRecord.current);
      pendingRecord.current = setTimeout(flushRecord, HISTORY_COALESCE_MS);
    }
    if (json !== lastSaved.current) {
      setStatus((s) => (s === 'saving' ? s : 'unsaved'));
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => void saveNow(), AUTOSAVE_MS);
    }
  }, [sections, pageStyle, active, pageId, flushRecord, saveNow]);

  const apply = (h: H.History) => {
    historyRef.current = h;
    setHistory(h);
    if (h.present === null) return;
    const snap = JSON.parse(h.present) as Snapshot;
    latest.current = snap;
    opts.setSections(snap.sections);
    opts.setPageStyle(snap.pageStyle);
  };

  const undo = useCallback(() => {
    flushRecord();
    if (!H.canUndo(historyRef.current)) return false;
    apply(H.undo(historyRef.current));
    return true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flushRecord]);

  const redo = useCallback(() => {
    flushRecord();
    if (!H.canRedo(historyRef.current)) return false;
    apply(H.redo(historyRef.current));
    return true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flushRecord]);

  /** Setter for callers that may save in the same tick (e.g. delete then save). */
  const setSectionsNow = useCallback((s: any[]) => {
    latest.current = { ...latest.current, sections: s };
    opts.setSections(s);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save on leaving: route change (unmount), tab hide, and page unload.
  useEffect(() => {
    const dirty = () => initializedFor.current !== null && serialize(latest.current) !== lastSaved.current;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!dirty()) return;
      void saveNow();
      e.preventDefault();
      e.returnValue = '';
    };
    const onHide = () => {
      if (document.visibilityState === 'hidden' && dirty()) void saveNow();
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    document.addEventListener('visibilitychange', onHide);
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
      document.removeEventListener('visibilitychange', onHide);
      if (dirty()) void saveNow();
    };
  }, [saveNow]);

  return {
    undo,
    redo,
    // An edit still inside the coalescing window is undoable too.
    canUndo: H.canUndo(history) || (history.present !== null && serialize(latest.current) !== history.present),
    canRedo: H.canRedo(history),
    saveStatus: status,
    saveNow,
    setSectionsNow,
  };
}
