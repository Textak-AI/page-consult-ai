import { motion } from 'framer-motion';

const extractionExamples = [
  {
    input: "We help CBD companies reach their audience through compliant digital marketing",
    extractions: [
      { label: "Industry", value: "Digital Marketing (regulated)", color: "bg-purple-400" },
      { label: "Audience", value: "CBD companies (B2B)", color: "bg-cyan-400" },
      { label: "Key Challenge", value: "Ad platform restrictions", color: "bg-emerald-400" },
      { label: "Positioning Angle", value: '"Compliant" = differentiator', color: "bg-amber-400" },
    ],
  },
  {
    input: "Our clients usually see 2-3x increase in organic traffic within 6 months",
    extractions: [
      { label: "Proof Point", value: "2-3x traffic increase", color: "bg-purple-400" },
      { label: "Timeline", value: "6 months (realistic)", color: "bg-cyan-400" },
      { label: "CTA Strategy", value: "Results-focused messaging", color: "bg-emerald-400" },
      { label: "Calculator Idea", value: "Traffic growth estimator", color: "bg-amber-400" },
    ],
  },
  {
    input: "Most agencies don't understand the compliance side — they get accounts banned",
    extractions: [
      { label: "Competitor Weakness", value: "Compliance ignorance", color: "bg-purple-400" },
      { label: "Pain Point", value: "Banned accounts = lost revenue", color: "bg-cyan-400" },
      { label: "Your Edge", value: "Compliance expertise", color: "bg-emerald-400" },
      { label: "Section to Build", value: '"Why Others Fail" objection handler', color: "bg-amber-400" },
    ],
  },
];

const AIQuestionsShowcase = () => {
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
            Every answer you give becomes strategic intelligence. Here's what happens behind the scenes.
          </p>
        </motion.div>

        {/* Extraction Examples */}
        <div className="space-y-6">
          {extractionExamples.map((example, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="grid md:grid-cols-2 gap-4 items-stretch"
            >
              {/* Left: What you say */}
              <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-white/5 h-full">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-white/30" />
                  <span className="text-white/40 text-xs font-medium uppercase tracking-wide">You say</span>
                </div>
                <p className="text-white/80 text-lg leading-relaxed">
                  "{example.input}"
                </p>
              </div>

              {/* Right: What I extract */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 border border-purple-500/20 relative overflow-hidden h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-cyan-500/5" />

                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="text-cyan-400 text-xs font-medium uppercase tracking-wide">I extract</span>
                  </div>

                  <div className="space-y-3">
                    {example.extractions.map((extraction, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className={`w-1.5 h-1.5 rounded-full ${extraction.color} mt-2 flex-shrink-0`} />
                        <div>
                          <span className="text-white/50 text-sm">{extraction.label}:</span>
                          <span className="text-white ml-2">{extraction.value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom caption */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center text-white/40 text-sm mt-12"
        >
          This is why no two PageConsult pages look alike. The strategy is extracted, not assumed.
        </motion.p>
      </div>
    </section>
  );
};

export default AIQuestionsShowcase;
