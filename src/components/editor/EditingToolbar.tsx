import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Sparkles,
  Save,
  X,
} from "lucide-react";
import { useState } from "react";
import { TextEffectsMenu } from "./TextEffectsMenu";

interface EditingToolbarProps {
  onSave: () => void;
  onCancel: () => void;
}

export function EditingToolbar({ onSave, onCancel }: EditingToolbarProps) {
  const [showEffects, setShowEffects] = useState(false);

  const applyFormat = (command: string) => {
    document.execCommand(command, false);
  };

  const setAlignment = (align: string) => {
    document.execCommand(`justify${align}`, false);
  };

  const setTextSize = (size: string) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const span = document.createElement("span");

    const sizeClasses: { [key: string]: string } = {
      small: "text-sm",
      normal: "text-base",
      large: "text-lg",
      huge: "text-2xl",
    };

    span.className = sizeClasses[size] || "text-base";
    range.surroundContents(span);
  };

  return (
    <>
      <div className="fixed top-20 right-8 z-50 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg shadow-lg p-2 flex items-center gap-1 animate-fade-in">
        {/* Basic formatting */}
        <Button
          size="sm"
          variant="ghost"
          onClick={() => applyFormat("bold")}
          className="hover:bg-white/10 text-white"
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => applyFormat("italic")}
          className="hover:bg-white/10 text-white"
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => applyFormat("underline")}
          className="hover:bg-white/10 text-white"
          title="Underline"
        >
          <Underline className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-white/20 mx-1" />

        {/* Effects button */}
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setShowEffects(!showEffects)}
          className="hover:bg-white/10 gap-1 text-white"
        >
          <Sparkles className="w-4 h-4" />
          Effects
        </Button>

        <div className="w-px h-6 bg-white/20 mx-1" />

        {/* Text size */}
        <Select onValueChange={setTextSize} defaultValue="normal">
          <SelectTrigger className="w-24 h-8 bg-white/5 border-white/20 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#1a1332] border-white/20">
            <SelectItem value="small" className="text-white hover:bg-white/10">Small</SelectItem>
            <SelectItem value="normal" className="text-white hover:bg-white/10">Normal</SelectItem>
            <SelectItem value="large" className="text-white hover:bg-white/10">Large</SelectItem>
            <SelectItem value="huge" className="text-white hover:bg-white/10">Huge</SelectItem>
          </SelectContent>
        </Select>

        <div className="w-px h-6 bg-white/20 mx-1" />

        {/* Alignment */}
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setAlignment("Left")}
          className="hover:bg-white/10 text-white"
          title="Align Left"
        >
          <AlignLeft className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setAlignment("Center")}
          className="hover:bg-white/10 text-white"
          title="Align Center"
        >
          <AlignCenter className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setAlignment("Right")}
          className="hover:bg-white/10 text-white"
          title="Align Right"
        >
          <AlignRight className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-white/20 mx-1" />

        {/* Actions */}
        <Button size="sm" variant="default" onClick={onSave} className="gap-1 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white border-0">
          <Save className="w-4 h-4" />
          Save
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={onCancel}
          className="hover:bg-red-500/20 hover:text-red-400 text-white"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {showEffects && (
        <TextEffectsMenu onClose={() => setShowEffects(false)} />
      )}
    </>
  );
}
