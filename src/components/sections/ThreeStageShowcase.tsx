import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { 
  ArrowRight, Sparkles, MessageSquare, FileText, Monitor,
  Clock, CheckCircle2, ExternalLink,
  Building2, Users, Target, Lightbulb, Zap,
  Send
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';

// Example consultation Q&A
const CONSULTATION_DATA = [
  { 
    question: "What's your company name?",
    answer: "TechFlow Solutions",
    insight: null
  },
  { 
    question: "What industry are you in?",
    answer: "B2B SaaS — workflow automation",
    insight: "SaaS buyers typically need 3-7 touches before converting. Your page needs multiple proof points."
  },
  { 
    question: "Who is your ideal customer?",
    answer: "Operations Directors at mid-market companies (200-2000 employees)",
    insight: "Ops Directors are measured on efficiency metrics. Lead with time savings, not features."
  },
  { 
    question: "What's your main page goal?",
    answer: "Generate qualified demo requests",
    insight: "Demo requests convert 3x higher than 'contact us' for B2B SaaS."
  },
  { 
    question: "What makes you different from competitors?",
    answer: "We automate manual workflows in 10 minutes, not 10 weeks. No-code setup.",
    insight: "Speed-to-value is your key differentiator. Make '10 minutes' your headline anchor."
  },
  { 
    question: "What objections do prospects typically have?",
    answer: "Security concerns, integration complexity, change management",
    insight: "Address security early with trust badges. Show integrations visually."
  },
];

// Example brief sections
const BRIEF_DATA = {
  executiveSummary: "TechFlow Solutions needs a conversion-focused landing page targeting Operations Directors at mid-market companies. The page should emphasize speed-to-value (10-minute setup) and efficiency gains.",
  targetAudience: {
    title: "Operations Directors",
    painPoints: ["Manual workflows eating 10+ hours/week", "Integration nightmares with existing tools", "Pressure to show efficiency gains"],
    motivations: ["Look good to leadership", "Reduce team burnout", "Hit efficiency KPIs"]
  },
  keyInsights: [
    "Lead with time savings (10 hours/week) not feature lists",
    "Include ROI calculator — Ops Directors love quantifiable results",
    "Address security concerns above the fold with trust badges",
    "Demo CTA converts 3x better than 'Contact Us' for this audience"
  ],
  recommendedStructure: [
    { section: "Hero", description: "Bold time-savings headline + demo CTA" },
    { section: "Problem/Solution", description: "Manual vs automated comparison" },
    { section: "ROI Calculator", description: "Interactive time/cost savings tool" },
    { section: "Features", description: "3 key capabilities with integration logos" },
    { section: "Social Proof", description: "Testimonials from Ops Directors" },
    { section: "FAQ", description: "Security, integrations, pricing objections" },
    { section: "Final CTA", description: "Demo request with urgency element" },
  ]
};

// Page preview sections
const PAGE_SECTIONS = [
  { 
    name: "Hero", 
    preview: (
      <div className="bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 p-8 rounded-xl">
        <div className="text-center space-y-4">
          <span className="inline-block px-3 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full">Workflow Automation</span>
          <h3 className="text-2xl font-bold text-white">Cut Manual Workflows by 10 Hours/Week</h3>
          <p className="text-gray-400 text-sm">Operations teams at 200+ companies use TechFlow to automate the busywork. Set up in 10 minutes, not 10 weeks.</p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <span className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg">Book a Demo →</span>
            <span className="text-gray-400 text-sm">Watch Video</span>
          </div>
          <div className="flex items-center justify-center gap-4 text-xs text-gray-500 pt-2">
            <span>✓ No credit card</span>
            <span>✓ 10-min setup</span>
            <span>✓ SOC 2 Certified</span>
          </div>
        </div>
      </div>
    )
  },
  { 
    name: "Problem/Solution", 
    preview: (
      <div className="bg-slate-800/50 p-6 rounded-xl">
        <h4 className="text-lg font-semibold text-white mb-4 text-center">Why teams switch to TechFlow</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg">
            <span className="text-red-400 text-xs font-medium">WITHOUT TECHFLOW</span>
            <div className="mt-2 space-y-1">
              <p className="text-gray-400 text-xs">• 10+ hours/week on manual tasks</p>
              <p className="text-gray-400 text-xs">• Data scattered across tools</p>
              <p className="text-gray-400 text-xs">• Errors from copy-paste</p>
            </div>
          </div>
          <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg">
            <span className="text-green-400 text-xs font-medium">WITH TECHFLOW</span>
            <div className="mt-2 space-y-1">
              <p className="text-gray-300 text-xs">• Automated in 10 minutes</p>
              <p className="text-gray-300 text-xs">• Single source of truth</p>
              <p className="text-gray-300 text-xs">• 99.9% accuracy</p>
            </div>
          </div>
        </div>
      </div>
    )
  },
  { 
    name: "ROI Calculator", 
    preview: (
      <div className="bg-gradient-to-br from-purple-900/30 to-slate-800/50 p-6 rounded-xl border border-purple-500/20">
        <div className="text-center mb-4">
          <span className="text-lg">📊 Calculate Your Time Savings</span>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Hours/week on manual workflows</span>
            <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div className="w-3/4 h-full bg-purple-500"></div>
            </div>
            <span className="text-white text-sm">15 hours</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Team members doing this work</span>
            <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div className="w-1/2 h-full bg-purple-500"></div>
            </div>
            <span className="text-white text-sm">4 people</span>
          </div>
          <div className="bg-purple-500/20 border border-purple-500/30 p-4 rounded-lg text-center mt-4">
            <p className="text-gray-400 text-xs">Your potential savings</p>
            <p className="text-3xl font-bold text-white">2,400 hours/year</p>
            <p className="text-purple-300 text-sm">≈ $120,000 in labor costs</p>
          </div>
        </div>
      </div>
    )
  },
  { 
    name: "Social Proof", 
    preview: (
      <div className="space-y-4">
        <div className="text-center">
          <p className="text-gray-400 text-sm mb-3">Trusted by operations teams at</p>
          <div className="flex items-center justify-center gap-6 text-gray-500 text-sm">
            <span className="opacity-60">Stripe</span>
            <span className="opacity-60">Notion</span>
            <span className="opacity-60">Figma</span>
          </div>
        </div>
        <div className="bg-slate-800/50 p-5 rounded-xl border border-gray-700/50">
          <p className="text-gray-300 text-sm italic mb-3">"TechFlow saved our ops team 12 hours per week. The ROI was obvious within the first month."</p>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-500/30 rounded-full"></div>
            <div>
              <p className="text-white text-sm font-medium">Sarah Chen</p>
              <p className="text-gray-500 text-xs">VP Operations, Acme Corp</p>
            </div>
          </div>
        </div>
      </div>
    )
  },
];

type Stage = 'consultation' | 'brief' | 'page';

interface Props {
  primaryColor?: string;
  onStartConsultation?: () => void;
}

export function ThreeStageShowcase({ 
  primaryColor = '#7C3AED',
  onStartConsultation 
}: Props) {
  const navigate = useNavigate();
  const [activeStage, setActiveStage] = useState<Stage>('consultation');
  const previewRef = useRef<HTMLDivElement>(null);
  
  // Chat state
  const [showChat, setShowChat] = useState(false);
  const [chatStep, setChatStep] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [leadData, setLeadData] = useState<Record<string, string>>({});
  const [messages, setMessages] = useState<{role: 'ai' | 'user', content: string}[]>([
    { role: 'ai', content: "Let's see what we'd build for you. What's your company name?" }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  
  const CHAT_FLOW = [
    { key: 'companyName', question: "What's your company name?", placeholder: "Acme Corp" },
    { key: 'industry', question: "What industry are you in?", placeholder: "B2B SaaS, E-commerce..." },
    { key: 'email', question: "Where should I send your strategy preview?", placeholder: "you@company.com" },
  ];
  
  const AI_RESPONSES: Record<string, (v: string) => string> = {
    companyName: (name) => `${name} — great. Let me understand your market.`,
    industry: (industry) => `${industry} — I know this space. Your buyers have specific needs.`,
    email: (email) => `Perfect! I'll send insights to ${email}. Ready to build your page?`,
  };
  
  const progress = (Object.keys(leadData).length / CHAT_FLOW.length) * 100;
  const isComplete = Object.keys(leadData).length >= CHAT_FLOW.length;
  
  const handleStageChange = (stage: Stage) => {
    setActiveStage(stage);
    previewRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isTyping) return;
    
    const currentQ = CHAT_FLOW[chatStep];
    const userInput = inputValue.trim();
    
    if (currentQ.key === 'email' && !userInput.includes('@')) return;
    
    setMessages(prev => [...prev, { role: 'user', content: userInput }]);
    setLeadData(prev => ({ ...prev, [currentQ.key]: userInput }));
    setInputValue('');
    setIsTyping(true);
    
    await new Promise(r => setTimeout(r, 500 + Math.random() * 300));
    
    setMessages(prev => [...prev, { role: 'ai', content: AI_RESPONSES[currentQ.key](userInput) }]);
    
    if (chatStep < CHAT_FLOW.length - 1) {
      await new Promise(r => setTimeout(r, 300));
      setMessages(prev => [...prev, { role: 'ai', content: CHAT_FLOW[chatStep + 1].question }]);
      setChatStep(prev => prev + 1);
    }
    
    setIsTyping(false);
  };

  const stages = [
    { 
      id: 'consultation' as Stage, 
      icon: MessageSquare, 
      title: 'Consultation',
      subtitle: '10 strategic questions',
      time: '5 min'
    },
    { 
      id: 'brief' as Stage, 
      icon: FileText, 
      title: 'Strategy Brief',
      subtitle: 'AI-generated insights',
      time: '2 min'
    },
    { 
      id: 'page' as Stage, 
      icon: Monitor, 
      title: 'Landing Page',
      subtitle: 'Ready to publish',
      time: '3 min'
    },
  ];

  return (
    <section className="relative py-24 overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(120,80,200,0.08),transparent_70%)]" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAyIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50" />
      
      {/* Glow effects */}
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-purple-300 text-sm font-medium">10-minute process</span>
            <span className="w-1 h-1 bg-purple-500/50 rounded-full" />
            <span className="text-purple-300 text-sm">Real example</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
              See What You'll Get
            </span>
          </h2>

          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Walk through a real consultation — from questions to published page
          </p>
        </div>
        
        {/* Main Showcase */}
        <div className="mb-12">
          <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-gray-800/50 overflow-hidden shadow-2xl">
            
            {/* Top bar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800/50 bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                  T
                </div>
                <div>
                  <p className="text-white font-medium text-sm">TechFlow Solutions</p>
                  <p className="text-gray-500 text-xs">B2B SaaS • Demo Requests</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Clock className="w-4 h-4" />
                Total time: 10 min
              </div>
            </div>
            
            {/* Two column layout */}
            <div className="grid md:grid-cols-[300px_1fr] min-h-[500px]">
              
              {/* Left: Stage Navigator */}
              <div className="border-r border-gray-800/50 p-5 bg-slate-900/30">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-4">Process Stages</p>
                
                <div className="space-y-3">
                  {stages.map((stage, idx) => {
                    const isActive = activeStage === stage.id;
                    const isPast = stages.findIndex(s => s.id === activeStage) > idx;
                    
                    return (
                      <button
                        key={stage.id}
                        onClick={() => handleStageChange(stage.id)}
                        className={cn(
                          "w-full text-left p-4 rounded-xl transition-all duration-200",
                          "border",
                          isActive 
                            ? "bg-purple-500/10 border-purple-500/40" 
                            : "bg-slate-800/30 border-gray-700/30 hover:bg-slate-800/50 hover:border-gray-600/50"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          {/* Step indicator */}
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0",
                            isActive ? "bg-purple-500 text-white" : isPast ? "bg-green-500/20 text-green-400" : "bg-gray-700 text-gray-400"
                          )}>
                            {isPast ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : (
                              <span>{idx + 1}</span>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className={cn("font-medium text-sm", isActive ? "text-white" : "text-gray-300")}>
                                {stage.title}
                              </span>
                              <span className="text-xs text-gray-500">{stage.time}</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">{stage.subtitle}</p>
                          </div>
                        </div>
                        
                        {/* Progress bar for active stage */}
                        {isActive && (
                          <div className="mt-3 h-1 bg-gray-700 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 w-full animate-pulse" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
                
                {/* Time summary */}
                <div className="mt-6 p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20">
                  <div className="flex items-center gap-2 text-purple-300 text-sm font-medium mb-1">
                    <Zap className="w-4 h-4" />
                    10x faster than manual
                  </div>
                  <p className="text-gray-400 text-xs">
                    What takes agencies 2-3 weeks, we do in 10 minutes.
                  </p>
                </div>
              </div>
              
              {/* Right: Preview Window */}
              <div className="flex flex-col">
                {/* Preview header */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-gray-800/50 bg-slate-800/20">
                  <div className="flex items-center gap-2 text-gray-300">
                    {activeStage === 'consultation' && <MessageSquare className="w-4 h-4 text-purple-400" />}
                    {activeStage === 'brief' && <FileText className="w-4 h-4 text-purple-400" />}
                    {activeStage === 'page' && <Monitor className="w-4 h-4 text-purple-400" />}
                    <span className="text-sm font-medium">
                      {activeStage === 'consultation' && 'Strategic Questions'}
                      {activeStage === 'brief' && 'AI Strategy Brief'}
                      {activeStage === 'page' && 'Generated Page Preview'}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">Scroll to explore ↓</span>
                </div>
                
                {/* Scrollable preview content */}
                <div ref={previewRef} className="flex-1 overflow-y-auto p-5 max-h-[450px] custom-scrollbar">
                  {/* Consultation Stage */}
                  {activeStage === 'consultation' && (
                    <div className="space-y-4">
                      {CONSULTATION_DATA.map((item, idx) => (
                        <div key={idx} className="bg-slate-800/40 rounded-xl p-4 border border-gray-700/30">
                          <div className="flex gap-3">
                            <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 text-xs font-bold shrink-0">
                              {idx + 1}
                            </div>
                            <div className="flex-1">
                              <p className="text-gray-400 text-sm mb-1">{item.question}</p>
                              <p className="text-white font-medium">{item.answer}</p>
                              {item.insight && (
                                <div className="mt-3 flex gap-2 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                                  <Lightbulb className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                                  <p className="text-purple-300 text-sm">{item.insight}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Brief Stage */}
                  {activeStage === 'brief' && (
                    <div className="space-y-5">
                      {/* Executive Summary */}
                      <div className="bg-slate-800/40 rounded-xl p-5 border border-gray-700/30">
                        <div className="flex items-center gap-2 text-white font-medium mb-3">
                          <FileText className="w-4 h-4 text-purple-400" />
                          Executive Summary
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed">{BRIEF_DATA.executiveSummary}</p>
                      </div>
                      
                      {/* Target Audience */}
                      <div className="bg-slate-800/40 rounded-xl p-5 border border-gray-700/30">
                        <div className="flex items-center gap-2 text-white font-medium mb-3">
                          <Users className="w-4 h-4 text-purple-400" />
                          Target Audience: {BRIEF_DATA.targetAudience.title}
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Pain Points</p>
                            <div className="space-y-1">
                              {BRIEF_DATA.targetAudience.painPoints.map((p, i) => (
                                <p key={i} className="text-red-300/80 text-sm">
                                  • {p}
                                </p>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Motivations</p>
                            <div className="space-y-1">
                              {BRIEF_DATA.targetAudience.motivations.map((m, i) => (
                                <p key={i} className="text-green-300/80 text-sm">
                                  • {m}
                                </p>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Key Insights */}
                      <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-5 border border-purple-500/20">
                        <div className="flex items-center gap-2 text-white font-medium mb-3">
                          <Lightbulb className="w-4 h-4 text-purple-400" />
                          AI Strategic Insights
                        </div>
                        <div className="space-y-3">
                          {BRIEF_DATA.keyInsights.map((insight, i) => (
                            <div key={i} className="flex gap-3 items-start">
                              <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                              <p className="text-gray-300 text-sm">{insight}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Recommended Structure */}
                      <div className="bg-slate-800/40 rounded-xl p-5 border border-gray-700/30">
                        <div className="flex items-center gap-2 text-white font-medium mb-3">
                          <Target className="w-4 h-4 text-purple-400" />
                          Recommended Page Structure
                        </div>
                        <div className="space-y-2">
                          {BRIEF_DATA.recommendedStructure.map((item, i) => (
                            <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-700/30 transition-colors">
                              <span className="w-6 h-6 rounded bg-purple-500/20 flex items-center justify-center text-purple-400 text-xs font-bold">
                                {i + 1}
                              </span>
                              <div>
                                <p className="text-white text-sm font-medium">{item.section}</p>
                                <p className="text-gray-500 text-xs">{item.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Page Stage */}
                  {activeStage === 'page' && (
                    <div className="space-y-5">
                      {PAGE_SECTIONS.map((section, idx) => (
                        <div key={idx}>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs text-gray-500 font-medium">{idx + 1}</span>
                            <span className="text-sm text-gray-300">{section.name}</span>
                          </div>
                          {section.preview}
                        </div>
                      ))}
                      
                      {/* View full page CTA */}
                      <div className="text-center pt-4">
                        <Button variant="outline" className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10">
                          View Full Page
                          <ExternalLink className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Try It Yourself - Chat */}
        <div className="max-w-2xl mx-auto mb-12">
          {!showChat ? (
            <div className="text-center">
              <button
                onClick={() => setShowChat(true)}
                className="inline-flex items-center gap-3 bg-slate-800/80 hover:bg-slate-800 border border-gray-700 hover:border-purple-500/50 px-6 py-4 rounded-2xl transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-white font-medium">Try It Yourself</p>
                  <p className="text-gray-400 text-sm">See what we'd build for your business</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
              </button>
            </div>
          ) : (
            <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-gray-800/50 overflow-hidden">
              {/* Chat header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-800/50">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900" />
                  </div>
                  <span className="text-white font-medium text-sm">Strategy Consultant</span>
                  <span className="text-green-400 text-xs">Online</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-xs">Progress</span>
                  <div className="w-20 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
              
              {/* Chat messages */}
              <div className="max-h-48 overflow-y-auto p-4 space-y-3">
                {messages.map((msg, idx) => (
                  <div key={idx} className={cn("flex", msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                    <div className={cn(
                      "max-w-[80%] px-4 py-2 rounded-2xl text-sm",
                      msg.role === 'user' 
                        ? "bg-purple-500 text-white" 
                        : "bg-slate-800 text-gray-200"
                    )}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-slate-800 px-4 py-2 rounded-2xl">
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Chat input */}
              <div className="p-4 border-t border-gray-800/50">
                <form onSubmit={handleChatSubmit} className="flex gap-2">
                  <Input
                    ref={null}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={isComplete ? "All set!" : CHAT_FLOW[chatStep]?.placeholder}
                    disabled={isTyping || isComplete}
                    className="flex-1 bg-slate-800 border-gray-700 text-white h-10 rounded-xl"
                    type={CHAT_FLOW[chatStep]?.key === 'email' ? 'email' : 'text'}
                  />
                  <Button type="submit" size="icon" disabled={isTyping || isComplete || !inputValue.trim()} className="bg-purple-500 hover:bg-purple-600 h-10 w-10 rounded-xl">
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </div>
              
              {isComplete && (
                <div className="px-4 pb-4">
                  <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
                    <p className="text-green-300 text-sm">
                      Ready! I'll send insights to {leadData.email}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Main CTA */}
        <div className="text-center">
          <Button
            size="lg"
            onClick={() => navigate('/new', { state: { prefillData: leadData, source: 'showcase_cta' } })}
            className="relative group text-lg px-10 py-7 font-semibold rounded-2xl shadow-2xl hover:scale-105 transition-all"
            style={{ backgroundColor: primaryColor, boxShadow: `0 25px 50px -12px ${primaryColor}40` }}
          >
            <span className="absolute inset-0 overflow-hidden rounded-2xl">
              <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </span>
            <span className="relative flex items-center gap-2">
              Start Your Free Consultation
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Button>
          
          <div className="flex items-center justify-center gap-6 mt-6 text-sm text-gray-400">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              No credit card required
            </span>
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-400" />
              10 minutes total
            </span>
            <span className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-400" />
              Full page + strategy brief
            </span>
          </div>
        </div>
        
      </div>
    </section>
  );
}
