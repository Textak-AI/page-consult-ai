import React, { useState } from 'react';
import { Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  const [showTimestamp, setShowTimestamp] = useState(false);
  const isAssistant = message.role === 'assistant';

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div
      className={cn(
        'flex gap-3 animate-fade-in',
        isAssistant ? 'justify-start' : 'justify-end'
      )}
      onMouseEnter={() => setShowTimestamp(true)}
      onMouseLeave={() => setShowTimestamp(false)}
    >
      {isAssistant && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center">
          <Bot className="h-4 w-4 text-cyan-400" />
        </div>
      )}
      
      <div className="flex flex-col max-w-[80%] sm:max-w-[70%]">
        <div
          className={cn(
            'px-4 py-3 rounded-2xl',
            isAssistant
              ? 'bg-white/10 backdrop-blur-sm border border-white/10 text-white rounded-tl-sm'
              : 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-tr-sm'
          )}
        >
          <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
        </div>
        
        <span
          className={cn(
            'text-xs text-white/40 mt-1 transition-opacity duration-200',
            showTimestamp ? 'opacity-100' : 'opacity-0',
            isAssistant ? 'text-left' : 'text-right'
          )}
        >
          {formatTime(message.timestamp)}
        </span>
      </div>

      {!isAssistant && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
          <User className="h-4 w-4 text-white" />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
