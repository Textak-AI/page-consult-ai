import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Send, 
  Minimize2, 
  Maximize2,
  X,
  Sparkles,
  Check,
  Loader2,
  Lightbulb,
  Target,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { CompletenessState } from '@/lib/pageCompleteness';

interface Message {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp: Date;
  actions?: ActionButton[];
  options?: OptionButton[];
}

interface ActionButton {
  id: string;
  label: string;
  section: string;
  field: string;
  value: string;
  reasoning?: string;
  applied?: boolean;
}

interface OptionButton {
  id: string;
  label: string;
  preview: string;
  value: string;
  reasoning: string;
  section: string;
  field: string;
  selected?: boolean;
}

interface ConsultantChatProps {
  consultationData: any;
  sections: any[];
  completeness: CompletenessState;
  onApplyChange: (section: string, field: string, value: string) => void;
  className?: string;
}

export function ConsultantChat({
  consultationData,
  sections,
  completeness,
  onApplyChange,
  className
}: ConsultantChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const companyName = consultationData?.companyName || consultationData?.businessName || 'your business';

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Initial analysis
  useEffect(() => {
    if (isOpen && !hasInitialized && messages.length === 0) {
      generateInitialAnalysis();
      setHasInitialized(true);
    }
  }, [isOpen, hasInitialized, messages.length]);

  // Focus input
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const generateInitialAnalysis = async () => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('consultant-chat', {
        body: {
          type: 'initial_analysis',
          consultationData,
          sections,
          completeness
        }
      });

      if (error) throw error;
      
      setMessages([{
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.content,
        timestamp: new Date(),
        actions: data.actions,
        options: data.options
      }]);
    } catch (error) {
      console.error('Initial analysis error:', error);
      setMessages([{
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `Hey! I've been reviewing the ${companyName} page. You're at ${completeness.score}% page strength — ${completeness.score >= 75 ? "that's solid foundation to work with" : "let's get this higher together"}. What would you like to focus on first?`,
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('consultant-chat', {
        body: {
          type: 'message',
          message: content,
          consultationData,
          sections,
          completeness,
          history: messages.slice(-10).map(m => ({ role: m.role, content: m.content }))
        }
      });

      if (error) throw error;
      
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.content,
        timestamp: new Date(),
        actions: data.actions,
        options: data.options
      }]);
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Connection issue. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = (action: ActionButton) => {
    onApplyChange(action.section, action.field, action.value);
    
    setMessages(prev => prev.map(msg => ({
      ...msg,
      actions: msg.actions?.map(a => 
        a.id === action.id ? { ...a, applied: true } : a
      )
    })));

    toast.success('Change applied', {
      description: `Updated ${action.field} in ${action.section}`
    });
  };

  const handleOption = (option: OptionButton, messageId: string) => {
    onApplyChange(option.section, option.field, option.value);
    
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, options: msg.options?.map(o => ({ ...o, selected: o.id === option.id })) }
        : msg
    ));

    // Add follow-up
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `Great choice. ${option.reasoning} What's next on your mind?`,
        timestamp: new Date()
      }]);
    }, 500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  // Strategic prompts (not generic)
  const strategicPrompts = [
    { 
      icon: <Sparkles className="w-3.5 h-3.5" />, 
      label: "Sharpen my headline", 
      prompt: "I want a headline that stops my ideal customer in their tracks. Can you look at what I have and suggest something stronger?" 
    },
    { 
      icon: <Target className="w-3.5 h-3.5" />, 
      label: "Find my angle", 
      prompt: "What's the most compelling angle for this page? What should I lead with?" 
    },
    { 
      icon: <TrendingUp className="w-3.5 h-3.5" />, 
      label: "What's missing?", 
      prompt: "What's the biggest gap in this page right now? What would make the biggest difference?" 
    },
  ];

  // Closed state - premium floating button
  if (!isOpen) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={cn("fixed bottom-6 right-6 z-50", className)}
      >
        <Button
          onClick={() => setIsOpen(true)}
          className={cn(
            "h-14 px-5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700",
            "text-white shadow-lg shadow-purple-500/25 rounded-full",
            "border border-purple-400/20"
          )}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-sm font-semibold">Strategy Consultant</div>
              <div className="text-[10px] text-white/70">Let's build this together</div>
            </div>
          </div>
        </Button>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        className={cn(
          "fixed bottom-6 right-6 z-50",
          isExpanded ? "w-[480px] h-[600px]" : "w-[400px] h-[500px]",
          "bg-background/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-border/50",
          "flex flex-col overflow-hidden transition-all duration-300",
          className
        )}
      >
        {/* Premium Header */}
        <div className="p-4 border-b border-border/50 bg-gradient-to-r from-purple-600/10 to-indigo-600/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="h-10 w-10 border-2 border-purple-500/30">
                  <AvatarFallback className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white font-bold text-sm">
                    PC
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-background" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">PageConsult Strategist</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400">
                    {completeness.score}% strength
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Your co-producer on {companyName}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                )}
              >
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0">
                    <Avatar className="h-8 w-8 border border-purple-500/30">
                      <AvatarFallback className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white text-xs font-bold">
                        PC
                      </AvatarFallback>
                    </Avatar>
                  </div>
                )}
                
                <div className={cn(
                  "flex flex-col gap-2 max-w-[85%]",
                  message.role === 'user' ? 'items-end' : 'items-start'
                )}>
                  <div className={cn(
                    "rounded-2xl px-4 py-2.5 text-sm",
                    message.role === 'user' 
                      ? 'bg-purple-600 text-white rounded-br-md' 
                      : 'bg-muted rounded-bl-md'
                  )}>
                    <div className="whitespace-pre-wrap leading-relaxed">
                      {message.content}
                    </div>
                  </div>
                  
                  {/* Action Buttons - Premium Style */}
                  {message.actions && message.actions.length > 0 && (
                    <div className="space-y-2 w-full">
                      {message.actions.map((action) => (
                        <button
                          key={action.id}
                          className={cn(
                            "w-full p-3 rounded-xl text-left transition-all",
                            action.applied 
                              ? "bg-green-500/10 border border-green-500/30" 
                              : "bg-purple-500/10 border border-purple-500/30 hover:bg-purple-500/20 cursor-pointer"
                          )}
                          onClick={() => !action.applied && handleAction(action)}
                          disabled={action.applied}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-purple-400">
                              {action.applied ? '✓ Applied' : action.label}
                            </span>
                            {!action.applied && (
                              <Sparkles className="w-3 h-3 text-purple-400" />
                            )}
                          </div>
                          <div className="text-sm text-foreground/80 line-clamp-2">
                            {action.value}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Option Cards - For Multiple Choices */}
                  {message.options && message.options.length > 0 && (
                    <div className="grid gap-2 w-full">
                      {message.options.map((option) => (
                        <button
                          key={option.id}
                          className={cn(
                            "p-3 rounded-xl text-left transition-all border",
                            option.selected
                              ? "bg-green-500/10 border-green-500/30"
                              : "bg-muted/50 border-border/50 hover:border-purple-500/50 hover:bg-purple-500/5 cursor-pointer"
                          )}
                          onClick={() => !option.selected && handleOption(option, message.id)}
                          disabled={option.selected}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-foreground">
                              {option.label}
                            </span>
                            {option.selected && <Check className="w-4 h-4 text-green-500" />}
                          </div>
                          <p className="text-sm text-foreground/90 mb-1">{option.preview}</p>
                          <p className="text-xs text-muted-foreground">{option.reasoning}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <Avatar className="h-8 w-8 border border-purple-500/30">
                    <AvatarFallback className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white text-xs font-bold">
                      PC
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span>Thinking strategically...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Strategic Prompts */}
        {messages.length <= 1 && !isLoading && (
          <div className="px-4 pb-2">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
              Quick starts
            </div>
            <div className="flex flex-wrap gap-2">
              {strategicPrompts.map((prompt, i) => (
                <Button
                  key={i}
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs gap-1.5 rounded-full border-purple-500/30 hover:bg-purple-500/10 hover:border-purple-500/50"
                  onClick={() => sendMessage(prompt.prompt)}
                >
                  {prompt.icon}
                  {prompt.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Premium Input Area */}
        <div className="p-4 border-t border-border/50 bg-muted/30">
          <div className="relative">
            <div className="relative">
              <Textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="What would you like to work on?"
                className="min-h-[44px] max-h-32 pr-12 resize-none rounded-xl border-muted-foreground/20 focus:border-purple-400"
                rows={1}
                disabled={isLoading}
              />
              <Button 
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isLoading}
                size="icon"
                className={cn(
                  "absolute right-1.5 bottom-1.5 h-8 w-8 rounded-lg transition-all",
                  input.trim() 
                    ? "bg-purple-600 hover:bg-purple-700 text-white" 
                    : "bg-muted text-muted-foreground"
                )}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
          <div className="text-[10px] text-muted-foreground mt-2 text-center">
            Press Enter to send • Shift+Enter for new line
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
