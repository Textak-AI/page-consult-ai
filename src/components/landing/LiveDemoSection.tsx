import { useState, useEffect, useRef } from 'react';
import { useIntelligence } from '@/contexts/IntelligenceContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Sparkles, Send, Loader2, ChevronRight, BarChart3, X, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import BusinessCardGateModal from './BusinessCardGateModal';
import { supabase } from '@/integrations/supabase/client';
import { calculateIntelligenceScore } from '@/lib/intelligenceScoreCalculator';
import { IntelligenceTabs } from '@/components/demo/IntelligenceTabs';
import { FocusModeOverlay } from '@/components/demo/FocusModeOverlay';
import { FocusModeIndicator } from '@/components/demo/FocusModeIndicator';
import { StrategySessionTransition } from '@/components/demo/StrategySessionTransition';

// Typing indicator component
const TypingIndicator = () => (
  <div className="flex items-center gap-1 px-4 py-3">
    <div className="flex gap-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 bg-cyan-400 rounded-full"
          animate={{ y: [0, -6, 0] }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.15,
          }}
        />
      ))}
    </div>
  </div>
);

export default function LiveDemoSection() {
  const navigate = useNavigate();
  const { state, processUserMessage, submitEmail, submitBusinessCard, dismissEmailGate, reopenEmailGate } = useIntelligence();
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasInitialized = useRef(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const focusModeScrollRef = useRef<HTMLDivElement>(null);
  
  // Mobile intelligence drawer state
  const [showMobileIntelligence, setShowMobileIntelligence] = useState(false);
  
  // Session saving state
  const [isSavingSession, setIsSavingSession] = useState(false);
  
  // Focus mode state
  const [focusModeOpen, setFocusModeOpen] = useState(false);
  
  // Strategy session transition state
  const [showSessionTransition, setShowSessionTransition] = useState(false);

  // 🎬 Log component mount
  useEffect(() => {
    console.log('🎬 [LiveDemo] Component mounted');
  }, []);

  // 🧠 Log intelligence updates
  useEffect(() => {
    console.log('🧠 [LiveDemo] Intelligence updated:', {
      timestamp: new Date().toISOString(),
      extracted: {
        industry: state.extracted?.industry,
        audience: state.extracted?.audience,
        valueProp: state.extracted?.valueProp,
        businessType: state.extracted?.businessType,
        competitive: state.extracted?.competitorDifferentiator,
        painPoints: state.extracted?.painPoints,
        proofElements: state.extracted?.proofElements,
      },
      market: {
        hasInsights: state.market?.industryInsights?.length || 0,
        hasObjections: state.market?.commonObjections?.length || 0,
        hasBuyerPersona: !!state.market?.buyerPersona,
      },
      readiness: state.readiness,
    });
  }, [state.extracted, state.market, state.readiness]);

  // Send initial AI message on mount
  useEffect(() => {
    if (!hasInitialized.current && state.conversation.length === 0) {
      hasInitialized.current = true;
    }
  }, [state.conversation.length]);

  // Activate focus mode with transition
  const activateFocusMode = () => {
    // Show transition first
    setShowSessionTransition(true);
    
    // After transition, activate focus mode
    setTimeout(() => {
      setShowSessionTransition(false);
      setFocusModeOpen(true);
    }, 2000); // 2 second transition
  };

  // Exit focus mode
  const exitFocusMode = () => {
    setFocusModeOpen(false);
  };

  // Handle email gate - continue without email (activates focus mode)
  const handleContinueWithoutEmail = () => {
    dismissEmailGate();
    activateFocusMode();
  };

  // Handle email gate - with business card (activates focus mode immediately, research runs in background)
  const handleBusinessCardSubmitAndActivateFocus = async (data: { companyName: string; website: string; email: string }) => {
    activateFocusMode(); // Expand immediately
    await submitBusinessCard(data, (followUpMessage: string) => {
      // Add the assumptive follow-up to the conversation by simulating an assistant message
      // This happens after research completes
      setTimeout(() => {
        // We can't directly update conversation here since it's managed by processUserMessage
        // Instead, we'll store the follow-up and display it as an assistant message
        console.log('📝 [LiveDemo] Assumptive follow-up received:', followUpMessage.substring(0, 60) + '...');
      }, 100);
    });
  };

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current && chatContainerRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [state.conversation, inputValue]);

  // Auto-scroll in focus mode when typing
  useEffect(() => {
    if (inputValue.trim() && focusModeOpen && focusModeScrollRef.current) {
      focusModeScrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [inputValue, focusModeOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || state.isProcessing || state.rateLimited) return;

    const message = inputValue.trim();
    setInputValue('');
    await processUserMessage(message);
  };

  // Skip mode selection - go directly to signup
  // User already experienced conversational mode in demo, will continue with structured form after signup
  const handleGenerateClick = () => {
    handleContinueToWizard('wizard'); // Default to structured form
  };

  const handleContinueToWizard = async (selectedPath: 'conversation' | 'wizard' = 'wizard') => {
    setIsSavingSession(true);
    
    const sessionId = crypto.randomUUID();
    const isReady = state.readiness >= 70; // High readiness = skip wizard, go to brand setup
    
    const demoIntelligence = {
      sessionId,
      source: 'demo',
      capturedAt: new Date().toISOString(),
      industry: state.extracted.industry || null,
      industrySummary: state.extracted.industrySummary || null,
      audience: state.extracted.audience || null,
      audienceSummary: state.extracted.audienceSummary || null,
      valueProp: state.extracted.valueProp || null,
      valuePropSummary: state.extracted.valuePropSummary || null,
      competitorDifferentiator: state.extracted.competitorDifferentiator || null,
      edgeSummary: state.extracted.edgeSummary || null,
      painPoints: state.extracted.painPoints || null,
      painSummary: state.extracted.painSummary || null,
      buyerObjections: state.extracted.buyerObjections || null,
      objectionsSummary: state.extracted.objectionsSummary || null,
      proofElements: state.extracted.proofElements || null,
      proofSummary: state.extracted.proofSummary || null,
      marketResearch: {
        marketSize: state.market.marketSize || null,
        buyerPersona: state.market.buyerPersona || null,
        commonObjections: state.market.commonObjections || [],
        industryInsights: state.market.industryInsights || [],
      },
      conversationHistory: state.conversation.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp?.toISOString() || new Date().toISOString(),
      })),
      readinessScore: state.readiness,
      selectedPath,
    };
    
    // 🚀 Log handoff payload BEFORE saving
    console.log('🚀 [LiveDemo→Wizard] Preparing handoff payload:', {
      sessionId,
      isReady,
      extractedIntelligence: demoIntelligence,
      marketResearch: demoIntelligence.marketResearch,
      conversationLength: demoIntelligence.conversationHistory?.length,
      readiness: demoIntelligence.readinessScore,
      FULL_EXTRACTED: JSON.stringify(demoIntelligence, null, 2),
    });
    
    sessionStorage.setItem('demoIntelligence', JSON.stringify(demoIntelligence));
    
    // Store brand prefill data for Brand Setup page
    const brandPrefill = {
      logo: state.extractedLogo || null,
      companyName: state.businessCard?.companyName || state.companyResearch?.companyName || null,
      website: state.businessCard?.website || null,
      colors: state.extractedBrand?.colors || null,
      fonts: state.extractedBrand?.fonts || null,
      industry: state.extracted?.industry || null,
    };
    sessionStorage.setItem('brandPrefill', JSON.stringify(brandPrefill));
    console.log('📦 [LiveDemo] Brand prefill stored:', brandPrefill);
    
    if (state.email) {
      sessionStorage.setItem('demoEmail', state.email);
    }
    
    const sessionData = {
      session_id: sessionId,
      extracted_intelligence: demoIntelligence,
      market_research: demoIntelligence.marketResearch,
      messages: state.conversation.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
      readiness: state.readiness,
      completed: isReady, // Mark as completed if high readiness
      continued_to_consultation: true,
    };
    
    try {
      const { error } = await supabase.from('demo_sessions').insert([sessionData]);
      // 💾 Log Supabase save result
      console.log('💾 [LiveDemo] Supabase save result:', { 
        success: !error, 
        error: error?.message,
        sessionId,
        isReady,
      });
      localStorage.setItem('pageconsult_session_id', sessionId);
      
      // Include session ID and ready flag in URL for post-signup claiming
      const signupUrl = isReady 
        ? `/signup?from=demo&session=${sessionId}&ready=true`
        : `/signup?from=demo&session=${sessionId}`;
      
      navigate(signupUrl);
    } catch (err) {
      console.error('💾 [LiveDemo] Error saving demo session:', err);
      navigate('/signup?from=demo');
    } finally {
      setIsSavingSession(false);
    }
  };

  const displayConversation = state.conversation.length === 0 
    ? [{ role: 'assistant' as const, content: "Tell me about your business — who do you help and what do you do for them?", timestamp: new Date() }]
    : state.conversation;

  // Calculate score - this will recalculate on every render when state.extracted changes
  const score = calculateIntelligenceScore(state.extracted);

  return (
    <section className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header - sticky with glass effect */}
      <header className="sticky top-0 z-50 h-16 border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-xl flex-shrink-0">
        <div className="h-full px-6 flex items-center justify-between">
          {/* Left: Logo + Breadcrumb */}
          <div className="flex items-center gap-4">
            <nav className="flex items-center gap-1.5 text-sm">
              <span className="text-slate-400">PageConsult</span>
              <ChevronRight className="w-4 h-4 text-slate-600" />
              <span className="text-white font-medium">Strategy Session</span>
            </nav>
          </div>
          
          {/* Right: Demo badge + Focus Mode */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-cyan-500/10 to-violet-500/10 border border-cyan-500/20">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-sm font-medium text-cyan-300">Live AI Demo</span>
            </div>
            
            {/* Focus Mode button - visible at 30%+ readiness */}
            {state.readiness >= 30 && (
              <button
                onClick={activateFocusMode}
                className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50 transition-all text-sm"
              >
                <Maximize2 className="w-4 h-4" />
                <span>Focus</span>
              </button>
            )}
            
            {/* Mobile: Show Progress button */}
            <button
              onClick={() => setShowMobileIntelligence(true)}
              className="lg:hidden flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-white hover:border-slate-600 transition-all text-sm"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="text-cyan-400">{score.totalScore}/100</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content - Chat + Sidebar with flexible ratio */}
      <div className="flex-1 flex gap-0 overflow-hidden">
        
        {/* Chat Container - takes remaining space with controlled max-width */}
        <main className="flex-[55] min-w-0 flex flex-col">
          
          {/* Messages Area - Scrollable */}
          <div 
            ref={chatContainerRef} 
            className="flex-1 overflow-y-auto"
          >
            <div className="max-w-2xl mx-auto px-6 py-6 space-y-6">
              <AnimatePresence mode="popLayout">
                {displayConversation.map((message, index) => (
                  <motion.div
                    key={`msg-${index}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {message.role === 'assistant' ? (
                      // AI Message (left-aligned with avatar)
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                          <MessageSquare className="w-5 h-5 text-slate-300" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-sm font-medium text-white">PageConsult AI</span>
                            <span className="text-xs text-slate-500">Strategy Consultant</span>
                          </div>
                          <div className="bg-slate-800/60 rounded-2xl rounded-tl-md px-4 py-3 text-slate-200 text-[15px] leading-relaxed break-words">
                            {message.content}
                          </div>
                        </div>
                      </div>
                    ) : (
                      // User Message (right-aligned)
                      <div className="flex justify-end">
                        <div className="max-w-[80%]">
                          <div className="bg-cyan-600/20 border border-cyan-500/20 rounded-2xl rounded-tr-md px-4 py-3 text-slate-200 text-[15px] leading-relaxed break-words">
                            {message.content}
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {/* Live typing preview */}
              <AnimatePresence>
                {inputValue.trim().length > 0 && !state.isProcessing && (
                  <motion.div
                    key="typing-preview"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.1 } }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="flex justify-end"
                  >
                    <div className="max-w-[80%]">
                      <div className="rounded-2xl rounded-tr-md px-4 py-3 border border-dashed border-slate-600 bg-slate-800/30">
                        <p className="text-[15px] leading-relaxed text-slate-400 italic">
                          {inputValue}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-xs text-slate-500">composing...</span>
                          <span className="w-1 h-1 bg-slate-500 rounded-full animate-pulse" />
                          <span className="text-xs text-slate-600 ml-auto">{inputValue.length}/500</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Typing indicator */}
              {state.isProcessing && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-4"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-slate-300" />
                  </div>
                  <div className="bg-slate-800/60 rounded-2xl rounded-tl-md">
                    <TypingIndicator />
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area - Sticky Bottom */}
          <div className="sticky bottom-0 border-t border-slate-800/50 bg-slate-950/80 backdrop-blur-xl flex-shrink-0">
            <div className="max-w-2xl mx-auto px-6 py-4">
              {state.rateLimited ? (
                <div className="text-center py-3">
                  <p className="text-amber-400 text-sm mb-2">Demo limit reached (5 messages)</p>
                  <Button
                    onClick={() => navigate('/new')}
                    className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white"
                  >
                    Start Full Strategy Session
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="relative">
                    <Input
                      ref={inputRef}
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Tell me about your business..."
                      disabled={state.isProcessing}
                      className="w-full px-4 py-3 pr-14 bg-slate-800/50 border-slate-700/50 rounded-xl text-white placeholder:text-slate-500 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10 transition-all text-[15px] leading-relaxed"
                    />
                    <Button
                      type="submit"
                      disabled={!inputValue.trim() || state.isProcessing}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 p-0 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-lg flex items-center justify-center hover:opacity-90 transition-opacity"
                    >
                      {state.isProcessing ? (
                        <Loader2 className="w-5 h-5 text-white animate-spin" />
                      ) : (
                        <Send className="w-5 h-5 text-white" />
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </main>
        
        {/* Intel Sidebar - Desktop only with flexible width */}
        <aside className="hidden lg:flex flex-[45] max-w-[580px] border-l border-slate-800/50 bg-slate-900/30 flex-col overflow-hidden">
          <IntelligenceTabs 
            onContinue={handleGenerateClick}
            onReopenEmailGate={reopenEmailGate}
          />
        </aside>
        
      </div>

      {/* Mobile Intelligence Drawer */}
      <AnimatePresence>
        {showMobileIntelligence && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 lg:hidden"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowMobileIntelligence(false)}
            />
            
            {/* Drawer */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 bg-slate-900 border-t border-white/10 rounded-t-3xl max-h-[80vh] flex flex-col"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 flex-shrink-0">
                <h3 className="text-white font-semibold">Intelligence Dashboard</h3>
                <button
                  onClick={() => setShowMobileIntelligence(false)}
                  className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Drawer content - using tabbed interface */}
              <div className="flex-1 overflow-hidden">
                <IntelligenceTabs 
                  onContinue={() => {
                    setShowMobileIntelligence(false);
                    handleGenerateClick();
                  }}
                  onReopenEmailGate={() => {
                    setShowMobileIntelligence(false);
                    reopenEmailGate();
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Business Card Gate Modal */}
      <BusinessCardGateModal
        isOpen={state.showEmailGate}
        onSubmit={handleBusinessCardSubmitAndActivateFocus}
        onContinueWithoutResearch={handleContinueWithoutEmail}
        industry={state.extracted.industry}
      />

      {/* Saving session loader - shown when transitioning to signup */}
      <AnimatePresence>
        {isSavingSession && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center"
            >
              <div className="flex items-center justify-center gap-2 text-cyan-400">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="font-medium">Preparing your session...</span>
              </div>
              <p className="text-sm text-slate-400 mt-2">
                Saving your strategy progress
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Strategy Session Transition - shows when entering focus mode */}
      <StrategySessionTransition isVisible={showSessionTransition} />

      {/* Focus Mode Indicator - shows when in focus mode */}
      <FocusModeIndicator
        isActive={focusModeOpen}
        onExit={exitFocusMode}
      />

      {/* Focus Mode Overlay */}
      <FocusModeOverlay
        isOpen={focusModeOpen}
        onClose={exitFocusMode}
        onContinue={handleGenerateClick}
        onReopenEmailGate={reopenEmailGate}
        chatContent={
          <>
            {/* Header */}
            <div className="px-4 sm:px-6 py-4 border-b border-white/5 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">PageConsult AI</h3>
                  <p className="text-white/50 text-sm">Strategy Consultant</p>
                </div>
              </div>
            </div>
            
            {/* Messages - scrollable */}
            <div className="flex-1 overflow-y-scroll px-4 sm:px-6 py-5 space-y-4 scroll-smooth">
              <AnimatePresence mode="popLayout">
                {displayConversation.map((message, index) => (
                  <motion.div
                    key={`focus-msg-${index}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] md:max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-cyan-600/20 border border-cyan-500/30 text-white'
                          : 'bg-slate-700/50 border border-slate-600/30 text-slate-200'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {/* Live typing preview */}
              {inputValue.trim() && !state.isProcessing && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex justify-end"
                >
                  <div className="max-w-[85%] md:max-w-[80%] px-4 py-3 rounded-2xl rounded-br-sm bg-slate-700/20 border border-slate-600/20">
                    <p className="text-sm leading-relaxed text-slate-500 italic">
                      {inputValue}
                    </p>
                  </div>
                </motion.div>
              )}
              
              {/* Typing indicator */}
              {state.isProcessing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-slate-700/50 border border-slate-600/30 rounded-2xl">
                    <TypingIndicator />
                  </div>
                </motion.div>
              )}
              
              {/* Scroll anchor */}
              <div ref={focusModeScrollRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="px-4 sm:px-6 py-4 border-t border-white/5 flex-shrink-0">
              {state.rateLimited ? (
                <div className="text-center py-3">
                  <p className="text-amber-400 text-sm mb-2">Demo limit reached (5 messages)</p>
                  <Button
                    onClick={() => navigate('/new')}
                    className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white"
                  >
                    Start Full Strategy Session
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Tell me about your business..."
                    disabled={state.isProcessing}
                    className="flex-1 bg-slate-800 border-slate-600 focus:border-cyan-500 text-white placeholder:text-slate-500"
                  />
                  <Button
                    type="submit"
                    disabled={!inputValue.trim() || state.isProcessing}
                    className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white px-4"
                  >
                    {state.isProcessing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              )}
            </form>
          </>
        }
      />
    </section>
  );
}
