import { createContext, useContext, useState, ReactNode } from "react";

interface EditingContextType {
  editingSection: number | null;
  setEditingSection: (index: number | null) => void;
  isEditing: boolean;
}

const EditingContext = createContext<EditingContextType | undefined>(undefined);

export function EditingProvider({ children }: { children: ReactNode }) {
  const [editingSection, setEditingSection] = useState<number | null>(null);

  return (
    <EditingContext.Provider
      value={{
        editingSection,
        setEditingSection,
        isEditing: editingSection !== null,
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
