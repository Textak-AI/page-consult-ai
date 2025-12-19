import { useState } from "react";
import { Sparkles, Send, RotateCcw, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";

interface SectionAIChatProps {
  isOpen: boolean;
  onClose: () => void;
  sectionType: string;
  sectionContent: any;
  strategyBrief?: any;
  onApplyChanges: (newContent: any) => void;
}

const QUICK_ACTIONS = [
  { label: "Make shorter", prompt: "Make this more concise while keeping the key message." },
  { label: "Make punchier", prompt: "Make this more energetic with stronger verbs and action-oriented language." },
  { label: "Add detail", prompt: "Add more specific details and examples to make this more compelling." },
  { label: "More professional", prompt: "Adjust the tone to be more formal and professional." },
  { label: "Focus on benefits", prompt: "Focus more on customer benefits and outcomes rather than features." },
  { label: "Add urgency", prompt: "Add more urgency and a stronger call to action." },
];

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function SectionAIChat({
  isOpen,
  onClose,
  sectionType,
  sectionContent,
  strategyBrief,
  onApplyChanges,
}: SectionAIChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewContent, setPreviewContent] = useState<any>(null);

  const sectionLabel = sectionType
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: message };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('modify-section', {
        body: {
          sectionType,
          sectionContent,
          userRequest: message,
          strategyBrief,
          brandVoice: strategyBrief?.tone || strategyBrief?.brandVoice || 'professional'
        }
      });

      if (fnError) {
        throw new Error(fnError.message || 'Failed to call AI service');
      }

      if (data?.success && data?.modifiedContent) {
        const assistantMessage: Message = {
          role: "assistant",
          content: `I've updated the ${sectionLabel} section based on your request. Review the changes below and click "Apply Changes" when ready.`,
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setPreviewContent(data.modifiedContent);
      } else {
        throw new Error(data?.error || 'Failed to modify section');
      }
    } catch (err) {
      console.error('Error modifying section:', err);
      setError(err instanceof Error ? err.message : 'Network error. Please try again.');
      
      const errorMessage: Message = {
        role: "assistant",
        content: "Sorry, I encountered an error processing your request. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action: typeof QUICK_ACTIONS[0]) => {
    handleSendMessage(action.prompt);
  };

  const handleApply = () => {
    if (previewContent) {
      onApplyChanges(previewContent);
      onClose();
      // Reset state for next use
      setMessages([]);
      setPreviewContent(null);
      setError(null);
    }
  };

  const handleReset = () => {
    setMessages([]);
    setPreviewContent(null);
    setError(null);
  };

  const handleClose = () => {
    onClose();
    // Reset state when closing
    setMessages([]);
    setPreviewContent(null);
    setError(null);
    setInput("");
  };

  const renderContentPreview = (content: any, label: string, variant: 'original' | 'modified') => {
    const bgClass = variant === 'original' 
      ? 'bg-muted/50' 
      : 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800';
    const labelClass = variant === 'original'
      ? 'text-muted-foreground'
      : 'text-green-700 dark:text-green-400';

    const getDisplayContent = (c: any): string[] => {
      const lines: string[] = [];
      if (c?.headline) lines.push(`Headline: "${c.headline}"`);
      if (c?.subheadline) lines.push(`Subheadline: "${c.subheadline}"`);
      if (c?.ctaText) lines.push(`CTA: "${c.ctaText}"`);
      if (c?.description) {
        const desc = c.description.length > 120 ? c.description.substring(0, 120) + '...' : c.description;
        lines.push(`Description: "${desc}"`);
      }
      if (c?.items && Array.isArray(c.items)) {
        lines.push(`Items: ${c.items.length} items`);
      }
      if (c?.features && Array.isArray(c.features)) {
        lines.push(`Features: ${c.features.length} features`);
      }
      if (c?.questions && Array.isArray(c.questions)) {
        lines.push(`FAQs: ${c.questions.length} questions`);
      }
      return lines.length > 0 ? lines : ['Complex content structure'];
    };

    return (
      <div className={`rounded-md p-3 border ${bgClass}`}>
        <p className={`text-xs font-medium mb-2 ${labelClass}`}>{label}</p>
        <pre className="text-xs whitespace-pre-wrap overflow-auto max-h-32">
          {getDisplayContent(content).join('\n')}
        </pre>
      </div>
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col p-0">
        <SheetHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Edit: {sectionLabel}
            </SheetTitle>
            <Button variant="ghost" size="icon" onClick={handleReset} title="Reset conversation">
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        {/* Error Alert */}
        {error && (
          <div className="px-6 py-3">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        {/* Before/After Preview */}
        {previewContent ? (
          <div className="px-6 py-4 border-b space-y-3">
            <p className="text-xs font-medium text-muted-foreground">Compare Changes</p>
            <div className="grid grid-cols-2 gap-3">
              {renderContentPreview(sectionContent, 'Original', 'original')}
              {renderContentPreview(previewContent, 'Modified ✓', 'modified')}
            </div>
          </div>
        ) : (
          /* Current Content Summary - only show when no preview */
          <div className="px-6 py-3 border-b bg-muted/30">
            <p className="text-xs font-medium text-muted-foreground mb-2">Current Content</p>
            {renderContentPreview(sectionContent, '', 'original')}
          </div>
        )}

        {/* Quick Actions */}
        <div className="px-6 py-3 border-b">
          <p className="text-xs font-medium text-muted-foreground mb-2">Quick Actions</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_ACTIONS.map((action) => (
              <Badge
                key={action.label}
                variant="outline"
                className={`cursor-pointer hover:bg-primary/10 hover:border-primary transition-colors ${
                  isLoading ? 'opacity-50 pointer-events-none' : ''
                }`}
                onClick={() => handleQuickAction(action)}
              >
                {action.label}
              </Badge>
            ))}
          </div>
        </div>

        {/* Chat Messages */}
        <ScrollArea className="flex-1 px-6 py-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <Sparkles className="h-12 w-12 mb-4 opacity-20" />
              <p className="text-sm">
                Use quick actions above or type a custom instruction to edit this section with AI
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 text-sm ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg px-4 py-3 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">AI is working...</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Input Area */}
        <div className="px-6 py-4 border-t bg-background">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe what changes you want..."
              className="min-h-[44px] max-h-32 resize-none"
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(input);
                }
              }}
            />
            <Button
              size="icon"
              className="shrink-0"
              onClick={() => handleSendMessage(input)}
              disabled={!input.trim() || isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-4 border-t flex gap-3">
          <Button variant="outline" className="flex-1" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={handleApply}
            disabled={!previewContent || isLoading}
          >
            {previewContent ? 'Apply Changes' : 'Waiting for changes...'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
