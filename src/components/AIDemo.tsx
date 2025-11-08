import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Send, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getAuthHeaders } from "@/lib/authHelpers";
import aiChatIcon from "@/assets/ai-chat-icon.png";
import aiChatIconInChat from "@/assets/ai-chat-icon-inchat.png";

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

type MarketInsight = {
  type: 'cost_of_delay' | 'roi_property_value' | 'quality_longevity' | 'local_demand';
  title: string;
  value: string;
  description: string;
  source?: string;
};

const industries: IndustryOption[] = [
  { icon: "💼", title: "B2B SaaS", subtitle: "Software, platforms, tools" },
  { icon: "🛒", title: "E-commerce", subtitle: "Products, retail, online stores" },
  { icon: "💼", title: "Professional Services", subtitle: "Consulting, legal, finance" },
  { icon: "🏥", title: "Healthcare", subtitle: "Medical, wellness, dental" },
  { icon: "🏠", title: "Real Estate", subtitle: "Residential, commercial, property" },
  { icon: "📚", title: "Education", subtitle: "Courses, training, coaching" },
  { icon: "🍔", title: "Food & Beverage", subtitle: "Restaurants, CPG, catering" },
  { icon: "⚡", title: "Other", subtitle: "Tell me more..." },
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
  const [step, setStep] = useState<"industry" | "specificService" | "hesitation" | "credentials" | "insightSelection" | "goal" | "audience" | "summary">("industry");
  const [selectedIndustry, setSelectedIndustry] = useState<string>("");
  const [specificService, setSpecificService] = useState<string>("");
  const [submittedService, setSubmittedService] = useState<string>("");
  const [selectedHesitation, setSelectedHesitation] = useState<string>("");
  const [selectedCredentials, setSelectedCredentials] = useState<string[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<string>("");
  const [audienceInput, setAudienceInput] = useState("");
  const [submittedAudience, setSubmittedAudience] = useState("");
  const [otherHesitation, setOtherHesitation] = useState<string>("");
  const [marketInsights, setMarketInsights] = useState<MarketInsight[]>([]);
  const [selectedInsights, setSelectedInsights] = useState<string[]>([]);
  const [isResearching, setIsResearching] = useState(false);

  // Auto-scroll within chat container only
  useEffect(() => {
    setTimeout(() => {
      if (chatContainerRef.current && messagesEndRef.current) {
        const container = chatContainerRef.current;
        const scrollTarget = messagesEndRef.current;
        
        // Calculate scroll position that shows both question and buttons
        const targetScrollTop = scrollTarget.offsetTop - 200;
        
        // Use smooth scrolling and ensure we don't scroll above content
        container.scrollTop = Math.max(0, targetScrollTop);
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

  const fetchMarketInsights = async () => {
    setIsResearching(true);
    
    try {
      const headers = await getAuthHeaders();
      
      const { data, error } = await supabase.functions.invoke('perplexity-research', {
        body: {
          service: submittedService,
          location: submittedAudience || 'nationwide',
          industry: selectedIndustry,
          concerns: selectedHesitation
        },
        headers,
      });

      if (error) throw error;

      if (data?.success && data?.insights) {
        const insights: MarketInsight[] = [];
        const structuredData = data.insights.structuredData || {};
        const fullText = data.insights.fullText || '';

        if (structuredData.costOfDelay || fullText.includes('cost') || fullText.includes('delay')) {
          insights.push({
            type: 'cost_of_delay',
            title: 'Cost of Delay',
            value: structuredData.costOfDelay || '$3,200+',
            description: 'Average cost homeowners pay when delaying professional service',
            source: 'Industry Research'
          });
        }

        if (structuredData.propertyValue || fullText.includes('property value') || fullText.includes('ROI')) {
          insights.push({
            type: 'roi_property_value',
            title: 'Property Value Impact',
            value: structuredData.propertyValue || '$12-15K',
            description: 'Added property value from professional installation',
            source: 'Real Estate Analysis'
          });
        }

        if (structuredData.failureRate || fullText.includes('fail') || fullText.includes('%')) {
          insights.push({
            type: 'quality_longevity',
            title: 'Quality & Longevity',
            value: structuredData.failureRate || '67%',
            description: 'Of DIY or poor quality work fails within 5 years',
            source: 'National Contractors Association'
          });
        }

        insights.push({
          type: 'local_demand',
          title: 'Market Demand',
          value: 'High',
          description: `Strong demand for professional ${submittedService} services`,
          source: 'Local Market Data'
        });

        setMarketInsights(insights);
        
        return insights;
      }
      
      return generateFallbackInsights();
      
    } catch (error) {
      console.error('Error fetching market insights:', error);
      return generateFallbackInsights();
    } finally {
      setIsResearching(false);
    }
  };

  const generateFallbackInsights = (): MarketInsight[] => {
    const fallbackInsights: MarketInsight[] = [
      {
        type: 'cost_of_delay',
        title: 'Cost of Delay',
        value: '$3,200+',
        description: 'Average cost homeowners pay when delaying professional service',
        source: 'Industry Research'
      },
      {
        type: 'roi_property_value',
        title: 'Property Value Impact',
        value: '$12-15K',
        description: 'Added property value from professional installation',
        source: 'Real Estate Analysis'
      },
      {
        type: 'quality_longevity',
        title: 'Quality & Longevity',
        value: '67%',
        description: 'Of DIY or poor quality work fails within 5 years',
        source: 'National Contractors Association'
      },
      {
        type: 'local_demand',
        title: 'Market Demand',
        value: 'High',
        description: `Strong demand for professional ${submittedService} services`,
        source: 'Local Market Data'
      }
    ];
    
    setMarketInsights(fallbackInsights);
    return fallbackInsights;
  };

  const handleCredentialsSubmit = async () => {
    const credentialsList = selectedCredentials.length > 0 
      ? selectedCredentials.join(", ")
      : "None selected";
    
    addMessage("user", credentialsList);
    
    setTimeout(async () => {
      const hasNoCredentials = selectedCredentials.includes("None yet - I'm just starting") || selectedCredentials.length === 0;
      
      if (hasNoCredentials) {
        addMessage("ai", "No problem! New businesses can build trust using market data. Let me find some industry statistics that will help establish your credibility...", true);
        
        const insights = await fetchMarketInsights();
        
        const insightsSummary = insights.map(i => 
          `• ${i.title}: ${i.value} - ${i.description}`
        ).join('\n');
        
        addMessage(
          "ai",
          `Great news! I found compelling data to build trust without testimonials:\n\n📊 Industry Insights:\n${insightsSummary}\n\nWhich data points best support your value proposition? (Select all that apply)`
        );
        setStep("insightSelection");
      } else {
        addMessage(
          "ai",
          "Excellent! I'll highlight these credentials on your page to build trust immediately.\n\nWhat's your main goal for this page?"
        );
        setStep("goal");
      }
    }, 800);
  };

  const handleInsightToggle = (insightType: string) => {
    setSelectedInsights(prev => 
      prev.includes(insightType)
        ? prev.filter(t => t !== insightType)
        : [...prev, insightType]
    );
  };

  const handleInsightsSubmit = () => {
    const insightsList = selectedInsights.length > 0 
      ? selectedInsights.join(", ")
      : "All insights";
    
    addMessage("user", insightsList);
    
    setTimeout(() => {
      addMessage(
        "ai",
        "Perfect! I'll create a compelling statistics section using this real market data to build instant credibility.\n\nWhat's your main goal for this page?"
      );
      setStep("goal");
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
    <section id="demo" className="relative py-24 md:py-32 px-8 bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950 overflow-hidden">
      
      {/* Background ambient elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl" />
      </div>

      {/* Live Demo floating badge */}
      <div className="absolute top-8 right-8 hidden lg:block z-10">
        <div className="bg-green-500/20 border border-green-400/30 rounded-full px-4 py-2 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-green-400 text-sm font-semibold">Live Demo</span>
          </div>
        </div>
      </div>

      {/* Floating stat card */}
      <div className="absolute bottom-8 left-8 hidden lg:block z-10">
        <div className="bg-slate-800/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl">
          <div className="text-cyan-400 text-sm font-semibold">60 seconds</div>
          <div className="text-gray-400 text-xs">Average demo time</div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-5xl md:text-6xl font-extrabold text-center mb-4">
            <span className="bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent" style={{ textShadow: '0 0 40px rgba(168, 85, 247, 0.3)' }}>
              See the AI Consultant in Action
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-300 text-center max-w-3xl mx-auto leading-relaxed">
            Watch the AI ask intelligent questions and build your strategy in real-time. No signup, no email, just pure proof.
          </p>
        </div>

        <div className="max-w-4xl mx-auto relative group">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-pink-500/20 blur-3xl opacity-60 rounded-3xl" />
          
          {/* Demo card */}
          <div className="relative bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 border-b border-white/10 p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center overflow-hidden">
                  <img src={aiChatIcon} alt="AI" className="w-6 h-6 object-contain" />
                </div>
                <div>
                  <div className="text-white font-bold text-lg">AI Consultant Demo</div>
                  <div className="text-cyan-400 text-sm font-medium">Building your strategy...</div>
                </div>
              </div>
              <button className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-cyan-500/50 hover:scale-105 transform transition-all duration-300">
                → Try Free
              </button>
            </div>

            <div 
              ref={chatContainerRef}
              className="p-8 space-y-6 max-h-[520px] overflow-y-auto"
              style={{ scrollBehavior: 'smooth' }}
            >
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-4 animate-fade-in ${
                    message.role === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === "ai"
                        ? "bg-gradient-to-br from-cyan-400 to-purple-500 overflow-hidden"
                        : "bg-slate-700 text-white"
                    }`}
                  >
                    {message.role === "ai" ? (
                      <img src={aiChatIconInChat} alt="AI" className="w-5 h-5 object-contain" />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                  </div>
                  <div
                    className={`rounded-2xl px-6 py-4 max-w-md ${
                      message.role === "ai"
                        ? "bg-slate-800/60 backdrop-blur-sm border border-white/5 text-gray-200"
                        : "bg-cyan-500 text-slate-900 ml-auto"
                    }`}
                  >
                    {message.isLoading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Researching...</span>
                      </div>
                    ) : (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    )}
                  </div>
                </div>
              ))}

              {step === "industry" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto mt-8 animate-fade-in">
                  {industries.map((industry) => (
                    <button
                      key={industry.title}
                      onClick={(e) => handleIndustrySelect(e, industry.title)}
                      className="group relative bg-slate-800/40 backdrop-blur-sm border border-white/10 hover:border-cyan-400/50 rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-cyan-500/20 text-left"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-purple-500/0 group-hover:from-cyan-500/10 group-hover:to-purple-500/10 rounded-2xl transition-all duration-300" />
                      
                      <div className="relative flex items-start gap-4">
                        <div className="text-4xl group-hover:scale-110 transition-transform duration-300" style={{ filter: 'drop-shadow(0 0 12px rgba(6, 182, 212, 0.4))' }}>
                          {industry.icon}
                        </div>
                        <div className="flex-1">
                          <div className="text-white font-bold text-lg mb-1 group-hover:text-cyan-400 transition-colors">
                            {industry.title}
                          </div>
                          <div className="text-gray-400 text-sm">
                            {industry.subtitle}
                          </div>
                        </div>
                        <div className="text-cyan-400 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-300">
                          →
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {step === "goal" && (
                <div className="grid grid-cols-1 gap-4 max-w-3xl mx-auto mt-8 animate-fade-in">
                  {goals.map((goal) => (
                    <button
                      key={goal.title}
                      onClick={(e) => handleGoalSelect(e, goal.title)}
                      className="group relative bg-slate-800/40 backdrop-blur-sm border border-white/10 hover:border-cyan-400/50 rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-cyan-500/20 text-left"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-purple-500/0 group-hover:from-cyan-500/10 group-hover:to-purple-500/10 rounded-2xl transition-all duration-300" />
                      
                      <div className="relative flex items-start gap-4">
                        <div className="text-4xl group-hover:scale-110 transition-transform duration-300" style={{ filter: 'drop-shadow(0 0 12px rgba(6, 182, 212, 0.4))' }}>
                          {goal.icon}
                        </div>
                        <div className="flex-1">
                          <div className="text-white font-bold text-lg mb-1 group-hover:text-cyan-400 transition-colors">
                            {goal.title}
                          </div>
                          <div className="text-gray-400 text-sm">
                            {goal.subtitle}
                          </div>
                        </div>
                        <div className="text-cyan-400 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-300">
                          →
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {step === "specificService" && (
                <div className="animate-fade-in space-y-4 max-w-xl mx-auto">
                  <Input
                    placeholder="e.g., Roofing, Plumbing, Electrical..."
                    value={specificService}
                    onChange={(e) => setSpecificService(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSpecificServiceSubmit();
                      }
                    }}
                    className="bg-slate-800/60 border-white/10 text-white placeholder:text-gray-500 focus:border-cyan-400 rounded-xl px-6 py-3"
                  />
                  <Button
                    onClick={handleSpecificServiceSubmit}
                    className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold rounded-xl py-3"
                    disabled={!specificService.trim()}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Submit
                  </Button>
                </div>
              )}

              {step === "audience" && (
                <div className="animate-fade-in space-y-4 max-w-xl mx-auto">
                  <Input
                    placeholder="e.g., Homeowners in Austin, CTOs at Series B startups..."
                    value={audienceInput}
                    onChange={(e) => setAudienceInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAudienceSubmit();
                      }
                    }}
                    className="bg-slate-800/60 border-white/10 text-white placeholder:text-gray-500 focus:border-cyan-400 rounded-xl px-6 py-3"
                  />
                  <Button
                    onClick={handleAudienceSubmit}
                    className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold rounded-xl py-3"
                    disabled={!audienceInput.trim()}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Submit
                  </Button>
                </div>
              )}

              {step === "hesitation" && (
                <div className="space-y-4 animate-fade-in max-w-3xl mx-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {hesitations.filter(h => h.title !== "Other").map((hesitation) => (
                      <button
                        key={hesitation.title}
                        onClick={(e) => handleHesitationSelect(e, hesitation.title)}
                        className="group relative bg-slate-800/40 backdrop-blur-sm border border-white/10 hover:border-cyan-400/50 rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-cyan-500/20 text-left"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-purple-500/0 group-hover:from-cyan-500/10 group-hover:to-purple-500/10 rounded-2xl transition-all duration-300" />
                        
                        <div className="relative flex items-center gap-4">
                          <div className="text-3xl group-hover:scale-110 transition-transform duration-300">
                            {hesitation.icon}
                          </div>
                          <div className="font-semibold text-white text-base group-hover:text-cyan-400 transition-colors">
                            {hesitation.title}
                          </div>
                          <div className="ml-auto text-cyan-400 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-300">
                            →
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                  
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        const otherButton = document.getElementById('other-hesitation-input');
                        if (otherButton) otherButton.focus();
                      }}
                      className="group relative w-full bg-slate-800/40 backdrop-blur-sm border border-white/10 hover:border-cyan-400/50 rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-cyan-500/20 text-left"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-purple-500/0 group-hover:from-cyan-500/10 group-hover:to-purple-500/10 rounded-2xl transition-all duration-300" />
                      
                      <div className="relative flex items-center gap-4">
                        <span className="text-3xl group-hover:scale-110 transition-transform duration-300">✏️</span>
                        <div className="font-semibold text-white text-base group-hover:text-cyan-400 transition-colors">
                          Other (specify below)
                        </div>
                      </div>
                    </button>
                    
                    <div className="flex gap-2">
                      <Input
                        id="other-hesitation-input"
                        placeholder="Describe the main hesitation..."
                        value={otherHesitation}
                        onChange={(e) => setOtherHesitation(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleOtherHesitationSubmit();
                          }
                        }}
                        className="bg-slate-800/60 border-white/10 text-white placeholder:text-gray-500 focus:border-cyan-400 rounded-xl px-6 py-3"
                      />
                      <Button
                        onClick={handleOtherHesitationSubmit}
                        disabled={!otherHesitation.trim()}
                        size="icon"
                        className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 rounded-xl"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {step === "credentials" && (
                <div className="space-y-4 animate-fade-in max-w-3xl mx-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {credentials.map((credential) => {
                      const isSelected = selectedCredentials.includes(credential.title);
                      return (
                        <button
                          key={credential.title}
                          onClick={() => handleCredentialToggle(credential.title)}
                          className={`group relative backdrop-blur-sm rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-xl text-left ${
                            isSelected
                              ? "bg-cyan-500/20 border-2 border-cyan-400 shadow-cyan-500/30"
                              : "bg-slate-800/40 border border-white/10 hover:border-cyan-400/50 hover:shadow-cyan-500/20"
                          }`}
                        >
                          <div className={`absolute inset-0 bg-gradient-to-br rounded-2xl transition-all duration-300 ${
                            isSelected 
                              ? "from-cyan-500/20 to-purple-500/20" 
                              : "from-cyan-500/0 to-purple-500/0 group-hover:from-cyan-500/10 group-hover:to-purple-500/10"
                          }`} />
                          
                          <div className="relative flex items-center gap-4">
                            <div className="text-3xl group-hover:scale-110 transition-transform duration-300">
                              {credential.icon}
                            </div>
                            <div className={`font-semibold text-base transition-colors ${
                              isSelected ? "text-cyan-400" : "text-white group-hover:text-cyan-400"
                            }`}>
                              {credential.title}
                            </div>
                            {isSelected && (
                              <div className="ml-auto text-cyan-400">✓</div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <Button
                    onClick={handleCredentialsSubmit}
                    className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold rounded-xl py-3"
                  >
                    Continue
                  </Button>
                </div>
              )}

              {step === "insightSelection" && (
                <div className="space-y-4 animate-fade-in max-w-3xl mx-auto">
                  <div className="grid grid-cols-1 gap-4">
                    {marketInsights.map((insight) => {
                      const isSelected = selectedInsights.includes(insight.type);
                      return (
                        <button
                          key={insight.type}
                          onClick={() => handleInsightToggle(insight.type)}
                          className={`group relative backdrop-blur-sm rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-xl text-left ${
                            isSelected
                              ? "bg-cyan-500/20 border-2 border-cyan-400 shadow-cyan-500/30"
                              : "bg-slate-800/40 border border-white/10 hover:border-cyan-400/50 hover:shadow-cyan-500/20"
                          }`}
                        >
                          <div className={`absolute inset-0 bg-gradient-to-br rounded-2xl transition-all duration-300 ${
                            isSelected 
                              ? "from-cyan-500/20 to-purple-500/20" 
                              : "from-cyan-500/0 to-purple-500/0 group-hover:from-cyan-500/10 group-hover:to-purple-500/10"
                          }`} />
                          
                          <div className="relative space-y-3">
                            <div className="flex items-start justify-between gap-4">
                              <div className={`font-bold text-lg transition-colors ${
                                isSelected ? "text-cyan-400" : "text-white"
                              }`}>
                                {insight.title}
                              </div>
                              <div className="text-3xl font-bold text-cyan-400">{insight.value}</div>
                            </div>
                            <div className="text-sm text-gray-300">
                              {insight.description}
                            </div>
                            {insight.source && (
                              <div className="text-xs text-gray-500">
                                Source: {insight.source}
                              </div>
                            )}
                            {isSelected && (
                              <div className="absolute top-0 right-0 text-cyan-400 text-2xl">✓</div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <Button
                    onClick={handleInsightsSubmit}
                    className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold rounded-xl py-3"
                    disabled={selectedInsights.length === 0}
                  >
                    Use Selected Insights
                  </Button>
                </div>
              )}

              {step === "summary" && (
                <div className="animate-fade-in space-y-6 max-w-xl mx-auto">
                  <div className="bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-400/30 rounded-2xl p-8 space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">✨</span>
                      <span className="font-bold text-2xl text-white">Your Strategy is Ready</span>
                    </div>
                    <p className="text-base text-gray-200 leading-relaxed">
                      I've analyzed your business and built a conversion-optimized structure. 
                      Ready to see your page come to life?
                    </p>
                  </div>
                  
                  <Link
                    to="/wizard"
                    className="block w-full"
                  >
                    <Button className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold text-lg py-6 rounded-xl hover:scale-105 transform transition-all duration-300 shadow-lg shadow-cyan-500/50">
                      Start Building My Page - Free
                    </Button>
                  </Link>
                  
                  <p className="text-sm text-center text-gray-400">
                    No credit card required • Takes 2 minutes
                  </p>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {messages.length > 1 && step !== "summary" && (
              <div className="px-8 pb-6 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                  <span>Consultation Progress</span>
                  <span>
                    {step === "industry" ? "10%" : 
                     step === "specificService" ? "25%" :
                     step === "hesitation" ? "40%" :
                     step === "credentials" ? "55%" :
                     step === "insightSelection" ? "70%" :
                     step === "goal" ? "80%" :
                     step === "audience" ? "90%" : "100%"}
                  </span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-500 ease-out"
                    style={{ 
                      width: step === "industry" ? "10%" : 
                             step === "specificService" ? "25%" :
                             step === "hesitation" ? "40%" :
                             step === "credentials" ? "55%" :
                             step === "insightSelection" ? "70%" :
                             step === "goal" ? "80%" :
                             step === "audience" ? "90%" : "100%"
                    }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIDemo;