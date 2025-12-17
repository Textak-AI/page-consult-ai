import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Trash2, RefreshCw, Calculator, Loader2 } from "lucide-react";
import { useState } from "react";
import { useEditing } from "@/contexts/EditingContext";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

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
  const [regeneratingSection, setRegeneratingSection] = useState<string | null>(null);
  const { setEditingSection } = useEditing();

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

  const handleRegenerate = async (sectionType: string) => {
    if (!onRegenerateSection || isRegenerating) return;
    setRegeneratingSection(sectionType);
    try {
      await onRegenerateSection(sectionType);
      toast({
        title: `${getSectionTitle(sectionType)} section regenerated`,
        description: "Content has been updated with fresh copy.",
      });
    } catch (error) {
      toast({
        title: "Regeneration failed",
        description: "Please try again.",
        variant: "destructive",
      });
    }
    setRegeneratingSection(null);
  };

  const getSectionTitle = (type: string) => {
    const titles: { [key: string]: string } = {
      hero: "Hero",
      "stats-bar": "Stats Bar",
      "problem-solution": "Problem / Solution",
      calculator: "ROI Calculator",
      features: "Features",
      "photo-gallery": "Photo Gallery",
      "social-proof": "Testimonials",
      "final-cta": "Final CTA",
    };
    return titles[type] || type.replace(/_/g, ' ').replace(/-/g, ' ');
  };

  const getSectionIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      hero: "🎯",
      "stats-bar": "📊",
      "problem-solution": "💡",
      calculator: "🧮",
      features: "✨",
      "photo-gallery": "🖼️",
      "social-proof": "⭐",
      "final-cta": "🚀",
    };
    return icons[type] || "📄";
  };

  return (
    <div className="flex flex-col h-full">
      {/* Section List Header */}
      <div className="px-4 py-3 border-b border-white/10">
        <h2 className="font-semibold text-sm text-white tracking-wide">PAGE SECTIONS</h2>
      </div>

      {/* Sections List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
        {sections.map((section, index) => {
          const isCurrentlyRegenerating = regeneratingSection === section.type;
          return (
            <div
              key={index}
              className={cn(
                "group flex items-center gap-2 px-3 py-2.5 rounded-lg transition-all cursor-pointer",
                section.visible 
                  ? "bg-white/5 hover:bg-white/10 border border-white/10" 
                  : "bg-white/[0.02] opacity-50 border border-white/5"
              )}
              onClick={() => setEditingSection(index)}
            >
              {/* Icon */}
              <span className="text-base flex-shrink-0">{getSectionIcon(section.type)}</span>
              
              {/* Title */}
              <span className={cn(
                "flex-1 text-sm font-medium truncate",
                section.visible ? "text-white" : "text-gray-500"
              )}>
                {getSectionTitle(section.type)}
              </span>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {/* Regenerate */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRegenerate(section.type);
                  }}
                  disabled={isRegenerating}
                  className={cn(
                    "p-1.5 rounded hover:bg-cyan-500/20 transition-colors",
                    isCurrentlyRegenerating ? "text-cyan-400" : "text-gray-400 hover:text-cyan-400"
                  )}
                  title={`Regenerate ${getSectionTitle(section.type)}`}
                >
                  {isCurrentlyRegenerating ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3.5 h-3.5" />
                  )}
                </button>
                
                {/* Visibility */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleVisibility(index);
                  }}
                  className="p-1.5 rounded hover:bg-white/10 transition-colors"
                  title={section.visible ? "Hide section" : "Show section"}
                >
                  {section.visible ? (
                    <Eye className="w-3.5 h-3.5 text-cyan-400" />
                  ) : (
                    <EyeOff className="w-3.5 h-3.5 text-gray-500" />
                  )}
                </button>
                
                {/* Delete */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSection(index);
                  }}
                  className="p-1.5 rounded hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                  title="Delete section"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Calculator Button */}
      {onAddCalculator && (
        <div className="p-3 border-t border-white/10">
          <Button 
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border-purple-500/30 text-white hover:bg-purple-500/20 hover:border-purple-500/50"
            onClick={onAddCalculator}
          >
            <Calculator className="w-4 h-4 text-purple-400" />
            <span>Add Calculator</span>
            <span className="ml-auto text-xs text-purple-400/70">PRO</span>
          </Button>
        </div>
      )}
    </div>
  );
}
