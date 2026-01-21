import { useState, useRef, useEffect } from "react";
import { X, Send, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export interface SuggestionData {
  id: string;
  type: 'headline' | 'subheadline' | 'cta' | 'feature' | 'proof' | 'description';
  sectionId?: string;
  field: string;
  currentValue: string;
  suggestedValue: string;
  label: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  suggestion?: SuggestionData;
}

interface StrategyConsultantOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  onApplySuggestion?: (sectionId: string, field: string, value: string) => void;
}

// Helper to infer section from suggestion type
const inferSectionFromType = (type: string): string => {
  switch (type) {
    case 'headline':
    case 'subheadline':
      return 'hero';
    case 'cta':
      return 'final-cta';
    case 'proof':
      return 'social-proof';
    case 'feature':
      return 'features';
    case 'description':
      return 'problem-solution';
    default:
      return 'hero';
  }
};

export function StrategyConsultantOverlay({
  isOpen,
  onClose,
  messages,
  onSendMessage,
  isLoading = false,
  onApplySuggestion,
}: StrategyConsultantOverlayProps) {
  const [input, setInput] = useState("");
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim());
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // Auto-resize
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 72) + "px";
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.95 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className={cn(
            "fixed bottom-24 right-6 z-50",
            "w-full max-w-[420px] min-h-[400px] max-h-[70vh]",
            "bg-slate-900/95 backdrop-blur-xl",
            "border border-slate-700/50",
            "rounded-t-2xl rounded-bl-2xl",
            "shadow-2xl",
            "flex flex-col",
            "sm:w-[420px]",
            // Mobile: full width bottom sheet
            "max-sm:left-0 max-sm:right-0 max-sm:bottom-0 max-sm:max-w-none max-sm:rounded-t-2xl max-sm:rounded-b-none"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <h3 className="font-semibold text-white">Strategy Consultant</h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "flex",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-xl px-4 py-2.5",
                    message.role === "user"
                      ? "bg-purple-600/30 text-white"
                      : "bg-slate-800/50 text-slate-100"
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  
                  {/* Suggestion Card */}
                  {message.suggestion && (() => {
                    const suggestion = message.suggestion;
                    const isApplied = appliedSuggestions.has(suggestion.id);
                    const sectionId = suggestion.sectionId || inferSectionFromType(suggestion.type);
                    
                    const handleApply = () => {
                      if (isApplied || !onApplySuggestion) return;
                      
                      // Call the apply handler
                      onApplySuggestion(sectionId, suggestion.field, suggestion.suggestedValue);
                      
                      // Mark as applied
                      setAppliedSuggestions(prev => new Set([...prev, suggestion.id]));
                      
                      // Show toast
                      toast({
                        title: "Applied!",
                        description: `Updated ${suggestion.field} in ${sectionId}`,
                      });
                    };
                    
                    return (
                      <div
                        onClick={handleApply}
                        className={cn(
                          "mt-3 p-3 rounded-lg border cursor-pointer transition-all duration-200",
                          isApplied 
                            ? "bg-green-500/10 border-green-500/30"
                            : "bg-slate-700/50 border-slate-600/50 hover:bg-slate-600/50 hover:border-purple-500/50 hover:scale-[1.01]"
                        )}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-purple-400">
                            {suggestion.label || `Improve ${suggestion.field}`}
                          </span>
                          {isApplied ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : (
                            <Sparkles className="w-4 h-4 text-purple-400" />
                          )}
                        </div>
                        <p className="text-sm text-white">"{suggestion.suggestedValue}"</p>
                        {isApplied && (
                          <p className="text-xs text-green-400 mt-1">Applied ✓</p>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </motion.div>
            ))}

            {/* Typing Indicator */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-slate-800/50 rounded-xl px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="px-4 py-3 border-t border-slate-700/50">
            <div className="flex gap-2 items-end">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                placeholder="Ask about your page strategy..."
                disabled={isLoading}
                rows={1}
                className={cn(
                  "flex-1 resize-none",
                  "bg-slate-800/50 border border-slate-700/50 rounded-xl",
                  "px-4 py-2.5 text-sm text-white placeholder:text-slate-500",
                  "focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50",
                  "disabled:opacity-50",
                  "min-h-[40px] max-h-[72px]"
                )}
              />
              <Button
                onClick={handleSubmit}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="h-10 w-10 bg-gradient-to-br from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 rounded-xl shrink-0"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
