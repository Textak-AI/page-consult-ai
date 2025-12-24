import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export function HeroFlowAnimation() {
  const [activeStep, setActiveStep] = useState(0);

  // Auto-advance every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const cards = [
    {
      id: 'wizard',
      title: 'Strategic Questions',
      content: (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="text-sm text-slate-300">What's your business?</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="text-sm text-slate-300">Who's your ideal customer?</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="text-sm text-slate-300">What makes you unique?</span>
          </div>
        </div>
      ),
    },
    {
      id: 'brief',
      title: 'Strategy Brief Generated',
      content: (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-300">Page Strength</span>
            <span className="text-lg font-bold text-emerald-400">98%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-2 rounded-full w-[98%]" />
          </div>
          <div className="text-xs text-slate-400">✓ Headline • ✓ Features • ✓ FAQ • ✓ CTA</div>
        </div>
      ),
    },
    {
      id: 'dashboard',
      title: 'Ready to Publish',
      content: (
        <div className="space-y-2">
          <div className="bg-slate-700/50 rounded h-16 flex items-center justify-center text-xs text-slate-400">
            Hero Section
          </div>
          <div className="grid grid-cols-3 gap-1">
            <div className="bg-slate-700/50 rounded h-8" />
            <div className="bg-slate-700/50 rounded h-8" />
            <div className="bg-slate-700/50 rounded h-8" />
          </div>
          <div className="bg-slate-700/50 rounded h-10" />
        </div>
      ),
    },
  ];

  return (
    <div className="relative w-full max-w-md h-80 perspective-1000">
      {cards.map((card, index) => {
        const isActive = index === activeStep;
        const offset = index - activeStep;

        return (
          <motion.div
            key={card.id}
            className="absolute inset-0 rounded-xl border border-slate-700/50 bg-slate-900/90 backdrop-blur-sm p-6 shadow-2xl"
            initial={false}
            animate={{
              z: offset * -50,
              y: offset * 20,
              x: offset * 15,
              scale: 1 - Math.abs(offset) * 0.05,
              opacity: 1 - Math.abs(offset) * 0.3,
              rotateY: offset * -5,
            }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
            }}
            style={{
              transformStyle: 'preserve-3d',
              zIndex: 3 - Math.abs(offset),
            }}
          >
            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-4">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  isActive ? 'bg-cyan-500 text-white' : 'bg-slate-700 text-slate-400'
                }`}
              >
                {index + 1}
              </div>
              <span className={`text-sm font-medium ${isActive ? 'text-white' : 'text-slate-400'}`}>
                {card.title}
              </span>
            </div>

            {/* Card content */}
            {card.content}
          </motion.div>
        );
      })}

      {/* Step dots */}
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2">
        {[0, 1, 2].map((i) => (
          <button
            key={i}
            onClick={() => setActiveStep(i)}
            className={`h-2 rounded-full transition-all ${
              i === activeStep ? 'bg-cyan-400 w-6' : 'bg-slate-600 hover:bg-slate-500 w-2'
            }`}
            aria-label={`Go to step ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
