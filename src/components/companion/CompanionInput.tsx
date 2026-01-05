import { useState, KeyboardEvent } from 'react';
import { useCompanion } from '@/contexts/CompanionContext';
import { SCREEN_BEHAVIORS } from '@/lib/companionScreenContext';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function CompanionInput() {
  const { state, sendMessage, collapse } = useCompanion();
  const [input, setInput] = useState('');
  
  const behavior = SCREEN_BEHAVIORS[state.currentScreen];
  
  if (!behavior.allowChat) {
    return null;
  }

  const handleSend = () => {
    if (input.trim() && !state.isProcessing) {
      sendMessage(input);
      setInput('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === 'Escape') {
      collapse();
    }
  };

  return (
    <div className="p-3 border-t border-slate-700/50 bg-slate-900/50">
      <div className="flex items-end gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={behavior.inputPlaceholder}
          disabled={state.isProcessing}
          rows={1}
          className={cn(
            "flex-1 resize-none bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5",
            "text-sm text-slate-100 placeholder:text-slate-500",
            "focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "min-h-[40px] max-h-[100px]"
          )}
          style={{ 
            height: 'auto',
            overflow: input.split('\n').length > 3 ? 'auto' : 'hidden'
          }}
        />
        <Button
          onClick={handleSend}
          disabled={!input.trim() || state.isProcessing}
          size="icon"
          className="h-10 w-10 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl shrink-0"
        >
          {state.isProcessing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
