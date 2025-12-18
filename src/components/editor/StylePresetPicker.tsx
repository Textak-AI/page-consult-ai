import { Paintbrush, Check, Sparkles, Minus, Zap, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StylePresetName, stylePresetInfo } from "@/styles/presets";

interface StylePresetPickerProps {
  currentStyle: StylePresetName;
  onStyleChange: (style: StylePresetName) => void;
}

const styleIcons: Record<StylePresetName, React.ElementType> = {
  premium: Sparkles,
  minimal: Minus,
  bold: Zap,
  elegant: Crown,
};

const styleColors: Record<StylePresetName, string> = {
  premium: "from-cyan-500 to-purple-500",
  minimal: "from-slate-400 to-slate-600",
  bold: "from-yellow-400 to-yellow-600",
  elegant: "from-amber-500 to-amber-700",
};

export function StylePresetPicker({ currentStyle, onStyleChange }: StylePresetPickerProps) {
  const CurrentIcon = styleIcons[currentStyle];
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2 bg-white/5 border-white/20 hover:bg-white/10 text-white"
        >
          <Paintbrush className="w-4 h-4" />
          <span className="hidden sm:inline">Style:</span>
          <span className="font-medium">{stylePresetInfo[currentStyle].name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 bg-slate-900 border-slate-700 p-2 z-50">
        {(Object.keys(stylePresetInfo) as StylePresetName[]).map((style) => {
          const Icon = styleIcons[style];
          const isSelected = style === currentStyle;
          return (
            <DropdownMenuItem
              key={style}
              onClick={() => onStyleChange(style)}
              className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer ${
                isSelected 
                  ? 'bg-white/10 border border-cyan-500/50' 
                  : 'hover:bg-white/5 border border-transparent'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${styleColors[style]} flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">{stylePresetInfo[style].name}</span>
                  {isSelected && <Check className="w-4 h-4 text-cyan-400" />}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{stylePresetInfo[style].description}</p>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
