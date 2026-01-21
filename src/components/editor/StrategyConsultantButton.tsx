import { Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface StrategyConsultantButtonProps {
  onClick: () => void;
  suggestionCount?: number;
}

export function StrategyConsultantButton({
  onClick,
  suggestionCount = 0,
}: StrategyConsultantButtonProps) {
  const hasSuggestions = suggestionCount > 0;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            className={cn(
              "fixed bottom-6 right-6 z-40",
              "w-14 h-14 rounded-full",
              "bg-gradient-to-br from-purple-600 to-violet-600",
              "flex items-center justify-center",
              "shadow-lg hover:shadow-xl",
              "transition-all duration-300 ease-out",
              "hover:scale-110",
              "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-background",
              hasSuggestions && "animate-pulse"
            )}
            aria-label="Open Strategy Consultant"
          >
            <Brain className="w-6 h-6 text-white" />
            
            {hasSuggestions && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-background">
                {suggestionCount > 9 ? "9+" : suggestionCount}
              </span>
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="left" className="bg-slate-800 text-white border-slate-700">
          <p>Strategy Consultant</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
