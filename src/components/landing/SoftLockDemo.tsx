import { useState, useEffect, useRef, useCallback } from 'react';
import { useIntelligence } from '@/contexts/IntelligenceContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Sparkles, Send, Loader2, X, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import BusinessCardGateModal from './BusinessCardGateModal';
import { supabase } from '@/integrations/supabase/client';
import { calculateIntelligenceScore } from '@/lib/intelligenceScoreCalculator';
import { IntelligenceTabs } from '@/components/demo/IntelligenceTabs';
import { DemoPreviewWidget } from './DemoPreviewWidget';

// Circuit pattern SVG - extremely subtle for expanded view (2% opacity)
const circuitPatternSvg = `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23ffffff' stroke-width='0.5' opacity='0.02'%3E%3Cpath d='M0 40h20v-20h20v-20'/%3E%3Cpath d='M80 40h-20v20h-20v20'/%3E%3Ccircle cx='20' cy='20' r='2'/%3E%3Ccircle cx='60' cy='60' r='2'/%3E%3C/g%3E%3C/svg%3E")`;

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

interface SoftLockDemoProps {
  onLockChange?: (isLocked: boolean) => void;
}

export default function SoftLockDemo({ onLockChange }: SoftLockDemoProps) {
  const navigate = useNavigate();
  const { state, processUserMessage, submitBusinessCard, dismissEmailGate, reopenEmailGate } = useIntelligence();
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // Soft lock state
  const [isLocked, setIsLocked] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  
  // Ghost text activation state - tracks when user engages with input
  const [isGhostActivated, setIsGhostActivated] = useState(false);
  
  // Mobile intelligence drawer state
  const [showMobileIntelligence, setShowMobileIntelligence] = useState(false);
  
  // Session saving state
  const [isSavingSession, setIsSavingSession] = useState(false);

  // Activate soft lock
  const activateLock = useCallback(() => {
    if (isLocked) return;
    setIsLocked(true);
    setHasInteracted(true);
    onLockChange?.(true);
    
    // Disable body scroll
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
  }, [isLocked, onLockChange]);

  // Deactivate soft lock
  const deactivateLock = useCallback(() => {
    if (!isLocked) return;
    setIsLocked(false);
    onLockChange?.(false);
    
    // Re-enable body scroll
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
    
    // Scroll back to demo section
    setTimeout(() => {
      sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }, [isLocked, onLockChange]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isLocked) {
        deactivateLock();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLocked, deactivateLock]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, []);

  // Auto-focus input when session expands
  useEffect(() => {
    if (isLocked && inputRef.current) {
      // Small delay to ensure the expanded view has rendered
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isLocked]);

  // Handle input focus - trigger lock and activate ghost text
  const handleInputFocus = () => {
    activateLock();
    if (!isGhostActivated) {
      setIsGhostActivated(true);
    }
  };

  // Handle input change - also activates ghost text
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (!isGhostActivated && e.target.value.length > 0) {
      setIsGhostActivated(true);
    }
  };

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current && chatContainerRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [state.conversation, inputValue]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || state.isProcessing || state.rateLimited) return;

    // Ensure we're locked when sending first message
    if (!isLocked) {
      activateLock();
    }

    const message = inputValue.trim();
    setInputValue('');
    await processUserMessage(message);
  };

  // Handle email gate dismissal
  const handleContinueWithoutEmail = () => {
    dismissEmailGate();
  };

  // Handle business card submit
  const handleBusinessCardSubmit = async (data: { companyName: string; website: string; email: string }) => {
    await submitBusinessCard(data, (followUpMessage: string) => {
      console.log('📝 [SoftLockDemo] Research complete:', followUpMessage.substring(0, 60) + '...');
    });
  };

  const handleGenerateClick = () => {
    handleContinueToWizard('wizard');
  };

  const handleContinueToWizard = async (selectedPath: 'conversation' | 'wizard' = 'wizard') => {
    setIsSavingSession(true);
    
    const sessionId = crypto.randomUUID();
    const isReady = state.readiness >= 70;
    
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
    
    const brandPrefill = {
      logo: state.extractedLogo || null,
      companyName: state.businessCard?.companyName || state.companyResearch?.companyName || null,
      website: state.businessCard?.website || null,
      colors: state.extractedBrand?.colors || null,
      fonts: state.extractedBrand?.fonts || null,
      industry: state.extracted?.industry || null,
    };
    sessionStorage.setItem('brandPrefill', JSON.stringify(brandPrefill));
    
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
      completed: isReady,
      continued_to_consultation: true,
    };
    
    try {
      await supabase.from('demo_sessions').insert([sessionData]);
      localStorage.setItem('pageconsult_session_id', sessionId);
      
      const signupUrl = isReady 
        ? `/signup?from=demo&session=${sessionId}&ready=true`
        : `/signup?from=demo&session=${sessionId}`;
      
      navigate(signupUrl);
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
    <>
      {/* Preview Widget - shows when unlocked */}
      <AnimatePresence>
        {!isLocked && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3 }}
          >
            <DemoPreviewWidget 
              onActivate={activateLock}
              onInputFocus={activateLock}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full Strategy Session - shows when locked */}
      <AnimatePresence>
        {isLocked && (
          <motion.section 
            ref={sectionRef}
            id="demo-expanded"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-40 min-h-screen bg-slate-950 flex flex-col"
          >
            {/* Circuit pattern background - fades in */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="absolute inset-0 pointer-events-none"
              style={{ 
                backgroundImage: circuitPatternSvg,
                backgroundSize: '80px 80px',
              }}
            />

            {/* Header - matches main site nav exactly */}
            <motion.header
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="sticky top-0 z-50 h-[72px] border-b border-slate-800/50 bg-slate-950/95 backdrop-blur-xl flex-shrink-0"
            >
              <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between max-w-7xl mx-auto">
                {/* Left: Logo - identical to main nav */}
                <button
                  onClick={deactivateLock}
                  className="flex items-center py-2 hover:opacity-80 transition-opacity"
                >
                  <div className="h-8 w-32 flex items-center flex-shrink-0">
                    <img 
                      src="/logo/whiteAsset_3combimark_darkmode.svg" 
                      alt="PageConsult AI" 
                      className="h-8 w-auto"
                    />
                  </div>
                </button>
                
                {/* Center: Session label */}
                <span className="text-sm text-slate-400 font-medium">
                  Strategy Session
                </span>
                
                {/* Right: X button */}
                <button
                  onClick={deactivateLock}
                  className="w-9 h-9 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </motion.header>

            {/* Main Content - Chat + Sidebar with proper padding on all sides */}
            <div className="flex-1 flex overflow-hidden relative z-10 p-6 lg:p-8 gap-6">
              
              {/* Chat Container */}
              <main className="flex-1 flex flex-col min-w-0 bg-slate-900/30 rounded-2xl border border-slate-800/30 overflow-hidden">
                
                {/* Messages Area - normal top-down layout */}
                <div 
                  ref={chatContainerRef} 
                  className="flex-1 overflow-y-auto min-h-0"
                >
                  <div className="max-w-4xl mx-auto px-6 py-6 space-y-6 w-full">
                    <AnimatePresence mode="popLayout">
                      {displayConversation.map((message, index) => {
                        // Check if this is the initial ghost message (first message, no real conversation yet)
                        const isInitialGhostMessage = index === 0 && state.conversation.length === 0;
                        const showAsGhost = isInitialGhostMessage && !isGhostActivated;
                        
                        return (
                          <motion.div
                            key={`msg-${index}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            {message.role === 'assistant' ? (
                              <div className="flex gap-4">
                                <motion.div 
                                  className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center"
                                  animate={{ opacity: showAsGhost ? 0.5 : 1 }}
                                  transition={{ duration: 0.35 }}
                                >
                                  <MessageSquare className="w-5 h-5 text-slate-300" />
                                </motion.div>
                                <div className="flex-1 min-w-0 max-w-[85%]">
                                  <motion.div 
                                    className="flex items-center gap-2 mb-1.5"
                                    animate={{ opacity: showAsGhost ? 0.5 : 1 }}
                                    transition={{ duration: 0.35 }}
                                  >
                                    <span className="text-sm font-medium text-white">PageConsult AI</span>
                                    <span className="text-xs text-slate-500">Strategy Consultant</span>
                                  </motion.div>
                                  <motion.div 
                                    className="rounded-2xl rounded-tl-md px-4 py-3 text-[15px] leading-relaxed break-words"
                                    animate={{ 
                                      opacity: showAsGhost ? 0.55 : 1,
                                      backgroundColor: showAsGhost ? 'rgba(30, 41, 59, 0)' : 'rgba(30, 41, 59, 0.6)',
                                    }}
                                    transition={{ duration: 0.35 }}
                                  >
                                    <motion.span
                                      className="text-slate-200"
                                      animate={{ 
                                        fontStyle: showAsGhost ? 'italic' : 'normal',
                                      }}
                                      transition={{ duration: 0.35 }}
                                    >
                                      {message.content}
                                    </motion.span>
                                  </motion.div>
                                </div>
                              </div>
                          ) : (
                            <div className="flex justify-end">
                              <div className="max-w-[85%]">
                                <div className="bg-cyan-600/20 border border-cyan-500/20 rounded-2xl rounded-tr-md px-4 py-3 text-slate-200 text-[15px] leading-relaxed break-words">
                                  {message.content}
                                </div>
                              </div>
                            </div>
                          )}
                        </motion.div>
                        );
                      })}
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

                {/* Input Area - with comfortable padding */}
                <div className="border-t border-slate-800/50 bg-slate-900/50 flex-shrink-0 px-6 py-6">
                  <div className="max-w-2xl mx-auto">
                    {state.rateLimited ? (
                      <div className="text-center py-3">
                        <p className="text-amber-400 text-sm mb-2">Demo limit reached (5 messages)</p>
                        <Button
                          onClick={() => navigate('/new')}
                          className="bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-600 hover:to-violet-700 text-white"
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
                            onChange={handleInputChange}
                            onFocus={handleInputFocus}
                            placeholder="Tell me about your business..."
                            disabled={state.isProcessing}
                            className="w-full px-4 py-3.5 pr-14 bg-slate-800/50 border-slate-700/50 rounded-xl text-white placeholder:text-slate-500 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10 transition-all text-[15px] leading-relaxed"
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
              
              {/* Intel Sidebar - Desktop only, with proper right margin */}
              <aside className="hidden lg:flex w-[380px] flex-shrink-0 bg-slate-900/40 border border-slate-800/30 rounded-2xl flex-col overflow-hidden">
                <div className="p-5 flex-1 overflow-hidden">
                  <IntelligenceTabs 
                    onContinue={handleGenerateClick}
                    onReopenEmailGate={reopenEmailGate}
                  />
                </div>
              </aside>
              
            </div>
          </motion.section>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showMobileIntelligence && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 lg:hidden"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowMobileIntelligence(false)}
            />
            
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 bg-slate-900 border-t border-white/10 rounded-t-3xl max-h-[80vh] flex flex-col"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 flex-shrink-0">
                <h3 className="text-white font-semibold">Intelligence Dashboard</h3>
                <button
                  onClick={() => setShowMobileIntelligence(false)}
                  className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
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
        onSubmit={handleBusinessCardSubmit}
        onContinueWithoutResearch={handleContinueWithoutEmail}
        industry={state.extracted.industry}
      />

      {/* Saving session loader */}
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
    </>
  );
}
