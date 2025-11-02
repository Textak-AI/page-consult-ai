import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, User, Send } from "lucide-react";
import { Link } from "react-router-dom";

type Message = {
  role: "ai" | "user";
  content: string;
  isTyping?: boolean;
};

type IndustryOption = {
  icon: string;
  title: string;
  subtitle: string;
};

type GoalOption = {
  icon: string;
  title: string;
  subtitle: string;
};

const industries: IndustryOption[] = [
  { icon: "🖥️", title: "B2B SaaS", subtitle: "Software, platforms, tools" },
  { icon: "🛒", title: "E-commerce", subtitle: "Products, retail, online stores" },
  { icon: "💼", title: "Professional Services", subtitle: "Consulting, legal, finance" },
  { icon: "🏢", title: "Other", subtitle: "Tell me more..." },
];

const goals: GoalOption[] = [
  { icon: "📊", title: "Generate Leads", subtitle: "Trials, demos, consultations" },
  { icon: "💰", title: "Drive Sales", subtitle: "Purchases, subscriptions" },
  { icon: "📞", title: "Book Meetings", subtitle: "Sales calls, product demos" },
];

const AIDemo = () => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      content: "Hey! I'm excited to help you build a page that converts.\n\nBefore we jump into design, let's have a quick strategy chat—this ensures we build exactly what your business needs.\n\nFirst up: What industry are you in?",
    },
  ]);
  const [step, setStep] = useState<"industry" | "goal" | "audience" | "summary">("industry");
  const [selectedIndustry, setSelectedIndustry] = useState<string>("");
  const [selectedGoal, setSelectedGoal] = useState<string>("");
  const [audienceInput, setAudienceInput] = useState("");
  const [submittedAudience, setSubmittedAudience] = useState("");

  // Auto-scroll within chat container only
  useEffect(() => {
    setTimeout(() => {
      if (chatContainerRef.current && messagesEndRef.current) {
        const container = chatContainerRef.current;
        const scrollTarget = messagesEndRef.current;
        
        // Scroll within container, not the page
        container.scrollTop = scrollTarget.offsetTop;
      }
    }, 100);
  }, [messages]);

  const addMessage = (role: "ai" | "user", content: string) => {
    setMessages((prev) => [...prev, { role, content }]);
  };

  const handleIndustrySelect = (e: React.MouseEvent, industry: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Prevent any default behavior
    if (window.event) {
      window.event.preventDefault();
      window.event.stopPropagation();
    }
    
    setSelectedIndustry(industry);
    addMessage("user", industry);
    
    setTimeout(() => {
      addMessage(
        "ai",
        `Perfect! ${industry === "B2B SaaS" ? "SaaS buyers are research-driven and ROI-focused." : "Great choice!"}\n\nWhat's your main goal for this page?`
      );
      setStep("goal");
    }, 800);
    
    return false;
  };

  const handleGoalSelect = (e: React.MouseEvent, goal: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Prevent any default behavior
    if (window.event) {
      window.event.preventDefault();
      window.event.stopPropagation();
    }
    
    setSelectedGoal(goal);
    addMessage("user", goal);
    
    setTimeout(() => {
      addMessage(
        "ai",
        `Got it—optimizing for ${goal.toLowerCase()}.\n\nWho exactly are you trying to reach?`
      );
      setStep("audience");
    }, 800);
    
    return false;
  };

  const handleAudienceSubmit = () => {
    if (!audienceInput.trim()) return;
    
    const audience = audienceInput.trim();
    setSubmittedAudience(audience);
    addMessage("user", audience);
    
    setTimeout(() => {
      addMessage(
        "ai",
        `Excellent! Based on our chat, here's what I'd build for you:\n\n📄 Page Structure:\n• Hero: Headline targeting ${audience}\n• Problem/Solution section\n• ROI Calculator (interactive, proven to boost conversions)\n• Key Features grid\n• Social proof area\n• Clear CTA: ${selectedGoal}\n\nReady to build this for real?`
      );
      setStep("summary");
    }, 1200);
    
    setAudienceInput("");
  };

  return (
    <section id="demo" className="py-24 px-6 bg-background">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Experience It Yourself
          </h2>
          <p className="text-lg text-muted-foreground">
            See how AI consultation works in 60 seconds - no signup required
          </p>
        </div>

        <div className="bg-card rounded-2xl shadow-xl overflow-hidden max-w-2xl mx-auto animate-scale-in">
          <div className="bg-primary text-primary-foreground px-6 py-4 flex items-center justify-between">
            <h3 className="font-semibold">AI Consultant Demo</h3>
            <span className="text-xs bg-secondary text-secondary-foreground px-3 py-1 rounded-full font-medium">
              Try free
            </span>
          </div>

          <div 
            ref={chatContainerRef}
            className="p-6 space-y-4 max-h-[520px] overflow-y-auto pb-8"
            style={{ scrollBehavior: 'auto' }}
          >
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 animate-slide-up ${
                  message.role === "user" ? "flex-row-reverse" : ""
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === "ai"
                      ? "bg-primary/10 text-primary"
                      : "bg-secondary/10 text-secondary"
                  }`}
                >
                  {message.role === "ai" ? (
                    <Bot className="w-4 h-4" />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                </div>
                <div
                  className={`flex-1 rounded-2xl p-4 whitespace-pre-line ${
                    message.role === "ai"
                      ? "bg-muted text-foreground"
                      : "bg-secondary/20 text-foreground"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}

            {step === "industry" && (
              <div className="grid grid-cols-2 gap-3 pt-2 animate-fade-in">
                {industries.map((industry) => (
                  <button
                    key={industry.title}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleIndustrySelect(e, industry.title);
                    }}
                    className="bg-card border border-border rounded-xl p-4 text-left hover-lift hover:border-primary transition-all"
                  >
                    <div className="text-2xl mb-2">{industry.icon}</div>
                    <div className="font-semibold text-foreground mb-1">
                      {industry.title}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {industry.subtitle}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {step === "goal" && (
              <div className="grid grid-cols-1 gap-3 pt-2 animate-fade-in">
                {goals.map((goal) => (
                  <button
                    key={goal.title}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleGoalSelect(e, goal.title);
                    }}
                    className="bg-card border border-border rounded-xl p-4 text-left hover-lift hover:border-primary transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{goal.icon}</div>
                      <div className="flex-1">
                        <div className="font-semibold text-foreground mb-1">
                          {goal.title}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {goal.subtitle}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {step === "audience" && (
              <div className="pt-2 animate-fade-in">
                <div className="flex gap-2">
                  <Input
                    value={audienceInput}
                    onChange={(e) => setAudienceInput(e.target.value)}
                    placeholder="e.g., CFOs at mid-market companies..."
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAudienceSubmit();
                    }}
                    autoFocus
                  />
                  <Button
                    onClick={handleAudienceSubmit}
                    variant="hero"
                    size="icon"
                    disabled={!audienceInput.trim()}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {step === "summary" && (
              <div className="pt-4 animate-fade-in">
                <Button 
                  asChild 
                  variant="hero" 
                  size="lg" 
                  className="w-full text-base"
                >
                  <Link 
                    to={`/wizard?industry=${encodeURIComponent(selectedIndustry)}&goal=${encodeURIComponent(selectedGoal)}&audience=${encodeURIComponent(submittedAudience)}`}
                  >
                    Sign Up to Build Your Page
                  </Link>
                </Button>
                <p className="text-center text-sm text-muted-foreground mt-3">
                  Just 3 more quick questions to refine your strategy
                </p>
              </div>
            )}
            
            {/* Scroll anchor */}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIDemo;
