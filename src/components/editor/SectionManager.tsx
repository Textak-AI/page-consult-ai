import { Button } from "@/components/ui/button";
import { ChevronRight, Eye, EyeOff, Trash2, GripVertical, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useEditing } from "@/contexts/EditingContext";
import { cn } from "@/lib/utils";

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
  onRegenerateSection?: (sectionType: string) => void;
  isRegenerating?: boolean;
}

export function SectionManager({
  sections,
  onSectionsChange,
  onSave,
  onAddCalculator,
  onRegenerateSection,
  isRegenerating,
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
    <div className="flex-1 overflow-y-auto">
      <div className="p-4 border-b border-white/10">
        <h2 className="font-semibold text-lg text-white">Sections</h2>
      </div>

      <div className="p-4 space-y-2">
        {sections.map((section, index) => (
          <div
            key={index}
            className="group border border-white/10 rounded-lg overflow-hidden bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center p-3 gap-2">
              <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
              <button
                onClick={() => toggleSection(index)}
                className="flex-1 flex items-center gap-2 text-left hover:text-cyan-400 transition-colors text-white"
              >
                <ChevronRight
                  className={`w-4 h-4 transition-transform ${
                    expandedSection === index ? "rotate-90" : ""
                  }`}
                />
                <span className="font-medium">{getSectionTitle(section.type)}</span>
              </button>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onRegenerateSection?.(section.type);
                }}
                disabled={isRegenerating}
                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-cyan-500/20 hover:text-cyan-400"
                title={`Regenerate ${section.type.replace(/-/g, ' ')}`}
              >
                <RefreshCw className={cn("h-3.5 w-3.5", isRegenerating && "animate-spin")} />
              </Button>
              <button
                onClick={() => toggleVisibility(index)}
                className="p-1 hover:bg-white/10 rounded transition-colors"
              >
                {section.visible ? (
                  <Eye className="w-4 h-4 text-cyan-400" />
                ) : (
                  <EyeOff className="w-4 h-4 text-gray-500" />
                )}
              </button>
              <button
                onClick={() => deleteSection(index)}
                className="p-1 hover:bg-red-500/20 hover:text-red-400 rounded transition-colors text-gray-400"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {expandedSection === index && (
              <div className="p-3 border-t border-white/10 bg-white/5">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start text-white hover:bg-white/10 hover:text-cyan-400"
                  onClick={() => setEditingSection(index)}
                >
                  Edit content
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-white/10 space-y-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start relative pl-6 bg-white/5 border-white/10 text-white hover:bg-white/10"
          >
            <span className="absolute left-0 top-0 w-1 h-full bg-blue-500 rounded-l"></span>
            + Add Section
          </Button>
        {onAddCalculator && (
          <Button 
            variant="outline"
            size="sm"
            className="w-full justify-start relative pl-6 bg-white/5 border-white/10 text-white hover:bg-white/10"
            onClick={onAddCalculator}
          >
            <span className="absolute left-0 top-0 w-1 h-full bg-purple-500 rounded-l"></span>
            + Calculator
          </Button>
        )}
        <Button 
          variant="outline" 
          size="sm"
          className="w-full justify-start relative pl-6 bg-white/5 border-white/10 text-white hover:bg-white/10"
        >
          <span className="absolute left-0 top-0 w-1 h-full bg-orange-500 rounded-l"></span>
          ⚡ AI Improve
        </Button>
      </div>
    </div>
  );
}
