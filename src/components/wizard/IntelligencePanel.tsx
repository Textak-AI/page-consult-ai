import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, 
  Target, 
  Gem, 
  Shield, 
  Rocket, 
  Gauge, 
  Users, 
  TrendingUp,
  Sparkles,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type TileState = "empty" | "emerging" | "developing" | "confirmed";

export interface IntelligenceTile {
  id: string;
  category: string;
  icon: keyof typeof iconMap;
  fill: number; // 0-100
  insight: string;
  state: TileState;
}

const iconMap = {
  Building2,
  Target,
  Gem,
  Shield,
  Rocket,
  Gauge,
  Users,
  TrendingUp,
  Sparkles,
  Search
};

const defaultTiles: IntelligenceTile[] = [
  { id: "industry", category: "Industry & Market", icon: "Building2", fill: 0, insight: "Not yet known", state: "empty" },
  { id: "audience", category: "Target Audience", icon: "Target", fill: 0, insight: "Not yet known", state: "empty" },
  { id: "value", category: "Value Proposition", icon: "Gem", fill: 0, insight: "Not yet known", state: "empty" },
  { id: "competitive", category: "Competitive Position", icon: "Shield", fill: 0, insight: "Not yet known", state: "empty" },
  { id: "goals", category: "Goals & Objectives", icon: "Rocket", fill: 0, insight: "Not yet known", state: "empty" },
  { id: "swagger", category: "Swagger Level", icon: "Gauge", fill: 0, insight: "Not yet known", state: "empty" },
];

export function getDefaultTiles(): IntelligenceTile[] {
  return defaultTiles.map(t => ({ ...t }));
}

interface IntelligencePanelProps {
  tiles: IntelligenceTile[];
  overallReadiness: number;
  onBeginResearch: () => void;
  isResearchReady: boolean;
}

function getTileStyles(state: TileState) {
  switch (state) {
    case "empty":
      return {
        border: "border-dashed border-white/20",
        bg: "bg-white/[0.02]",
        iconOpacity: "opacity-30",
        glow: ""
      };
    case "emerging":
      return {
        border: "border-white/20",
        bg: "bg-white/[0.04]",
        iconOpacity: "opacity-50",
        glow: "shadow-[0_0_15px_rgba(6,182,212,0.1)]"
      };
    case "developing":
      return {
        border: "border-cyan-500/30",
        bg: "bg-white/[0.06]",
        iconOpacity: "opacity-75",
        glow: "shadow-[0_0_20px_rgba(6,182,212,0.15)]"
      };
    case "confirmed":
      return {
        border: "border-cyan-500/50",
        bg: "bg-gradient-to-br from-cyan-500/10 to-purple-500/10",
        iconOpacity: "opacity-100",
        glow: "shadow-[0_0_25px_rgba(6,182,212,0.25)]"
      };
  }
}

function IntelligenceTileCard({ tile, index }: { tile: IntelligenceTile; index: number }) {
  const Icon = iconMap[tile.icon];
  const styles = getTileStyles(tile.state);
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      className={cn(
        "relative p-4 rounded-xl border backdrop-blur-sm transition-all duration-500",
        styles.border,
        styles.bg,
        styles.glow
      )}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={cn(
          "flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-opacity duration-500",
          tile.state === "confirmed" ? "bg-gradient-to-br from-cyan-500/20 to-purple-500/20" : "bg-white/5",
          styles.iconOpacity
        )}>
          <Icon 
            className={cn(
              "w-5 h-5 transition-colors duration-500",
              tile.state === "confirmed" ? "text-cyan-400" : "text-white/70"
            )} 
            strokeWidth={1.5} 
          />
          {tile.state === "confirmed" && (
            <motion.div
              className="absolute inset-0 rounded-lg bg-cyan-400/10"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-xs font-medium text-white/60 uppercase tracking-wide">
              {tile.category}
            </h4>
            <span className={cn(
              "text-xs font-medium",
              tile.fill >= 80 ? "text-cyan-400" : 
              tile.fill >= 40 ? "text-white/60" : 
              "text-white/30"
            )}>
              {tile.fill}%
            </span>
          </div>
          
          {/* Fill meter */}
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-2">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${tile.fill}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
          
          {/* Insight */}
          <p className={cn(
            "text-sm leading-relaxed transition-colors duration-300",
            tile.state === "empty" ? "text-white/30 italic" : "text-white/80"
          )}>
            {tile.insight}
          </p>
        </div>
      </div>
      
      {/* Update pulse animation */}
      <AnimatePresence>
        {tile.state !== "empty" && (
          <motion.div
            key={`pulse-${tile.fill}`}
            initial={{ opacity: 0.5, scale: 1 }}
            animate={{ opacity: 0, scale: 1.05 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 rounded-xl border-2 border-cyan-400/50 pointer-events-none"
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function IntelligencePanel({ 
  tiles, 
  overallReadiness, 
  onBeginResearch, 
  isResearchReady 
}: IntelligencePanelProps) {
  return (
    <div className="h-full flex flex-col bg-black/30 backdrop-blur-xl border-l border-white/10">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          Intelligence Profile
        </h2>
        <p className="text-sm text-white/50 mt-1">
          Building your business profile in real-time
        </p>
      </div>
      
      {/* Tiles */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <AnimatePresence mode="popLayout">
          {tiles.map((tile, index) => (
            <IntelligenceTileCard key={tile.id} tile={tile} index={index} />
          ))}
        </AnimatePresence>
      </div>
      
      {/* Readiness Footer */}
      <div className="p-4 border-t border-white/10 space-y-4">
        {/* Overall readiness meter */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-white/60">Ready for research</span>
            <span className={cn(
              "text-sm font-semibold",
              overallReadiness >= 80 ? "text-cyan-400" : "text-white/60"
            )}>
              {overallReadiness}%
            </span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                overallReadiness >= 80 
                  ? "bg-gradient-to-r from-cyan-400 to-purple-400" 
                  : "bg-gradient-to-r from-cyan-500/50 to-purple-500/50"
              )}
              animate={{ width: `${overallReadiness}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
        </div>
        
        {/* Research button */}
        <AnimatePresence>
          {isResearchReady && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              <Button
                onClick={onBeginResearch}
                className={cn(
                  "w-full py-6 text-base font-semibold gap-2",
                  "bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500"
                )}
              >
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Search className="w-5 h-5" />
                </motion.div>
                Begin Market Research
                <Rocket className="w-5 h-5" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
        
        {!isResearchReady && (
          <div className="text-center space-y-2">
            <p className="text-xs text-white/40">
              {overallReadiness >= 70 
                ? "Almost there! Fill in missing details to unlock generation."
                : "Keep chatting to build your intelligence profile"
              }
            </p>
            {overallReadiness >= 70 && (
              <p className="text-[10px] text-white/30">
                Need 90%+ readiness with all required fields
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
