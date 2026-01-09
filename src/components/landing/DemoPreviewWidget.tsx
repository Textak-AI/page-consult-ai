import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Send, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface DemoPreviewWidgetProps {
  onActivate: () => void;
  onInputFocus: () => void;
}

// Circuit pattern SVG for background
const circuitPatternSvg = `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23ffffff' stroke-width='0.5' opacity='0.08'%3E%3Cpath d='M0 40h20v-20h20v-20'/%3E%3Cpath d='M80 40h-20v20h-20v20'/%3E%3Cpath d='M40 0v20h20v20h20'/%3E%3Cpath d='M40 80v-20h-20v-20h-20'/%3E%3Ccircle cx='20' cy='20' r='2'/%3E%3Ccircle cx='60' cy='20' r='2'/%3E%3Ccircle cx='20' cy='60' r='2'/%3E%3Ccircle cx='60' cy='60' r='2'/%3E%3Ccircle cx='40' cy='40' r='3'/%3E%3C/g%3E%3C/svg%3E")`;

// Intelligence category data for preview
const intelligenceCategories = [
  { label: 'WHO YOU ARE', progress: 70, checks: 2 },
  { label: 'WHAT YOU OFFER', progress: 80, checks: 2 },
  { label: 'BUYER REALITY', progress: 65, checks: 2 },
  { label: 'PROOF', progress: 75, checks: 1 },
];

const previewTags = ['B2B SaaS', 'Product-led', 'Series A', 'Dev Tools'];

export function DemoPreviewWidget({ onActivate, onInputFocus }: DemoPreviewWidgetProps) {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = useCallback(() => {
    onActivate();
  }, [onActivate]);

  const handleInputFocus = useCallback(() => {
    onInputFocus();
  }, [onInputFocus]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onActivate();
  };

  return (
    <section 
      className="relative py-24 overflow-hidden"
      style={{ background: '#0a0a0f' }}
    >
      {/* Circuit pattern layer */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{ 
          backgroundImage: circuitPatternSvg,
          backgroundSize: '80px 80px',
          opacity: 0.6
        }}
      />
      
      {/* Rear projection glow */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{
          width: '1000px',
          height: '700px',
          background: 'radial-gradient(ellipse at center, rgba(6, 182, 212, 0.12) 0%, rgba(139, 92, 246, 0.08) 35%, transparent 65%)',
          filter: 'blur(60px)',
        }}
      />

      {/* Section header */}
      <div className="relative z-10 text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
          Try the Strategy Session
        </h2>
        <p className="text-slate-400 text-lg max-w-xl mx-auto">
          See how AI uncovers your positioning in real-time
        </p>
      </div>

      {/* Miniature Preview Widget */}
      <div className="relative z-10 max-w-[920px] mx-auto px-6">
        <motion.div
          onClick={handleClick}
          className="relative rounded-2xl overflow-hidden cursor-pointer group"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          whileHover={{ scale: 1.005 }}
          transition={{ duration: 0.4 }}
          style={{
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(139, 92, 246, 0.15))',
            padding: '2px',
          }}
        >
          {/* Animated border glow on hover */}
          <div 
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.4), rgba(139, 92, 246, 0.4))',
              filter: 'blur(20px)',
            }}
          />
          
          {/* Inner container */}
          <div className="relative bg-slate-950 rounded-2xl overflow-hidden">
            <div className="flex">
              {/* Left Panel - Chat (scaled down feel) */}
              <div className="flex-1 bg-slate-950 p-5 min-h-[420px] flex flex-col border-r border-slate-800/50">
                {/* AI Avatar + Label */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-slate-300" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">PageConsult AI</div>
                    <div className="text-xs text-slate-500">Strategy Consultant</div>
                  </div>
                </div>
                
                {/* Single chat bubble */}
                <div className="flex-1">
                  <div className="bg-slate-800/60 rounded-2xl rounded-tl-md px-4 py-3 max-w-[90%]">
                    <p className="text-slate-200 text-sm leading-relaxed">
                      Tell me about your business — who do you help and what do you do for them?
                    </p>
                  </div>
                </div>
                
                {/* Input field */}
                <form onSubmit={handleSubmit} className="mt-auto pt-4">
                  <div className="relative">
                    <Input
                      ref={inputRef}
                      type="text"
                      value={inputValue}
                      onChange={(e) => {
                        e.stopPropagation();
                        setInputValue(e.target.value);
                      }}
                      onFocus={(e) => {
                        e.stopPropagation();
                        handleInputFocus();
                      }}
                      onClick={(e) => e.stopPropagation()}
                      placeholder="Type your response..."
                      className="w-full px-4 py-3 pr-12 bg-slate-800/50 border-slate-700/50 rounded-xl text-white placeholder:text-slate-500 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10 text-sm"
                    />
                    <Button
                      type="submit"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 p-0 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-lg"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Send className="w-4 h-4 text-white" />
                    </Button>
                  </div>
                </form>
              </div>
              
              {/* Right Panel - Intelligence (dense, info-rich) */}
              <div className="w-[340px] bg-slate-900/60 p-5 flex-shrink-0">
                {/* Score header */}
                <div className="text-center mb-5">
                  <div className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
                    72<span className="text-2xl text-slate-500">/100</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1 uppercase tracking-wider">
                    Intelligence Score
                  </div>
                </div>
                
                {/* Main progress bar */}
                <div className="mb-6">
                  <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-violet-500"
                      style={{ width: '72%' }}
                    />
                  </div>
                </div>
                
                {/* Category sections */}
                <div className="space-y-4">
                  {intelligenceCategories.map((category, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                          {category.label}
                        </span>
                        <div className="flex gap-1">
                          {Array.from({ length: category.checks }).map((_, i) => (
                            <div key={i} className="w-4 h-4 rounded bg-emerald-500/20 flex items-center justify-center">
                              <Check className="w-2.5 h-2.5 text-emerald-400" />
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-gradient-to-r from-cyan-500/70 to-violet-500/70"
                          style={{ width: `${category.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Tags */}
                <div className="mt-6 pt-5 border-t border-slate-800/50">
                  <div className="flex flex-wrap gap-2">
                    {previewTags.map((tag, index) => (
                      <span 
                        key={index}
                        className="px-2.5 py-1 bg-slate-800/80 border border-slate-700/50 rounded-full text-xs text-slate-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Demo badge */}
                <div className="mt-5 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-cyan-500/10 to-violet-500/10 border border-cyan-500/20">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-xs font-medium text-cyan-300">Click to try live demo</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Hint text */}
        <p className="text-center text-slate-600 text-sm mt-6">
          Click anywhere on the widget or start typing to begin
        </p>
      </div>
    </section>
  );
}
