import { useState, useEffect } from "react";
import { Bot, User } from "lucide-react";

const conversationSteps = [
  { type: "ai", message: "What industry are you in?" },
  { type: "user", message: "B2B SaaS" },
  { type: "ai", message: "Who is your target audience?" },
  { type: "user", message: "Marketing directors at mid-size companies" },
  { type: "ai", message: "What's your main value proposition?" },
  { type: "user", message: "Save 20 hours/week on reporting" },
  { type: "building", message: "✨ Building your strategic landing page..." },
];

export function AnimatedChatPreview() {
  const [visibleMessages, setVisibleMessages] = useState<number>(0);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleMessages((prev) => {
        if (prev >= conversationSteps.length) {
          // Reset animation
          setTimeout(() => setVisibleMessages(0), 2000);
          return prev;
        }
        
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 800);
        return prev + 1;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 blur-3xl rounded-full -z-10"></div>
      
      {/* Chat container */}
      <div className="relative bg-card/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-border/50 p-6 transform hover:scale-[1.02] transition-transform duration-300">
        <div className="space-y-4 min-h-[320px]">
          {/* Header */}
          <div className="flex items-center gap-3 pb-4 border-b border-border/50">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <div className="font-semibold text-foreground">AI Consultant</div>
              <div className="text-xs text-muted-foreground">Building your strategy...</div>
            </div>
          </div>

          {/* Messages */}
          <div className="space-y-3">
            {conversationSteps.slice(0, visibleMessages).map((step, index) => (
              <div
                key={index}
                className={`flex gap-3 animate-fade-in ${
                  step.type === "user" ? "flex-row-reverse" : ""
                } ${step.type === "building" ? "justify-center" : ""}`}
              >
                {step.type !== "building" && (
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      step.type === "ai"
                        ? "bg-primary/10 text-primary"
                        : "bg-secondary/10 text-secondary"
                    }`}
                  >
                    {step.type === "ai" ? (
                      <Bot className="w-4 h-4" />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                  </div>
                )}
                <div
                  className={`rounded-xl px-4 py-2 max-w-[80%] ${
                    step.type === "ai"
                      ? "bg-muted text-foreground"
                      : step.type === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-gradient-to-r from-primary/10 to-secondary/10 text-foreground font-medium px-6 py-3"
                  }`}
                >
                  {step.message}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && visibleMessages < conversationSteps.length && (
              <div className="flex gap-3 animate-fade-in">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-muted rounded-xl px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Progress indicator */}
          {visibleMessages > 0 && visibleMessages <= conversationSteps.length && (
            <div className="pt-4 border-t border-border/50">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <span>Consultation Progress</span>
                <span>{Math.min(Math.round((visibleMessages / conversationSteps.length) * 100), 100)}%</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500 ease-out"
                  style={{ width: `${Math.min((visibleMessages / conversationSteps.length) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
