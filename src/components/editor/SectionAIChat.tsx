import { useState } from "react";
import { X, Sparkles, Send, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface SectionAIChatProps {
  isOpen: boolean;
  onClose: () => void;
  sectionType: string;
  sectionContent: any;
  strategyBrief?: any;
  onApplyChanges: (newContent: any) => void;
}

const QUICK_ACTIONS = [
  { label: "Make shorter", prompt: "Make this content more concise and punchy" },
  { label: "Make punchier", prompt: "Make this copy more compelling and action-oriented" },
  { label: "Add detail", prompt: "Expand on this content with more specific details" },
  { label: "Change tone", prompt: "Make the tone more professional and authoritative" },
  { label: "Add urgency", prompt: "Add more urgency and a stronger call to action" },
  { label: "Simplify", prompt: "Simplify the language for a broader audience" },
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
  const [proposedChanges, setProposedChanges] = useState<any>(null);

  const sectionLabel = sectionType
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    const userMessage: Message = { role: "user", content: message };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // TODO: Wire up actual AI in Phase 2
    // For now, simulate a response
    setTimeout(() => {
      const assistantMessage: Message = {
        role: "assistant",
        content: `I'll help you "${message.toLowerCase()}" for the ${sectionLabel} section. This is a placeholder response - AI integration coming in Phase 2.`,
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
      
      // Simulate proposed changes
      setProposedChanges({
        ...sectionContent,
        _preview: true,
      });
    }, 1000);
  };

  const handleQuickAction = (action: typeof QUICK_ACTIONS[0]) => {
    handleSendMessage(action.prompt);
  };

  const handleApply = () => {
    if (proposedChanges) {
      const { _preview, ...changes } = proposedChanges;
      onApplyChanges(changes);
      onClose();
    }
  };

  const handleReset = () => {
    setMessages([]);
    setProposedChanges(null);
  };

  const getCurrentContentSummary = () => {
    if (!sectionContent) return "No content available";
    
    const summary: string[] = [];
    if (sectionContent.headline) summary.push(`Headline: "${sectionContent.headline}"`);
    if (sectionContent.subheadline) summary.push(`Subheadline: "${sectionContent.subheadline}"`);
    if (sectionContent.ctaText) summary.push(`CTA: "${sectionContent.ctaText}"`);
    if (sectionContent.description) summary.push(`Description: "${sectionContent.description.substring(0, 100)}..."`);
    
    return summary.length > 0 ? summary.join("\n") : "Complex content structure";
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col p-0">
        <SheetHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Edit: {sectionLabel}
            </SheetTitle>
            <Button variant="ghost" size="icon" onClick={handleReset}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        {/* Current Content Summary */}
        <div className="px-6 py-3 border-b bg-muted/30">
          <p className="text-xs font-medium text-muted-foreground mb-2">Current Content</p>
          <pre className="text-xs bg-background rounded-md p-3 overflow-auto max-h-24 whitespace-pre-wrap">
            {getCurrentContentSummary()}
          </pre>
        </div>

        {/* Quick Actions */}
        <div className="px-6 py-3 border-b">
          <p className="text-xs font-medium text-muted-foreground mb-2">Quick Actions</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_ACTIONS.map((action) => (
              <Badge
                key={action.label}
                variant="outline"
                className="cursor-pointer hover:bg-primary/10 hover:border-primary transition-colors"
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
                  <div className="bg-muted rounded-lg px-4 py-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Proposed Changes Preview */}
        {proposedChanges && (
          <div className="px-6 py-3 border-t bg-green-50 dark:bg-green-950/20">
            <p className="text-xs font-medium text-green-700 dark:text-green-400 mb-2">
              ✓ Changes Ready to Apply
            </p>
            <p className="text-xs text-muted-foreground">
              Preview the changes in the editor before applying
            </p>
          </div>
        )}

        {/* Input Area */}
        <div className="px-6 py-4 border-t bg-background">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe what changes you want..."
              className="min-h-[44px] max-h-32 resize-none"
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
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-4 border-t flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={handleApply}
            disabled={!proposedChanges}
          >
            Apply Changes
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
