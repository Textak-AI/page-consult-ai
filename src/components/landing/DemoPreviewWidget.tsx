import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CircuitGridBackground } from './CircuitGridBackground';

interface DemoPreviewWidgetProps {
  onActivate: () => void;
  onInputFocus: () => void;
}

// Intelligence category data - ALL ZEROED for preview
const intelligenceCategories = [
  { label: 'WHO YOU ARE', score: 0, max: 25, color: 'cyan' },
  { label: 'WHAT YOU OFFER', score: 0, max: 25, color: 'violet' },
  { label: 'BUYER REALITY', score: 0, max: 25, color: 'emerald' },
  { label: 'PROOF & CREDIBILITY', score: 0, max: 25, color: 'amber' },
];

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
      {/* Animated Circuit Grid Background */}
      <CircuitGridBackground />

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
      <div className="relative z-10 max-w-4xl mx-auto px-6">
        <motion.div
          onClick={handleClick}
          className="relative rounded-2xl overflow-hidden cursor-pointer group"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.4 }}
        >
          {/* Outer frame with gradient border */}
          <div 
            className="absolute inset-0 rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(139, 92, 246, 0.2))',
              padding: '1px',
            }}
          />
          
          {/* Animated border glow on hover */}
          <div 
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.4), rgba(139, 92, 246, 0.4))',
              filter: 'blur(20px)',
            }}
          />
          
          {/* Inner container */}
          <div className="relative bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-800/50 overflow-hidden shadow-2xl shadow-violet-500/5">
            {/* Subtle inner glow at top */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
            
            {/* Two-panel grid */}
            <div className="grid md:grid-cols-2 divide-x divide-slate-800/50">
              
              {/* Left Panel - Chat */}
              <div className="p-6 min-h-[380px] flex flex-col">
                {/* AI Avatar + Label */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-slate-300" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">PageConsult AI</div>
                    <div className="text-xs text-slate-500">Strategy Consultant</div>
                  </div>
                </div>
                
                {/* Single chat bubble */}
                <div className="flex-1">
                  <div className="bg-slate-800/60 rounded-2xl rounded-tl-md px-4 py-3 max-w-[95%]">
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
              
              {/* Right Panel - Intelligence Profile (ZEROED) */}
              <div className="p-6 bg-slate-900/50 flex flex-col">
                {/* Score header */}
                <div className="mb-5">
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">Intelligence Profile</span>
                    <span className="text-slate-500 text-sm font-medium">0<span className="text-slate-600">/100</span></span>
                  </div>
                  {/* Main progress bar - empty */}
                  <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    {/* Ghost gradient hint at 2% opacity */}
                    <div 
                      className="h-full w-full rounded-full"
                      style={{ 
                        background: 'linear-gradient(to right, rgba(6, 182, 212, 0.02), rgba(139, 92, 246, 0.02))',
                      }}
                    />
                  </div>
                </div>
                
                {/* Category sections - all zeroed */}
                <div className="space-y-4 flex-1">
                  {intelligenceCategories.map((category, index) => (
                    <div key={index} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                          {category.label}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          {category.score}/{category.max}
                        </span>
                      </div>
                      {/* Empty progress bar track */}
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        {/* Very faint ghost of where color will appear */}
                        <div 
                          className="h-full rounded-full"
                          style={{ 
                            width: '100%',
                            background: category.color === 'cyan' 
                              ? 'rgba(6, 182, 212, 0.02)'
                              : category.color === 'violet'
                              ? 'rgba(139, 92, 246, 0.02)'
                              : category.color === 'emerald'
                              ? 'rgba(16, 185, 129, 0.02)'
                              : 'rgba(245, 158, 11, 0.02)',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Empty state message */}
                <div className="mt-6 pt-4 border-t border-slate-800/50 text-center">
                  <p className="text-xs text-slate-500 italic">
                    Ready to capture your business intelligence
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Call to action below */}
        <p className="text-center mt-6 text-slate-500 text-sm">
          <span className="text-cyan-400">✦</span> Click anywhere to start your strategy session
        </p>
      </div>
    </section>
  );
}
