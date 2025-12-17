import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Send, 
  Laptop2, 
  ShoppingBag, 
  Briefcase, 
  Heart, 
  Home, 
  GraduationCap, 
  UtensilsCrossed, 
  Sparkles,
  BarChart3,
  DollarSign,
  CalendarCheck,
  Bot,
  User,
  Loader2
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

type Message = {
  role: "ai" | "user";
  content: string;
  isTyping?: boolean;
};

type IndustryOption = {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
};

type GoalOption = {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
};

const industries: IndustryOption[] = [
  { icon: <Laptop2 className="h-6 w-6" />, title: "B2B SaaS", subtitle: "Software & platforms" },
  { icon: <ShoppingBag className="h-6 w-6" />, title: "E-commerce", subtitle: "Products & retail" },
  { icon: <Briefcase className="h-6 w-6" />, title: "Professional Services", subtitle: "Consulting & finance" },
  { icon: <Heart className="h-6 w-6" />, title: "Healthcare", subtitle: "Medical & wellness" },
  { icon: <Home className="h-6 w-6" />, title: "Real Estate", subtitle: "Property & rentals" },
  { icon: <GraduationCap className="h-6 w-6" />, title: "Education", subtitle: "Courses & coaching" },
  { icon: <UtensilsCrossed className="h-6 w-6" />, title: "Food & Beverage", subtitle: "Restaurants & CPG" },
  { icon: <Sparkles className="h-6 w-6" />, title: "Other", subtitle: "Tell me more" },
];

const goals: GoalOption[] = [
  { icon: <BarChart3 className="h-6 w-6" />, title: "Generate Leads", subtitle: "Trials, demos, consultations" },
  { icon: <DollarSign className="h-6 w-6" />, title: "Drive Sales", subtitle: "Purchases & subscriptions" },
  { icon: <CalendarCheck className="h-6 w-6" />, title: "Book Meetings", subtitle: "Sales calls & demos" },
];

const stepInfo: Record<string, { number: number; label: string }> = {
  industry: { number: 1, label: "Industry" },
  specificService: { number: 2, label: "Service" },
  goal: { number: 3, label: "Goal" },
  audience: { number: 4, label: "Audience" },
  challenge: { number: 5, label: "Challenge" },
  uniqueValue: { number: 6, label: "Differentiator" },
  summary: { number: 7, label: "Complete" },
};

