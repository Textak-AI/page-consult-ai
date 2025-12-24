import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Check, Sparkles, Eye, Send } from 'lucide-react';

export function HeroFlowAnimation() {
  const [activeStep, setActiveStep] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);

  // Auto-advance cards every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Animate questions appearing in card 1
  useEffect(() => {
    if (activeStep === 0) {
      setQuestionIndex(0);
      const questionInterval = setInterval(() => {
        setQuestionIndex((prev) => Math.min(prev + 1, 3));
      }, 600);
      return () => clearInterval(questionInterval);
    }
  }, [activeStep]);

  const cards = [
    {
      id: 'wizard',
      title: 'Strategic Questions',
      content: (
        <div className="flex flex-col h-full">
          {/* Questions with stagger animation */}
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

          {/* Bottom section - Analysis indicator */}
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
          {/* Page strength */}
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

          {/* Generated items */}
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

          {/* Preview headline */}
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
          {/* Mini page preview */}
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

          {/* Mini action buttons */}
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

          {/* Success message */}
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

  return (
    <div className="relative w-full max-w-sm h-72 perspective-1000">
      {cards.map((card, index) => {
        const offset = index - activeStep;

        return (
          <motion.div
            key={card.id}
            className="synthwave-edge absolute inset-0 rounded-xl bg-slate-900/90 backdrop-blur-sm p-4 shadow-2xl overflow-hidden"
            animate={{
              z: offset * -40,
              y: offset * 15,
              x: offset * 12,
              scale: 1 - Math.abs(offset) * 0.05,
              opacity: 1 - Math.abs(offset) * 0.4,
              rotateY: offset * -3,
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
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center text-[10px] font-bold text-white">
                {index + 1}
              </div>
              <span className="text-xs font-medium text-white">{card.title}</span>
            </div>

            {/* Card content - fills remaining space */}
            <div className="h-[calc(100%-2rem)]">{card.content}</div>
          </motion.div>
        );
      })}

      {/* Step dots */}
      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2">
        {[0, 1, 2].map((i) => (
          <button
            key={i}
            onClick={() => setActiveStep(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === activeStep ? 'w-6' : 'w-1.5 hover:opacity-80'
            }`}
            style={{
              background: i === activeStep ? 'linear-gradient(90deg, #06b6d4, #ec4899)' : '#475569',
            }}
            aria-label={`Go to step ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
