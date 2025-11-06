import { Button } from "@/components/ui/button";
import { ChevronRight, Eye, EyeOff, Trash2, GripVertical } from "lucide-react";
import { useState } from "react";
import { useEditing } from "@/contexts/EditingContext";

type Section = {
  type: string;
  order: number;
  visible: boolean;
  content: any;
};

interface SectionManagerProps {
  sections: Section[];
  onSectionsChange: (sections: Section[]) => void;
  onSave: () => void;
  onAddCalculator?: () => void;
}

export function SectionManager({
  sections,
  onSectionsChange,
  onSave,
  onAddCalculator,
}: SectionManagerProps) {
  const [expandedSection, setExpandedSection] = useState<number | null>(null);
  const { setEditingSection } = useEditing();

  const toggleSection = (index: number) => {
    setExpandedSection(expandedSection === index ? null : index);
  };

  const toggleVisibility = (index: number) => {
    const updated = [...sections];
    updated[index].visible = !updated[index].visible;
    onSectionsChange(updated);
    onSave();
  };

  const deleteSection = (index: number) => {
    const updated = sections.filter((_, i) => i !== index);
    onSectionsChange(updated);
    onSave();
  };

  const getSectionTitle = (type: string) => {
    const titles: { [key: string]: string } = {
      hero: "Hero Section",
      "problem-solution": "Problem/Solution",
      calculator: "ROI Calculator",
      features: "Features Grid",
      "photo-gallery": "Photo Gallery",
      "social-proof": "Social Proof",
      "final-cta": "Final CTA",
    };
    return titles[type] || type.replace(/_/g, ' ').replace(/-/g, ' ').toUpperCase();
  };

  return (
    <div className="w-80 border-r bg-card overflow-y-auto">
      <div className="p-4 border-b">
        <h2 className="font-semibold text-lg">Sections</h2>
      </div>

      <div className="p-4 space-y-2">
        {sections.map((section, index) => (
          <div
            key={index}
            className="border rounded-lg overflow-hidden bg-background"
          >
            <div className="flex items-center p-3 gap-2">
              <GripVertical className="w-4 h-4 text-muted-foreground cursor-move" />
              <button
                onClick={() => toggleSection(index)}
                className="flex-1 flex items-center gap-2 text-left hover:text-primary transition-colors"
              >
                <ChevronRight
                  className={`w-4 h-4 transition-transform ${
                    expandedSection === index ? "rotate-90" : ""
                  }`}
                />
                <span className="font-medium">{getSectionTitle(section.type)}</span>
              </button>
              <button
                onClick={() => toggleVisibility(index)}
                className="p-1 hover:bg-muted rounded transition-colors"
              >
                {section.visible ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
              <button
                onClick={() => deleteSection(index)}
                className="p-1 hover:bg-destructive/10 hover:text-destructive rounded transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {expandedSection === index && (
              <div className="p-3 border-t bg-muted/30">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => setEditingSection(index)}
                >
                  Edit content
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="p-4 border-t space-y-2">
        <Button variant="outline" className="w-full justify-start">
          + Add Section
        </Button>
        {onAddCalculator && (
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={onAddCalculator}
          >
            + Calculator
          </Button>
        )}
        <Button variant="outline" className="w-full justify-start">
          💡 AI Improve
        </Button>
      </div>
    </div>
  );
}
