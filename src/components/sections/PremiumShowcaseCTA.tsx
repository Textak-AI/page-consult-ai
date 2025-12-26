import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ArrowRight, Sparkles, Building2, Users, Target, 
  CheckCircle2, MessageSquare, FileText, Monitor,
  Clock, ExternalLink, Loader2, Zap, Shield,
  Send
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

// Example data for showcase
const EXAMPLE_DATA = {
  companyName: "TechFlow Solutions",
  industry: "B2B SaaS",
  audience: "Operations Directors at mid-market companies",
  goal: "Generate qualified demo requests",
  keyInsight: "Operations Directors are measured on efficiency metrics — your page needs to show time savings in their language, not yours.",
  heroHeadline: "Cut Manual Workflows by 10 Hours/Week",
  heroSubhead: "Operations teams at 200+ companies use TechFlow to automate the busywork.",
  pageFeatures: [
    "Strategy-driven headline",
    "ROI calculator included",
    "Trust signals for Ops Directors",
    "Low-friction demo CTA"
  ],
  briefUrl: "/examples/techflow-brief",
  pageUrl: "/examples/techflow-page",
};

// Chat flow for lead gen
const CHAT_FLOW = [
  { key: 'companyName', question: "What's your company or project name?", placeholder: "Acme Corp" },
  { key: 'industry', question: "What industry are you in?", placeholder: "B2B SaaS, E-commerce, etc." },
  { key: 'email', question: "Where should I send your strategy preview?", placeholder: "you@company.com" },
];

const AI_RESPONSES: Record<string, (value: string) => string> = {
  companyName: (name) => `${name} — great name. Let me understand your market.`,
  industry: (industry) => `${industry} — I know this space. Your buyers have specific objections we can address.`,
  email: (email) => `Perfect! I'll analyze your market and send strategic insights to ${email}. Ready to build your page?`,
};

interface ChatMessage {
  role: 'ai' | 'user';
  content: string;
}

interface Props {
  primaryColor?: string;
  onStartConsultation?: (data: Record<string, string>) => void;
}

