import { useState, useEffect } from "react";

const AnimatedStatsCard = () => {
  const stats = [
    {
      icon: "📊",
      text: "40% conversion boost with calculators",
      color: "text-cyan-400",
    },
    {
      icon: "⚡",
      text: "10 min average build time",
      color: "text-purple-400",
    },
    {
      icon: "🎯",
      text: "3.4x more conversions with tools",
      color: "text-green-400",
    },
    {
      icon: "🤖",
      text: "AI-powered, no templates",
      color: "text-pink-400",
    },
    {
      icon: "✨",
      text: "Zero guesswork approach",
      color: "text-amber-400",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Cycle through stats every 3 seconds with smooth transitions
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % stats.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [stats.length]);

  return (
    <div className="absolute bottom-12 left-4 z-0 hidden lg:block">
      <div className="w-64 h-20 bg-slate-800/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl overflow-hidden">
        {/* Single container with smooth vertical scrolling */}
        <div className="relative h-full" role="status" aria-live="polite" aria-atomic="true">
          {stats.map((stat, index) => {
            // Calculate position relative to current index
            // Current item: offset = 0 (visible at center)
            // Next item: offset = 1 (waiting below, will scroll up next)
            // Previous items: offset > 1 (already scrolled away)
            const offset = (index - currentIndex + stats.length) % stats.length;
            
            // Position and opacity based on offset
            let translateY = 100; // Default: below viewport
            let opacity = 0;
            
            if (offset === 0) {
              // Current item: centered and visible
              translateY = 0;
              opacity = 1;
            } else if (offset === stats.length - 1) {
              // Next item: ready below
              translateY = 100;
              opacity = 0;
            }

            return (
              <div
                key={`${stat.text}-${index}`}
                className="absolute inset-0 flex items-center gap-3 transition-all duration-700 ease-in-out"
                style={{
                  transform: `translateY(${translateY}%)`,
                  opacity: opacity,
                  willChange: "transform, opacity",
                }}
              >
                <span 
                  className="text-2xl flex-shrink-0" 
                  style={{ filter: "drop-shadow(0 0 8px rgba(6, 182, 212, 0.3))" }}
                >
                  {stat.icon}
                </span>
                <div className={`text-sm font-semibold ${stat.color} leading-tight`}>
                  {stat.text}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AnimatedStatsCard;
