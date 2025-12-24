import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Check, Sparkles, Eye, Send } from 'lucide-react';

export function HeroFlowAnimation() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);

  const totalCards = 3;

  // Auto-rotate every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % totalCards);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Reset question animation when card 1 comes to front
  useEffect(() => {
    if (activeIndex === 0) {
      setQuestionIndex(0);
      const questionInterval = setInterval(() => {
        setQuestionIndex((prev) => Math.min(prev + 1, 3));
      }, 600);
      return () => clearInterval(questionInterval);
    }
  }, [activeIndex]);

  const cards = [
    {
      id: 'wizard',
      title: 'Strategic Questions',
      content: (
        <div className="flex flex-col h-full">
          <div className="space-y-2 flex-1">
            {["What's your business?", "Who's your ideal customer?", 'What makes you unique?'].map((q, i) => (
              <motion.div
                key={q}
                initial={{ opacity: 0, x: -10 }}
                animate={{
                  opacity: questionIndex > i ? 1 : 0.3,
                  x: questionIndex > i ? 0 : -10,
                }}
                className="flex items-center gap-2 text-sm"
              >
                {questionIndex > i ? (
                  <Check className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                ) : (
                  <div className="w-3 h-3 rounded-full border border-slate-600 flex-shrink-0" />
                )}
                <span className={questionIndex > i ? 'text-slate-200' : 'text-slate-500'}>{q}</span>
                {questionIndex === i && (
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    className="text-cyan-400"
                  >
                    |
                  </motion.span>
                )}
              </motion.div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/50">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="w-1.5 h-1.5 rounded-full bg-cyan-400"
              />
              <span>Building your strategy...</span>
            </div>
            <div className="mt-2 h-1 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500"
                animate={{ width: ['0%', '100%'] }}
                transition={{ duration: 3, ease: 'easeInOut' }}
              />
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'brief',
      title: 'Strategy Brief Generated',
      content: (
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400">Page Strength</span>
            <div className="flex items-center gap-1">
              <span className="text-lg font-bold text-emerald-400">98%</span>
              <Sparkles className="w-3 h-3 text-amber-400" />
            </div>
          </div>
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden mb-4">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: '98%' }}
              transition={{ duration: 1, delay: 0.3 }}
            />
          </div>
          <div className="space-y-1.5 flex-1">
            {[
              { label: 'Headlines', count: '3 options' },
              { label: 'Messaging pillars', count: '4 points' },
              { label: 'Proof points', count: '5 items' },
              { label: 'FAQ answers', count: '4 Q&As' },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.15 }}
                className="flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-slate-300">{item.label}</span>
                </div>
                <span className="text-slate-500">{item.count}</span>
              </motion.div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/50">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Top Headline</div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-xs text-cyan-300 font-medium truncate"
            >
              "Transform Your Landing Pages With..."
            </motion.div>
          </div>
        </div>
      ),
    },
    {
      id: 'dashboard',
      title: 'Ready to Publish',
      content: (
        <div className="flex flex-col h-full">
          <div className="bg-slate-800/50 rounded-lg p-2 mb-3">
            <div className="space-y-1.5">
              {[
                { name: 'Hero', active: true },
                { name: 'Problem', active: false },
                { name: 'Features', active: false },
                { name: 'FAQ', active: false },
                { name: 'CTA', active: false },
              ].map((section) => (
                <div key={section.name} className="flex items-center gap-2">
                  <div
                    className={`h-2 rounded-sm flex-1 ${
                      section.active
                        ? 'bg-gradient-to-r from-cyan-500/50 to-emerald-500/50'
                        : 'bg-slate-700/50'
                    }`}
                  />
                  <span className="text-[9px] text-slate-500 w-12">{section.name}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-2 mb-3">
            <div className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded bg-slate-800/50 text-[10px] text-slate-400">
              <Eye className="w-2.5 h-2.5" />
              Preview
            </div>
            <motion.div
              animate={{
                boxShadow: [
                  '0 0 0 0 rgba(16, 185, 129, 0)',
                  '0 0 0 4px rgba(16, 185, 129, 0.2)',
                  '0 0 0 0 rgba(16, 185, 129, 0)',
                ],
              }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded bg-gradient-to-r from-cyan-600 to-emerald-600 text-[10px] text-white font-medium"
            >
              <Send className="w-2.5 h-2.5" />
              Publish
            </motion.div>
          </div>
          <div className="mt-auto pt-2 border-t border-slate-800/50">
            <div className="flex items-center gap-2 text-xs">
              <div className="flex -space-x-1">
                <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-emerald-400" />
                </div>
              </div>
              <span className="text-slate-400">Conversion-ready in</span>
              <span className="text-emerald-400 font-medium">10 min</span>
            </div>
          </div>
        </div>
      ),
    },
  ];

  // Calculate position in the Ferris wheel rotation
  const getCardTransform = (cardIndex: number) => {
    let offset = cardIndex - activeIndex;

    // Normalize to -1, 0, 1 range (handles wrap-around)
    if (offset > 1) offset -= totalCards;
    if (offset < -1) offset += totalCards;

    // Y position: arc movement
    const y = offset * 100;

    // Z position: center is closest
    const z = -Math.abs(offset) * 80;

    // Scale: largest at center, smaller at edges
    const scale = 1 - Math.abs(offset) * 0.15;

    // Opacity: full at center, fading at edges
    const opacity = Math.abs(offset) === 0 ? 1 : 0.3 - Math.abs(offset) * 0.1;

    // Slight rotation for 3D feel
    const rotateX = offset * 15;

    // Z-index: center card on top
    const zIndex = 10 - Math.abs(offset) * 5;

    // Blur: sharp at center, slightly blurred at edges
    const blur = Math.abs(offset) * 2;

    return { y, z, scale, opacity, rotateX, zIndex, blur };
  };

  return (
    <div className="relative w-full max-w-sm h-80 perspective-1000 overflow-hidden">
      {/* Cards container */}
      <div className="relative w-full h-full flex items-center justify-center">
        {cards.map((card, index) => {
          const { y, z, scale, opacity, rotateX, zIndex, blur } = getCardTransform(index);

          return (
            <motion.div
              key={card.id}
              className="synthwave-edge absolute w-full max-w-[320px] h-64 rounded-xl bg-slate-900/95 backdrop-blur-sm p-4 shadow-2xl"
              animate={{
                y,
                z,
                scale,
                opacity,
                rotateX,
                filter: `blur(${blur}px)`,
              }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 25,
              }}
              style={{
                transformStyle: 'preserve-3d',
                zIndex,
              }}
            >
              {/* Step indicator */}
              <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center text-[10px] font-bold text-white">
                  {index + 1}
                </div>
                <span className="text-xs font-medium text-white">{card.title}</span>
              </div>

              {/* Card content */}
              <div className="h-[calc(100%-2rem)]">{card.content}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Step indicators */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {cards.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === activeIndex
                ? 'w-6 bg-gradient-to-r from-cyan-400 to-pink-500'
                : 'w-1.5 bg-slate-600 hover:bg-slate-500'
            }`}
            aria-label={`Go to step ${i + 1}`}
          />
        ))}
      </div>

      {/* Void gradients for fade effect */}
      <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-background to-transparent pointer-events-none z-10" />
      <div className="absolute inset-x-0 bottom-8 h-16 bg-gradient-to-t from-background to-transparent pointer-events-none z-10" />
    </div>
  );
}
