import { motion } from "framer-motion";
import { CheckCircle, Search, Rocket, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import type { IntelligenceTile } from "./IntelligencePanel";

interface ResearchReadyPanelProps {
  tiles: IntelligenceTile[];
  overallReadiness: number;
  onBeginResearch: () => void;
}

export function ResearchReadyPanel({ 
  tiles, 
  overallReadiness, 
  onBeginResearch 
}: ResearchReadyPanelProps) {
  const [showTiles, setShowTiles] = useState(false);
  const filledTiles = tiles.filter(t => t.fill >= 80);
  
  return (
    <div className="h-full flex flex-col bg-black/30 backdrop-blur-xl border-l border-white/10">
      {/* Success Header */}
      <div className="p-6 border-b border-white/10 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <CheckCircle className="w-8 h-8 text-green-400" />
        </motion.div>
        <h2 className="text-xl font-semibold text-white">Strategy Profile Complete</h2>
        <p className="text-sm text-white/50 mt-1">
          {overallReadiness}% readiness achieved
        </p>
      </div>
      
      {/* Collapsible Summary */}
      <div className="flex-1 overflow-y-auto p-4">
        <button
          onClick={() => setShowTiles(!showTiles)}
          className="w-full flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors mb-4"
        >
          <span className="text-sm text-white/70">
            {filledTiles.length} insights gathered
          </span>
          {showTiles ? (
            <ChevronUp className="w-4 h-4 text-white/50" />
          ) : (
            <ChevronDown className="w-4 h-4 text-white/50" />
          )}
        </button>
        
        {showTiles && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="space-y-2"
          >
            {tiles.map((tile) => (
              <div
                key={tile.id}
                className={cn(
                  "p-3 rounded-lg border transition-all",
                  tile.fill >= 80
                    ? "bg-green-500/10 border-green-500/30"
                    : tile.fill >= 50
                    ? "bg-yellow-500/10 border-yellow-500/30"
                    : "bg-white/5 border-white/10"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-white/60 uppercase">
                    {tile.category}
                  </span>
                  <span className={cn(
                    "text-xs",
                    tile.fill >= 80 ? "text-green-400" : "text-white/40"
                  )}>
                    {tile.fill}%
                  </span>
                </div>
                <p className="text-sm text-white/80 line-clamp-2">
                  {tile.insight}
                </p>
              </div>
            ))}
          </motion.div>
        )}
        
        {/* Research Info */}
        <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/20">
          <h3 className="text-sm font-semibold text-cyan-400 mb-2">
            What happens next?
          </h3>
          <ul className="space-y-2 text-sm text-white/70">
            <li className="flex items-start gap-2">
              <Search className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
              Analyze your competitive landscape
            </li>
            <li className="flex items-start gap-2">
              <Search className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
              Research industry statistics
            </li>
            <li className="flex items-start gap-2">
              <Search className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
              Identify audience pain points
            </li>
          </ul>
          <p className="text-xs text-white/40 mt-3">
            This usually takes 30-60 seconds
          </p>
        </div>
      </div>
      
      {/* CTA */}
      <div className="p-4 border-t border-white/10">
        <Button
          onClick={onBeginResearch}
          className={cn(
            "w-full py-6 text-base font-semibold gap-2",
            "bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500",
            "shadow-lg shadow-cyan-500/25"
          )}
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Search className="w-5 h-5" />
          </motion.div>
          Begin Market Research
          <Rocket className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
