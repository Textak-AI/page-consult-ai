import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Check, Sparkles, Eye, Send } from 'lucide-react';

export function HeroFlowAnimation() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const cards = [
    {
      id: 'wizard',
      title: 'Strategic Questions',
      content: (
        <div className="flex flex-col h-full">
          <div className="space-y-2 flex-1">
            {['What\'s your business?', 'Who\'s your ideal customer?', 'What makes you unique?'].map((q) => (
              <div key={q} className="flex items-center gap-2 text-sm">
                <Check className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                <span className="text-slate-200">{q}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/50">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span>Building your strategy...</span>
            </div>
            <div className="mt-2 h-1 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 w-3/4" />
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
            <div className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full w-[98%]" />
          </div>
          <div className="space-y-1.5 flex-1">
            {[
              { label: 'Headlines', count: '3 options' },
              { label: 'Messaging pillars', count: '4 points' },
              { label: 'Proof points', count: '5 items' },
              { label: 'FAQ answers', count: '4 Q&As' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-slate-300">{item.label}</span>
                </div>
                <span className="text-slate-500">{item.count}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/50">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Top Headline</div>
            <div className="text-xs text-cyan-300 font-medium truncate">"Transform Your Landing Pages With..."</div>
          </div>
        </div>
      ),
    },
    {
      id: 'dashboard',
      title: 'Ready to Publish',
      content: (
        <div className="flex flex-col h-full">
          <div className="bg-slate-800/50 rounded-lg p-2 mb-3 flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded bg-gradient-to-br from-cyan-500/30 to-emerald-500/30 flex items-center justify-center">
                <span className="text-[8px] text-cyan-300">HERO</span>
              </div>
              <div className="flex-1 space-y-1">
                <div className="h-1.5 bg-slate-700 rounded w-3/4" />
                <div className="h-1 bg-slate-700/50 rounded w-1/2" />
              </div>
            </div>
            <div className="space-y-1">
              {['Features', 'FAQ', 'CTA'].map((section) => (
                <div key={section} className="flex items-center gap-2">
                  <div className="h-1.5 bg-slate-700/50 rounded flex-1" />
                  <span className="text-[8px] text-slate-500 w-10">{section}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-2 mb-3">
            <div className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded bg-slate-800/50 text-[10px] text-slate-400">
              <Eye className="w-2.5 h-2.5" />
              Preview
            </div>
            <div className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded bg-gradient-to-r from-cyan-600 to-emerald-600 text-[10px] text-white font-medium">
              <Send className="w-2.5 h-2.5" />
              Publish
            </div>
          </div>
          <div className="pt-2 border-t border-slate-800/50">
            <div className="flex items-center gap-2 text-xs">
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-slate-400">Conversion-ready in</span>
              <span className="text-emerald-400 font-medium">10 min</span>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="relative w-[450px] h-[340px]">
      {cards.map((card, index) => {
        let depth = index - activeIndex;
        if (depth < 0) depth += 3;
        const isActive = depth === 0;

        return (
          <motion.div
            key={card.id}
            className="absolute top-0 right-0 w-[340px] h-full rounded-xl bg-slate-900/95 backdrop-blur-sm border border-slate-800/50 p-5"
            animate={{
              x: depth * -50,
              y: depth * 15,
              scale: 1 - depth * 0.03,
              opacity: isActive ? 1 : 0.4,
              zIndex: 30 - depth * 10,
            }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
            }}
          >
            {/* Synthwave edge reflection - only on active card */}
            {isActive && (
              <>
                {/* Animated edge glow container */}
                <div className="absolute inset-0 rounded-xl pointer-events-none">
                  {/* Top edge reflection */}
                  <motion.div
                    className="absolute top-0 left-[20%] w-[30%] h-[2px]"
                    animate={{ 
                      opacity: [0.3, 0.8, 0.3],
                      left: ['20%', '50%', '20%'],
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    style={{
                      background: 'linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.9), transparent)',
                      boxShadow: '0 0 15px 2px rgba(6, 182, 212, 0.6)',
                    }}
                  />
                  
                  {/* Right edge reflection */}
                  <motion.div
                    className="absolute right-0 top-[30%] w-[2px] h-[25%]"
                    animate={{ 
                      opacity: [0.2, 0.7, 0.2],
                      top: ['30%', '55%', '30%'],
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                    style={{
                      background: 'linear-gradient(180deg, transparent, rgba(236, 72, 153, 0.9), transparent)',
                      boxShadow: '0 0 15px 2px rgba(236, 72, 153, 0.6)',
                    }}
                  />
                  
                  {/* Bottom edge reflection */}
                  <motion.div
                    className="absolute bottom-0 right-[25%] w-[35%] h-[2px]"
                    animate={{ 
                      opacity: [0.2, 0.75, 0.2],
                      right: ['25%', '45%', '25%'],
                    }}
                    transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                    style={{
                      background: 'linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.9), transparent)',
                      boxShadow: '0 0 15px 2px rgba(139, 92, 246, 0.6)',
                    }}
                  />
                  
                  {/* Left edge reflection */}
                  <motion.div
                    className="absolute left-0 bottom-[20%] w-[2px] h-[30%]"
                    animate={{ 
                      opacity: [0.3, 0.65, 0.3],
                      bottom: ['20%', '40%', '20%'],
                    }}
                    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                    style={{
                      background: 'linear-gradient(180deg, transparent, rgba(6, 182, 212, 0.8), transparent)',
                      boxShadow: '0 0 12px 2px rgba(6, 182, 212, 0.5)',
                    }}
                  />
                  
                  {/* Corner accent - top right */}
                  <motion.div
                    className="absolute -top-[1px] -right-[1px] w-16 h-16"
                    animate={{ opacity: [0.2, 0.5, 0.2] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
                    style={{
                      background: 'radial-gradient(circle at top right, rgba(236, 72, 153, 0.4) 0%, transparent 70%)',
                    }}
                  />
                  
                  {/* Corner accent - bottom left */}
                  <motion.div
                    className="absolute -bottom-[1px] -left-[1px] w-16 h-16"
                    animate={{ opacity: [0.15, 0.4, 0.15] }}
                    transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
                    style={{
                      background: 'radial-gradient(circle at bottom left, rgba(6, 182, 212, 0.4) 0%, transparent 70%)',
                    }}
                  />
                </div>
                
                {/* Outer glow halo */}
                <div 
                  className="absolute -inset-[1px] rounded-xl pointer-events-none -z-10"
                  style={{
                    boxShadow: '0 0 20px 1px rgba(6, 182, 212, 0.15), 0 0 40px 2px rgba(139, 92, 246, 0.1)',
                  }}
                />
              </>
            )}

            {/* Card content */}
            <div className="relative z-10 h-full">
              {/* Step indicator */}
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center text-xs font-bold text-white">
                  {index + 1}
                </div>
                <span className="text-sm font-medium text-white">{card.title}</span>
              </div>

              {/* Card body */}
              <div className="h-52">{card.content}</div>
            </div>
          </motion.div>
        );
      })}

      {/* Step dots */}
      <div className="absolute -bottom-10 right-0 flex gap-2">
        {[0, 1, 2].map((i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === activeIndex ? 'w-6 bg-gradient-to-r from-cyan-400 to-pink-500' : 'w-1.5 bg-slate-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
