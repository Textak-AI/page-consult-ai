import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { StylePresetName, StylePreset, stylePresets } from "@/styles/presets";

export type PageStyle = StylePresetName;

export type Section = {
  type: string;
  order: number;
  visible: boolean;
  content: any;
};

interface EditingContextType {
  editingSection: number | null;
  setEditingSection: (index: number | null) => void;
  isEditing: boolean;
  pageStyle: PageStyle;
  setPageStyle: (style: PageStyle) => void;
  styles: StylePreset;
  // History management
  history: Section[][];
  historyIndex: number;
  canUndo: boolean;
  canRedo: boolean;
  pushHistory: (sections: Section[]) => void;
  undo: () => Section[] | null;
  redo: () => Section[] | null;
  clearHistory: () => void;
}

const EditingContext = createContext<EditingContextType | undefined>(undefined);

export function EditingProvider({ children }: { children: ReactNode }) {
  const [editingSection, setEditingSection] = useState<number | null>(null);
  const [pageStyle, setPageStyle] = useState<PageStyle>("premium");
  const [history, setHistory] = useState<Section[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const pushHistory = useCallback((sections: Section[]) => {
    setHistory(prev => {
      // Remove any "future" history if we're not at the end
      const newHistory = prev.slice(0, historyIndex + 1);
      // Add new state, limit to 50 states
      const updatedHistory = [...newHistory, JSON.parse(JSON.stringify(sections))];
      return updatedHistory.slice(-50);
    });
    setHistoryIndex(prev => Math.min(prev + 1, 49));
  }, [historyIndex]);

  const undo = useCallback((): Section[] | null => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
      return history[historyIndex - 1];
    }
    return null;
  }, [history, historyIndex]);

  const redo = useCallback((): Section[] | null => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
      return history[historyIndex + 1];
    }
    return null;
  }, [history, historyIndex]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    setHistoryIndex(-1);
  }, []);

  return (
    <EditingContext.Provider
      value={{
        editingSection,
        setEditingSection,
        isEditing: editingSection !== null,
        pageStyle,
        setPageStyle,
        styles: stylePresets[pageStyle],
        history,
        historyIndex,
        canUndo: historyIndex > 0,
        canRedo: historyIndex < history.length - 1,
        pushHistory,
        undo,
        redo,
        clearHistory,
      }}
    >
      {children}
    </EditingContext.Provider>
  );
}

export function useEditing() {
  const context = useContext(EditingContext);
  if (!context) {
    throw new Error("useEditing must be used within EditingProvider");
  }
  return context;
}
