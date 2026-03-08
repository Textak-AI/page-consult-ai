import { motion } from 'framer-motion';
import { Brain, CheckCircle, AlertTriangle } from 'lucide-react';

const ARCHETYPE_PROFILES: Record<string, string> = {
  'Analytical Validator': 'This buyer evaluates vendors like they evaluate data — systematically. They want ROI projections, benchmark comparisons, and peer-reviewed credibility. Urgency tactics insult their intelligence. Authority and hard evidence win.',
  'Emotional Connector': 'This buyer is in pain and looking for someone who gets it. They respond to stories of transformation, peer-level warmth, and low-pressure entry points. Hard sells push them away. Empathy and testimonials win.',
  'Decisive Commander': 'This buyer has budget authority and wants to move. They respect directness, outcome proof, and recognizable credentials. Don\'t waste their time with soft asks or long narratives. Show the result, make the ask, close.',
  'Cautious Researcher': 'This buyer is thorough and risk-averse. They\'re comparing 3–5 vendors, reading every case study, and checking references. Urgency destroys trust instantly. Give them a soft entry, balanced proof, and room to evaluate.',
};

export interface MessagingArchitecturePanelProps {
  messagingArchitecture: {
    archetype: string;
    confidence: number;
    headlineFocus: string;
    proofStyle: string;
    commitmentAsk: string;
    voiceRegister: string;
    urgencySignal: string;
    socialProofType: string;
    probability: number;
    stateKey: string;
  };
  detectedSignals?: string[];
}

const ARCHETYPE_META: Record<string, { description: string; color: string; colorClass: string; bgClass: string; borderClass: string; pillBg: string }> = {
  'Analytical Validator': {
    description: 'Buys with spreadsheets. Needs proof before they\'ll even take a call.',
    color: 'cyan',
    colorClass: 'text-cyan-400',
    bgClass: 'bg-cyan-400/10',
    borderClass: 'border-cyan-400/30',
    pillBg: 'bg-cyan-400/20 text-cyan-300',
  },
  'Emotional Connector': {
    description: 'Buys with their gut. Needs to feel understood before they\'ll trust you.',
    color: 'rose',
    colorClass: 'text-rose-400',
    bgClass: 'bg-rose-400/10',
    borderClass: 'border-rose-400/30',
    pillBg: 'bg-rose-400/20 text-rose-300',
  },
  'Decisive Commander': {
    description: 'Buys fast when convinced. Needs results, not hand-holding.',
    color: 'amber',
    colorClass: 'text-amber-400',
    bgClass: 'bg-amber-400/10',
    borderClass: 'border-amber-400/30',
    pillBg: 'bg-amber-400/20 text-amber-300',
  },
  'Cautious Researcher': {
    description: 'Buys slowly and carefully. Needs options, not pressure.',
    color: 'violet',
    colorClass: 'text-violet-400',
    bgClass: 'bg-violet-400/10',
    borderClass: 'border-violet-400/30',
    pillBg: 'bg-violet-400/20 text-violet-300',
  },
};

interface Decision {
  key: string;
  question: string;
  field: string;
  options: Record<string, { answer: string; reasoning: string }>;
}

const DECISIONS: Decision[] = [
  {
    key: 'headlineFocus', question: 'Lead with the result or the problem?', field: 'headlineFocus',
    options: {
      'outcome-led': { answer: 'Result-Led', reasoning: 'Your buyer wants proof of outcomes before engaging.' },
      'problem-led': { answer: 'Problem-Led', reasoning: 'Your buyer needs to feel understood before they\'ll listen.' },
    },
  },
  {
    key: 'proofStyle', question: 'Prove it with numbers or stories?', field: 'proofStyle',
    options: {
      'quantitative': { answer: 'Data & Metrics', reasoning: 'This buyer validates with evidence. Stats build confidence.' },
      'narrative': { answer: 'Stories & Narratives', reasoning: 'This buyer connects through human experience. Stories build trust.' },
    },
  },
  {
    key: 'commitmentAsk', question: 'Ask for commitment or curiosity?', field: 'commitmentAsk',
    options: {
      'direct': { answer: 'Direct Ask', reasoning: 'This buyer respects directness. A clear ask signals confidence.' },
      'exploratory': { answer: 'Soft Ask', reasoning: 'This buyer needs space to evaluate. A soft entry reduces resistance.' },
    },
  },
  {
    key: 'voiceRegister', question: 'Sound like the expert or the ally?', field: 'voiceRegister',
    options: {
      'authoritative': { answer: 'Expert Authority', reasoning: 'This buyer trusts credentials and professional distance.' },
      'peer-relational': { answer: 'Peer & Ally', reasoning: 'This buyer trusts warmth and shared understanding.' },
    },
  },
  {
    key: 'urgencySignal', question: 'Create urgency or build patience?', field: 'urgencySignal',
    options: {
      'present': { answer: 'Urgency Signals', reasoning: 'This buyer responds to consequence framing and competitive pressure.' },
      'absent': { answer: 'No Urgency — Trust First', reasoning: 'This buyer distrusts manufactured scarcity. Patience earns the conversion.' },
    },
  },
  {
    key: 'socialProofType', question: 'Show logos or show people?', field: 'socialProofType',
    options: {
      'authority': { answer: 'Logos & Credentials', reasoning: 'This buyer is impressed by who you\'ve worked with.' },
      'testimonial': { answer: 'Named Testimonials', reasoning: 'This buyer is convinced by what others experienced.' },
    },
  },
];

