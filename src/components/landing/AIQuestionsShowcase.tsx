import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';

const strategicQuestions = [
  {
    question: "How do you demonstrate 'real positioning' on a static landing page?",
    industry: "SaaS",
  },
  {
    question: "What makes enterprise buyers hesitate — and how do you address it before they ask?",
    industry: "B2B",
  },
  {
    question: "Your competitors promise the same outcome. What's your 'only we can do this' story?",
    industry: "Consulting",
  },
  {
    question: "What's the one metric that proves your solution works — and can you show it in 5 seconds?",
    industry: "Fintech",
  },
];

const AIQuestionsShowcase = () => {
  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      {/* Subtle background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900/50 to-slate-950" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-6">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-cyan-400 font-medium">Real Strategic Questions</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            What Our AI Asks
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            These are real strategic questions generated during consultations — 
            the kind that make founders pause and think differently.
          </p>
        </motion.div>

        {/* Questions grid */}
        <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
          {strategicQuestions.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative"
            >
              <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/50 hover:border-cyan-500/30 transition-all duration-300 h-full">
                {/* Industry tag */}
                <span className="inline-block text-xs font-medium text-cyan-400/80 bg-cyan-500/10 px-2.5 py-1 rounded-full mb-4">
                  {item.industry}
                </span>
                
                {/* Question */}
                <div className="flex gap-3">
                  <ArrowRight className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <p className="text-white/90 leading-relaxed font-medium">
                    "{item.question}"
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA hint */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center text-slate-500 text-sm mt-10"
        >
          Try the demo above to see what questions it generates for your business →
        </motion.p>
      </div>
    </section>
  );
};

export default AIQuestionsShowcase;
