import { useState, useEffect, useRef } from "react";
import { User } from "lucide-react";
import aiChatIcon from "@/assets/iconmark-darkmode.svg";

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

  // Smooth scroll to bottom with debouncing
  const smoothScroll = () => {
    if (isScrollingRef.current || !messagesContainerRef.current) return;
    
    isScrollingRef.current = true;
    const container = messagesContainerRef.current;
    
    // Wait for content to fully render
    setTimeout(() => {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      });
      
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
    <div className="relative group cursor-default">
      {/* Enhanced glow effect - always visible */}
      <div className="absolute inset-0 -m-2 bg-gradient-to-br from-cyan-500/30 via-purple-500/30 to-pink-500/30 rounded-3xl blur-3xl opacity-60 group-hover:opacity-80 transition-opacity duration-700 z-0 animate-pulse-slow" style={{ willChange: 'opacity' }} />
      
      {/* Chat container with smooth initialization - LARGER */}
      <div 
        className={`relative z-10 bg-slate-900/90 backdrop-blur-2xl rounded-3xl border border-white/10 p-6 md:p-8 transform transition-all duration-500 h-[450px] md:h-[580px] flex flex-col shadow-2xl shadow-cyan-500/20 group-hover:-translate-y-1 group-hover:shadow-cyan-500/30 ${
          isInitialized ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ 
          transition: 'opacity 300ms ease-in, transform 500ms ease-out, box-shadow 500ms ease-out',
          willChange: 'transform'
        }}
        aria-live="polite"
      >
        <div 
          ref={messagesContainerRef} 
          className="flex-1 overflow-y-auto space-y-3" 
          style={{ 
            scrollBehavior: 'smooth',
            scrollPaddingBottom: '20px',
            transition: 'scroll 0.5s cubic-bezier(0.4, 0.0, 0.2, 1)',
            scrollbarWidth: 'thin',
            scrollbarColor: '#06b6d4 rgba(255,255,255,0.1)'
          }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 pb-4 border-b border-white/10">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center overflow-hidden shadow-lg shadow-cyan-500/40 animate-pulse-slow">
                <img src={aiChatIcon} alt="AI" className="w-6 h-6 object-contain" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-slate-900" />
            </div>
            <div>
              <div className="font-semibold text-white antialiased">AI Consultant</div>
              <div className="flex items-center gap-1 text-xs text-gray-400 antialiased">
                <span>Building your strategy</span>
                <span className="inline-flex gap-0.5 ml-0.5">
                  <span className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
                  <span className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '200ms' }} />
                  <span className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '400ms' }} />
                </span>
              </div>
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
                        ? "bg-gradient-to-br from-cyan-500 to-purple-600 shadow-lg shadow-cyan-500/30 overflow-hidden"
                        : "bg-slate-700"
                    }`}
                  >
                    {step.type === "ai" ? (
                      <img src={aiChatIcon} alt="AI" className="w-5 h-5 object-contain" />
                    ) : (
                      <User className="w-4 h-4 text-gray-300" />
                    )}
                  </div>
                  )}
                  <div
                    className={`rounded-xl px-4 py-2 antialiased ${
                      step.type === "ai"
                        ? "bg-slate-800/60 backdrop-blur-sm border border-white/5 text-gray-200 shadow-lg font-medium"
                        : step.type === "user"
                        ? "bg-gradient-to-br from-cyan-600 to-cyan-700 text-white shadow-lg shadow-cyan-500/40 font-semibold"
                        : step.type === "thinking"
                        ? "bg-slate-800/60 backdrop-blur-sm border border-purple-500/30 text-white font-medium px-6 py-3 animate-pulse-slow"
                        : "bg-slate-800/60 backdrop-blur-sm border border-cyan-500/20 text-white font-medium px-6 py-3"
                    }`}
                    style={{ textRendering: 'optimizeLegibility' }}
                  >
                    <div className={step.type === "thinking" ? "flex items-center gap-2" : ""}>
                      {step.type === "thinking" && (
                        <span className="inline-block animate-pulse text-purple-400">●</span>
                      )}
                      <span>
                        {step.type === "ai" && isTypingText && index === visibleMessages - 1 
                          ? typedText 
                          : step.message}
                      </span>
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
                              opacity: 0,
                              textShadow: '0 0 20px rgba(74, 222, 128, 0.4)'
                            }}
                          >
                            <span className="text-green-400 font-bold">✓</span>
                            <span className="text-green-400 font-medium">{check}</span>
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
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-lg shadow-cyan-500/30">
                  <img src={aiChatIcon} alt="AI" className="w-5 h-5 object-contain" />
                </div>
                <div className="bg-slate-800/60 backdrop-blur-sm border border-white/5 rounded-xl px-4 py-3 shadow-lg">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
        
        {/* Progress indicator - Fixed at bottom */}
        {visibleMessages > 0 && visibleMessages <= conversationSteps.length && (
          <div className="pt-4 border-t border-white/10 mt-4">
            <div className="flex items-center justify-between text-xs mb-2 antialiased">
              <span className="text-gray-400 font-medium">Consultation Progress</span>
              <span className="text-cyan-400 font-semibold">{Math.min(Math.round((visibleMessages / conversationSteps.length) * 100), 100)}%</span>
            </div>
            <div className="h-2.5 bg-slate-800/60 border border-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-600 rounded-full shadow-lg shadow-cyan-400/60 relative overflow-hidden ease-out"
                style={{ 
                  width: `${Math.min((visibleMessages / conversationSteps.length) * 100, 100)}%`,
                  transition: 'width 700ms ease-out',
                  willChange: 'width'
                }}
              >
                <div 
                  className="absolute inset-0 animate-shimmer"
                  style={{ 
                    backgroundSize: '200% 100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                    willChange: 'background-position'
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
