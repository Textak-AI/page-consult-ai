import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bot, 
  User, 
  Building2, 
  Target, 
  Gem, 
  Shield, 
  Gauge,
  Rocket,
  Search,
  Play,
  Pause,
  RotateCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

// Demo conversation script
const conversationScript = [
  { role: "ai" as const, content: "Hey — I'm your AI Associate. Tell me what brings you here today." },
  { role: "user" as const, content: "I run a consulting firm helping manufacturers improve efficiency" },
  { role: "ai" as const, content: "Manufacturing consulting — interesting space. Who specifically do you work with?" },
  { role: "user" as const, content: "Operations directors and VPs at mid-size companies" },
  { role: "ai" as const, content: "Got it. What results do you typically deliver for them?" },
  { role: "user" as const, content: "Usually 15-20% efficiency gains in the first 6 months" },
  { role: "ai" as const, content: "That's a compelling result. Ready for me to research your market and see what's working?" },
];

// Intelligence states at each conversation step (after each user message)
const intelligenceStates = [
  // Initial state
  {
    industry: { fill: 0, insight: "Not yet known", state: "empty" as const },
    audience: { fill: 0, insight: "Not yet known", state: "empty" as const },
    value: { fill: 0, insight: "Not yet known", state: "empty" as const },
    competitive: { fill: 0, insight: "Not yet known", state: "empty" as const },
    swagger: { fill: 0, insight: "Not yet known", state: "empty" as const },
    readiness: 0,
  },
  // After "I run a consulting firm helping manufacturers..."
  {
    industry: { fill: 65, insight: "Manufacturing consulting", state: "developing" as const },
    audience: { fill: 0, insight: "Not yet known", state: "empty" as const },
    value: { fill: 35, insight: "Efficiency improvement", state: "emerging" as const },
    competitive: { fill: 0, insight: "Not yet known", state: "empty" as const },
    swagger: { fill: 0, insight: "Not yet known", state: "empty" as const },
    readiness: 25,
  },
  // After "Operations directors and VPs..."
  {
    industry: { fill: 78, insight: "Manufacturing, Mid-size", state: "developing" as const },
    audience: { fill: 85, insight: "Operations Directors, VPs", state: "confirmed" as const },
    value: { fill: 35, insight: "Efficiency improvement", state: "emerging" as const },
    competitive: { fill: 0, insight: "Not yet known", state: "empty" as const },
    swagger: { fill: 0, insight: "Not yet known", state: "empty" as const },
    readiness: 48,
  },
  // After "15-20% efficiency gains..."
  {
    industry: { fill: 78, insight: "Manufacturing, Mid-size", state: "developing" as const },
    audience: { fill: 85, insight: "Operations Directors, VPs", state: "confirmed" as const },
    value: { fill: 92, insight: "15-20% efficiency in 6 months", state: "confirmed" as const },
    competitive: { fill: 25, insight: "Results-focused approach", state: "emerging" as const },
    swagger: { fill: 55, insight: "Quantifiable, confident", state: "developing" as const },
    readiness: 72,
  },
];

type TileState = "empty" | "emerging" | "developing" | "confirmed";

interface TileData {
  fill: number;
  insight: string;
  state: TileState;
}

const tileConfig = [
  { id: "industry", label: "Industry & Market", icon: Building2 },
  { id: "audience", label: "Target Audience", icon: Target },
  { id: "value", label: "Value Proposition", icon: Gem },
  { id: "competitive", label: "Competitive Edge", icon: Shield },
  { id: "swagger", label: "Swagger Level", icon: Gauge },
];

function getTileStyles(state: TileState) {
  switch (state) {
    case "empty":
      return { border: "border-dashed border-white/15", bg: "bg-white/[0.02]", iconOpacity: 0.3, glow: "" };
    case "emerging":
      return { border: "border-white/20", bg: "bg-white/[0.04]", iconOpacity: 0.5, glow: "shadow-[0_0_12px_rgba(6,182,212,0.1)]" };
    case "developing":
      return { border: "border-cyan-500/30", bg: "bg-white/[0.05]", iconOpacity: 0.75, glow: "shadow-[0_0_18px_rgba(6,182,212,0.15)]" };
    case "confirmed":
      return { border: "border-cyan-500/50", bg: "bg-gradient-to-br from-cyan-500/10 to-purple-500/10", iconOpacity: 1, glow: "shadow-[0_0_24px_rgba(6,182,212,0.2)]" };
  }
}

interface IntelligenceTileProps {
  id: string;
  label: string;
  icon: typeof Building2;
  data: TileData;
  isUpdating: boolean;
}