interface CoherencePair {
  conditions: [string, string, string, string]; // [field1, val1, field2, val2]
  label: string;
  type: 'reinforcing' | 'tension';
}

const COHERENCE_PAIRS: CoherencePair[] = [
  { conditions: ['voiceRegister', 'authoritative', 'commitmentAsk', 'direct'], label: 'Expert voice + direct ask reinforces confidence', type: 'reinforcing' },
  { conditions: ['voiceRegister', 'peer-relational', 'commitmentAsk', 'exploratory'], label: 'Peer voice + soft ask feels natural and safe', type: 'reinforcing' },
  { conditions: ['proofStyle', 'quantitative', 'headlineFocus', 'outcome-led'], label: 'Data proof + result headline creates a strong evidence chain', type: 'reinforcing' },
  { conditions: ['proofStyle', 'narrative', 'voiceRegister', 'peer-relational'], label: 'Story proof + peer voice makes narratives feel authentic', type: 'reinforcing' },
  { conditions: ['socialProofType', 'authority', 'voiceRegister', 'authoritative'], label: 'Logos + expert voice projects consistent authority', type: 'reinforcing' },
  { conditions: ['socialProofType', 'testimonial', 'voiceRegister', 'peer-relational'], label: 'Testimonials + peer voice feels genuinely human', type: 'reinforcing' },
  { conditions: ['voiceRegister', 'authoritative', 'urgencySignal', 'present'], label: 'Expert voice + urgency feels manipulative — credibility risk', type: 'tension' },
  { conditions: ['commitmentAsk', 'direct', 'urgencySignal', 'present'], label: 'Direct ask + urgency creates too much pressure', type: 'tension' },
  { conditions: ['voiceRegister', 'peer-relational', 'socialProofType', 'authority'], label: 'Peer voice + corporate logos feels inauthentic', type: 'tension' },
  { conditions: ['proofStyle', 'narrative', 'socialProofType', 'authority'], label: 'Story proof + corporate logos sends mixed signals', type: 'tension' },
  { conditions: ['commitmentAsk', 'direct', 'voiceRegister', 'peer-relational'], label: 'Direct ask + peer voice feels pushy from a friend', type: 'tension' },
  { conditions: ['headlineFocus', 'outcome-led', 'voiceRegister', 'peer-relational'], label: 'Result headline + peer voice can feel like bragging', type: 'tension' },
];

function getActiveCoherencePairs(arch: MessagingArchitecturePanelProps['messagingArchitecture']) {
  const vals: Record<string, string> = {
    headlineFocus: arch.headlineFocus,
    proofStyle: arch.proofStyle,
    commitmentAsk: arch.commitmentAsk,
    voiceRegister: arch.voiceRegister,
    urgencySignal: arch.urgencySignal,
    socialProofType: arch.socialProofType,
  };
  return COHERENCE_PAIRS.filter(p =>
    vals[p.conditions[0]] === p.conditions[1] && vals[p.conditions[2]] === p.conditions[3]
  );
}

function buildBriefPreview(arch: MessagingArchitecturePanelProps['messagingArchitecture']): string {
  const meta = ARCHETYPE_META[arch.archetype];
  const article = arch.archetype === 'Emotional Connector' || arch.archetype === 'Analytical Validator' ? 'an' : 'a';
  const desc = meta?.description.toLowerCase() || 'has a distinct buying psychology';

  const headlineReason = arch.headlineFocus === 'outcome-led'
    ? 'Your headline leads with the outcome — what they get — because this buyer wants proof before engagement.'
    : 'Your headline leads with the problem — what they\'re struggling with — because this buyer needs to feel understood first.';

  const urgencyReason = arch.urgencySignal === 'present'
    ? 'Urgency signals are active. This buyer responds to consequence framing and competitive pressure.'
    : 'We\'ve removed all urgency signals. This buyer interprets scarcity as manipulation, and it will cost you the conversion.';

  const ctaReason = arch.commitmentAsk === 'direct'
    ? 'Your CTA is direct — \'Schedule a Call\' or \'Request a Proposal\' — because this buyer respects confidence and doesn\'t need hand-holding.'
    : 'Your CTA is exploratory — \'See How It Works\' or \'Explore the Platform\' — because this buyer needs space to evaluate before committing.';

  return `Your buyer is ${article} ${arch.archetype} — ${desc} We've optimized your page architecture around this psychology. ${headlineReason} ${urgencyReason} ${ctaReason}`;
}

