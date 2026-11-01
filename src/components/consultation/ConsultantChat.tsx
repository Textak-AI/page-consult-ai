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
  Plus,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { CompletenessState } from '@/lib/pageCompleteness';
import { isLimitReached, LIMIT_REACHED_MESSAGE } from '@/lib/limitReached';
import { announceUsageChanged } from '@/hooks/useAIActions';
import { ADDABLE_SECTION_TYPES, buildSectionContent } from '@/lib/editor/sectionFactory';
import { describeOp, previewOf } from '@/lib/editor/pageChatOps';
import { CHAT_ADDABLE_TYPES, type PageChatOperation } from '../../../supabase/functions/_shared/pageChat';

interface Message {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp: Date;
  operations?: PageChatOperation[];
  applied?: boolean;
}

interface ConsultantChatProps {
  consultationData: any;
  sections: any[];
  completeness: CompletenessState;
  /** Structured strategy brief, so added sections start from the owner's own words. */
  brief?: unknown;
  titleFor: (type: string) => string;
  /** Set when a section's AI button is clicked: open, scoped to that section. */
  focus?: { index: number; type: string; nonce: number; prefill?: string } | null;
  onApplyOperations: (operations: PageChatOperation[]) => void;
  /** Reports the open panel's width (0 when closed) so the editor can make room for it. */
  onDockWidth?: (px: number) => void;
  className?: string;
}

// Plumbing and design never go to the model; only what the owner told us.
const OWNER_INPUT_EXCLUDE = /brief|websiteIntelligence|designIntelligence|aiSeo|ai_seo|brand|image|logo|color|font|classification|draft|conversation|history|id$/i;
function ownerInputOf(data: any): Record<string, unknown> {
  if (!data || typeof data !== 'object') return {};
  return Object.fromEntries(Object.entries(data).filter(([k, v]) => !OWNER_INPUT_EXCLUDE.test(k) && v !== null && v !== '' && typeof v !== 'function'));
}

const CHAT_ADDABLE = ADDABLE_SECTION_TYPES
  .filter((t) => (CHAT_ADDABLE_TYPES as readonly string[]).includes(t.type))
  .map((t) => ({ type: t.type, label: t.label, description: t.description, shape: buildSectionContent(t.type, null) }));

