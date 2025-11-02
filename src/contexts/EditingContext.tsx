import { createContext, useContext, useState, ReactNode } from "react";

export type PageStyle = "professional" | "modern" | "bold" | "minimal" | "elegant";

interface EditingContextType {
  editingSection: number | null;
  setEditingSection: (index: number | null) => void;
  isEditing: boolean;
  pageStyle: PageStyle;
  setPageStyle: (style: PageStyle) => void;
}

const EditingContext = createContext<EditingContextType | undefined>(undefined);

export function EditingProvider({ children }: { children: ReactNode }) {
  const [editingSection, setEditingSection] = useState<number | null>(null);
  const [pageStyle, setPageStyle] = useState<PageStyle>("professional");

  return (
    <EditingContext.Provider
      value={{
        editingSection,
        setEditingSection,
        isEditing: editingSection !== null,
        pageStyle,
        setPageStyle,
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
