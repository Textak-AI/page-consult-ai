import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PageStyle } from "@/contexts/EditingContext";
import { StylePresetName, stylePresetInfo } from "@/styles/presets";
import { Check, Sparkles, Minus, Zap, Crown } from "lucide-react";

interface StylePickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentStyle: PageStyle;
  onStyleSelect: (style: PageStyle) => void;
}

const styleIcons: Record<StylePresetName, React.ElementType> = {
  premium: Sparkles,
  minimal: Minus,
  bold: Zap,
  elegant: Crown,
};

const styleGradients: Record<StylePresetName, string> = {
  premium: "from-cyan-500 to-purple-500",
  minimal: "from-slate-400 to-slate-600",
  bold: "from-yellow-400 to-yellow-600",
  elegant: "from-amber-500 to-amber-700",
};

const stylePreviews: Record<StylePresetName, { bg: string; card: string; accent: string }> = {
  premium: {
    bg: "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900",
    card: "bg-white/5 border border-white/10",
    accent: "bg-gradient-to-r from-cyan-500 to-purple-500",
  },
  minimal: {
    bg: "bg-white dark:bg-slate-900",
    card: "bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700/50",
    accent: "bg-slate-900 dark:bg-white",
  },
  bold: {
    bg: "bg-black",
    card: "bg-black border-2 border-yellow-400",
    accent: "bg-yellow-400",
  },
  elegant: {
    bg: "bg-gradient-to-br from-stone-50 to-amber-50/30 dark:from-stone-900 dark:to-stone-800",
    card: "bg-white/80 dark:bg-stone-800/50 border border-amber-200/50 dark:border-amber-900/30",
    accent: "bg-gradient-to-r from-amber-700 to-amber-800",
  },
};

const styles: { value: StylePresetName; label: string; description: string }[] = [
  {
    value: "premium",
    label: stylePresetInfo.premium.name,
    description: stylePresetInfo.premium.description,
  },
  {
    value: "minimal",
    label: stylePresetInfo.minimal.name,
    description: stylePresetInfo.minimal.description,
  },
  {
    value: "bold",
    label: stylePresetInfo.bold.name,
    description: stylePresetInfo.bold.description,
  },
  {
    value: "elegant",
    label: stylePresetInfo.elegant.name,
    description: stylePresetInfo.elegant.description,
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
      <DialogContent className="max-w-3xl bg-[#1a1332] border-white/20 text-white">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">Choose Page Style</DialogTitle>
          <DialogDescription className="text-gray-400">
            Select a style preset to transform your entire landing page's appearance
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {styles.map((style) => {
            const Icon = styleIcons[style.value];
            const preview = stylePreviews[style.value];
            const isSelected = currentStyle === style.value;
            
            return (
              <button
                key={style.value}
                onClick={() => handleSelect(style.value)}
                className={`relative p-4 border-2 rounded-xl text-left transition-all hover:border-cyan-500 bg-white/5 backdrop-blur-sm overflow-hidden group ${
                  isSelected
                    ? "border-cyan-500 bg-cyan-500/10"
                    : "border-white/10"
                }`}
              >
                {/* Visual preview */}
                <div className={`${preview.bg} rounded-lg p-3 mb-4 h-24 relative overflow-hidden`}>
                  {/* Mini mockup */}
                  <div className="space-y-2">
                    {/* Headline placeholder */}
                    <div className={`h-3 ${isSelected ? 'w-3/4' : 'w-2/3'} ${style.value === 'bold' ? 'bg-yellow-400' : style.value === 'elegant' ? 'bg-amber-700' : style.value === 'minimal' ? 'bg-slate-900 dark:bg-white' : 'bg-white'} rounded opacity-80`} />
                    <div className={`h-2 w-1/2 ${style.value === 'bold' ? 'bg-yellow-400/50' : style.value === 'elegant' ? 'bg-amber-600/50' : style.value === 'minimal' ? 'bg-slate-400' : 'bg-gray-400'} rounded`} />
                    {/* Button placeholder */}
                    <div className={`${preview.accent} h-4 w-16 rounded mt-2`} />
                  </div>
                  {/* Card preview */}
                  <div className={`absolute bottom-2 right-2 ${preview.card} rounded w-12 h-8`} />
                </div>
                
                {isSelected && (
                  <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
                
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${styleGradients[style.value]} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1 text-white">{style.label}</h3>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      {style.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
          <p className="text-sm text-gray-300">
            💡 <strong className="text-cyan-400">Tip:</strong> The selected style will transform all
            sections including typography, colors, spacing, and effects for a cohesive design.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
