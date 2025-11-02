import { Button } from "@/components/ui/button";
import { Bold, Italic, Link as LinkIcon, Save, X } from "lucide-react";
import { useState } from "react";

interface EditingToolbarProps {
  onSave: () => void;
  onCancel: () => void;
}

export function EditingToolbar({ onSave, onCancel }: EditingToolbarProps) {
  const [isLinkMode, setIsLinkMode] = useState(false);

  const applyFormat = (command: string) => {
    document.execCommand(command, false);
  };

  const insertLink = () => {
    const url = prompt("Enter URL:");
    if (url) {
      document.execCommand("createLink", false, url);
    }
    setIsLinkMode(false);
  };

  return (
    <div className="fixed top-20 right-8 z-50 bg-card border rounded-lg shadow-lg p-2 flex items-center gap-1 animate-fade-in">
      <Button
        size="sm"
        variant="ghost"
        onClick={() => applyFormat("bold")}
        className="hover:bg-accent"
      >
        <Bold className="w-4 h-4" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => applyFormat("italic")}
        className="hover:bg-accent"
      >
        <Italic className="w-4 h-4" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={insertLink}
        className="hover:bg-accent"
      >
        <LinkIcon className="w-4 h-4" />
      </Button>
      <div className="w-px h-6 bg-border mx-1" />
      <Button
        size="sm"
        variant="default"
        onClick={onSave}
        className="gap-1"
      >
        <Save className="w-4 h-4" />
        Save
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={onCancel}
        className="hover:bg-destructive/10 hover:text-destructive"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
}
