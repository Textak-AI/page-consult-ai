import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TextEffectsMenuProps {
  onClose: () => void;
}

const effects = [
  {
    id: "gradient-animate",
    name: "Gradient",
    description: "Smooth color transition",
    className: "text-effect-gradient-animate",
  },
  {
    id: "glow-pulse",
    name: "Glow",
    description: "Subtle pulsing glow",
    className: "text-effect-glow-pulse",
  },
  {
    id: "typewriter",
    name: "Typewriter",
    description: "Types out on load",
    className: "text-effect-typewriter",
  },
  {
    id: "highlight-sweep",
    name: "Highlight",
    description: "Background sweep effect",
    className: "text-effect-highlight-sweep",
  },
  {
    id: "float-3d",
    name: "3D Float",
    description: "Subtle floating animation",
    className: "text-effect-float-3d",
  },
  {
    id: "bounce",
    name: "Bounce",
    description: "Playful bounce effect",
    className: "text-effect-bounce",
  },
];

export function TextEffectsMenu({ onClose }: TextEffectsMenuProps) {
  const applyEffect = (effectClassName: string) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const span = document.createElement("span");
    span.className = effectClassName;

    try {
      range.surroundContents(span);
      onClose();
    } catch (e) {
      console.error("Error applying effect:", e);
    }
  };

  const removeEffects = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer;

    // Remove effect classes from parent elements
    let element = container.parentElement;
    while (element) {
      effects.forEach((effect) => {
        if (element?.classList.contains(effect.className)) {
          element.classList.remove(effect.className);
        }
      });
      element = element.parentElement;
    }

    onClose();
  };

  return (
    <div className="fixed top-20 right-[420px] z-50 w-80 bg-card border rounded-lg shadow-xl animate-fade-in">
      <div className="flex items-center justify-between p-4 border-b">
        <h4 className="font-semibold">Text Effects</h4>
        <Button size="sm" variant="ghost" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
        {effects.map((effect) => (
          <button
            key={effect.id}
            onClick={() => applyEffect(effect.className)}
            className="w-full p-3 text-left border rounded-lg hover:border-primary hover:bg-accent/50 transition-all group"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className={`font-medium ${effect.className}`}>
                  {effect.name}
                </span>
                <p className="text-sm text-muted-foreground mt-1">
                  {effect.description}
                </p>
              </div>
            </div>
          </button>
        ))}

        <div className="pt-2 border-t">
          <button
            onClick={removeEffects}
            className="w-full p-3 text-left border border-destructive/50 rounded-lg hover:bg-destructive/10 text-destructive transition-all"
          >
            <span className="font-medium">Remove All Effects</span>
            <p className="text-sm mt-1">Clear formatting from selection</p>
          </button>
        </div>
      </div>

      <div className="p-4 bg-muted/50 border-t rounded-b-lg">
        <p className="text-xs text-muted-foreground">
          💡 <strong>Tip:</strong> Select text first, then choose an effect.
          Effects can be combined with bold, italic, and other formatting.
        </p>
      </div>
    </div>
  );
}
