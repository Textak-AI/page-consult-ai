import React from 'react';
import { Bot } from 'lucide-react';

const TypingIndicator = () => {
  return (
    <div className="flex gap-3 justify-start animate-fade-in">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center">
        <Bot className="h-4 w-4 text-cyan-400" />
      </div>
      
      <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex gap-1.5">
          <span className="w-2 h-2 bg-cyan-400/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-cyan-400/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 bg-cyan-400/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