export function ConsultantChat({
  consultationData,
  sections,
  completeness,
  brief,
  titleFor,
  focus,
  onApplyOperations,
  onDockWidth,
  className
}: ConsultantChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  // Panel width + its 24px gutter, so the page you are editing stays visible beside it.
  useEffect(() => { onDockWidth?.(isOpen ? (isExpanded ? 480 : 400) + 24 : 0); }, [isOpen, isExpanded, onDockWidth]);
  useEffect(() => () => onDockWidth?.(0), [onDockWidth]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // Visible progress while the reply is written: elapsed seconds, so a
  // 15-20 s wait reads as work in progress rather than a stall.
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!isLoading) { setElapsed(0); return; }
    const started = Date.now();
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - started) / 1000)), 1000);
    return () => clearInterval(t);
  }, [isLoading]);
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

  // Opening line is static: every chat turn costs an action, so nothing runs until the owner asks.
  useEffect(() => {
    if (isOpen && !hasInitialized && messages.length === 0) {
      setMessages([{
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `Tell me what to change on the ${companyName} page — rewrite a section, or add a new one. I'll show you the changes before anything is applied, and I'll ask when I need a fact you haven't given me.`,
        timestamp: new Date(),
      }]);
      setHasInitialized(true);
    }
  }, [isOpen, hasInitialized, messages.length]);

  // A section's AI button: open the chat scoped to that section.
  const [focusIndex, setFocusIndex] = useState<number | null>(null);
  useEffect(() => {
    if (!focus) return;
    setIsOpen(true);
    setFocusIndex(focus.index);
    setInput(prev => prev.trim() ? prev : (focus.prefill || ''));
    setTimeout(() => inputRef.current?.focus(), 150);
  }, [focus?.nonce]);

  // Focus input
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

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
      const { data, error } = await supabase.functions.invoke('page-chat', {
        body: {
          message: content.trim(),
          history: messages.slice(-10).map(m => ({ role: m.role, content: m.content })),
          sections: sections.map((s: any) => ({ type: s.type, content: s.content })),
          addable: CHAT_ADDABLE,
          brief: brief ?? null,
          ownerInput: ownerInputOf(consultationData),
          businessName: consultationData?.businessName || consultationData?.companyName || '',
          focusIndex,
        }
      });

      announceUsageChanged();
      if (isLimitReached(error)) throw new Error(LIMIT_REACHED_MESSAGE);
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Chat failed');

      const operations: PageChatOperation[] = Array.isArray(data.operations) ? data.operations : [];
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.reply || (operations.length ? 'Here are the changes.' : 'Can you tell me a bit more?'),
        timestamp: new Date(),
        operations,
      }]);
    } catch (error) {
      console.error('🔴 [PageChat] error:', error);
      toast.error(error instanceof Error && error.message === LIMIT_REACHED_MESSAGE ? LIMIT_REACHED_MESSAGE : 'Connection issue. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const applyMessage = (message: Message) => {
    if (!message.operations?.length || message.applied) return;
    onApplyOperations(message.operations);
    setMessages(prev => prev.map(m => m.id === message.id ? { ...m, applied: true } : m));
    toast.success('Applied to your page', { description: 'Undo reverts it. Replace anything in [brackets] with your own words.' });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  // Quick starts: each one is a real edit or add the chat can carry out.
  const strategicPrompts = [
    { icon: <Sparkles className="w-3.5 h-3.5" />, label: "Sharpen my headline", prompt: "Rewrite my hero headline so it lands harder with my ideal customer. Use only what I've told you." },
    { icon: <Plus className="w-3.5 h-3.5" />, label: "Add an FAQ", prompt: "Add an FAQ section built from my answers and brief." },
    { icon: <Target className="w-3.5 h-3.5" />, label: "Tighten every section", prompt: "Tighten the copy in my problem and features sections: shorter sentences, same facts." },
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
              <div className="text-sm font-semibold">Page Chat</div>
              <div className="text-[10px] text-white/70">Edit or add sections</div>
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
                <Avatar className="h-10 w-10 border-2 border-cyan-500/30">
                  <AvatarFallback className="bg-slate-900"><img src="/brand/pageconsult-icon.svg" alt="PageConsult" className="h-[62%] w-[62%] object-contain" /></AvatarFallback>
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
                  Edits and new sections for {companyName}
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
                    <Avatar className="h-8 w-8 border border-cyan-500/30">
                      <AvatarFallback className="bg-slate-900"><img src="/brand/pageconsult-icon.svg" alt="PageConsult" className="h-[62%] w-[62%] object-contain" /></AvatarFallback>
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
                  
                  {/* Proposed changes: reviewed, then applied together */}
                  {message.operations && message.operations.length > 0 && (
                    <div className={cn(
                      "w-full rounded-xl border p-3 space-y-2",
                      message.applied ? "bg-green-500/10 border-green-500/30" : "bg-purple-500/10 border-purple-500/30"
                    )}>
                      {message.operations.map((op, i) => (
                        <div key={i} className="text-sm">
                          <div className="text-xs font-medium text-purple-400">{describeOp(op, sections, titleFor)}</div>
                          <div className="text-foreground/80 line-clamp-2">{previewOf(op.content)}</div>
                        </div>
                      ))}
                      <Button
                        size="sm"
                        className="w-full h-8 bg-purple-600 hover:bg-purple-700 text-white"
                        disabled={message.applied}
                        onClick={() => applyMessage(message)}
                      >
                        {message.applied ? <><Check className="w-3.5 h-3.5 mr-1" />Applied</> : `Apply ${message.operations.length === 1 ? 'change' : `${message.operations.length} changes`}`}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <Avatar className="h-8 w-8 border border-cyan-500/30">
                    <AvatarFallback className="bg-slate-900"><img src="/brand/pageconsult-icon.svg" alt="PageConsult" className="h-[62%] w-[62%] object-contain" /></AvatarFallback>
                  </Avatar>
                </div>
                <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span aria-live="polite">
                      Reading your page and writing changes · {elapsed}s
                      <span className="block text-xs opacity-80">Usually 15 to 20 seconds. Every line is checked against your answers before you see it.</span>
                    </span>
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
          {focusIndex !== null && sections[focusIndex] && (
            <div className="mb-2 flex items-center gap-2 text-xs">
              <span className="px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-cyan-500/30">
                About: {titleFor(sections[focusIndex].type)}
              </span>
              <button className="text-muted-foreground hover:text-foreground" onClick={() => setFocusIndex(null)} aria-label="Clear section focus">Clear</button>
            </div>
          )}
          <div className="relative">
            <div className="relative">
              <Textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={focusIndex !== null ? "What should change in this section?" : "e.g. Add a section on who this is for"}
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
