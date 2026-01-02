import { useState, useEffect, useRef } from 'react';
import { useIntelligence } from '@/contexts/IntelligenceContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Sparkles, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import EmailGateModal from './EmailGateModal';
import ConversionCTAPanel from './ConversionCTAPanel';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { calculateStrategicLevel } from '@/lib/strategicLevelCalculator';
import { StrategicLevelIndicator } from '@/components/consultation/StrategicLevelIndicator';
import type { ExtractedIntelligence, ConsultationStatus } from '@/types/consultationReadiness';
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

// Market insight tile
const InsightTile = ({ insight, delay }: { insight: string; delay: number }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay, duration: 0.4 }}
    className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-3"
  >
    <div className="flex items-start gap-2">
      <Sparkles className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
      <p className="text-sm text-slate-300 leading-relaxed">{insight}</p>
    </div>
  </motion.div>
);

export default function LiveDemoSection() {
  const navigate = useNavigate();
  const { state, processUserMessage, resetIntelligence, submitEmail, dismissEmailGate } = useIntelligence();
  const [inputValue, setInputValue] = useState('');
  const [showConversionCTA, setShowConversionCTA] = useState(false);
  const [dismissedCTA, setDismissedCTA] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasInitialized = useRef(false);
  const continueRef = useRef<HTMLDivElement>(null);

  // Send initial AI message on mount
  useEffect(() => {
    if (!hasInitialized.current && state.conversation.length === 0) {
      hasInitialized.current = true;
      // Add initial AI message
      const initialMessage = {
        role: 'assistant' as const,
        content: "Tell me about your business — who do you help and what do you do for them?",
        timestamp: new Date(),
      };
      // We need to set this directly since processUserMessage expects user input
      // Using a simple state update through the context would be cleaner
      // For now, we'll simulate this by not calling processUserMessage
    }
  }, [state.conversation.length]);

  // Show conversion CTA when readiness hits 70%+ OR email is captured
  useEffect(() => {
    if (!dismissedCTA && (state.readiness >= 70 || state.emailCaptured)) {
      // Small delay so user sees the latest message first
      const timer = setTimeout(() => {
        setShowConversionCTA(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [state.readiness, state.emailCaptured, dismissedCTA]);

  // Scroll to bottom on new messages or when typing preview appears
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (messagesEndRef.current && chatContainerRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [state.conversation, inputValue]);

  // Get market insights to display (limit to 2 for layout balance)
  const marketInsights = [
    ...(state.market.industryInsights || []),
    ...(state.market.commonObjections?.slice(0, 1) || []),
  ].slice(0, 2);

  // Auto-scroll to Continue button after market insights load
  useEffect(() => {
    if (marketInsights.length > 0 && !state.market.isLoading) {
      const timer = setTimeout(() => {
        continueRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'nearest' 
        });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [marketInsights.length, state.market.isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || state.isProcessing || state.rateLimited) return;

    const message = inputValue.trim();
    setInputValue('');
    await processUserMessage(message);
  };

  const [isSavingSession, setIsSavingSession] = useState(false);

  const handleContinueToWizard = async () => {
    setIsSavingSession(true);
    
    const sessionId = crypto.randomUUID();
    
    console.log('🚀 [Demo→Wizard] Saving session to Supabase:', sessionId);
    
    // Build structured intelligence from demo state
    const demoIntelligence: Partial<ExtractedIntelligence> = {
      source: 'demo',
      capturedAt: new Date().toISOString(),
      industry: state.extracted.industry || null,
      subIndustry: null,
      audience: state.extracted.audience || null,
      audienceRole: null,
      valueProp: state.extracted.valueProp || null,
      businessName: null,
      painPoints: [], // Demo doesn't typically capture these
      buyerObjections: [],
      competitorDifferentiation: null,
      proofElements: [],
      toneDirection: null,
      goals: null,
      marketResearch: {
        marketSize: state.market.marketSize || null,
        buyerPersona: state.market.buyerPersona || null,
        commonObjections: state.market.commonObjections || [],
        industryInsights: state.market.industryInsights || [],
        researchedAt: state.market.industryInsights?.length ? new Date().toISOString() : null,
      },
      conversationHistory: state.conversation.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        timestamp: msg.timestamp?.toISOString() || new Date().toISOString(),
        source: 'demo' as const,
      })),
      readinessScore: 0,
      readinessBreakdown: [],
    };
    
    // Calculate strategic level (will be low from demo alone)
    const levelResult = calculateStrategicLevel(demoIntelligence);
    
    console.log('📊 [Demo→Wizard] Strategic level calculated:', {
      level: levelResult.currentLevel,
      canGenerate: levelResult.canUnlock('page_generation'),
      missingForNext: levelResult.missingForNext,
    });
    
    // Determine consultation status - demo_complete means they need wizard
    const consultationStatus: ConsultationStatus = 'demo_complete';
    
    // Save to demo_sessions table (for session continuity)
    const sessionData: {
      session_id: string;
      extracted_intelligence: any;
      market_research: any;
      messages: any;
      readiness: number;
      completed: boolean;
      continued_to_consultation: boolean;
    } = {
      session_id: sessionId,
      extracted_intelligence: demoIntelligence,
      market_research: {
        industryInsights: state.market.industryInsights || [],
        commonObjections: state.market.commonObjections || [],
        buyerPersona: state.market.buyerPersona || null,
        marketSize: state.market.marketSize || null,
      },
      messages: state.conversation.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
      readiness: state.readiness, // Use state readiness for DB storage
      completed: false, // Demo is NOT complete for page generation
      continued_to_consultation: true,
    };
    
    try {
      const { error } = await supabase
        .from('demo_sessions')
        .insert([sessionData]);
      
      if (error) {
        console.error('Failed to save demo session:', error);
        toast({
          title: "Error saving session",
          description: "Couldn't save your progress. Please try again.",
          variant: "destructive"
        });
        setIsSavingSession(false);
        return;
      }
      
      console.log('✅ [Demo→Wizard] Session saved with status:', consultationStatus);
      console.log('📊 [Demo→Wizard] Strategic level:', levelResult.currentLevel);
      
      // Store session ID in localStorage (survives auth redirect)
      localStorage.setItem('pageconsult_session_id', sessionId);
      localStorage.setItem('pageconsult_consultation_status', consultationStatus);
      console.log('💾 [Demo→Wizard] Stored session ID in localStorage:', sessionId);
      
      // CRITICAL: Navigate to WIZARD, not generate
      // The wizard will continue the consultation to reach generation readiness
      navigate(`/wizard?session=${sessionId}`);
    } catch (err) {
      console.error('Error saving demo session:', err);
      toast({
        title: "Error saving session",
        description: "Couldn't save your progress. Please try again.",
        variant: "destructive"
      });
      setIsSavingSession(false);
    }
  };

  const handleKeepChatting = () => {
    setShowConversionCTA(false);
    setDismissedCTA(true);
  };

  // Build display conversation (with initial AI message if needed)
  const displayConversation = state.conversation.length === 0 
    ? [{ role: 'assistant' as const, content: "Tell me about your business — who do you help and what do you do for them?", timestamp: new Date() }]
    : state.conversation;


  return (
    <section id="demo" className="py-20 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-12">
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
            className="text-3xl md:text-4xl font-bold text-white mb-4"
          >
            Experience the Strategy Session
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-400 max-w-2xl mx-auto"
          >
            Type a message about your business. Watch as we analyze your market in real-time.
          </motion.p>
        </div>

        {/* Two-column layout */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column - Chat Interface */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden flex flex-col h-[500px]"
          >
            {/* Chat header */}
            <div className="px-4 py-3 border-b border-slate-700/50 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-white">PageConsult AI</h3>
                <p className="text-xs text-slate-400">Strategy Consultant</p>
              </div>
            </div>

            {/* Messages area */}
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
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
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
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
                    <div className="max-w-[80%] rounded-2xl px-4 py-3 border border-dashed border-slate-600 bg-slate-800/30">
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

            {/* Input area */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-slate-700/50">
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
          </motion.div>

          {/* Right Column - Intelligence Profile */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative flex flex-col h-[500px]"
          >
            {/* Scrollable content area */}
            <div className="flex-1 overflow-y-auto pb-32 space-y-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
              {/* Strategic Level Indicator - replaces old readiness bars */}
              <StrategicLevelIndicator 
                result={calculateStrategicLevel(state.extracted)}
                onContinue={handleContinueToWizard}
              />

              {/* Market Insights (appears when loaded) */}
              <AnimatePresence>
                {marketInsights.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6"
                  >
                    <h4 className="text-sm font-medium text-slate-300 mb-4">Market Insights</h4>
                    <div className="space-y-3">
                      {marketInsights.map((insight, i) => (
                        <InsightTile key={i} insight={insight} delay={i * 0.15} />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Loading state for market research */}
              {state.market.isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6"
                >
                  <div className="flex items-center gap-3 text-slate-400">
                    <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
                    <span className="text-sm">Researching your market...</span>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Fixed CTA at bottom - always visible when ready */}
            <AnimatePresence>
              {showConversionCTA && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900 via-slate-900 to-transparent pt-8 pb-2 px-1">
                  <ConversionCTAPanel
                    readiness={state.readiness}
                    onContinue={handleContinueToWizard}
                    onKeepChatting={handleKeepChatting}
                  />
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* Email Gate Modal */}
      <EmailGateModal
        isOpen={state.showEmailGate}
        onSubmit={submitEmail}
        onDismiss={dismissEmailGate}
        industry={state.extracted.industry}
        audience={state.extracted.audience}
      />
    </section>
  );
}
