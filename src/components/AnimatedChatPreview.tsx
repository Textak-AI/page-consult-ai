import { useState, useEffect, useRef } from "react";
import { Bot, User } from "lucide-react";

const conversationSteps = [
  { type: "ai", message: "What industry are you in?" },
  { type: "user", message: "B2B SaaS" },
  { type: "thinking", message: "🧠 Analyzing your response...", checks: ["Industry patterns identified", "Audience insights extracted"] },
  { type: "ai", message: "Perfect! B2B SaaS buyers are ROI-focused. Who is your target audience?" },
  { type: "user", message: "Marketing directors at mid-size companies" },
  { type: "thinking", message: "🧠 Analyzing your response...", checks: ["Audience insights extracted", "Optimizing strategy"] },
  { type: "ai", message: "Excellent! I'll emphasize measurable results. What's your main value proposition?" },
  { type: "user", message: "Save 20 hours/week on reporting" },
  { type: "building", message: "✨ Building your strategic page...", checks: ["Hero optimized for B2B SaaS", "ROI Calculator (B2B needs proof)", "Trust signals added", "Strategic CTA aligned to goal"] },
];

export function AnimatedChatPreview() {
  const [visibleMessages, setVisibleMessages] = useState<number>(0);
  const [isTyping, setIsTyping] = useState(false);
  const [visibleChecks, setVisibleChecks] = useState<number>(0);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Smooth scroll to bottom when new messages appear
  useEffect(() => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
      
      if (isNearBottom || visibleMessages === 1) {
        // Scroll smoothly to bottom
        setTimeout(() => {
          container.scrollTo({
            top: container.scrollHeight,
            behavior: 'smooth'
          });
        }, 100);
      }
    }
  }, [visibleMessages]);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleMessages((prev) => {
        if (prev >= conversationSteps.length) {
          // Reset animation
          setTimeout(() => {
            setVisibleMessages(0);
            setVisibleChecks(0);
          }, 2000);
          return prev;
        }
        
        const currentStep = conversationSteps[prev];
        
        // For thinking/building messages, show checks sequentially
        if ((currentStep?.type === "thinking" || currentStep?.type === "building") && currentStep.checks) {
          setVisibleChecks(0);
          const checkInterval = setInterval(() => {
            setVisibleChecks((checkPrev) => {
              if (checkPrev >= currentStep.checks!.length) {
                clearInterval(checkInterval);
                return checkPrev;
              }
              return checkPrev + 1;
            });
          }, 400);
        }
        
        // Only show typing indicator before AI messages
        const nextStep = conversationSteps[prev];
        if (nextStep?.type === "ai" || nextStep?.type === "thinking" || nextStep?.type === "building") {
          setIsTyping(true);
          setTimeout(() => setIsTyping(false), 800);
        }
        
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
      <div className="relative bg-card/90 backdrop-blur-sm rounded-2xl border border-border/50 p-6 transform hover:scale-[1.02] transition-transform duration-300 h-[400px] md:h-[500px] flex flex-col" style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)' }}>
        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto space-y-3" style={{ scrollBehavior: 'smooth' }}>
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
          <div className="space-y-2.5">
            {conversationSteps.slice(0, visibleMessages).map((step, index) => (
              <div
                key={index}
                className={`flex gap-3 animate-fade-in ${
                  step.type === "user" ? "flex-row-reverse justify-end" : "justify-start"
                } ${step.type === "building" || step.type === "thinking" ? "justify-center" : ""}`}
                style={{ 
                  animation: 'fade-in 0.4s ease-out forwards',
                  animationDelay: `${index * 0.1}s`,
                  opacity: 0
                }}
              >
                {step.type !== "building" && step.type !== "thinking" && (
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      step.type === "ai"
                        ? "bg-primary/10 text-primary"
                        : "bg-[#1e293b] text-white"
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
                  className={`rounded-xl px-4 py-2 ${
                    step.type === "ai"
                      ? "bg-[#f3f4f6] text-[#1f2937] max-w-[80%]"
                      : step.type === "user"
                      ? "bg-[#1e293b] text-white max-w-[75%]"
                      : step.type === "thinking"
                      ? "bg-muted/50 text-foreground font-medium px-6 py-3 max-w-[85%]"
                      : "bg-gradient-to-r from-primary/10 to-secondary/10 text-foreground font-medium px-6 py-3 max-w-[90%]"
                  }`}
                >
                  <div>{step.message}</div>
                  {(step.type === "thinking" || step.type === "building") && step.checks && (
                    <div className="mt-3 space-y-1.5">
                      {step.checks.slice(0, index === visibleMessages - 1 ? visibleChecks : step.checks.length).map((check, checkIndex) => (
                        <div 
                          key={checkIndex} 
                          className="flex items-center gap-2 text-sm animate-fade-in"
                          style={{
                            animation: 'fade-in 0.3s ease-out forwards',
                            animationDelay: `${checkIndex * 0.1}s`,
                            opacity: 0
                          }}
                        >
                          <span className="text-green-500">✓</span>
                          <span className="text-muted-foreground">{check}</span>
                        </div>
                      ))}
                    </div>
                  )}
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

        </div>
        
        {/* Progress indicator - Fixed at bottom */}
        {visibleMessages > 0 && visibleMessages <= conversationSteps.length && (
          <div className="pt-4 border-t border-border/50 mt-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
              <span>Consultation Progress</span>
              <span>{Math.min(Math.round((visibleMessages / conversationSteps.length) * 100), 100)}%</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-secondary ease-out"
                style={{ 
                  width: `${Math.min((visibleMessages / conversationSteps.length) * 100, 100)}%`,
                  transition: 'width 2s ease-out'
                }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
