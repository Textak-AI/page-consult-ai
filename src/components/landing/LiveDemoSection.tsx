import { useState, useEffect, useRef, useMemo } from 'react';
import { useIntelligence, ExtractedIntelligence as ContextExtractedIntelligence } from '@/contexts/IntelligenceContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Sparkles, Send, Loader2, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import EmailGateModal from './EmailGateModal';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { calculateStrategicLevel } from '@/lib/strategicLevelCalculator';
import { StrategicLevelIndicator } from '@/components/consultation/StrategicLevelIndicator';
import type { ExtractedIntelligence, ConsultationStatus } from '@/types/consultationReadiness';

// Convert context's simple extracted intelligence to the full format expected by the calculator
function convertToFullIntelligence(simple: ContextExtractedIntelligence): Partial<ExtractedIntelligence> {
  return {
    industry: simple.industry,
    audience: simple.audience,
    valueProp: simple.valueProp,
    // Use competitorDifferentiation (matching ExtractedIntelligence type)
    competitorDifferentiation: simple.competitorDifferentiator,
    // Convert single strings to arrays for painPoints, buyerObjections, proofElements
    painPoints: simple.painPoints ? [simple.painPoints] : [],
    buyerObjections: simple.buyerObjections ? [simple.buyerObjections] : [],
    proofElements: simple.proofElements ? [simple.proofElements] : [],
    // Include summaries for tooltips (cast to any since these aren't in the strict type)
    ...(simple.industrySummary && { industrySummary: simple.industrySummary }),
    ...(simple.audienceSummary && { audienceSummary: simple.audienceSummary }),
    ...(simple.valuePropSummary && { valuePropSummary: simple.valuePropSummary }),
    ...(simple.edgeSummary && { edgeSummary: simple.edgeSummary }),
    ...(simple.painSummary && { painSummary: simple.painSummary }),
    ...(simple.objectionsSummary && { objectionsSummary: simple.objectionsSummary }),
    ...(simple.proofSummary && { proofSummary: simple.proofSummary }),
  } as Partial<ExtractedIntelligence>;
}

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
  const { state, processUserMessage, resetIntelligence, submitEmail, dismissEmailGate, reopenEmailGate } = useIntelligence();
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasInitialized = useRef(false);
  
  // Path selector modal state
  const [showPathSelector, setShowPathSelector] = useState(false);

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

  // Scroll to bottom on new messages or when typing preview appears
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
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

  const [isSavingSession, setIsSavingSession] = useState(false);

  // Handle opening path selector when CTA is clicked
  const handleGenerateClick = () => {
    setShowPathSelector(true);
  };

  const handleContinueToWizard = async (selectedPath: 'conversation' | 'wizard' = 'wizard') => {
    setShowPathSelector(false);
    setIsSavingSession(true);
    
    const sessionId = crypto.randomUUID();
    
    console.log('🚀 [Demo→Signup] Preparing demo intelligence for signup');
    
    // Build structured intelligence from demo state
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
      selectedPath: selectedPath, // Use the selected path from modal
    };
    
    // Calculate strategic level
    const levelResult = calculateStrategicLevel(convertToFullIntelligence(state.extracted));
    
    console.log('📊 [Demo→Signup] Strategic level:', levelResult.currentLevel);
    
    // Store demo intelligence in sessionStorage (survives redirect)
    sessionStorage.setItem('demoIntelligence', JSON.stringify(demoIntelligence));
    
    // Pre-fill email if captured
    if (state.email) {
      sessionStorage.setItem('demoEmail', state.email);
    }
    
    // Also save to demo_sessions for persistence
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
      const { error } = await supabase
        .from('demo_sessions')
        .insert([sessionData]);
      
      if (error) {
        console.error('Failed to save demo session:', error);
        // Continue anyway - sessionStorage has the data
      } else {
        console.log('✅ [Demo→Signup] Session saved to DB');
      }
      
      // Store session ID in localStorage (backup)
      localStorage.setItem('pageconsult_session_id', sessionId);
      
      console.log('🚀 [Demo→Signup] Redirecting to signup with demo context');
      
      // Navigate to signup with demo origin flag
      navigate('/signup?from=demo');
    } catch (err) {
      console.error('Error saving demo session:', err);
      // Continue anyway - sessionStorage has the data
      navigate('/signup?from=demo');
    } finally {
      setIsSavingSession(false);
    }
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

        {/* Responsive layout: Desktop side-by-side, Tablet/Mobile stacked */}
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-5">
          {/* Chat Interface */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden flex flex-col h-[400px] md:h-[450px] lg:h-[500px]"
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

          {/* Intelligence Profile - responsive layouts handled inside component */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-1"
          >
            <StrategicLevelIndicator 
              result={calculateStrategicLevel(convertToFullIntelligence(state.extracted))}
              onContinue={handleGenerateClick}
              isThinking={state.isProcessing}
              className="lg:h-[500px] lg:border-l-2 lg:border-slate-700/50 lg:shadow-[-4px_0_12px_rgba(0,0,0,0.2)]"
            />
            
            {/* Unlock Market Research button - shown when email modal was dismissed */}
            {state.emailDismissed && !state.emailCaptured && state.extracted.industry && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3"
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
