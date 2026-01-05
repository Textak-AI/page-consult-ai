import { useCompanion } from '@/contexts/CompanionContext';
import { MessageCircle, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CompanionHeaderProps {
  isExpanded: boolean;
}

export function CompanionHeader({ isExpanded }: CompanionHeaderProps) {
  const { state, toggle } = useCompanion();
  
  const latestMessage = state.messages[state.messages.length - 1];
  const latestAIMessage = [...state.messages].reverse().find(m => m.role === 'assistant');

  return (
    <button
      onClick={toggle}
      className={cn(
        "w-full flex items-center justify-between px-4 py-3",
        "text-left transition-colors",
        isExpanded 
          ? "border-b border-slate-700/50" 
          : "hover:bg-slate-800/50"
      )}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="relative shrink-0">
          <MessageCircle className="w-5 h-5 text-cyan-400" />
          {state.hasUnread && !isExpanded && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-cyan-500 rounded-full animate-pulse" />
          )}
        </div>
        
        <div className="min-w-0 flex-1">
          <span className="text-cyan-400 font-medium text-sm">PageConsult AI</span>
          {!isExpanded && latestAIMessage && (
            <span className="text-slate-400 text-sm ml-2 truncate inline-block max-w-[300px] md:max-w-[500px]">
              "{latestAIMessage.content}"
            </span>
          )}
        </div>
      </div>
      
      <div className="shrink-0 ml-2 text-slate-400">
        {isExpanded ? (
          <ChevronDown className="w-5 h-5" />
        ) : (
          <ChevronUp className="w-5 h-5" />
        )}
      </div>
    </button>
  );
}
