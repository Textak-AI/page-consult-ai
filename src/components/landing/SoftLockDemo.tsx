import { useState, useEffect, useRef, useCallback } from 'react';
import { useIntelligence } from '@/contexts/IntelligenceContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BusinessCardGateModal from './BusinessCardGateModal';
import { supabase } from '@/integrations/supabase/client';
import { calculateIntelligenceScore } from '@/lib/intelligenceScoreCalculator';
import { IntelligenceTabs } from '@/components/demo/IntelligenceTabs';
import { DemoPreviewWidget } from './DemoPreviewWidget';
import { MutedCircuitBackground } from './MutedCircuitBackground';
import { StrategistIcon } from '@/components/ui/StrategistIcon';
import ReactMarkdown from 'react-markdown';

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
  const [showInputPreview, setShowInputPreview] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // Check if input content exceeds one line (80 chars or newline)
  useEffect(() => {
    setShowInputPreview(inputValue.length > 80 || inputValue.includes('\n'));
  }, [inputValue]);
  
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
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
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
    <div id="demo">
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
              
              {/* Chat Container with glass panel effect */}
              <main className="flex-1 flex flex-col min-w-0 relative rounded-2xl overflow-hidden">
                {/* Muted circuitry background */}
                <MutedCircuitBackground />
                
                {/* Glass panel overlay */}
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
                
                {/* Border */}
                <div className="absolute inset-0 rounded-2xl border border-slate-800/40 pointer-events-none" />
                
                {/* Content container */}
                <div className="relative z-10 flex flex-col flex-1 overflow-hidden">
                
                {/* ============================================
                    MESSAGES AREA - Scrollable container
                    ============================================ */}
                <div 
                  ref={chatContainerRef} 
                  className="flex-1 overflow-y-auto min-h-0"
                >
                  <div className="max-w-4xl mr-auto px-6 py-6 space-y-2">
                    <AnimatePresence mode="popLayout">
                      {displayConversation.map((message, index) => {
                        const isInitialGhostMessage = index === 0 && state.conversation.length === 0;
                        const showAsGhost = isInitialGhostMessage && !isGhostActivated;
                        
                        return (
                          <motion.div
                            key={`msg-${index}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="w-full"
                          >
                            {message.role === 'assistant' ? (
                              /* ======== AI MESSAGE - LEFT ALIGNED ======== */
                              <div className="flex items-start gap-4 mb-8">
                                {/* Avatar with glow */}
                                <motion.div 
                                  className="relative flex-shrink-0"
                                  animate={{ opacity: showAsGhost ? 0.5 : 1 }}
                                  transition={{ duration: 0.35 }}
                                >
                                  <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700/60 flex items-center justify-center">
                                    <StrategistIcon size={24} />
                                  </div>
                                </motion.div>
                                
                                {/* Message content - max 75% width */}
                                <div className="max-w-[75%]">
                                  <motion.div 
                                    className="flex items-center gap-2 mb-1.5"
                                    animate={{ opacity: showAsGhost ? 0.5 : 1 }}
                                    transition={{ duration: 0.35 }}
                                  >
                                    <span className="text-cyan-400 font-medium text-sm">PageConsult AI</span>
                                    <span className="text-slate-500 text-xs">Strategy Consultant</span>
                                  </motion.div>
                                  
                                  {/* Bubble - clean, no glow */}
                                  <motion.div 
                                    className="bg-slate-800/80 rounded-2xl px-4 py-3 border border-slate-700/50 shadow-sm"
                                    animate={{ opacity: showAsGhost ? 0.55 : 1 }}
                                    transition={{ duration: 0.35 }}
                                  >
                                    <motion.div
                                      className="text-[15px] text-slate-100 leading-relaxed"
                                      animate={{ fontStyle: showAsGhost ? 'italic' : 'normal' }}
                                      transition={{ duration: 0.35 }}
                                    >
                                      <ReactMarkdown
                                        components={{
                                          strong: ({ children }) => <span className="font-semibold text-white">{children}</span>,
                                          em: ({ children }) => <span className="italic text-slate-200">{children}</span>,
                                          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                          ul: ({ children }) => <ul className="my-2 ml-4 list-disc">{children}</ul>,
                                          li: ({ children }) => <li className="text-slate-100">{children}</li>,
                                        }}
                                      >
                                        {message.content}
                                      </ReactMarkdown>
                                    </motion.div>
                                  </motion.div>
                                </div>
                              </div>
                            ) : (
                              /* ======== USER MESSAGE - RIGHT ALIGNED ======== */
                              <div className="flex justify-end mb-6">
                                <div className="max-w-[65%]">
                                  {/* Bubble - clean, no glow */}
                                  <div className="bg-slate-700/60 rounded-2xl px-4 py-3 border border-slate-600/50 shadow-sm">
                                    <div className="text-[15px] text-slate-200 leading-relaxed">
                                      <ReactMarkdown
                                        components={{
                                          strong: ({ children }) => <span className="font-semibold text-white">{children}</span>,
                                          em: ({ children }) => <span className="italic text-slate-300">{children}</span>,
                                          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                        }}
                                      >
                                        {message.content}
                                      </ReactMarkdown>
                                    </div>
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
                        className="flex items-start gap-4 mb-8"
                      >
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700/60 flex items-center justify-center">
                            <StrategistIcon size={24} />
                          </div>
                        </div>
                        <div className="bg-slate-800/80 rounded-2xl px-4 py-3 border border-slate-700/50 shadow-sm">
                          <div className="flex gap-1">
                            <span className="w-2 h-2 bg-cyan-400/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-2 h-2 bg-cyan-400/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-2 h-2 bg-cyan-400/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                      </motion.div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {/* ============================================
                    INPUT AREA - Fixed at bottom, same alignment
                    ============================================ */}
                <div className="flex-shrink-0 border-t border-slate-800/50">
                  <div className="max-w-4xl mr-auto px-6 py-4">
                    <form onSubmit={handleSubmit}>
                      {/* Overflow preview - only when text > 80 chars */}
                      <AnimatePresence>
                        {showInputPreview && inputValue.trim() && (
                          <motion.div
                            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                            animate={{ opacity: 1, height: 'auto', marginBottom: 12 }}
                            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 py-2.5 rounded-xl bg-slate-800/30 border border-slate-700/40">
                              <p className="text-sm text-slate-400/70 italic leading-relaxed whitespace-pre-wrap">
                                {inputValue}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      
                      {/* Input field - clean styling */}
                      <div className="relative">
                        <div className="relative flex items-end gap-3 bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 hover:border-cyan-500/30 focus-within:border-cyan-500/40 transition-colors px-4 py-3">
                          <textarea
                            ref={inputRef}
                            value={inputValue}
                            onChange={handleInputChange}
                            onFocus={handleInputFocus}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit(e);
                              }
                            }}
                            placeholder="Tell me about your business..."
                            disabled={state.isProcessing}
                            rows={1}
                            className="flex-1 bg-transparent text-slate-200 placeholder:text-slate-500 resize-none outline-none text-[15px] leading-relaxed max-h-32 overflow-y-auto"
                            onInput={(e) => {
                              const target = e.target as HTMLTextAreaElement;
                              target.style.height = 'auto';
                              target.style.height = Math.min(target.scrollHeight, 128) + 'px';
                            }}
                          />
                          
                          {/* Send button - understated */}
                          <button
                            type="submit"
                            disabled={state.isProcessing || !inputValue.trim()}
                            className="flex-shrink-0 p-2 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-700/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          >
                            {state.isProcessing ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <Send className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
                </div>
              </main>
              
              {/* Intel Sidebar - Desktop only, with proper right margin */}
              <aside className="hidden lg:flex w-[420px] flex-shrink-0 bg-slate-900/40 border border-slate-800/30 rounded-2xl flex-col overflow-hidden">
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
    </div>
  );
}
