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
  const [typedText, setTypedText] = useState<string>("");
  const [isTypingText, setIsTypingText] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const currentIndexRef = useRef<number>(0);
  const isScrollingRef = useRef(false);

  // Initialize demo smoothly
  useEffect(() => {
    // Fade in after mount
    setTimeout(() => setIsInitialized(true), 100);
  }, []);

  // Smooth scroll to show AI message with context
  const smoothScroll = () => {
    if (isScrollingRef.current || !messagesContainerRef.current) return;
    
    isScrollingRef.current = true;
    const container = messagesContainerRef.current;
    
    // Wait for content to fully render
    setTimeout(() => {
      // Find the last AI message to keep it in view
      const allMessages = container.querySelectorAll('.ai-message, .user-message, .special-message');
      const lastMessage = allMessages[allMessages.length - 1];
      
      if (lastMessage) {
        // Scroll to show the message with some padding from top
        const messagePosition = (lastMessage as HTMLElement).offsetTop;
        const offset = 60; // padding from top to keep message visible
        
        container.scrollTo({
          top: Math.max(0, messagePosition - offset),
          behavior: 'smooth'
        });
      } else {
        // Fallback to bottom if no messages found
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth'
        });
      }
      
      // Reset scroll lock after animation completes
      setTimeout(() => {
        isScrollingRef.current = false;
      }, 600);
    }, 200);
  };

  // Trigger smooth scroll when content changes
  useEffect(() => {
    smoothScroll();
  }, [visibleMessages, isTyping]);

  // Typing effect for AI messages
  const typeMessage = (text: string, callback: () => void) => {
    setIsTypingText(true);
    setTypedText("");
    let currentChar = 0;
    
    const typeInterval = setInterval(() => {
      if (currentChar < text.length) {
        setTypedText(text.substring(0, currentChar + 1));
        currentChar++;
      } else {
        clearInterval(typeInterval);
        setIsTypingText(false);
        callback();
      }
    }, 35);
  };

  useEffect(() => {
    const showNextMessage = () => {
      const index = currentIndexRef.current;
      
      if (index >= conversationSteps.length) {
        // Reset animation after pause
        setTimeout(() => {
          currentIndexRef.current = 0;
          setVisibleMessages(0);
          setVisibleChecks(0);
          setTypedText("");
          showNextMessage();
        }, 3000);
        return;
      }

      const currentStep = conversationSteps[index];

      // Handle different message types
      if (currentStep.type === "user") {
        // User messages appear after a natural pause
        setVisibleMessages(index + 1);
        currentIndexRef.current++;
        // Pause to let user "confirm" their choice
        setTimeout(showNextMessage, 800);
      } else if (currentStep.type === "thinking" || currentStep.type === "building") {
        // Thinking/building messages with sequential checkmarks
        setVisibleMessages(index + 1);
        
        // Pause before showing first check
        setTimeout(() => {
          setVisibleChecks(0);
          
          // Show checks one by one with pauses
          const showChecks = (checkIndex: number) => {
            if (checkIndex < currentStep.checks!.length) {
              setVisibleChecks(checkIndex + 1);
              // Longer pause for building sequence, shorter for thinking
              const delay = currentStep.type === "building" ? 800 : 600;
              setTimeout(() => showChecks(checkIndex + 1), delay);
            } else {
              // All checks shown, pause before next message
              const finalPause = currentStep.type === "building" ? 1000 : 300;
              setTimeout(() => {
                currentIndexRef.current++;
                showNextMessage();
              }, finalPause);
            }
          };
          
          showChecks(0);
        }, 400);
      } else if (currentStep.type === "ai") {
        // AI messages: show typing dots, then type out message
        setIsTyping(true);
        
        setTimeout(() => {
          setIsTyping(false);
          
          setTimeout(() => {
            setVisibleMessages(index + 1);
            
            // Type out the message character by character
            typeMessage(currentStep.message, () => {
              currentIndexRef.current++;
              // Longer pause after AI message for user to "read" next question
              setTimeout(showNextMessage, index === 0 ? 1000 : 1200);
            });
          }, 200);
        }, 1500);
      }
    };

    // Start the animation after initialization
    if (isInitialized) {
      showNextMessage();
    }
  }, [isInitialized]);

  return (
    <div className="relative">
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 blur-3xl rounded-full -z-10"></div>
      
      {/* Chat container with smooth initialization */}
      <div 
        className={`relative bg-card/90 backdrop-blur-sm rounded-2xl border border-border/50 p-6 transform hover:scale-[1.02] transition-all duration-300 h-[400px] md:h-[500px] flex flex-col ${
          isInitialized ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ 
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          transition: 'opacity 300ms ease-in, transform 300ms ease-out'
        }}
      >
        <div 
          ref={messagesContainerRef} 
          className="flex-1 overflow-y-auto space-y-3" 
          style={{ 
            scrollBehavior: 'smooth',
            scrollPaddingBottom: '20px',
            transition: 'scroll 0.5s cubic-bezier(0.4, 0.0, 0.2, 1)'
          }}
        >
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
            {conversationSteps.slice(0, visibleMessages).map((step, index) => {
              const isUser = step.type === "user";
              const isSpecial = step.type === "building" || step.type === "thinking";
              
              return (
                <div
                  key={index}
                  className={`flex gap-3 ${
                    isUser ? "flex-row-reverse" : ""
                  } ${isSpecial ? "justify-center" : ""}`}
                  style={{ 
                    animation: 'fade-in 0.3s ease-out forwards',
                    opacity: 0,
                    marginLeft: isUser ? 'auto' : '0',
                    marginRight: isUser ? '0' : 'auto',
                    maxWidth: isUser ? '80%' : isSpecial ? '90%' : '85%',
                    width: isUser ? 'fit-content' : 'auto',
                    transform: 'translateY(0)',
                    transition: 'transform 0.3s ease-out'
                  }}
                >
                  {!isSpecial && (
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
                        ? "bg-[#f3f4f6] text-[#1f2937] ai-message"
                        : step.type === "user"
                        ? "bg-[#1e293b] text-white user-message"
                        : step.type === "thinking"
                        ? "bg-muted/50 text-foreground font-medium px-6 py-3 special-message"
                        : "bg-gradient-to-r from-primary/10 to-secondary/10 text-foreground font-medium px-6 py-3 special-message"
                    }`}
                  >
                    <div>
                      {step.type === "ai" && isTypingText && index === visibleMessages - 1 
                        ? typedText 
                        : step.message}
                    </div>
                    {isSpecial && step.checks && (
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
              );
            })}

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
