import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, User, Send } from "lucide-react";
import { Link } from "react-router-dom";

type Message = {
  role: "ai" | "user";
  content: string;
  isTyping?: boolean;
  isLoading?: boolean;
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

type HesitationOption = {
  icon: string;
  title: string;
};

type CredentialOption = {
  icon: string;
  title: string;
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

const hesitations: HesitationOption[] = [
  { icon: "💵", title: "Price concerns" },
  { icon: "🤝", title: "Trust/credibility" },
  { icon: "⏰", title: "Timing/urgency" },
  { icon: "❓", title: "Unsure of need" },
  { icon: "✏️", title: "Other" },
];

const credentials: CredentialOption[] = [
  { icon: "📅", title: "Years in business" },
  { icon: "⭐", title: "Customer testimonials" },
  { icon: "🏆", title: "Industry certifications" },
  { icon: "📸", title: "Photo portfolio" },
  { icon: "🆕", title: "None yet - I'm just starting" },
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
  const [step, setStep] = useState<"industry" | "specificService" | "hesitation" | "credentials" | "insights" | "goal" | "audience" | "summary">("industry");
  const [selectedIndustry, setSelectedIndustry] = useState<string>("");
  const [specificService, setSpecificService] = useState<string>("");
  const [submittedService, setSubmittedService] = useState<string>("");
  const [selectedHesitation, setSelectedHesitation] = useState<string>("");
  const [selectedCredentials, setSelectedCredentials] = useState<string[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<string>("");
  const [audienceInput, setAudienceInput] = useState("");
  const [submittedAudience, setSubmittedAudience] = useState("");
  const [otherHesitation, setOtherHesitation] = useState<string>("");

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

  const addMessage = (role: "ai" | "user", content: string, isLoading = false) => {
    setMessages((prev) => [...prev, { role, content, isLoading }]);
  };

  const handleIndustrySelect = (e: React.MouseEvent, industry: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (window.event) {
      window.event.preventDefault();
      window.event.stopPropagation();
    }
    
    setSelectedIndustry(industry);
    addMessage("user", industry);
    
    setTimeout(() => {
      if (industry === "Professional Services") {
        addMessage(
          "ai",
          "Great! Professional services covers a lot. What specific service do you provide?"
        );
        setStep("specificService");
      } else {
        addMessage(
          "ai",
          `Perfect! ${industry === "B2B SaaS" ? "SaaS buyers are research-driven and ROI-focused." : "Great choice!"}\n\nWhat's your main goal for this page?`
        );
        setStep("goal");
      }
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

  const handleSpecificServiceSubmit = () => {
    if (!specificService.trim()) return;
    
    const service = specificService.trim();
    setSubmittedService(service);
    addMessage("user", service);
    
    setTimeout(() => {
      addMessage(
        "ai",
        `Excellent - ${service} is essential for home value. For ${service} contractors targeting homeowners who want sales, I need to understand what sets you apart.\n\nWhat's the #1 reason homeowners hesitate before hiring you?`
      );
      setStep("hesitation");
    }, 800);
    
    setSpecificService("");
  };

  const handleHesitationSelect = (e: React.MouseEvent, hesitation: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (window.event) {
      window.event.preventDefault();
      window.event.stopPropagation();
    }
    
    if (hesitation === "Other") {
      // Show text input for other
      return false;
    }
    
    setSelectedHesitation(hesitation);
    addMessage("user", hesitation);
    
    setTimeout(() => {
      const response = hesitation === "Trust/credibility" 
        ? "That's common for newer contractors. Let me help you build instant credibility.\n\nDo you have any of these? (select all that apply)"
        : "I understand. Let me help you address that concern effectively.\n\nDo you have any of these credentials? (select all that apply)";
      
      addMessage("ai", response);
      setStep("credentials");
    }, 800);
    
    return false;
  };

  const handleOtherHesitationSubmit = () => {
    if (!otherHesitation.trim()) return;
    
    const hesitation = otherHesitation.trim();
    setSelectedHesitation(`Other: ${hesitation}`);
    addMessage("user", `Other: ${hesitation}`);
    
    setTimeout(() => {
      addMessage(
        "ai",
        "I understand. Let me help you address that concern effectively.\n\nDo you have any of these credentials? (select all that apply)"
      );
      setStep("credentials");
    }, 800);
    
    setOtherHesitation("");
  };

  const handleCredentialToggle = (credential: string) => {
    setSelectedCredentials(prev => 
      prev.includes(credential)
        ? prev.filter(c => c !== credential)
        : [...prev, credential]
    );
  };

  const handleCredentialsSubmit = () => {
    const credentialsList = selectedCredentials.length > 0 
      ? selectedCredentials.join(", ")
      : "None selected";
    
    addMessage("user", credentialsList);
    
    setTimeout(() => {
      const hasNoCredentials = selectedCredentials.includes("None yet - I'm just starting") || selectedCredentials.length === 0;
      
      if (hasNoCredentials) {
        addMessage("ai", "No problem! New businesses can build trust using market data. Let me find some industry statistics that will help establish your credibility...", true);
        
        // Simulate loading and then show insights
        setTimeout(() => {
          addMessage(
            "ai",
            `Here's what I found for ${submittedService} contractors:\n\n• Average repair delay costs homeowners $3,200 extra\n• 67% of projects fail within 5 years without proper installation\n• Professional installation adds $12-15K to property value\n\nI'll use these insights to build credibility without fake testimonials. Ready to see your customized page strategy?\n\nWhat's your main goal for this page?`
          );
          setStep("goal");
        }, 2000);
      } else {
        addMessage(
          "ai",
          "Excellent! I'll highlight these credentials on your page to build trust immediately.\n\nWhat's your main goal for this page?"
        );
        setStep("goal");
      }
    }, 800);
  };

  const handleAudienceSubmit = () => {
    if (!audienceInput.trim()) return;
    
    const audience = audienceInput.trim();
    setSubmittedAudience(audience);
    addMessage("user", audience);
    
    setTimeout(() => {
      const pageStructure = submittedService
        ? `📄 Page Structure:\n• Hero: Headline targeting ${audience}\n• Problem/Solution highlighting ${selectedHesitation}\n• ${selectedCredentials.includes("None yet - I'm just starting") ? "Industry Statistics section (builds credibility with data)" : "Credentials showcase"}\n• ${submittedService} Portfolio\n• ROI Calculator (interactive, proven to boost conversions)\n• Clear CTA: ${selectedGoal}`
        : `📄 Page Structure:\n• Hero: Headline targeting ${audience}\n• Problem/Solution section\n• ROI Calculator (interactive, proven to boost conversions)\n• Key Features grid\n• Social proof area\n• Clear CTA: ${selectedGoal}`;
      
      addMessage(
        "ai",
        `Excellent! Based on our chat, here's what I'd build for you:\n\n${pageStructure}\n\nReady to build this for real?`
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
                  {message.isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      <span>Searching industry data...</span>
                    </div>
                  ) : (
                    message.content
                  )}
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

            {step === "specificService" && (
              <div className="pt-2 animate-fade-in">
                <div className="flex gap-2">
                  <Input
                    value={specificService}
                    onChange={(e) => setSpecificService(e.target.value)}
                    placeholder="e.g., driveway and concrete installation..."
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSpecificServiceSubmit();
                    }}
                    autoFocus
                  />
                  <Button
                    onClick={handleSpecificServiceSubmit}
                    variant="hero"
                    size="icon"
                    disabled={!specificService.trim()}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {step === "hesitation" && (
              <div className="grid grid-cols-1 gap-3 pt-2 animate-fade-in">
                {hesitations.map((hesitation) => (
                  <button
                    key={hesitation.title}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (hesitation.title === "Other") {
                        // Just show the input, don't call handler
                      } else {
                        handleHesitationSelect(e, hesitation.title);
                      }
                    }}
                    className="bg-card border border-border rounded-xl p-4 text-left hover-lift hover:border-primary transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{hesitation.icon}</div>
                      <div className="font-semibold text-foreground">
                        {hesitation.title}
                      </div>
                    </div>
                  </button>
                ))}
                <div className="flex gap-2 mt-2">
                  <Input
                    value={otherHesitation}
                    onChange={(e) => setOtherHesitation(e.target.value)}
                    placeholder="Describe the main concern..."
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleOtherHesitationSubmit();
                    }}
                  />
                  <Button
                    onClick={handleOtherHesitationSubmit}
                    variant="hero"
                    size="icon"
                    disabled={!otherHesitation.trim()}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {step === "credentials" && (
              <div className="pt-2 animate-fade-in space-y-3">
                {credentials.map((credential) => (
                  <button
                    key={credential.title}
                    type="button"
                    onClick={() => handleCredentialToggle(credential.title)}
                    className={`w-full bg-card border-2 rounded-xl p-4 text-left transition-all ${
                      selectedCredentials.includes(credential.title)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        selectedCredentials.includes(credential.title)
                          ? "border-primary bg-primary"
                          : "border-border"
                      }`}>
                        {selectedCredentials.includes(credential.title) && (
                          <span className="text-primary-foreground text-xs">✓</span>
                        )}
                      </div>
                      <div className="text-xl">{credential.icon}</div>
                      <div className="font-semibold text-foreground">
                        {credential.title}
                      </div>
                    </div>
                  </button>
                ))}
                <Button
                  onClick={handleCredentialsSubmit}
                  variant="hero"
                  className="w-full mt-4"
                  disabled={selectedCredentials.length === 0}
                >
                  Continue
                </Button>
              </div>
            )}

            {step === "audience" && (
              <div className="pt-2 animate-fade-in">
                <div className="flex gap-2">
                  <Input
                    value={audienceInput}
                    onChange={(e) => setAudienceInput(e.target.value)}
                    placeholder="e.g., homeowners in Lakewood..."
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
