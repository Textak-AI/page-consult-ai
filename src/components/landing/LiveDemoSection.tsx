import { useState, useEffect, useRef } from 'react';
import { useIntelligence } from '@/contexts/IntelligenceContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Sparkles, Send, Loader2, Unlock, ChevronRight, BarChart3, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import EmailGateModal from './EmailGateModal';
import MarketResearchPanel from './MarketResearchPanel';
import { supabase } from '@/integrations/supabase/client';
import { calculateIntelligenceScore } from '@/lib/intelligenceScoreCalculator';
import { IntelligenceProfileDemo } from '@/components/consultation/IntelligenceProfileDemo';

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
  const { state, processUserMessage, submitEmail, dismissEmailGate, reopenEmailGate } = useIntelligence();
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasInitialized = useRef(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // Mobile intelligence drawer state
  const [showMobileIntelligence, setShowMobileIntelligence] = useState(false);
  
  // Path selector modal state
  const [showPathSelector, setShowPathSelector] = useState(false);
  const [isSavingSession, setIsSavingSession] = useState(false);

  // Send initial AI message on mount
  useEffect(() => {
    if (!hasInitialized.current && state.conversation.length === 0) {
      hasInitialized.current = true;
    }
  }, [state.conversation.length]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current && chatContainerRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [state.conversation, inputValue]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || state.isProcessing || state.rateLimited) return;

    const message = inputValue.trim();
    setInputValue('');
    await processUserMessage(message);
  };

  const handleGenerateClick = () => {
    setShowPathSelector(true);
  };

  const handleContinueToWizard = async (selectedPath: 'conversation' | 'wizard' = 'wizard') => {
    setShowPathSelector(false);
    setIsSavingSession(true);
    
    const sessionId = crypto.randomUUID();
    
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
    
    sessionStorage.setItem('demoIntelligence', JSON.stringify(demoIntelligence));
    
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
      completed: false,
      continued_to_consultation: true,
    };
    
    try {
      await supabase.from('demo_sessions').insert([sessionData]);
      localStorage.setItem('pageconsult_session_id', sessionId);
      navigate('/signup?from=demo');
    } catch (err) {
      console.error('Error saving demo session:', err);
      navigate('/signup?from=demo');
    } finally {
      setIsSavingSession(false);
    }
  };

  const displayConversation = state.conversation.length === 0 
    ? [{ role: 'assistant' as const, content: "Tell me about your business — who do you help and what do you do for them?", timestamp: new Date() }]
    : state.conversation;

  const score = calculateIntelligenceScore(state.extracted);

  return (
    <section id="demo" className="min-h-screen bg-slate-950 relative flex flex-col overflow-hidden">
      {/* === LASER BEAM EFFECTS === */}
      
      {/* Horizontal beam - slow drift across */}
      <div className="absolute top-1/4 left-0 w-full h-px overflow-hidden pointer-events-none">
        <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent blur-sm animate-beam-horizontal" />
      </div>
      
      {/* Diagonal beam - top left to bottom right */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 left-1/4 w-px h-[200%] bg-gradient-to-b from-transparent via-purple-500/20 to-transparent blur-sm animate-beam-diagonal" />
      </div>
      
      {/* Diagonal beam - top right to bottom left */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute -top-1/2 right-1/3 w-px h-[200%] bg-gradient-to-b from-transparent via-cyan-500/15 to-transparent blur-sm animate-beam-diagonal-reverse"
          style={{ animationDelay: '3s' }}
        />
      </div>
      
      {/* Subtle glow orbs that pulse */}
      <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-[100px] animate-glow-pulse pointer-events-none" />
      <div 
        className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-cyan-500/10 rounded-full blur-[80px] animate-glow-pulse pointer-events-none"
        style={{ animationDelay: '3s' }}
      />
      
      {/* Grid pattern overlay - very subtle */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }}
      />
      
      {/* === END LASER EFFECTS === */}
      
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 via-transparent to-transparent pointer-events-none" />
      {/* Header breadcrumb */}
      <div className="relative z-10 max-w-6xl mx-auto w-full px-6 pt-8 pb-4">
        <nav className="flex items-center gap-2 text-sm text-white/40">
          <span>PageConsult</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-white/70">Strategy Session</span>
        </nav>
        
        {/* Section header */}
        <div className="mt-6 mb-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-400 text-sm font-medium mb-4"
          >
            <Sparkles className="w-4 h-4" />
            Live AI Demo
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-2xl md:text-3xl font-bold text-white"
          >
            Experience the Strategy Session
          </motion.h2>
        </div>
      </div>

      {/* Centered consultation container */}
      <div className="relative z-10 flex-1 flex items-start justify-center px-4 sm:px-6 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="w-full max-w-6xl h-[65vh] min-h-[500px] max-h-[700px]"
        >
          <div className="h-full bg-slate-900/80 backdrop-blur-sm rounded-3xl border border-white/10 shadow-2xl shadow-black/20 overflow-hidden">
            
            {/* Single row: Chat + Intelligence Profile */}
            <div className="h-full flex flex-col lg:flex-row">
              
              {/* Left: Chat Interface */}
              <div className="flex-1 flex flex-col lg:border-r border-white/5 min-w-0">
                {/* Header */}
                <div className="px-4 sm:px-6 py-4 border-b border-white/5 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">PageConsult AI</h3>
                        <p className="text-white/50 text-sm">Strategy Consultant</p>
                      </div>
                    </div>
                    
                    {/* Mobile: Show Progress button */}
                    <button
                      onClick={() => setShowMobileIntelligence(true)}
                      className="lg:hidden flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-white hover:border-slate-600 transition-all text-sm"
                    >
                      <BarChart3 className="w-4 h-4" />
                      <span className="hidden sm:inline">Progress</span>
                      <span className="text-xs text-cyan-400">{score.totalScore}/100</span>
                    </button>
                  </div>
                </div>
                
                {/* Messages - scrollable */}
                <div 
                  ref={chatContainerRef} 
                  className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-4 scroll-smooth"
                >
                  <AnimatePresence mode="popLayout">
                    {displayConversation.map((message, index) => (
                      <motion.div
                        key={`msg-${index}`}
                        initial={{ opacity: 0.6, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.15 }}
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
                  <AnimatePresence>
                    {inputValue.trim().length > 0 && !state.isProcessing && (
                      <motion.div
                        key="typing-preview"
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.1 } }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="flex justify-end"
                      >
                        <div className="max-w-[85%] md:max-w-[80%] rounded-2xl px-4 py-3 border border-dashed border-slate-600 bg-slate-800/30">
                          <p className="text-sm leading-relaxed text-slate-400 italic">
                            {inputValue}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-xs text-slate-500">composing...</span>
                            <span className="w-1 h-1 bg-slate-500 rounded-full animate-pulse" />
                            <span className="text-xs text-slate-600 ml-auto">{inputValue.length}/500</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
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
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Input - fixed at bottom */}
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
                        ref={inputRef}
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
              </div>
              
              {/* Right: Intelligence Profile - Desktop only */}
              <div className="hidden lg:flex w-[360px] flex-shrink-0 bg-slate-900/50 flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto">
                  <IntelligenceProfileDemo 
                    score={score}
                    onContinue={handleGenerateClick}
                    isThinking={state.isProcessing}
                    className="h-auto border-0 rounded-none"
                  />
                  
                  {/* Market Research Section */}
                  <AnimatePresence mode="wait">
                    {/* Show unlock button if: dismissed without email AND industry exists AND not loading/loaded */}
                    {state.emailDismissed && !state.emailCaptured && !state.market.isLoading && state.extracted.industry && (
                      <motion.div
                        key="unlock-button"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-4 border-t border-white/5"
                      >
                        <button
                          onClick={reopenEmailGate}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-cyan-500/40 text-cyan-400 rounded-lg hover:bg-cyan-500/10 hover:border-cyan-400/60 transition-all text-sm font-medium"
                        >
                          <Unlock className="w-4 h-4" />
                          Unlock Market Research
                        </button>
                      </motion.div>
                    )}
                    
                    {/* Show loading or results if email captured */}
                    {state.emailCaptured && (state.market.isLoading || state.market.marketSize || state.market.industryInsights.length > 0) && (
                      <motion.div
                        key="market-research"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="border-t border-white/5"
                      >
                        <MarketResearchPanel 
                          market={state.market}
                          industry={state.extracted.industry}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              
            </div>
          </div>
        </motion.div>
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
                <h3 className="text-white font-semibold">Intelligence Profile</h3>
                <button
                  onClick={() => setShowMobileIntelligence(false)}
                  className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Drawer content */}
              <div className="flex-1 overflow-y-auto p-4">
                <IntelligenceProfileDemo 
                  score={score}
                  onContinue={() => {
                    setShowMobileIntelligence(false);
                    handleGenerateClick();
                  }}
                  isThinking={state.isProcessing}
                  className="border-0 rounded-none bg-transparent"
                />
                
                {/* Market Research Section - Mobile */}
                <AnimatePresence mode="wait">
                  {/* Show unlock button if: dismissed without email AND industry exists AND not loading/loaded */}
                  {state.emailDismissed && !state.emailCaptured && !state.market.isLoading && state.extracted.industry && (
                    <motion.div
                      key="unlock-button-mobile"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-4"
                    >
                      <button
                        onClick={() => {
                          setShowMobileIntelligence(false);
                          reopenEmailGate();
                        }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-cyan-500/40 text-cyan-400 rounded-lg hover:bg-cyan-500/10 hover:border-cyan-400/60 transition-all text-sm font-medium"
                      >
                        <Unlock className="w-4 h-4" />
                        Unlock Market Research
                      </button>
                    </motion.div>
                  )}
                  
                  {/* Show loading or results if email captured */}
                  {state.emailCaptured && (state.market.isLoading || state.market.marketSize || state.market.industryInsights.length > 0) && (
                    <motion.div
                      key="market-research-mobile"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-4"
                    >
                      <MarketResearchPanel 
                        market={state.market}
                        industry={state.extracted.industry}
                        className="p-0"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Email Gate Modal */}
      <EmailGateModal
        isOpen={state.showEmailGate}
        onSubmit={submitEmail}
        onDismiss={dismissEmailGate}
        industry={state.extracted.industry}
        audience={state.extracted.audience}
      />

      {/* Path Selector Modal */}
      <AnimatePresence>
        {showPathSelector && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowPathSelector(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl"
            >
              <h3 className="text-xl font-semibold text-white mb-2">Choose Your Path</h3>
              <p className="text-slate-400 text-sm mb-6">
                How would you like to continue building your strategy?
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={() => handleContinueToWizard('conversation')}
                  disabled={isSavingSession}
                  className="w-full p-4 rounded-xl border border-white/10 hover:border-cyan-500/50 hover:bg-cyan-500/10 text-left transition-all disabled:opacity-50"
                >
                  <p className="text-lg font-medium text-white mb-1">💬 Conversation Mode</p>
                  <p className="text-sm text-slate-400">
                    Continue chatting naturally. AI guides you through remaining questions.
                  </p>
                </button>
                
                <button
                  onClick={() => handleContinueToWizard('wizard')}
                  disabled={isSavingSession}
                  className="w-full p-4 rounded-xl border border-white/10 hover:border-purple-500/50 hover:bg-purple-500/10 text-left transition-all disabled:opacity-50"
                >
                  <p className="text-lg font-medium text-white mb-1">📋 Structured Wizard</p>
                  <p className="text-sm text-slate-400">
                    Step-by-step form with clear progress. Faster if you know what you want.
                  </p>
                </button>
              </div>
              
              {isSavingSession && (
                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-cyan-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Preparing your session...
                </div>
              )}
              
              <button
                onClick={() => setShowPathSelector(false)}
                disabled={isSavingSession}
                className="mt-4 text-sm text-slate-500 hover:text-slate-400 w-full text-center"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
