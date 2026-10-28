import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Trash2, RefreshCw, Calculator, Loader2, Zap, ChevronUp, ChevronDown, GripVertical, Plus, Lock } from "lucide-react";
import { useState } from "react";
import { useEditing } from "@/contexts/EditingContext";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { canMove, isPinned, move, moveTo, removeAt, toggleVisibleAt } from "@/lib/editor/sectionOps";

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
  /** Opens the Add Section menu, optionally preselecting an insert position. */
  onAddSection?: (insertAt?: number) => void;
  onRegenerateSection?: (sectionType: string) => void;
  isRegenerating?: boolean;
  actionCost?: number;
}

export function SectionManager({
  sections,
  onSectionsChange,
  onSave,
  onAddCalculator,
  onAddSection,
  onRegenerateSection,
  isRegenerating,
  actionCost = 1,
}: SectionManagerProps) {
  const [regeneratingSection, setRegeneratingSection] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const { setEditingSection } = useEditing();

  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  // All list changes are immutable and flow through onSectionsChange, so the
  // editor's undo history and autosave capture them.
  const toggleVisibility = (index: number) => {
    onSectionsChange(toggleVisibleAt(sections, index));
    onSave();
  };

  const deleteSection = (index: number) => {
    const removed = sections[index];
    onSectionsChange(removeAt(sections, index));
    onSave();
    toast({
      title: `${getSectionTitle(removed?.type || '')} removed`,
      description: "Press Ctrl+Z (Cmd+Z) or Undo to bring it back.",
    });
  };

  const moveSection = (index: number, dir: -1 | 1) => {
    if (!canMove(sections, index, dir)) return;
    onSectionsChange(move(sections, index, dir));
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

  const handleSectionClick = (section: Section, index: number) => {
    setEditingSection(index);
    setActiveSection(section.type);
    
    // Get the section ID for scrolling
    const sectionId = getSectionId(section.type);
    const sectionElement = document.getElementById(sectionId);
    
    if (sectionElement) {
      // Smooth scroll to section
      sectionElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Add glow effect
      sectionElement.classList.add('section-highlight-glow');
      
      // Remove glow after 2 seconds
      setTimeout(() => {
        sectionElement.classList.remove('section-highlight-glow');
        setActiveSection(null);
      }, 2000);
    }
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

  const getSectionId = (type: string) => {
    return `section-${type}`;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Section List Header */}
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
        <h2 className="font-semibold text-sm text-white tracking-wide">PAGE SECTIONS</h2>
        {onAddSection && (
          <button
            onClick={() => onAddSection()}
            className="flex items-center gap-1 text-xs font-medium text-cyan-400 hover:text-cyan-300 px-2 py-1 rounded hover:bg-white/10 transition-colors"
            aria-label="Add Section"
          >
            <Plus className="w-3.5 h-3.5" />
            Add
          </button>
        )}
      </div>

      {/* Sections List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
        {sections.map((section, index) => {
          const isCurrentlyRegenerating = regeneratingSection === section.type;
          const isActive = activeSection === section.type;
          const pinned = isPinned(sections, index);
          return (
            <div
              key={index}
              draggable={!pinned}
              onDragStart={(e) => {
                if (pinned) return;
                setDragFrom(index);
                e.dataTransfer.effectAllowed = "move";
              }}
              onDragOver={(e) => {
                if (dragFrom === null) return;
                e.preventDefault();
                setDragOver(index);
              }}
              onDrop={(e) => {
                e.preventDefault();
                if (dragFrom !== null && dragFrom !== index) onSectionsChange(moveTo(sections, dragFrom, index));
                setDragFrom(null);
                setDragOver(null);
              }}
              onDragEnd={() => { setDragFrom(null); setDragOver(null); }}
              data-section-row={section.type}
              className={cn(
                "group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all cursor-pointer",
                dragOver === index && dragFrom !== index && "ring-2 ring-cyan-400/40",
                section.visible 
                  ? "bg-white/5 hover:bg-white/10 border border-white/10" 
                  : "bg-white/[0.02] opacity-50 border border-white/5",
                isActive && "ring-2 ring-cyan-400/50 bg-cyan-500/10"
              )}
              onClick={() => handleSectionClick(section, index)}
            >
              {pinned ? (
                <Lock className="w-3.5 h-3.5 text-gray-500 shrink-0" aria-label="Position fixed" />
              ) : (
                <GripVertical className="w-3.5 h-3.5 text-gray-500 shrink-0 cursor-grab" aria-hidden />
              )}
              {/* Title - no emoji, just text */}
              <span className={cn(
                "flex-1 min-w-0 truncate text-sm font-medium",
                section.visible ? "text-white" : "text-gray-500"
              )}>
                {getSectionTitle(section.type)}
              </span>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 opacity-0 max-w-0 overflow-hidden group-hover:opacity-100 group-hover:max-w-none group-focus-within:opacity-100 group-focus-within:max-w-none transition-opacity">
                {/* Reorder */}
                {!pinned && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); moveSection(index, -1); }}
                      disabled={!canMove(sections, index, -1)}
                      className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors disabled:opacity-30"
                      title="Move section up"
                      aria-label="Move section up"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); moveSection(index, 1); }}
                      disabled={!canMove(sections, index, 1)}
                      className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors disabled:opacity-30"
                      title="Move section down"
                      aria-label="Move section down"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
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

      {/* Add Section / Calculator */}
      {onAddCalculator && (
        <div className="p-3 border-t border-white/10 space-y-2">
          {onAddCalculator && (
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
          )}
        </div>
      )}
    </div>
  );
}
