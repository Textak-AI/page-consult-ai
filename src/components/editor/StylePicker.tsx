import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PageStyle } from "@/contexts/EditingContext";
import { Check } from "lucide-react";

interface StylePickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentStyle: PageStyle;
  onStyleSelect: (style: PageStyle) => void;
}

const styles: { value: PageStyle; label: string; description: string }[] = [
  {
    value: "professional",
    label: "Professional",
    description: "Clean, trustworthy design for service businesses",
  },
  {
    value: "modern",
    label: "Modern",
    description: "Contemporary look with bold typography and gradients",
  },
  {
    value: "bold",
    label: "Bold",
    description: "High-contrast, attention-grabbing design",
  },
  {
    value: "minimal",
    label: "Minimal",
    description: "Simple, elegant design with plenty of white space",
  },
  {
    value: "elegant",
    label: "Elegant",
    description: "Sophisticated design with refined details",
  },
];

export function StylePicker({
  open,
  onOpenChange,
  currentStyle,
  onStyleSelect,
}: StylePickerProps) {
  const handleSelect = (style: PageStyle) => {
    onStyleSelect(style);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Choose Page Style</DialogTitle>
          <DialogDescription>
            Select a style to apply consistently across your entire landing page
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {styles.map((style) => (
            <button
              key={style.value}
              onClick={() => handleSelect(style.value)}
              className={`relative p-6 border-2 rounded-lg text-left transition-all hover:border-primary ${
                currentStyle === style.value
                  ? "border-primary bg-primary/5"
                  : "border-border"
              }`}
            >
              {currentStyle === style.value && (
                <div className="absolute top-3 right-3">
                  <Check className="w-5 h-5 text-primary" />
                </div>
              )}
              <h3 className="font-semibold text-lg mb-2">{style.label}</h3>
              <p className="text-sm text-muted-foreground">
                {style.description}
              </p>
            </button>
          ))}
        </div>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Tip:</strong> The selected style will be applied to all
            sections, ensuring a cohesive and professional appearance throughout
            your landing page.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
