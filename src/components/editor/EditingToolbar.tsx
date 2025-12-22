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
  Sun,
  Moon,
} from "lucide-react";
import { useState } from "react";
import { TextEffectsMenu } from "./TextEffectsMenu";

interface EditingToolbarProps {
  onSave: () => void;
  onCancel: () => void;
}

export function EditingToolbar({ onSave, onCancel }: EditingToolbarProps) {
  const [showEffects, setShowEffects] = useState(false);
  const [textColorMode, setTextColorMode] = useState<'light' | 'dark'>('dark');

  const applyFormat = (command: string) => {
    document.execCommand(command, false);
  };

  const setAlignment = (align: string) => {
    document.execCommand(`justify${align}`, false);
  };
  
  const toggleTextColor = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const span = document.createElement("span");
    
    const newMode = textColorMode === 'dark' ? 'light' : 'dark';
    setTextColorMode(newMode);
    
    span.style.color = newMode === 'light' ? 'white' : '#0f172a';
    
    try {
      range.surroundContents(span);
    } catch (e) {
      const contents = range.extractContents();
      span.appendChild(contents);
      range.insertNode(span);
    }
  };


  const setTextSize = (size: string) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;

    // Store the selection text to restore later
    const selectedText = selection.toString();
    if (!selectedText) return;

    const range = selection.getRangeAt(0);
    
    // Remove existing size classes from selection
    const container = range.commonAncestorContainer;
    let element = container.parentElement;
    while (element && element.tagName !== 'BODY') {
      ['text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl', 'text-4xl'].forEach(cls => {
        element?.classList.remove(cls);
      });
      element = element.parentElement;
    }
    
    const span = document.createElement("span");

    // Fixed size mapping - larger values for bigger sizes
    const sizeClasses: { [key: string]: string } = {
      small: "text-sm",
      normal: "text-base",
      large: "text-xl",
      huge: "text-3xl",
    };

    span.className = sizeClasses[size] || "text-base";
    
    // Apply inline style as backup for immediate visual feedback
    const sizeStyles: { [key: string]: string } = {
      small: "0.875rem",
      normal: "1rem",
      large: "1.25rem",
      huge: "1.875rem",
    };
    span.style.fontSize = sizeStyles[size] || "1rem";
    
    try {
      range.surroundContents(span);
    } catch (e) {
      // If surroundContents fails (e.g., selection spans multiple elements),
      // extract contents and wrap them
      const contents = range.extractContents();
      span.appendChild(contents);
      range.insertNode(span);
    }

    // Restore the selection on the new span
    requestAnimationFrame(() => {
      const newRange = document.createRange();
      newRange.selectNodeContents(span);
      selection.removeAllRanges();
      selection.addRange(newRange);
    });
  };

  return (
    <>
      <div className="fixed top-20 right-8 z-50 bg-white/95 backdrop-blur-md border border-gray-200 rounded-lg shadow-lg p-2 flex items-center gap-1 animate-fade-in">
        {/* Basic formatting */}
        <Button
          size="sm"
          variant="ghost"
          onClick={() => applyFormat("bold")}
          className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => applyFormat("italic")}
          className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => applyFormat("underline")}
          className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          title="Underline"
        >
          <Underline className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-gray-200 mx-1" />

        {/* Effects button */}
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setShowEffects(!showEffects)}
          className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 gap-1"
        >
          <Sparkles className="w-4 h-4" />
          Effects
        </Button>

        <div className="w-px h-6 bg-gray-200 mx-1" />

        {/* Text size */}
        <Select onValueChange={setTextSize} defaultValue="normal">
          <SelectTrigger className="w-24 h-8 bg-gray-50 border-gray-200 text-gray-700">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white border-gray-200">
            <SelectItem value="small" className="text-gray-700 hover:bg-gray-100">Small</SelectItem>
            <SelectItem value="normal" className="text-gray-700 hover:bg-gray-100">Normal</SelectItem>
            <SelectItem value="large" className="text-gray-700 hover:bg-gray-100">Large</SelectItem>
            <SelectItem value="huge" className="text-gray-700 hover:bg-gray-100">Huge</SelectItem>
          </SelectContent>
        </Select>

        <div className="w-px h-6 bg-gray-200 mx-1" />

        {/* Text color toggle */}
        <Button
          size="sm"
          variant="ghost"
          onClick={toggleTextColor}
          className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          title={textColorMode === 'dark' ? 'Switch to Light Text' : 'Switch to Dark Text'}
        >
          {textColorMode === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>

        <div className="w-px h-6 bg-gray-200 mx-1" />

        {/* Alignment */}
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setAlignment("Left")}
          className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          title="Align Left"
        >
          <AlignLeft className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setAlignment("Center")}
          className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          title="Align Center"
        >
          <AlignCenter className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setAlignment("Right")}
          className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          title="Align Right"
        >
          <AlignRight className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-gray-200 mx-1" />

        {/* Actions */}
        <Button size="sm" variant="default" onClick={onSave} className="gap-1 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white border-0">
          <Save className="w-4 h-4" />
          Save
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 hover:bg-red-50"
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
