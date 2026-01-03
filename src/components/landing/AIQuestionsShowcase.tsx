import { motion, AnimatePresence } from 'framer-motion';
import { useMemo } from 'react';
import { useIntelligence } from '@/contexts/IntelligenceContext';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatForHeadline } from '@/utils/formatForDisplay';

interface ExtractionField {
  label: string;
  value: string;
  color: 'purple' | 'cyan' | 'emerald' | 'amber' | string;
}

interface ExtractionExample {
  input: string;
  extractions: ExtractionField[];
  isReal?: boolean;
}

const staticExamples: ExtractionExample[] = [
  {
    input: "We help CBD companies reach their audience through compliant digital marketing",
    extractions: [
      { label: "Industry", value: "Digital Marketing (regulated)", color: "purple" },
      { label: "Audience", value: "CBD companies (B2B)", color: "cyan" },
      { label: "Key Challenge", value: "Ad platform restrictions", color: "emerald" },
      { label: "Positioning Angle", value: '"Compliant" = differentiator', color: "amber" },
    ],
  },
  {
    input: "Our clients usually see 2-3x increase in organic traffic within 6 months",
    extractions: [
      { label: "Proof Point", value: "2-3x traffic increase", color: "purple" },
      { label: "Timeline", value: "6 months (realistic)", color: "cyan" },
      { label: "CTA Strategy", value: "Results-focused messaging", color: "emerald" },
      { label: "Calculator Idea", value: "Traffic growth estimator", color: "amber" },
    ],
  },
  {
    input: "Most agencies don't understand the compliance side — they get accounts banned",
    extractions: [
      { label: "Competitor Weakness", value: "Compliance ignorance", color: "purple" },
      { label: "Pain Point", value: "Banned accounts = lost revenue", color: "cyan" },
      { label: "Your Edge", value: "Compliance expertise", color: "emerald" },
      { label: "Section to Build", value: '"Why Others Fail" objection handler', color: "amber" },
    ],
  },
];

const colorToBgClass: Record<string, string> = {
  purple: 'bg-purple-400',
  cyan: 'bg-cyan-400',
  emerald: 'bg-emerald-400',
  amber: 'bg-amber-400',
};

const ExtractionCard = ({ 
  example, 
  index 
}: { 
  example: ExtractionExample; 
  index: number; 
}) => {
  return (
    <motion.div
      key={example.input}
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.98 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="grid md:grid-cols-2 gap-4 items-stretch"
    >
      {/* Left: What you say */}
      <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-white/5 h-full relative">
        {example.isReal && (
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-cyan-400 text-xs font-medium uppercase tracking-wide">
              Live
            </span>
          </div>
        )}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-white/30" />
          <span className="text-white/40 text-xs font-medium uppercase tracking-wide">You say</span>
        </div>
        <p className="text-white/80 text-lg leading-relaxed pr-16">
          "{example.input}"
        </p>
      </div>

      {/* Right: What I extract */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 border border-purple-500/20 relative overflow-hidden h-full">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-cyan-500/5" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <div className={`w-2 h-2 rounded-full bg-cyan-400 ${example.isReal ? 'animate-pulse' : ''}`} />
            <span className="text-cyan-400 text-xs font-medium uppercase tracking-wide">I extract</span>
          </div>

          <div className="space-y-3">
            {example.extractions.map((extraction, i) => (
              <motion.div 
                key={i} 
                className="flex items-start gap-3"
                initial={example.isReal ? { opacity: 0, x: -10 } : false}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${colorToBgClass[extraction.color] || 'bg-purple-400'} mt-2 flex-shrink-0`} />
                <div>
                  <span className="text-white/50 text-sm">{extraction.label}:</span>
                  <span className="text-white ml-2">{formatForHeadline(extraction.value)}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const AIQuestionsShowcase = () => {
  const { state } = useIntelligence();
  const { conversationHistory } = state;

  // Merge real conversation history with static fallbacks
  const displayedExamples = useMemo((): ExtractionExample[] => {
    // Convert conversation history to display format
    const realExamples: ExtractionExample[] = conversationHistory
      .filter(turn => turn.extraction?.fields?.length >= 2)
      .map(turn => ({
        input: turn.userMessage,
        extractions: turn.extraction.fields.map(f => ({
          label: f.label,
          value: f.value,
          color: f.color,
        })),
        isReal: true,
      }));

    // Fill remaining slots with static examples
    const needed = 3 - realExamples.length;
    const staticFill = staticExamples.slice(0, Math.max(0, needed));

    return [...realExamples, ...staticFill];
  }, [conversationHistory]);

  const hasRealExtractions = conversationHistory.length >= 2;

  return (
    <section className="py-20 bg-slate-950 relative overflow-hidden">
      {/* Subtle ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px]" />

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-cyan-400 text-sm font-semibold tracking-wide uppercase mb-3">
            Strategic Intelligence
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            How I Listen. How I Think.
          </h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            {hasRealExtractions 
              ? "Here's what I've extracted from your conversation — this is your strategy taking shape."
              : "Every answer you give becomes strategic intelligence. Here's what happens behind the scenes."
            }
          </p>
        </motion.div>

        {/* Extraction Examples */}
        <div className="space-y-6">
          <AnimatePresence mode="popLayout">
            {displayedExamples.map((example, index) => (
              <ExtractionCard 
                key={example.isReal ? `real-${index}` : `static-${index}`}
                example={example} 
                index={index} 
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Bottom caption or CTA */}
        {hasRealExtractions ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-12 text-center"
          >
            <div className="inline-block bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/20 rounded-2xl px-8 py-6">
              <p className="text-white/60 text-sm mb-2">
                ✨ This is your strategy taking shape
              </p>
              <p className="text-white text-lg font-medium mb-4">
                Ready to see it become a full landing page?
              </p>
              <Link 
                to="/consultation"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-400 hover:to-cyan-400 rounded-xl text-white font-semibold transition-all"
              >
                Continue to Full Strategy Session
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        ) : (
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="text-center text-white/40 text-sm mt-12"
          >
            This is why no two PageConsult pages look alike. The strategy is extracted, not assumed.
          </motion.p>
        )}
      </div>
    </section>
  );
};

export default AIQuestionsShowcase;