export function PremiumShowcaseCTA({ 
  primaryColor = '#7C3AED',
  onStartConsultation 
}: Props) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'example' | 'try'>('example');
  const [chatStep, setChatStep] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [leadData, setLeadData] = useState<Record<string, string>>({});
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'ai', content: "Let's see what we'd build for you. " + CHAT_FLOW[0].question }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [isHoveringPage, setIsHoveringPage] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Progress calculation
  const progress = (Object.keys(leadData).length / CHAT_FLOW.length) * 100;
  const isComplete = Object.keys(leadData).length >= CHAT_FLOW.length;
  
  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isTyping) return;
    
    const currentQuestion = CHAT_FLOW[chatStep];
    const userInput = inputValue.trim();
    
    // Validate email if on email step
    if (currentQuestion.key === 'email' && !userInput.includes('@')) {
      return;
    }
    
    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userInput }]);
    setLeadData(prev => ({ ...prev, [currentQuestion.key]: userInput }));
    setInputValue('');
    setIsTyping(true);
    
    // Simulate AI response
    await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 400));
    
    const response = AI_RESPONSES[currentQuestion.key](userInput);
    setMessages(prev => [...prev, { role: 'ai', content: response }]);
    
    // Move to next question or complete
    if (chatStep < CHAT_FLOW.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 400));
      const nextQuestion = CHAT_FLOW[chatStep + 1].question;
      setMessages(prev => [...prev, { role: 'ai', content: nextQuestion }]);
      setChatStep(prev => prev + 1);
    }
    
    setIsTyping(false);
    inputRef.current?.focus();
  };

  const handleStartConsultation = () => {
    if (onStartConsultation) {
      onStartConsultation(leadData);
    } else {
      navigate('/new', { 
        state: { prefillData: leadData, source: 'landing_cta' } 
      });
    }
  };

  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      {/* Premium gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-purple-950/20 to-slate-950" />
      
      {/* Animated mesh gradient */}
      <div className="absolute inset-0 opacity-30">
        <div 
          className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full blur-[120px] animate-pulse"
          style={{ background: `radial-gradient(circle, ${primaryColor}40 0%, transparent 70%)` }}
        />
        <div 
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full blur-[100px] animate-pulse"
          style={{ background: 'radial-gradient(circle, rgba(6, 182, 212, 0.3) 0%, transparent 70%)', animationDelay: '1s' }}
        />
      </div>
      
      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}
      />
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 rounded-full px-4 py-1.5 mb-6">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-purple-300">10-minute process</span>
            <span className="text-gray-600">•</span>
            <span className="text-sm text-cyan-400">No templates</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
              See What You'll Get
            </span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            A real strategy brief and landing page — then try it yourself
          </p>
        </div>
        
        {/* Tab Switcher */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-full p-1.5">
            <button
              onClick={() => setActiveTab('example')}
              className={cn(
                "px-6 py-2.5 rounded-full text-sm font-medium transition-all flex items-center gap-2",
                activeTab === 'example' 
                  ? "bg-white text-gray-900 shadow-lg" 
                  : "text-gray-400 hover:text-white"
              )}
            >
              <Monitor className="w-4 h-4" />
              View Example
            </button>
            <button
              onClick={() => setActiveTab('try')}
              className={cn(
                "px-6 py-2.5 rounded-full text-sm font-medium transition-all relative flex items-center gap-2",
                activeTab === 'try' 
                  ? "bg-white text-gray-900 shadow-lg" 
                  : "text-gray-400 hover:text-white"
              )}
            >
              <MessageSquare className="w-4 h-4" />
              Try It Yourself
              {activeTab !== 'try' && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              )}
            </button>
          </div>
        </div>
        
        {/* Main Content Area */}
        <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-800 rounded-3xl overflow-hidden shadow-2xl">
          
          {/* Example Tab */}
          {activeTab === 'example' && (
            <div className="p-6 lg:p-8">
              
              {/* Company Header Bar */}
              <div className="flex items-center justify-between bg-gray-800/50 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                    T
                  </div>
                  <div>
                    <p className="font-semibold text-white">{EXAMPLE_DATA.companyName}</p>
                    <p className="text-sm text-gray-400">{EXAMPLE_DATA.industry} • {EXAMPLE_DATA.goal}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 bg-green-500/20 text-green-400 text-xs font-medium px-3 py-1.5 rounded-full">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    Live Example
                  </span>
                </div>
              </div>
              
              {/* Two Column Content */}
              <div className="grid md:grid-cols-2 gap-6">
                
                {/* Left: Strategy Brief */}
                <div className="bg-gray-800/40 rounded-2xl border border-gray-700/50 overflow-hidden">
                  <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-700/50 bg-gray-800/60">
                    <div className="p-1.5 bg-purple-500/20 rounded-lg">
                      <FileText className="w-4 h-4 text-purple-400" />
                    </div>
                    <span className="text-sm font-medium text-white">Strategy Brief</span>
                  </div>
                  
                  <div className="p-5 space-y-4">
                    {/* Brief Fields */}
                    <div className="space-y-3">
                      {[
                        { icon: Building2, label: 'Industry', value: EXAMPLE_DATA.industry },
                        { icon: Users, label: 'Target Audience', value: EXAMPLE_DATA.audience },
                        { icon: Target, label: 'Page Goal', value: EXAMPLE_DATA.goal },
                      ].map((field) => (
                        <div key={field.label} className="flex items-start gap-3">
                          <field.icon className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs text-gray-500 uppercase tracking-wider">{field.label}</p>
                            <p className="text-sm text-white">{field.value}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* AI Insight */}
                    <div className="bg-gradient-to-br from-purple-500/10 to-cyan-500/10 rounded-xl p-4 border border-purple-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-purple-300">
                          <Sparkles className="w-3 h-3" />
                          AI Strategic Insight
                        </span>
                      </div>
                      <p className="text-sm text-gray-300 italic leading-relaxed">
                        "{EXAMPLE_DATA.keyInsight}"
                      </p>
                    </div>
                    
                    {/* View Brief Button */}
                    <Button variant="outline" className="w-full border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white">
                      View Full Strategy Brief
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
                
                {/* Right: Generated Page */}
                <div className="bg-gray-800/40 rounded-2xl border border-gray-700/50 overflow-hidden">
                  <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-700/50 bg-gray-800/60">
                    <div className="p-1.5 bg-cyan-500/20 rounded-lg">
                      <Monitor className="w-4 h-4 text-cyan-400" />
                    </div>
                    <span className="text-sm font-medium text-white">Generated Page</span>
                  </div>
                  
                  {/* Page Preview with hover effect */}
                  <div 
                    className="relative overflow-hidden cursor-pointer group m-4 rounded-xl"
                    onMouseEnter={() => setIsHoveringPage(true)}
                    onMouseLeave={() => setIsHoveringPage(false)}
                  >
                    <div className={cn(
                      "bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border border-gray-700 p-6 transition-all duration-500",
                      isHoveringPage && "scale-[0.98]"
                    )}>
                      {/* Simulated page content */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">
                            T
                          </div>
                          <div className="h-2 w-20 bg-gray-700 rounded" />
                        </div>
                        <h3 className="text-lg font-bold text-white">{EXAMPLE_DATA.heroHeadline}</h3>
                        <p className="text-sm text-gray-400">{EXAMPLE_DATA.heroSubhead}</p>
                        <div className="inline-flex items-center gap-2 bg-purple-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg">
                          Book a Demo →
                        </div>
                      </div>
                      
                      {/* Animated scroll indicator */}
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
                        <div className="w-4 h-7 border-2 border-gray-600 rounded-full p-1">
                          <div className="w-1 h-2 bg-gray-500 rounded-full mx-auto animate-bounce" />
                        </div>
                      </div>
                    </div>
                    
                    {/* Hover overlay */}
                    <div className={cn(
                      "absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center rounded-xl transition-opacity duration-300",
                      isHoveringPage ? "opacity-100" : "opacity-0"
                    )}>
                      <div className="text-center">
                        <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur flex items-center justify-center mx-auto mb-3">
                          <ExternalLink className="w-6 h-6 text-white" />
                        </div>
                        <p className="text-white font-medium">View Live Page</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Page Features */}
                  <div className="px-5 pb-5 space-y-2">
                    {EXAMPLE_DATA.pageFeatures.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                        <span className="text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* View Page Button */}
                  <div className="px-5 pb-5">
                    <Button variant="outline" className="w-full border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white">
                      View Live Page
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Footer */}
              <div className="mt-6 text-center">
                <p className="text-gray-500 text-sm">
                  Generated in 10 minutes from strategic consultation.
                  <span className="text-gray-400 ml-1">No templates. No guesswork.</span>
                </p>
              </div>
            </div>
          )}
          
          {/* Try It Tab - Interactive Chat */}
          {activeTab === 'try' && (
            <div className="p-6 lg:p-8">
              
              {/* Chat Header */}
              <div className="flex items-center justify-between bg-gray-800/50 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Strategy Consultant</p>
                    <p className="text-sm text-green-400">Online now</p>
                  </div>
                </div>
                
                {/* Progress indicator */}
                <div className="text-right">
                  <div className="flex items-center gap-2 text-sm mb-1">
                    <span className="text-gray-400">Brief Progress</span>
                    <span className="text-white font-medium">{Math.round(progress)}%</span>
                  </div>
                  <div className="w-32 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
              
              {/* Chat Messages */}
              <div className="bg-gray-800/30 rounded-2xl p-4 h-[300px] overflow-y-auto mb-4 space-y-4">
                {messages.map((msg, idx) => (
                  <div 
                    key={idx} 
                    className={cn(
                      "flex",
                      msg.role === 'user' ? "justify-end" : "justify-start"
                    )}
                  >
                    <div className={cn(
                      "max-w-[80%] px-4 py-3 rounded-2xl text-sm",
                      msg.role === 'user' 
                        ? "bg-purple-500 text-white rounded-br-sm" 
                        : "bg-gray-700 text-gray-200 rounded-bl-sm"
                    )}>
                      {msg.role === 'ai' && (
                        <Sparkles className="w-3 h-3 inline mr-2 text-purple-400" />
                      )}
                      {msg.content}
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-700 px-4 py-3 rounded-2xl rounded-bl-sm">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={chatEndRef} />
              </div>
              
              {/* Chat Input */}
              <form onSubmit={handleChatSubmit} className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={isComplete ? "All set! Click below to continue →" : CHAT_FLOW[chatStep]?.placeholder || "Type here..."}
                    disabled={isTyping || isComplete}
                    className="flex-1 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 h-12 rounded-xl"
                    type={CHAT_FLOW[chatStep]?.key === 'email' ? 'email' : 'text'}
                  />
                  <Button 
                    type="submit" 
                    disabled={isTyping || isComplete || !inputValue.trim()} 
                    className="h-12 w-12 rounded-xl bg-purple-500 hover:bg-purple-600"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Quick suggestions */}
                {!isComplete && chatStep === 1 && (
                  <div className="flex flex-wrap gap-2">
                    {['B2B SaaS', 'E-commerce', 'Agency', 'Healthcare'].map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => setInputValue(suggestion)}
                        className="text-xs px-3 py-1.5 rounded-full bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </form>
              
              {/* Lead Capture Success */}
              {isComplete && (
                <div className="mt-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <p className="font-medium text-white">Great! I've got what I need</p>
                      <p className="text-sm text-gray-400 mt-1">
                        I'll send strategic insights to {leadData.email}. Ready to build your full page?
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
        </div>
        
        {/* Primary CTA */}
        <div className="mt-10 text-center">
          <Button
            size="lg"
            onClick={handleStartConsultation}
            className={cn(
              "relative group text-lg px-12 py-8 font-semibold rounded-2xl",
              "shadow-2xl transition-all duration-300",
              "hover:scale-105 bg-purple-600 hover:bg-purple-700"
            )}
            style={{ 
              boxShadow: `0 25px 60px -15px ${primaryColor}50`
            }}
          >
            {/* Shimmer effect */}
            <span className="absolute inset-0 rounded-2xl overflow-hidden">
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </span>
            
            <Zap className="w-5 h-5 mr-2" />
            {isComplete ? 'Continue to Full Consultation' : 'Start Your Free Consultation'}
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          
          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-6 text-sm text-gray-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              No credit card required
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-cyan-400" />
              10 minutes start to finish
            </span>
            <span className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-purple-400" />
              Full page + strategy brief
            </span>
          </div>
        </div>
        
      </div>
    </section>
  );
}
