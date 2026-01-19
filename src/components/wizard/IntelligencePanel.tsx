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
  Search,
  CheckCircle2,
  Circle,
  ChevronRight
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
  isResearchReady?: boolean;
}

function getTileStyles(state: TileState) {
  switch (state) {
    case "empty":
      return {
        border: "border-white/10",
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
        border: "border-cyan-500/40",
        bg: "bg-gradient-to-br from-cyan-500/10 to-purple-500/10",
        iconOpacity: "opacity-100",
        glow: "shadow-[0_0_25px_rgba(6,182,212,0.2)]"
      };
  }
}

function getProgressGradient(fill: number) {
  if (fill >= 80) return "from-emerald-400 via-cyan-400 to-cyan-500";
  if (fill >= 50) return "from-cyan-500 via-cyan-400 to-purple-400";
  if (fill >= 25) return "from-amber-400 via-orange-400 to-rose-400";
  return "from-white/30 to-white/20";
}

function IntelligenceTileCard({ tile, index }: { tile: IntelligenceTile; index: number }) {
  const Icon = iconMap[tile.icon];
  const styles = getTileStyles(tile.state);
  const isComplete = tile.fill >= 80;
  const isPartial = tile.fill >= 25 && tile.fill < 80;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08, duration: 0.3 }}
      className={cn(
        "relative p-4 rounded-2xl border backdrop-blur-sm transition-all duration-500",
        styles.border,
        styles.bg,
        styles.glow
      )}
    >
      {/* Category Header */}
      <div className="flex items-center gap-3 mb-3">
        {/* Icon Container */}
        <div className={cn(
          "relative flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500",
          tile.state === "confirmed" 
            ? "bg-gradient-to-br from-cyan-500/25 to-purple-500/25 ring-1 ring-cyan-400/30" 
            : "bg-white/5",
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
              className="absolute inset-0 rounded-xl bg-cyan-400/10"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </div>
        
        {/* Category Title & Status */}
        <div className="flex-1 min-w-0">
          <h4 className={cn(
            "text-sm font-semibold tracking-wide transition-colors duration-300",
            tile.state === "confirmed" ? "text-white" : 
            tile.state === "developing" ? "text-white/90" :
            "text-white/70"
          )}>
            {tile.category}
          </h4>
          <div className="flex items-center gap-1.5 mt-0.5">
            {isComplete ? (
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            ) : isPartial ? (
              <Circle className="w-3 h-3 text-amber-400" />
            ) : (
              <Circle className="w-3 h-3 text-white/30" />
            )}
            <span className={cn(
              "text-xs font-medium",
              isComplete ? "text-emerald-400" : 
              isPartial ? "text-amber-400" : 
              "text-white/40"
            )}>
              {isComplete ? "Complete" : isPartial ? "In Progress" : "Awaiting Info"}
            </span>
          </div>
        </div>
        
        {/* Percentage Badge */}
        <div className={cn(
          "flex-shrink-0 px-2.5 py-1 rounded-lg text-xs font-bold transition-all duration-300",
          isComplete 
            ? "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30" 
            : isPartial 
              ? "bg-amber-500/15 text-amber-400" 
              : "bg-white/5 text-white/40"
        )}>
          {tile.fill}%
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-3 ring-1 ring-white/5">
        <motion.div
          className={cn(
            "h-full rounded-full bg-gradient-to-r",
            getProgressGradient(tile.fill)
          )}
          initial={{ width: 0 }}
          animate={{ width: `${tile.fill}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
      
      {/* Insight Content */}
      <div className={cn(
        "rounded-xl p-3 transition-all duration-300",
        tile.state === "empty" 
          ? "bg-white/[0.02] border border-dashed border-white/10" 
          : "bg-white/[0.04]"
      )}>
        <p className={cn(
          "text-sm leading-relaxed transition-colors duration-300",
          tile.state === "empty" 
            ? "text-white/30 italic" 
            : tile.state === "confirmed" 
              ? "text-white/90" 
              : "text-white/70"
        )}>
          {tile.insight}
        </p>
      </div>
      
      {/* Update pulse animation */}
      <AnimatePresence>
        {tile.state !== "empty" && (
          <motion.div
            key={`pulse-${tile.fill}`}
            initial={{ opacity: 0.5, scale: 1 }}
            animate={{ opacity: 0, scale: 1.02 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 rounded-2xl border-2 border-cyan-400/50 pointer-events-none"
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function IntelligencePanel({ 
  tiles, 
  overallReadiness, 
  onBeginResearch
}: IntelligencePanelProps) {
  const completedTiles = tiles.filter(t => t.fill >= 80).length;
  const totalTiles = tiles.length;
  const isReady = overallReadiness >= 70;
  
  return (
    <div className="h-full flex flex-col bg-black/40 backdrop-blur-xl border-l border-white/10">
      {/* Header with Prominent Score */}
      <div className="p-5 border-b border-white/10">
        {/* Title Row */}
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 ring-1 ring-cyan-400/20">
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">
              Intelligence Profile
            </h2>
            <p className="text-xs text-white/50">
              Real-time business analysis
            </p>
          </div>
        </div>
        
        {/* Score Card */}
        <div className={cn(
          "p-4 rounded-2xl transition-all duration-500",
          isReady 
            ? "bg-gradient-to-br from-cyan-500/15 to-purple-500/15 ring-1 ring-cyan-400/30" 
            : "bg-white/[0.04] ring-1 ring-white/10"
        )}>
          {/* Score Display */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-baseline gap-1">
              <motion.span 
                className={cn(
                  "text-4xl font-bold tabular-nums",
                  isReady ? "text-cyan-400" : "text-white/80"
                )}
                key={overallReadiness}
                initial={{ scale: 1.1, opacity: 0.5 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {overallReadiness}
              </motion.span>
              <span className="text-lg text-white/40">/100</span>
            </div>
            
            {/* Completion Badge */}
            <div className={cn(
              "px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5",
              isReady 
                ? "bg-emerald-500/20 text-emerald-400" 
                : "bg-white/10 text-white/60"
            )}>
              {isReady ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Ready
                </>
              ) : (
                <>
                  <ChevronRight className="w-3.5 h-3.5" />
                  {70 - overallReadiness} pts to go
                </>
              )}
            </div>
          </div>
          
          {/* Main Progress Bar */}
          <div className="relative h-3 bg-white/10 rounded-full overflow-hidden ring-1 ring-white/5">
            {/* 70% Threshold Marker */}
            <div 
              className="absolute top-0 bottom-0 w-0.5 bg-white/40 z-10"
              style={{ left: '70%' }}
            />
            <div 
              className="absolute -top-5 text-[10px] text-white/50 font-medium"
              style={{ left: '70%', transform: 'translateX(-50%)' }}
            >
              70
            </div>
            
            <motion.div
              className={cn(
                "h-full rounded-full transition-all duration-500 bg-gradient-to-r",
                isReady 
                  ? "from-emerald-400 via-cyan-400 to-purple-400" 
                  : "from-cyan-500/70 via-cyan-400/60 to-purple-500/50"
              )}
              animate={{ width: `${overallReadiness}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
          
          {/* Category Completion Summary */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
            <span className="text-xs text-white/50">Categories completed</span>
            <div className="flex items-center gap-1">
              {tiles.map((tile, i) => (
                <div
                  key={tile.id}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-300",
                    tile.fill >= 80 
                      ? "bg-emerald-400" 
                      : tile.fill >= 25 
                        ? "bg-amber-400/60" 
                        : "bg-white/20"
                  )}
                />
              ))}
              <span className="text-xs text-white/60 ml-2 font-medium">
                {completedTiles}/{totalTiles}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Category Tiles */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <AnimatePresence mode="popLayout">
          {tiles.map((tile, index) => (
            <IntelligenceTileCard key={tile.id} tile={tile} index={index} />
          ))}
        </AnimatePresence>
      </div>
      
      {/* Action Footer */}
      <div className="p-4 border-t border-white/10">
        {isReady ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Button
              onClick={onBeginResearch}
              className={cn(
                "w-full py-6 text-base font-semibold gap-2 rounded-xl",
                "bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500",
                "shadow-[0_0_30px_rgba(6,182,212,0.3)]"
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
            <p className="text-center text-white/40 text-xs mt-2">
              Analyze your competitive landscape
            </p>
          </motion.div>
        ) : (
          <div className="text-center space-y-2 py-2">
            <div className="flex items-center justify-center gap-2 text-white/60">
              <div className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-sm font-medium">Keep sharing...</span>
            </div>
            <p className="text-xs text-white/40">
              Need: {tiles.filter(t => t.fill < 50).map(t => t.category).slice(0, 2).join(', ')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
