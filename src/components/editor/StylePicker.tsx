import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PageStyle } from "@/contexts/EditingContext";
import { StylePresetName, stylePresetInfo } from "@/styles/presets";
import { Check, Sparkles, Minus, Zap, Crown, RotateCcw } from "lucide-react";
import { CURATED_FONTS, HERO_LAYOUTS, type PageTheme } from "@/lib/editor/pageTheme";

export interface DesignControlsProps {
  theme: PageTheme;
  onThemeChange: (t: PageTheme) => void;
  seedPrimary?: string | null;
  seedSecondary?: string | null;
  seedHeadingFont?: string;
  seedBodyFont?: string;
  heroLayout: string;
  hasHero: boolean;
  onHeroLayoutChange: (id: string) => void;
}

interface StylePickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentStyle: PageStyle;
  onStyleSelect: (style: PageStyle) => void;
  design?: DesignControlsProps;
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
  design,
}: StylePickerProps) {
  const handleSelect = (style: PageStyle) => {
    onStyleSelect(style);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-[#1a1332] border-white/20 text-white">
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
        {design && <DesignControls {...design} />}
      </DialogContent>
    </Dialog>
  );
}

const HEX = /^#[0-9a-fA-F]{6}$/;
const toHex = (v?: string | null) => {
  if (!v) return undefined;
  const t = v.trim();
  if (HEX.test(t)) return t.toLowerCase();
  if (/^#[0-9a-fA-F]{3}$/.test(t)) return ("#" + t.slice(1).split("").map((c) => c + c).join("")).toLowerCase();
  return undefined;
};

function DesignControls({ theme, onThemeChange, seedPrimary, seedSecondary, seedHeadingFont, seedBodyFont, heroLayout, hasHero, onHeroLayoutChange }: DesignControlsProps) {
  const set = (patch: Partial<PageTheme>) => {
    const next: PageTheme = { ...theme, ...patch };
    (Object.keys(next) as (keyof PageTheme)[]).forEach((k) => next[k] === undefined && delete next[k]);
    onThemeChange(next);
  };
  const colorRow = (label: string, key: "primaryColor" | "secondaryColor", seed?: string | null) => {
    const value = theme[key] || toHex(seed) || "#000000";
    return (
      <div className="flex items-center gap-3">
        <input
          type="color"
          aria-label={`${label} colour`}
          value={value}
          onChange={(e) => set({ [key]: e.target.value.toLowerCase() })}
          className="h-9 w-12 cursor-pointer rounded border border-white/20 bg-transparent"
        />
        <div className="flex-1">
          <div className="text-sm text-white">{label}</div>
          <div className="text-xs text-gray-400">{theme[key] ? value : toHex(seed) ? `${value} (page default)` : "Page default"}</div>
        </div>
        {theme[key] && (
          <button type="button" onClick={() => set({ [key]: undefined })} className="text-xs text-gray-400 hover:text-white inline-flex items-center gap-1">
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        )}
      </div>
    );
  };
  const fontRow = (label: string, key: "headingFont" | "bodyFont", seed?: string) => (
    <label className="flex items-center gap-3">
      <span className="w-20 text-sm text-white">{label}</span>
      <select
        aria-label={`${label} font`}
        value={theme[key] || ""}
        onChange={(e) => set({ [key]: e.target.value || undefined })}
        className="flex-1 h-9 rounded-md border border-white/20 bg-white/5 px-2 text-sm text-white"
      >
        <option value="" className="bg-slate-900">
          Page default{seed ? ` (${CURATED_FONTS.find((f) => f.id === seed)?.label})` : ""}
        </option>
        {CURATED_FONTS.map((f) => (
          <option key={f.id} value={f.id} className="bg-slate-900" style={{ fontFamily: f.stack }}>
            {f.label}
          </option>
        ))}
      </select>
    </label>
  );
  return (
    <div className="mt-6 grid gap-6 border-t border-white/10 pt-5 md:grid-cols-3">
      <div className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-400">Brand colours</h4>
        {colorRow("Primary", "primaryColor", seedPrimary)}
        {colorRow("Secondary", "secondaryColor", seedSecondary)}
      </div>
      <div className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-400">Fonts</h4>
        {fontRow("Headings", "headingFont", seedHeadingFont)}
        {fontRow("Body", "bodyFont", seedBodyFont)}
      </div>
      {hasHero && (
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-400">Hero layout</h4>
          <div role="radiogroup" aria-label="Hero layout" className="flex flex-col gap-2">
            {HERO_LAYOUTS.map((l) => (
              <button
                key={l.id}
                type="button"
                role="radio"
                aria-checked={heroLayout === l.id}
                onClick={() => onHeroLayoutChange(l.id)}
                className={`h-9 rounded-md border px-3 text-left text-sm transition-colors ${heroLayout === l.id ? "border-cyan-500 bg-cyan-500/10 text-white" : "border-white/10 text-gray-300 hover:border-white/30"}`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
