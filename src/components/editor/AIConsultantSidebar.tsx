import { useState, useRef, useEffect } from "react";
import { X, Send, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AIConsultantSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  pageContent: {
    headline?: string;
    subheadline?: string;
    features?: Array<{ title: string; description: string }>;
    cta?: string;
    industry?: string;
    serviceType?: string;
    targetAudience?: string;
  };
  onApplySuggestion?: (suggestion: any) => void;
}

export function AIConsultantSidebar({ 
  isOpen, 
  onClose, 
  pageContent,
  onApplySuggestion 
}: AIConsultantSidebarProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Start with initial analysis
      analyzePageContent('analyze');
    }
  }, [isOpen]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const analyzePageContent = async (action: string) => {
    setIsLoading(true);
    setShowQuickActions(false);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-consultant`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            messages: [],
            pageContent,
            action,
          }),
        }
      );

      if (!response.ok || !response.body) {
        throw new Error('Failed to start AI consultation');
      }

      await streamResponse(response.body);
    } catch (error) {
      console.error('Error analyzing page:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again in a moment."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);
    setShowQuickActions(false);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-consultant`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            messages: [...messages, { role: 'user', content: userMessage }],
            pageContent,
          }),
        }
      );

      if (!response.ok || !response.body) {
        throw new Error('Failed to get AI response');
      }

      await streamResponse(response.body);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I encountered an error. Please try again."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const streamResponse = async (body: ReadableStream<Uint8Array>) => {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";
    let assistantMessage = "";
    let streamDone = false;

    // Add empty assistant message that we'll update
    setMessages(prev => [...prev, { role: "assistant", content: "" }]);

    while (!streamDone) {
      const { done, value } = await reader.read();
      if (done) break;

      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") {
          streamDone = true;
          break;
        }

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            assistantMessage += content;
            // Update the last message with accumulated content
            setMessages(prev => {
              const newMessages = [...prev];
              newMessages[newMessages.length - 1] = {
                role: "assistant",
                content: assistantMessage
              };
              return newMessages;
            });
          }
        } catch {
          // Incomplete JSON, put it back
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }
  };

  const handleQuickAction = (action: string) => {
    analyzePageContent(action);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 h-screen w-96 bg-card border-l border-border shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">AI Copywriting Consultant</h3>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                "flex",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-lg px-4 py-2 text-sm",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg px-4 py-3">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            </div>
          )}

          {/* Quick Actions */}
          {showQuickActions && messages.length > 0 && !isLoading && (
            <div className="space-y-2 pt-4">
              <p className="text-xs text-muted-foreground text-center mb-3">
                What would you like me to help improve?
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction('improve_headline')}
                  className="text-xs"
                >
                  Headline
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction('improve_features')}
                  className="text-xs"
                >
                  Features
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction('improve_cta')}
                  className="text-xs"
                >
                  CTA
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction('add_social_proof')}
                  className="text-xs"
                >
                  Social Proof
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction('general_review')}
                  className="col-span-2 text-xs"
                >
                  General Review
                </Button>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Ask me anything about improving your page..."
            className="min-h-[60px] resize-none"
            disabled={isLoading}
          />
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}