const AIDemo = () => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      content: "Hi there! I'm your AI strategist. Let's build a page that converts.\n\nBefore we dive into design, I need to understand your business. This takes about 60 seconds and ensures we create exactly what you need.\n\nFirst question: What industry are you in?",
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
    if (chatContainerRef.current) {
      const scrollHeight = chatContainerRef.current.scrollHeight;
      const clientHeight = chatContainerRef.current.clientHeight;
      const maxScroll = scrollHeight - clientHeight;
      const targetScroll = Math.max(0, maxScroll - 250);
      
      chatContainerRef.current.scrollTo({
        top: targetScroll,
        behavior: "smooth"
      });
    }
  };

  const addAIMessage = (content: string) => {
    setIsThinking(true);
    setTimeout(() => {
      setIsThinking(false);
      setMessages((prev) => [...prev, { role: "ai", content }]);
    }, 1000);
  };

  const addUserMessage = (content: string) => {
    setMessages((prev) => [...prev, { role: "user", content }]);
  };

  const handleIndustrySelect = (e: any, industry: string) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    
    setSelectedIndustry(industry);
    addUserMessage(industry);
    
    setTimeout(() => {
      addAIMessage("Great choice! Let's get specific—what product or service do you offer?\n\nFor example: 'CRM Software', 'Marketing Agency', 'Online Courses'");
      setStep("specificService");
    }, 300);
  };

  const handleServiceSubmit = () => {
    if (!specificService.trim()) return;
    
    const service = specificService.trim();
    setSubmittedService(service);
    addUserMessage(service);
    
    setTimeout(() => {
      addAIMessage("Perfect! Now let's define your strategy.\n\nWhat's the primary goal for this landing page?");
      setStep("goal");
    }, 300);
    
    setSpecificService("");
  };

  const handleGoalSelect = (e: any, goal: string) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    
    setSelectedGoal(goal);
    addUserMessage(goal);
    
    setTimeout(() => {
      addAIMessage("Excellent choice! Now I need to understand your audience.\n\nWho exactly are you trying to reach? Be as specific as possible.\n\nExample: 'B2B companies with 50-200 employees' or 'Homeowners aged 35-55'");
      setStep("audience");
    }, 300);
  };

  const handleAudienceSubmit = () => {
    if (!audienceInput.trim()) return;
    
    const audience = audienceInput.trim();
    setSubmittedAudience(audience);
    addUserMessage(audience);
    
    setTimeout(() => {
      addAIMessage("Got it! Now let's identify the problem you solve.\n\nWhat's the #1 challenge your customers face that your solution addresses?");
      setStep("challenge");
    }, 300);
    
    setAudienceInput("");
  };

  const handleChallengeSubmit = () => {
    if (!challengeInput.trim()) return;
    
    const challenge = challengeInput.trim();
    setSubmittedChallenge(challenge);
    addUserMessage(challenge);
    
    setTimeout(() => {
      addAIMessage("Perfect! Last question—this is the most important one.\n\nWhat makes YOUR solution different from competitors? Why should customers choose you?");
      setStep("uniqueValue");
    }, 300);
    
    setChallengeInput("");
  };

  const handleUniqueValueSubmit = () => {
    if (!uniqueValueInput.trim()) return;
    
    const uniqueValue = uniqueValueInput.trim();
    setSubmittedUniqueValue(uniqueValue);
    addUserMessage(uniqueValue);
    
    setTimeout(() => {
      addAIMessage("Excellent! I've analyzed everything and built your personalized strategy.\n\nYour page will include:\n• Compelling headline targeting your exact audience\n• Problem/solution section addressing their pain points\n• Feature showcase highlighting your unique value\n• Social proof elements to build trust\n• Strategic CTAs optimized for conversions\n\nCreate a free account to save your progress and generate your page!");
      setStep("summary");
    }, 300);
    
    setUniqueValueInput("");
  };

  const currentStep = stepInfo[step];
  const progressPercent = ((currentStep.number - 1) / 6) * 100;

  return (
    <section id="demo" className="relative py-24 md:py-32 overflow-hidden">
      {/* Premium background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
      
      {/* Mesh gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-pink-500/5 rounded-full blur-[100px]" />
      </div>

      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,black_40%,transparent_100%)]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-6">
            <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
            <span className="text-cyan-400 text-sm font-medium">Interactive Demo</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
              See the AI Strategist
            </span>
            <br />
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              in Action
            </span>
          </h2>
          <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto">
            Experience how our AI builds your conversion strategy in real-time. No signup required.
          </p>
        </div>

        {/* Main demo container */}
        <div className="relative max-w-4xl mx-auto">
          {/* Outer glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-xl opacity-60" />
          
          {/* Demo card */}
          <div className="relative bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            
            {/* Progress bar at top */}
            <div className="px-6 py-4 border-b border-white/5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <span className="text-white/90 font-medium text-sm">AI Strategy Session</span>
                    <span className="text-white/40 text-sm ml-2">• Step {currentStep.number} of 7</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Link 
                    to="/signup?mode=login" 
                    className="text-white/50 hover:text-white text-sm font-medium transition-colors"
                  >
                    Sign in
                  </Link>
                  <Link to="/signup">
                    <Button size="sm" className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold rounded-lg shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all">
                      Get Started
                    </Button>
                  </Link>
                </div>
              </div>
              
              {/* Progress track */}
              <div className="relative h-1 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
                <div 
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full blur-sm transition-all duration-700 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Chat area */}
            <div 
              ref={chatContainerRef}
              className="p-6 space-y-6 max-h-[480px] md:max-h-[520px] lg:max-h-[560px] overflow-y-auto scroll-smooth"
            >
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex gap-3 animate-fade-in",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {message.role === "ai" && (
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/20">
                      <Bot className="h-5 w-5 text-white" />
                    </div>
                  )}
                  
                  {message.role === "ai" ? (
                    <div className="relative max-w-[85%]">
                      {/* Subtle glow behind AI messages */}
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-2xl blur-sm opacity-50" />
                      <div className="relative bg-slate-800/80 backdrop-blur-xl rounded-2xl rounded-tl-md p-5 border border-white/10">
                        <p className="text-white/90 text-[15px] leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="max-w-[85%] bg-gradient-to-r from-cyan-500 to-cyan-400 text-slate-900 rounded-2xl rounded-tr-md p-5 shadow-lg shadow-cyan-500/20">
                      <p className="font-medium text-[15px]">{message.content}</p>
                    </div>
                  )}
                  
                  {message.role === "user" && (
                    <div className="w-9 h-9 rounded-xl bg-slate-700 flex items-center justify-center flex-shrink-0">
                      <User className="h-5 w-5 text-white/70" />
                    </div>
                  )}
                </div>
              ))}

              {/* Thinking indicator */}
              {isThinking && (
                <div className="flex gap-3 animate-fade-in">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/20">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div className="bg-slate-800/80 backdrop-blur-xl rounded-2xl rounded-tl-md px-5 py-4 border border-white/10">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 text-cyan-400 animate-spin" />
                      <span className="text-white/50 text-sm">Analyzing...</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Industry selection */}
              {step === "industry" && !isThinking && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
                  {industries.map((industry, index) => (
                    <motion.button
                      key={industry.title}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.3, ease: "easeOut" }}
                      onClick={(e) => handleIndustrySelect(e, industry.title)}
                      className="group relative cursor-pointer text-left"
                    >
                      {/* Hover glow */}
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl opacity-0 group-hover:opacity-30 blur transition-all duration-300" />
                      
                      <div className="relative bg-slate-800/50 backdrop-blur-xl rounded-xl p-4 border border-white/10 
                                      hover:border-cyan-500/50 hover:bg-slate-800/70 
                                      transition-all duration-300 hover:-translate-y-1 h-full">
                        {/* Icon */}
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 
                                        flex items-center justify-center mb-3 
                                        group-hover:from-cyan-500/30 group-hover:to-purple-500/30 transition-all text-cyan-400">
                          {industry.icon}
                        </div>
                        
                        <h3 className="text-white font-semibold text-sm mb-0.5 group-hover:text-cyan-400 transition-colors">
                          {industry.title}
                        </h3>
                        <p className="text-white/40 text-xs">{industry.subtitle}</p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}

              {/* Service input */}
              {step === "specificService" && !isThinking && (
                <div className="space-y-3 mt-6 animate-fade-in max-w-lg">
                  <Input
                    type="text"
                    placeholder="Type your product/service..."
                    value={specificService}
                    onChange={(e) => setSpecificService(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleServiceSubmit()}
                    className="bg-slate-800/60 border-white/10 text-white placeholder:text-white/30 rounded-xl px-4 py-3 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                  />
                  <Button
                    onClick={handleServiceSubmit}
                    disabled={!specificService.trim()}
                    className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold rounded-xl py-3 disabled:opacity-50 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Continue
                  </Button>
                </div>
              )}

              {/* Goal selection */}
              {step === "goal" && !isThinking && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6">
                  {goals.map((goal, index) => (
                    <motion.button
                      key={goal.title}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.3, ease: "easeOut" }}
                      onClick={(e) => handleGoalSelect(e, goal.title)}
                      className="group relative cursor-pointer text-left"
                    >
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl opacity-0 group-hover:opacity-30 blur transition-all duration-300" />
                      
                      <div className="relative bg-slate-800/50 backdrop-blur-xl rounded-xl p-5 border border-white/10 
                                      hover:border-cyan-500/50 hover:bg-slate-800/70 
                                      transition-all duration-300 hover:-translate-y-1">
                        <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 
                                        flex items-center justify-center mb-3 
                                        group-hover:from-cyan-500/30 group-hover:to-purple-500/30 transition-all text-cyan-400">
                          {goal.icon}
                        </div>
                        
                        <h3 className="text-white font-semibold mb-1 group-hover:text-cyan-400 transition-colors">
                          {goal.title}
                        </h3>
                        <p className="text-white/40 text-sm">{goal.subtitle}</p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}

              {/* Audience input */}
              {step === "audience" && !isThinking && (
                <div className="space-y-3 mt-6 animate-fade-in max-w-lg">
                  <Input
                    type="text"
                    placeholder="Describe your target audience..."
                    value={audienceInput}
                    onChange={(e) => setAudienceInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAudienceSubmit()}
                    className="bg-slate-800/60 border-white/10 text-white placeholder:text-white/30 rounded-xl px-4 py-3 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                  />
                  <Button
                    onClick={handleAudienceSubmit}
                    disabled={!audienceInput.trim()}
                    className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold rounded-xl py-3 disabled:opacity-50 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Continue
                  </Button>
                </div>
              )}

              {/* Challenge input */}
              {step === "challenge" && !isThinking && (
                <div className="space-y-3 mt-6 animate-fade-in max-w-lg">
                  <Input
                    type="text"
                    placeholder="What problem do you solve?"
                    value={challengeInput}
                    onChange={(e) => setChallengeInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleChallengeSubmit()}
                    className="bg-slate-800/60 border-white/10 text-white placeholder:text-white/30 rounded-xl px-4 py-3 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                  />
                  <Button
                    onClick={handleChallengeSubmit}
                    disabled={!challengeInput.trim()}
                    className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold rounded-xl py-3 disabled:opacity-50 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Continue
                  </Button>
                </div>
              )}

              {/* Unique value input */}
              {step === "uniqueValue" && !isThinking && (
                <div className="space-y-3 mt-6 animate-fade-in max-w-lg">
                  <Input
                    type="text"
                    placeholder="What makes you different?"
                    value={uniqueValueInput}
                    onChange={(e) => setUniqueValueInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleUniqueValueSubmit()}
                    className="bg-slate-800/60 border-white/10 text-white placeholder:text-white/30 rounded-xl px-4 py-3 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                  />
                  <Button
                    onClick={handleUniqueValueSubmit}
                    disabled={!uniqueValueInput.trim()}
                    className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold rounded-xl py-3 disabled:opacity-50 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Complete Analysis
                  </Button>
                </div>
              )}

              {/* Summary */}
              {step === "summary" && !isThinking && (
                <div className="animate-fade-in space-y-5 max-w-lg mx-auto mt-6">
                  <div className="relative">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-2xl opacity-30 blur" />
                    <div className="relative bg-slate-800/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
                          <Sparkles className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-bold text-xl text-white">Your Strategy is Ready</span>
                      </div>
                      <p className="text-white/70 leading-relaxed">
                        I've analyzed your business and built a conversion-optimized structure tailored to your industry and audience. Create a free account to generate your page!
                      </p>
                    </div>
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
                    <Button className="w-full bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-slate-900 font-bold text-base py-6 rounded-xl hover:scale-[1.02] transform transition-all duration-300 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50">
                      Create Free Account & Generate Page
                    </Button>
                  </Link>
                  
                  <p className="text-sm text-center text-white/40">
                    No credit card required • Takes 30 seconds
                  </p>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>

        {/* Bottom stats */}
        <div className="flex justify-center gap-8 mt-10 text-center">
          <div>
            <div className="text-2xl font-bold text-white">60s</div>
            <div className="text-white/40 text-sm">Average time</div>
          </div>
          <div className="w-px bg-white/10" />
          <div>
            <div className="text-2xl font-bold text-white">2.4x</div>
            <div className="text-white/40 text-sm">Higher conversions</div>
          </div>
          <div className="w-px bg-white/10 hidden sm:block" />
          <div className="hidden sm:block">
            <div className="text-2xl font-bold text-white">500+</div>
            <div className="text-white/40 text-sm">Pages generated</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIDemo;