export function MessagingArchitecturePanel({ messagingArchitecture, detectedSignals }: MessagingArchitecturePanelProps) {
  const meta = ARCHETYPE_META[messagingArchitecture.archetype] || ARCHETYPE_META['Analytical Validator'];
  const activePairs = getActiveCoherencePairs(messagingArchitecture);
  const reinforcing = activePairs.filter(p => p.type === 'reinforcing');
  const tensions = activePairs.filter(p => p.type === 'tension');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="space-y-5"
    >
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-cyan-400">
          Messaging Architecture
        </p>
        <span className="text-[10px] px-2.5 py-1 rounded-full bg-white/[0.04] text-slate-500 tracking-wide">
          SDI Layer 1.5
        </span>
      </div>

      {/* Archetype Banner */}
      <div className={`rounded-xl border ${meta.borderClass} ${meta.bgClass} p-5`}>
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${meta.bgClass} flex items-center justify-center`}>
              <Brain className={`w-5 h-5 ${meta.colorClass}`} />
            </div>
            <div>
              <h3 className={`text-lg font-bold ${meta.colorClass}`}>{messagingArchitecture.archetype}</h3>
              <p className="text-slate-400 text-sm">{meta.description}</p>
            </div>
          </div>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${meta.pillBg} whitespace-nowrap`}>
            {Math.round(messagingArchitecture.confidence * 100)}% confidence
          </span>
        </div>
        {ARCHETYPE_PROFILES[messagingArchitecture.archetype] && (
          <p className="text-xs text-slate-400 leading-relaxed mt-2">
            {ARCHETYPE_PROFILES[messagingArchitecture.archetype]}
          </p>
        )}
        {detectedSignals && detectedSignals.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            <span className="text-[10px] text-slate-500 mr-1">Detected signals:</span>
            {detectedSignals.map((signal) => (
              <span
                key={signal}
                className={`text-[10px] px-2 py-0.5 rounded-full ${meta.pillBg}`}
              >
                {signal}
              </span>
            ))}
          </div>
        )}
        <p className="text-slate-500 text-xs mt-3">
          64 page architectures evaluated. Optimal configuration locked before generation.
        </p>
      </div>

      {/* Six Decision Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {DECISIONS.map((d, i) => {
          const val = (messagingArchitecture as any)[d.field] as string;
          const opt = d.options[val];
          if (!opt) return null;
          return (
            <motion.div
              key={d.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              className="bg-white/[0.03] border-l-[3px] rounded-lg p-4"
              style={{ borderLeftColor: `var(--arch-accent, rgba(148,163,184,0.33))` }}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <p className="text-slate-400 text-sm leading-snug">{d.question}</p>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${meta.pillBg}`}>
                  {opt.answer}
                </span>
              </div>
              <p className="text-slate-500 text-xs italic">{opt.reasoning}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Coherence Section */}
      {activePairs.length > 0 && (
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5 space-y-3">
          <h4 className="text-sm font-semibold text-white">Why these decisions work together</h4>
          <div className="space-y-2">
            {reinforcing.map((p, i) => (
              <div key={`r-${i}`} className="flex items-start gap-2 text-xs">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span className="text-emerald-400/80">{p.label}</span>
              </div>
            ))}
            {tensions.map((p, i) => (
              <div key={`t-${i}`} className="flex items-start gap-2 text-xs">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                <span className="text-amber-400/70">{p.label} <span className="text-slate-600 ml-1">— suppressed</span></span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Brief Preview Paragraph */}
      <div className="rounded-xl border border-white/[0.08] bg-gradient-to-br from-white/[0.03] to-white/[0.01] p-5">
        <p className="text-xs font-medium text-slate-500 mb-3 tracking-wide uppercase">
          How this reads in your Strategy Brief
        </p>
        <p className="text-slate-300 text-sm leading-relaxed italic font-serif">
          {buildBriefPreview(messagingArchitecture)}
        </p>
      </div>

      {/* Footer Note */}
      <p className="text-[11px] text-slate-600 italic text-center px-4">
        These decisions were resolved by deterministic optimization before your page was generated. The AI wrote copy against this locked architecture — it did not make these strategic choices itself.
      </p>
    </motion.div>
  );
}
