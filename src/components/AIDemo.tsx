import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { Link } from "react-router-dom";
import aiChatIcon from "@/assets/ai-chat-icon.png";
import aiChatIconInChat from "@/assets/ai-chat-icon-inchat.png";

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

const AIDemo = () => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      content: "Hey! I'm excited to help you build a page that converts.\n\nBefore we jump into design, let's have a quick strategy chat—this ensures we build exactly what your business needs.\n\nFirst up: What industry are you in?",
    },
  ]);
  const [step, setStep] = useState<"industry" | "specificService" | "goal" | "audience" | "challenge" | "uniqueValue" | "summary">("industry");
  const [selectedIndustry, setSelectedIndustry] = useState<string>("");
  const [specificService, setSpecificService] = useState<string>("");
  const [submittedService, setSubmittedService] = useState<string>("");
  const [selectedGoal, setSelectedGoal] = useState<string>("");
  const [audienceInput, setAudienceInput] = useState("");
  const [submittedAudience, setSubmittedAudience] = useState("");
  const [challengeInput, setChallengeInput] = useState("");
  const [submittedChallenge, setSubmittedChallenge] = useState("");
  const [uniqueValueInput, setUniqueValueInput] = useState("");
  const [submittedUniqueValue, setSubmittedUniqueValue] = useState("");

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    // Smart scroll: keep 250px visible above bottom to show questions
    if (chatContainerRef.current) {
      const scrollHeight = chatContainerRef.current.scrollHeight;
      const clientHeight = chatContainerRef.current.clientHeight;
      const maxScroll = scrollHeight - clientHeight;
      const targetScroll = Math.max(0, maxScroll - 250); // Keep 250px visible
      
      chatContainerRef.current.scrollTo({
        top: targetScroll,
        behavior: "smooth"
      });
    }
  };

  const addMessage = (role: "ai" | "user", content: string, isTyping = false) => {
    setMessages((prev) => [...prev, { role, content, isTyping }]);
  };

  const handleIndustrySelect = (e: any, industry: string) => {
    if (window.event) {
      window.event.preventDefault();
      window.event.stopPropagation();
    }
    
    setSelectedIndustry(industry);
    addMessage("user", industry);
    
    setTimeout(() => {
      addMessage("ai", "Great choice! Let's get specific—what product or service do you offer?\n\n(e.g., 'CRM Software', 'Marketing Agency', 'Online Courses')");
      setStep("specificService");
    }, 800);
    
    return false;
  };

  const handleServiceSubmit = () => {
    if (!specificService.trim()) return;
    
    const service = specificService.trim();
    setSubmittedService(service);
    addMessage("user", service);
    
    setTimeout(() => {
      addMessage("ai", "Perfect! Now let's nail down your strategy.\n\nWhat's your main goal for this page?");
      setStep("goal");
    }, 800);
    
    setSpecificService("");
  };

  const handleGoalSelect = (e: any, goal: string) => {
    if (window.event) {
      window.event.preventDefault();
      window.event.stopPropagation();
    }
    
    setSelectedGoal(goal);
    addMessage("user", goal);
    
    setTimeout(() => {
      addMessage("ai", "Excellent! Now I need to understand your audience.\n\nWho exactly are you trying to reach? Be specific!\n\n(e.g., 'B2B companies with 50-200 employees', 'Homeowners aged 35-55')");
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
      addMessage("ai", "Great! Now let's talk about the problem you solve.\n\nWhat's the #1 challenge your customers face that your solution addresses?\n\n(e.g., 'Wasting time on manual data entry', 'Struggling to generate qualified leads')");
      setStep("challenge");
    }, 800);
    
    setAudienceInput("");
  };

  const handleChallengeSubmit = () => {
    if (!challengeInput.trim()) return;
    
    const challenge = challengeInput.trim();
    setSubmittedChallenge(challenge);
    addMessage("user", challenge);
    
    setTimeout(() => {
      addMessage("ai", "Perfect! Last question—this is the most important one.\n\nWhat makes YOUR solution different from competitors? Why should customers choose you?\n\n(e.g., '24/7 support with 10-minute response time', '15 years experience with 500+ projects')");
      setStep("uniqueValue");
    }, 800);
    
    setChallengeInput("");
  };

  const handleUniqueValueSubmit = () => {
    if (!uniqueValueInput.trim()) return;
    
    const uniqueValue = uniqueValueInput.trim();
    setSubmittedUniqueValue(uniqueValue);
    addMessage("user", uniqueValue);
    
    setTimeout(() => {
      addMessage("ai", "🎉 Amazing! I've analyzed everything and built your strategy.\n\nYour page will include:\n• Compelling headline targeting your exact audience\n• Problem/solution section addressing their pain\n• Feature showcase highlighting your unique value\n• Social proof to build trust\n• Strategic CTAs optimized for conversions\n• Professional design that matches your industry\n\nCreate a free account to save your progress and generate your page!");
      setStep("summary");
    }, 1200);
    
    setUniqueValueInput("");
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

        <div className="max-w-5xl lg:max-w-7xl mx-auto relative group">
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
              className="p-8 space-y-6 max-h-[500px] md:max-h-[560px] lg:max-h-[600px] overflow-y-auto"
              style={{ scrollBehavior: 'smooth' }}
            >
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-4 ${message.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
                >
                  {message.role === "ai" && (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      <img src={aiChatIconInChat} alt="AI" className="w-5 h-5 object-contain" />
                    </div>
                  )}
                  
                  <div
                    className={`max-w-[80%] ${
                      message.role === "user"
                        ? "bg-cyan-500 text-slate-900"
                        : "bg-slate-800/60 text-gray-200"
                    } backdrop-blur-sm rounded-2xl p-6 shadow-xl border ${
                      message.role === "user" ? "border-cyan-400/30" : "border-white/5"
                    }`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  </div>
                  
                  {message.role === "user" && (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-600 to-gray-400 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-lg">👤</span>
                    </div>
                  )}
                </div>
              ))}

              {step === "industry" && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-full mt-8 animate-fade-in">
                  {industries.map((industry) => (
                    <button
                      key={industry.title}
                      onClick={(e) => handleIndustrySelect(e, industry.title)}
                      className="group relative bg-slate-800/40 backdrop-blur-sm border border-white/10 hover:border-cyan-400/50 rounded-2xl p-5 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-cyan-500/20 text-center"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-purple-500/0 group-hover:from-cyan-500/10 group-hover:to-purple-500/10 rounded-2xl transition-all duration-300" />
                      
                      <div className="relative space-y-3">
                        <div className="text-4xl group-hover:scale-110 transition-transform duration-300 mx-auto w-fit" style={{ filter: 'drop-shadow(0 0 12px rgba(6, 182, 212, 0.4))' }}>
                          {industry.icon}
                        </div>
                        <div>
                          <div className="text-white font-bold text-base mb-1 group-hover:text-cyan-400 transition-colors">
                            {industry.title}
                          </div>
                          <div className="text-gray-400 text-xs">
                            {industry.subtitle}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {step === "specificService" && (
                <div className="space-y-4 mt-8 animate-fade-in">
                  <Input
                    type="text"
                    placeholder="Type your product/service..."
                    value={specificService}
                    onChange={(e) => setSpecificService(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleServiceSubmit()}
                    className="bg-slate-800/60 border-white/10 text-white placeholder:text-gray-400 rounded-xl px-4 py-3 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                  />
                  <Button
                    onClick={handleServiceSubmit}
                    disabled={!specificService.trim()}
                    className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold rounded-xl py-3 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Submit
                  </Button>
                </div>
              )}

              {step === "goal" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-full mt-8 animate-fade-in">
                  {goals.map((goal) => (
                    <button
                      key={goal.title}
                      onClick={(e) => handleGoalSelect(e, goal.title)}
                      className="group relative bg-slate-800/40 backdrop-blur-sm border border-white/10 hover:border-cyan-400/50 rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-cyan-500/20 text-center"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-purple-500/0 group-hover:from-cyan-500/10 group-hover:to-purple-500/10 rounded-2xl transition-all duration-300" />
                      
                      <div className="relative space-y-3">
                        <div className="text-4xl group-hover:scale-110 transition-transform duration-300 mx-auto w-fit">
                          {goal.icon}
                        </div>
                        <div>
                          <div className="text-white font-bold text-base mb-1 group-hover:text-cyan-400 transition-colors">
                            {goal.title}
                          </div>
                          <div className="text-gray-400 text-xs">
                            {goal.subtitle}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {step === "audience" && (
                <div className="space-y-4 mt-8 animate-fade-in">
                  <Input
                    type="text"
                    placeholder="Type your target audience..."
                    value={audienceInput}
                    onChange={(e) => setAudienceInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAudienceSubmit()}
                    className="bg-slate-800/60 border-white/10 text-white placeholder:text-gray-400 rounded-xl px-4 py-3 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                  />
                  <Button
                    onClick={handleAudienceSubmit}
                    disabled={!audienceInput.trim()}
                    className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold rounded-xl py-3 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Submit
                  </Button>
                </div>
              )}

              {step === "challenge" && (
                <div className="space-y-4 mt-8 animate-fade-in">
                  <Input
                    type="text"
                    placeholder="Type the main challenge you solve..."
                    value={challengeInput}
                    onChange={(e) => setChallengeInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleChallengeSubmit()}
                    className="bg-slate-800/60 border-white/10 text-white placeholder:text-gray-400 rounded-xl px-4 py-3 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                  />
                  <Button
                    onClick={handleChallengeSubmit}
                    disabled={!challengeInput.trim()}
                    className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold rounded-xl py-3 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Submit
                  </Button>
                </div>
              )}

              {step === "uniqueValue" && (
                <div className="space-y-4 mt-8 animate-fade-in">
                  <Input
                    type="text"
                    placeholder="Type what makes you different..."
                    value={uniqueValueInput}
                    onChange={(e) => setUniqueValueInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleUniqueValueSubmit()}
                    className="bg-slate-800/60 border-white/10 text-white placeholder:text-gray-400 rounded-xl px-4 py-3 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                  />
                  <Button
                    onClick={handleUniqueValueSubmit}
                    disabled={!uniqueValueInput.trim()}
                    className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold rounded-xl py-3 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Submit
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
                      Create a free account to save your progress and generate your page!
                    </p>
                  </div>
                  
                  <Link
                    to="/signup"
                    state={{
                      consultationData: {
                        industry: selectedIndustry,
                        specificService: submittedService,
                        goal: selectedGoal,
                        targetAudience: submittedAudience,
                        challenge: submittedChallenge,
                        uniqueValue: submittedUniqueValue,
                        timestamp: new Date().toISOString()
                      },
                      redirectTo: '/generate'
                    }}
                    className="block w-full"
                  >
                    <Button className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold text-lg py-6 rounded-xl hover:scale-105 transform transition-all duration-300 shadow-lg shadow-cyan-500/50">
                      Create Free Account & Generate Page →
                    </Button>
                  </Link>
                  
                  <p className="text-sm text-center text-gray-400">
                    No credit card required • Takes 30 seconds
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
                     step === "specificService" ? "20%" :
                     step === "goal" ? "35%" :
                     step === "audience" ? "50%" :
                     step === "challenge" ? "65%" :
                     step === "uniqueValue" ? "80%" : "100%"}
                  </span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-500 ease-out"
                    style={{ 
                      width: step === "industry" ? "10%" : 
                             step === "specificService" ? "20%" :
                             step === "goal" ? "35%" :
                             step === "audience" ? "50%" :
                             step === "challenge" ? "65%" :
                             step === "uniqueValue" ? "80%" : "100%"
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
