import { useState } from "react";
import { Pencil, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SectionToolbarProps {
  sectionType: string;
  sectionContent: any;
  onEdit: () => void;
  onAIAssist: () => void;
  isEditing: boolean;
}

export function SectionToolbar({
  sectionType,
  sectionContent,
  onEdit,
  onAIAssist,
  isEditing,
}: SectionToolbarProps) {
  const sectionLabel = sectionType
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return (
    <div
      className={cn(
        "absolute top-2 right-2 z-50 flex items-center gap-1 rounded-lg border bg-background/95 backdrop-blur-sm shadow-lg p-1 transition-all duration-200",
        "opacity-0 group-hover:opacity-100 focus-within:opacity-100",
        isEditing && "opacity-100 border-primary"
      )}
    >
      <span className="text-xs font-medium text-muted-foreground px-2">
        {sectionLabel}
      </span>
      <div className="h-4 w-px bg-border" />
      <Button
        variant={isEditing ? "default" : "ghost"}
        size="sm"
        className="h-7 px-2 gap-1.5"
        onClick={onEdit}
      >
        <Pencil className="h-3.5 w-3.5" />
        <span className="text-xs">Edit</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-7 px-2 gap-1.5 text-primary hover:text-primary hover:bg-primary/10"
        onClick={onAIAssist}
      >
        <Sparkles className="h-3.5 w-3.5" />
        <span className="text-xs">AI</span>
      </Button>
    </div>
  );
}
