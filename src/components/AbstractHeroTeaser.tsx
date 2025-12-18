import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface BarState {
  width: number;
  delay: number;
}

export default function AbstractHeroTeaser() {
  const [phase, setPhase] = useState(0);
  
  // Animation phases: 0 = initial, 1-5 = progressive reveals
  // Bars only fill after USER messages (phases 2, 4 - after user blocks appear)
  useEffect(() => {
    const interval = setInterval(() => {
      setPhase(prev => (prev + 1) % 6);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Bar states - ONLY change after user messages (even phases after 1)
  const getBarStates = (): BarState[] => {
    switch (phase) {
      case 0: // Initial - empty
      case 1: // AI message 1 appears - bars stay static
        return [
          { width: 0, delay: 0 },
          { width: 0, delay: 0 },
          { width: 0, delay: 0 },
          { width: 0, delay: 0 },
          { width: 0, delay: 0 },
        ];
      case 2: // User message 1 appeared - bars fill
        return [
          { width: 65, delay: 0.3 },
          { width: 35, delay: 0.5 },
          { width: 0, delay: 0 },
          { width: 0, delay: 0 },
          { width: 0, delay: 0 },
        ];
      case 3: // AI message 2 appears - bars stay static
        return [
          { width: 65, delay: 0 },
          { width: 35, delay: 0 },
          { width: 0, delay: 0 },
          { width: 0, delay: 0 },
          { width: 0, delay: 0 },
        ];
      case 4: // User message 2 appeared - more bars fill
        return [
          { width: 78, delay: 0.3 },
          { width: 55, delay: 0.4 },
          { width: 45, delay: 0.5 },
          { width: 25, delay: 0.6 },
          { width: 0, delay: 0 },
        ];
      case 5: // AI message 3 appears - bars stay static (user hasn't replied yet)
        return [
          { width: 78, delay: 0 },
          { width: 55, delay: 0 },
          { width: 45, delay: 0 },
          { width: 25, delay: 0 },
          { width: 0, delay: 0 },
        ];
      default:
        return Array(5).fill({ width: 0, delay: 0 });
    }
  };

  const barStates = getBarStates();
  // Readiness only increases after user messages
  const overallReadiness = phase <= 1 ? 0 : phase <= 3 ? 35 : 58;

  return (
    <div className="relative w-full max-w-[520px]">
      {/* Subtle glow behind */}
      <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl blur-2xl opacity-60" />
      
      {/* Main container - glassmorphism */}
      <motion.div 
        className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 shadow-xl"
        animate={{ 
          y: [0, -6, 0],
        }}
        transition={{ 
          duration: 4, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
      >
        {/* Mini labels row - static, no animation */}
        <div className="flex justify-between mb-4 px-1">
          <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-medium">
            Conversation
          </span>
          <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-medium">
            Intelligence
          </span>
        </div>

        {/* Animation content row */}
        <div className="flex gap-4">
          {/* LEFT: Abstract chat blocks */}
          <div className="flex-1 space-y-2.5">
            {/* AI message 1 */}
            <motion.div 
              className="h-2.5 w-3/4 bg-slate-600/50 rounded-full"
              initial={{ opacity: 0, x: -10 }}
              animate={{ 
                opacity: phase >= 1 ? 0.8 : 0, 
                x: phase >= 1 ? 0 : -10 
              }}
              transition={{ duration: 0.4 }}
            />
            
            {/* User message 1 */}
            <motion.div 
              className="h-2.5 w-1/2 bg-cyan-500/40 rounded-full ml-auto"
              initial={{ opacity: 0, x: 10 }}
              animate={{ 
                opacity: phase >= 2 ? 0.9 : 0, 
                x: phase >= 2 ? 0 : 10 
              }}
              transition={{ duration: 0.4, delay: 0.1 }}
            />
            
            {/* AI message 2 */}
            <motion.div 
              className="h-2.5 w-2/3 bg-slate-600/50 rounded-full"
              initial={{ opacity: 0, x: -10 }}
              animate={{ 
                opacity: phase >= 3 ? 0.8 : 0, 
                x: phase >= 3 ? 0 : -10 
              }}
              transition={{ duration: 0.4 }}
            />
            
            {/* User message 2 */}
            <motion.div 
              className="h-2.5 w-2/5 bg-cyan-500/40 rounded-full ml-auto"
              initial={{ opacity: 0, x: 10 }}
              animate={{ 
                opacity: phase >= 4 ? 0.9 : 0, 
                x: phase >= 4 ? 0 : 10 
              }}
              transition={{ duration: 0.4, delay: 0.1 }}
            />
            
            {/* AI message 3 */}
            <motion.div 
              className="h-2.5 w-7/12 bg-slate-600/50 rounded-full"
              initial={{ opacity: 0, x: -10 }}
              animate={{ 
                opacity: phase >= 5 ? 0.8 : 0, 
                x: phase >= 5 ? 0 : -10 
              }}
              transition={{ duration: 0.4 }}
            />
            
            {/* Typing indicator - shows when waiting for user */}
            <motion.div 
              className="flex gap-1 pt-1"
              animate={{ opacity: phase < 5 ? [0.4, 1, 0.4] : 0 }}
              transition={{ duration: 1.2, repeat: Infinity }}
            >
              <div className="h-1.5 w-1.5 bg-slate-500 rounded-full" />
              <div className="h-1.5 w-1.5 bg-slate-500 rounded-full" />
              <div className="h-1.5 w-1.5 bg-slate-500 rounded-full" />
            </motion.div>
          </div>
          
          {/* Subtle vertical divider */}
          <div className="w-px bg-slate-700/30" />
          
          {/* RIGHT: Intelligence bars */}
          <div className="flex-1 space-y-2.5">
            {barStates.map((bar, index) => (
              <div key={index} className="flex items-center gap-2">
                {/* Icon placeholder */}
                <div className="h-3 w-3 rounded bg-slate-600/50 flex-shrink-0" />
                
                {/* Progress bar track */}
                <div className="flex-1 h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${bar.width}%` }}
                    transition={{ 
                      duration: 0.6, 
                      delay: bar.delay,
                      ease: "easeOut" 
                    }}
                  />
                </div>
              </div>
            ))}
            
            {/* Overall readiness meter */}
            <div className="pt-2 mt-1 border-t border-white/5">
              <div className="flex-1 h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${overallReadiness}%` }}
                  transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
