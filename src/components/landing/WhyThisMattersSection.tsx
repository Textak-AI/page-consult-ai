import { X, Check, ArrowRight } from 'lucide-react';
import { useIntelligence } from '@/contexts/IntelligenceContext';

const WhyThisMattersSection = () => {
  const { state } = useIntelligence();
  
  // Get the full industry value from demo interaction (if available)
  const industryFull = state.extracted.industryFull || state.extracted.industry;
  const hasInteracted = !!industryFull;
  
  // Dynamic personalized example based on user's demo interaction
  const personalizedExample = hasInteracted
    ? `"Landing pages for ${industryFull} professionals who need results"`
    : `"Landing pages for Digital Marketing agencies struggling with attribution"`;

  return (
    <section className="py-16 md:py-20 bg-gradient-to-b from-slate-50 to-slate-100 relative overflow-hidden">
      {/* Subtle gradient orbs */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-purple-500/[0.03] rounded-full blur-[120px]" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-cyan-500/[0.03] rounded-full blur-[120px]" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Opening statement */}
        <div className="text-center mb-12">
          <p className="text-purple-600 text-sm font-semibold tracking-wide uppercase mb-3">
            Why This Matters
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            You just watched this page adapt to you.
          </h2>
          <p className="text-slate-600 text-lg md:text-xl max-w-2xl mx-auto">
            Now imagine your visitors experiencing the same thing.
          </p>
        </div>
        
        {/* The value translation */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 md:p-10 mb-10">
          
          <p className="text-slate-500 text-sm font-medium uppercase tracking-wide mb-6">
            What this means for your landing page
          </p>
          
          {/* The flow */}
          <div className="space-y-6">
            
            {/* Step 1 */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-purple-600 font-semibold">1</span>
              </div>
              <div>
                <p className="text-slate-900 font-medium mb-1">Your visitors answer 1-2 simple questions</p>
                <p className="text-slate-500 text-sm">Or we detect intent from their behavior, source, or URL parameters</p>
              </div>
            </div>
            
            {/* Arrow */}
            <div className="flex justify-start pl-5">
              <div className="w-[2px] h-6 bg-gradient-to-b from-purple-500/30 to-cyan-500/30"></div>
            </div>
            
            {/* Step 2 */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-cyan-600 font-semibold">2</span>
              </div>
              <div>
                <p className="text-slate-900 font-medium mb-1">The page learns who they are and what they need</p>
                <p className="text-slate-500 text-sm">Role, industry, pain point, buying stage — extracted in real-time</p>
              </div>
            </div>
            
            {/* Arrow */}
            <div className="flex justify-start pl-5">
              <div className="w-[2px] h-6 bg-gradient-to-b from-cyan-500/30 to-emerald-500/30"></div>
            </div>
            
            {/* Step 3 */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-emerald-600 font-semibold">3</span>
              </div>
              <div>
                <p className="text-slate-900 font-medium mb-1">Everything shifts to match</p>
                <p className="text-slate-500 text-sm">Headlines, proof points, testimonials, CTAs — all personalized to their situation</p>
              </div>
            </div>
            
          </div>
          
          {/* The punchline */}
          <div className="mt-8 pt-8 border-t border-slate-100">
            <p className="text-slate-900 font-semibold text-lg text-center">
              Same page. Infinite variations. Zero extra work.
            </p>
          </div>
          
        </div>
        
        {/* The contrast */}
        <div className="bg-slate-900 rounded-3xl p-6 md:p-10 mb-10 relative overflow-hidden">
          {/* Subtle glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-cyan-500/10 rounded-3xl" />
          
          <div className="relative z-10">
            <p className="text-white/50 text-sm font-medium uppercase tracking-wide mb-6">
              This isn't a gimmick. It's the difference between:
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              
              {/* Generic */}
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <div className="flex items-center gap-2 mb-3">
                  <X className="w-5 h-5 text-red-400" />
                  <span className="text-white/40 text-sm font-medium">Generic</span>
                </div>
                <p className="text-white/60 text-lg">
                  "Landing pages for everyone"
                </p>
                <p className="text-white/30 text-sm mt-2">
                  → Ignored
                </p>
              </div>
              
              {/* Personalized - Dynamic if user interacted with demo */}
              <div className="bg-gradient-to-br from-purple-500/20 to-cyan-500/20 rounded-2xl p-6 border border-purple-500/30">
                <div className="flex items-center gap-2 mb-3">
                  <Check className="w-5 h-5 text-emerald-400" />
                  <span className="text-emerald-400 text-sm font-medium">Personalized</span>
                </div>
                <p className="text-white text-lg">
                  {personalizedExample}
                </p>
                <p className="text-emerald-400/70 text-sm mt-2">
                  → Converted
                </p>
              </div>
              
            </div>
          </div>
        </div>
        
        {/* Closing statement + CTA */}
        <div className="text-center">
          <p className="text-slate-600 text-lg mb-6">
            You just felt the difference. Your visitors will too.
          </p>
          <a 
            href="/wizard"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 rounded-xl text-white font-semibold text-lg shadow-lg shadow-purple-500/25 transition-all hover:shadow-xl hover:shadow-purple-500/30 hover:-translate-y-0.5"
          >
            Build Your Adaptive Page
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
        
      </div>
    </section>
  );
};

export default WhyThisMattersSection;