function IntelligenceTile({ id, label, icon: Icon, data, isUpdating }: IntelligenceTileProps) {
  const styles = getTileStyles(data.state);
  
  return (
    <motion.div
      layout
      className={cn(
        "relative p-3 rounded-lg border backdrop-blur-sm transition-all duration-500",
        styles.border,
        styles.bg,
        styles.glow
      )}
    >
      <div className="flex items-start gap-2.5">
        <div 
          className={cn(
            "flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center transition-all duration-500",
            data.state === "confirmed" ? "bg-gradient-to-br from-cyan-500/25 to-purple-500/25" : "bg-white/5"
          )}
          style={{ opacity: styles.iconOpacity }}
        >
          <Icon 
            className={cn(
              "w-4 h-4 transition-colors duration-500",
              data.state === "confirmed" ? "text-cyan-400" : "text-white/60"
            )} 
            strokeWidth={1.5} 
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-medium text-white/50 uppercase tracking-wider">{label}</span>
            <span className={cn(
              "text-[10px] font-semibold tabular-nums",
              data.fill >= 80 ? "text-cyan-400" : data.fill >= 40 ? "text-white/60" : "text-white/30"
            )}>
              {data.fill}%
            </span>
          </div>
          
          {/* Fill meter */}
          <div className="h-1 bg-white/10 rounded-full overflow-hidden mb-1.5">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${data.fill}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
          
          <p className={cn(
            "text-xs leading-tight truncate transition-colors duration-300",
            data.state === "empty" ? "text-white/25 italic" : "text-white/75"
          )}>
            {data.insight}
          </p>
        </div>
      </div>
      
      {/* Pulse on update */}
      <AnimatePresence>
        {isUpdating && (
          <motion.div
            initial={{ opacity: 0.6, scale: 1 }}
            animate={{ opacity: 0, scale: 1.02 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 rounded-lg border-2 border-cyan-400/60 pointer-events-none"
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function AIDemo() {
  const [messageIndex, setMessageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [tiles, setTiles] = useState(intelligenceStates[0]);
  const [updatingTiles, setUpdatingTiles] = useState<string[]>([]);
  const [isPaused, setIsPaused] = useState(false);

  // Calculate which intelligence state to use based on user messages shown
  const userMessageCount = conversationScript.slice(0, messageIndex).filter(m => m.role === "user").length;
  
  // Update tiles when user message count changes
  useEffect(() => {
    if (userMessageCount > 0 && userMessageCount <= intelligenceStates.length - 1) {
      const newState = intelligenceStates[userMessageCount];
      const prevState = intelligenceStates[userMessageCount - 1];
      
      // Find which tiles changed
      const changed: string[] = [];
      Object.keys(newState).forEach(key => {
        if (key !== "readiness" && (newState as any)[key].fill !== (prevState as any)[key].fill) {
          changed.push(key);
        }
      });
      
      setUpdatingTiles(changed);
      setTiles(newState);
      
      // Clear updating state
      setTimeout(() => setUpdatingTiles([]), 800);
    }
  }, [userMessageCount]);

  // Auto-play logic
  useEffect(() => {
    if (!isPlaying || isPaused) return;
    
    const nextMessage = conversationScript[messageIndex];
    if (!nextMessage) {
      // Reset after delay
      setTimeout(() => {
        setMessageIndex(0);
        setTiles(intelligenceStates[0]);
      }, 4000);
      return;
    }

    // Show typing indicator before AI messages
    if (nextMessage.role === "ai" && messageIndex > 0) {
      setIsTyping(true);
      const typingTimer = setTimeout(() => {
        setIsTyping(false);
        setMessageIndex(prev => prev + 1);
      }, 1200);
      return () => clearTimeout(typingTimer);
    } else {
      const delay = nextMessage.role === "user" ? 2000 : 1500;
      const timer = setTimeout(() => {
        setMessageIndex(prev => prev + 1);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [messageIndex, isPlaying, isPaused]);

  const handleReset = useCallback(() => {
    setMessageIndex(0);
    setTiles(intelligenceStates[0]);
    setIsTyping(false);
    setIsPlaying(true);
    setIsPaused(false);
  }, []);

  const visibleMessages = conversationScript.slice(0, messageIndex);

  return (
    <section id="demo" className="relative py-24 md:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px]" />
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,black_40%,transparent_100%)]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-6">
            <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
            <span className="text-cyan-400 text-sm font-medium">Live Demo</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
              Watch AI Build Your
            </span>
            <br />
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Strategy in Real-Time
            </span>
          </h2>
          <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto">
            Not a form. Not a template. A conversation that understands.
          </p>
        </div>

        {/* Demo Container */}
        <div className="relative max-w-6xl mx-auto">
          {/* Outer glow */}
          <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-2xl opacity-50" />
          
          {/* Main container */}
          <div 
            className="relative bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Window header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-black/30">
              <div className="flex items-center gap-3">
                {/* Traffic lights */}
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <span className="text-white/60 text-sm font-medium">AI Strategy Session</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="h-7 w-7 p-0 text-white/50 hover:text-white hover:bg-white/10"
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="h-7 w-7 p-0 text-white/50 hover:text-white hover:bg-white/10"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {/* Split content */}
            <div className="flex flex-col lg:flex-row min-h-[450px]">
              {/* LEFT: Chat */}
              <div className="lg:w-[55%] p-5 flex flex-col border-b lg:border-b-0 lg:border-r border-white/5">
                <div className="flex-1 overflow-y-auto space-y-4 mb-4 max-h-[300px] lg:max-h-none">
                  <AnimatePresence mode="popLayout">
                    {visibleMessages.map((message, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10, x: message.role === "user" ? 20 : -20 }}
                        animate={{ opacity: 1, y: 0, x: 0 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className={cn("flex gap-3", message.role === "user" ? "justify-end" : "justify-start")}
                      >
                        {message.role === "ai" && (
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                            <Bot className="w-4 h-4 text-white" />
                          </div>
                        )}
                        
                        <div className={cn(
                          "max-w-[80%] rounded-xl px-4 py-2.5",
                          message.role === "ai"
                            ? "bg-white/[0.08] backdrop-blur-sm text-white/90 rounded-tl-sm"
                            : "bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-tr-sm"
                        )}>
                          <p className="text-sm leading-relaxed">{message.content}</p>
                        </div>
                        
                        {message.role === "user" && (
                          <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-white/70" />
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {/* Typing indicator */}
                  <AnimatePresence>
                    {isTyping && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex gap-3"
                      >
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div className="bg-white/[0.08] backdrop-blur-sm rounded-xl rounded-tl-sm px-4 py-3">
                          <div className="flex gap-1">
                            <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                            <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                            <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                {/* Fake input */}
                <div className="flex gap-2 items-center">
                  <div className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white/30 text-sm">
                    Type your message...
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-cyan-500/50 to-purple-500/50 flex items-center justify-center">
                    <Rocket className="w-4 h-4 text-white/50" />
                  </div>
                </div>
              </div>

              {/* RIGHT: Intelligence Panel */}
              <div className="lg:w-[45%] p-5 bg-black/20">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-md bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center">
                    <Rocket className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-white/80">Intelligence Profile</h3>
                </div>
                
                {/* Tiles */}
                <div className="space-y-2.5 mb-5">
                  {tileConfig.map(({ id, label, icon }) => (
                    <IntelligenceTile
                      key={id}
                      id={id}
                      label={label}
                      icon={icon}
                      data={(tiles as any)[id]}
                      isUpdating={updatingTiles.includes(id)}
                    />
                  ))}
                </div>
                
                {/* Readiness meter */}
                <div className="pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-white/50">Ready for Research</span>
                    <span className={cn(
                      "text-xs font-semibold",
                      tiles.readiness >= 80 ? "text-cyan-400" : "text-white/50"
                    )}>
                      {tiles.readiness}%
                    </span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-3">
                    <motion.div
                      className={cn(
                        "h-full rounded-full",
                        tiles.readiness >= 80 
                          ? "bg-gradient-to-r from-cyan-400 to-purple-400" 
                          : "bg-gradient-to-r from-cyan-500/60 to-purple-500/60"
                      )}
                      animate={{ width: `${tiles.readiness}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    />
                  </div>
                  
                  <Button
                    disabled={tiles.readiness < 80}
                    className={cn(
                      "w-full gap-2 text-sm",
                      tiles.readiness >= 80 
                        ? "bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500" 
                        : "bg-white/10 text-white/40 cursor-not-allowed"
                    )}
                  >
                    <Search className="w-4 h-4" />
                    Begin Market Research
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA below demo */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center mt-12"
        >
          <p className="text-xl text-white/70 mb-6">
            Ready to see what AI discovers about <span className="text-cyan-400 font-semibold">YOUR</span> market?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-semibold px-8 py-6 text-base shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all"
              >
                Try It Free — No Credit Card
              </Button>
            </Link>
            <Link to="/#pricing">
              <Button 
                variant="outline" 
                size="lg"
                className="border-slate-600 bg-transparent text-white hover:bg-slate-800 hover:border-slate-500 px-8 py-6 text-base font-semibold"
              >
                See Pricing
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
