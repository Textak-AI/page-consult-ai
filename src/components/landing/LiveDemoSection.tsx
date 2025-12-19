import { useState, useEffect, useRef } from 'react';
import { useIntelligence } from '@/contexts/IntelligenceContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, User, Sparkles, ArrowRight, Send, TrendingUp, Users, Target, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import EmailGateModal from './EmailGateModal';

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

// Progress bar component
const IntelligenceBar = ({ 
  label, 
  value, 
  icon: Icon, 
  filled 
}: { 
  label: string; 
  value: string | null; 
  icon: React.ElementType; 
  filled: boolean;
}) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2 text-slate-300">
        <Icon className="w-4 h-4" />
        <span>{label}</span>
      </div>
      {value && (
        <motion.span
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-cyan-400 text-xs font-medium truncate max-w-[150px]"
        >
          {value}
        </motion.span>
      )}
    </div>
    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
      <motion.div
        className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full"
        initial={{ width: 0 }}
        animate={{ width: filled ? '100%' : '0%' }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />
    </div>
  </div>
);

// Readiness ring component
const ReadinessRing = ({ percentage }: { percentage: number }) => {
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-28 h-28 mx-auto">
      <svg className="w-28 h-28 transform -rotate-90">
        <circle
          cx="56"
          cy="56"
          r="45"
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          className="text-slate-700"
        />
        <motion.circle
          cx="56"
          cy="56"
          r="45"
          stroke="url(#gradient)"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{ strokeDasharray: circumference }}
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-white">{percentage}%</span>
        <span className="text-xs text-slate-400">Ready</span>
      </div>
    </div>
  );
};

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasInitialized = useRef(false);

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

  // Scroll to bottom on new messages - only within chat container
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (messagesEndRef.current && chatContainerRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [state.conversation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || state.isProcessing || state.rateLimited) return;

    const message = inputValue.trim();
    setInputValue('');
    await processUserMessage(message);
  };

  const handleContinue = () => {
    const prefillData = {
      extracted: state.extracted,
      market: state.market,
      source: 'landing_demo',
    };
    navigate(`/new?prefill=${encodeURIComponent(JSON.stringify(prefillData))}`);
  };

  // Build display conversation (with initial AI message if needed)
  const displayConversation = state.conversation.length === 0 
    ? [{ role: 'assistant' as const, content: "Tell me about your business — who do you help and what do you do for them?", timestamp: new Date() }]
    : state.conversation;

  // Get market insights to display (limit to 2 for layout balance)
  const marketInsights = [
    ...(state.market.industryInsights || []),
    ...(state.market.commonObjections?.slice(0, 1) || []),
  ].slice(0, 2);

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
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
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
            className="space-y-6 max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
          >
            {/* Intelligence Profile Card */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                Intelligence Profile
              </h3>

              <div className="space-y-5">
                <IntelligenceBar
                  label="Industry"
                  value={state.extracted.industry}
                  icon={TrendingUp}
                  filled={!!state.extracted.industry}
                />
                <IntelligenceBar
                  label="Audience"
                  value={state.extracted.audience}
                  icon={Users}
                  filled={!!state.extracted.audience}
                />
                <IntelligenceBar
                  label="Value Proposition"
                  value={state.extracted.valueProp}
                  icon={Target}
                  filled={!!state.extracted.valueProp}
                />
              </div>
            </div>

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

            {/* Readiness Ring */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
              <h4 className="text-sm font-medium text-slate-300 mb-4 text-center">Strategy Readiness</h4>
              <ReadinessRing percentage={state.readiness} />
              
              {/* Continue button - only show when email captured AND readiness >= 60 */}
              <AnimatePresence mode="wait">
                {state.readiness >= 60 && state.emailCaptured ? (
                  <motion.div
                    key="continue-button"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="mt-6"
                  >
                    <Button
                      onClick={handleContinue}
                      className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white py-3 text-base font-medium"
                    >
                      Continue Full Strategy Session
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </motion.div>
                ) : state.readiness >= 50 && !state.emailCaptured ? (
                  <motion.p
                    key="email-prompt"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="mt-4 text-center text-sm text-slate-400"
                  >
                    Enter your email above to continue...
                  </motion.p>
                ) : null}
              </AnimatePresence>
            </div>
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
