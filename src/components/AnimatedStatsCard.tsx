import { useState, useEffect } from 'react';

const AnimatedStatsCard = () => {
  const stats = [
    { 
      icon: '📊', 
      text: '40% conversion boost with calculators',
      color: 'text-cyan-400'
    },
    { 
      icon: '⚡', 
      text: '10 min average build time',
      color: 'text-purple-400'
    },
    { 
      icon: '🎯', 
      text: '3.4x more conversions with tools',
      color: 'text-green-400'
    },
    { 
      icon: '🤖', 
      text: 'AI-powered, no templates',
      color: 'text-pink-400'
    },
    { 
      icon: '✨', 
      text: 'Zero guesswork approach',
      color: 'text-amber-400'
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % stats.length);
        setIsAnimating(false);
      }, 400);
      
    }, 3000);

    return () => clearInterval(interval);
  }, [stats.length]);

  const currentStat = stats[currentIndex];
  const nextStat = stats[(currentIndex + 1) % stats.length];

  return (
    <div className="absolute bottom-12 left-4 z-0 hidden lg:block" style={{ animation: 'float 6s ease-in-out 2s infinite', animationFillMode: 'forwards', willChange: 'transform', opacity: 1 }}>
      <div className="w-64 h-20 bg-slate-800/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl overflow-hidden">
        
        {/* Animation container - fixed height for smooth transitions */}
        <div className="relative h-full flex items-center" role="status" aria-live="polite" aria-atomic="true">
          
          {/* Current stat (slides out) */}
          <div
            className={`
              absolute inset-0 flex items-center gap-3
              transition-all duration-[400ms] ease-in-out
              ${isAnimating 
                ? '-translate-y-full opacity-0' 
                : 'translate-y-0 opacity-100'
              }
            `}
            style={{ willChange: 'transform, opacity' }}
          >
            <span className="text-2xl flex-shrink-0" style={{ filter: 'drop-shadow(0 0 8px rgba(6, 182, 212, 0.3))' }}>
              {currentStat.icon}
            </span>
            <div className={`text-sm font-semibold ${currentStat.color} leading-tight`}>
              {currentStat.text}
            </div>
          </div>

          {/* Next stat (slides in from bottom) */}
          <div
            className={`
              absolute inset-0 flex items-center gap-3
              transition-all duration-[400ms] ease-in-out
              ${isAnimating 
                ? 'translate-y-0 opacity-100' 
                : 'translate-y-full opacity-0'
              }
            `}
            style={{ willChange: 'transform, opacity' }}
          >
            <span className="text-2xl flex-shrink-0" style={{ filter: 'drop-shadow(0 0 8px rgba(6, 182, 212, 0.3))' }}>
              {nextStat.icon}
            </span>
            <div className={`text-sm font-semibold ${nextStat.color} leading-tight`}>
              {nextStat.text}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AnimatedStatsCard;
