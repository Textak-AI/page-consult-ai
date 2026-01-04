import { Clock, DollarSign, Zap, CheckCircle, XCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const TimelineComparison = () => {
  const navigate = useNavigate();

  return (
    <section id="timeline" className="section-spacing bg-slate-950 relative overflow-hidden scroll-mt-16">
      {/* Ambient background effects */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px]" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px]" />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section header */}
        <div className="text-center mb-16 animate-fade-in">
          <p className="text-cyan-400 text-sm font-semibold tracking-wide uppercase mb-3">
            The Difference
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            Weeks to Hours.{" "}
            <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Thousands to Dozens.
            </span>
          </h2>
          <p className="text-xl text-white/50 max-w-2xl mx-auto mt-4">
            Same strategic depth. Fraction of the time and cost.
          </p>
        </div>

        {/* Comparison cards */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 mb-16">
          
          {/* Traditional Agency - Muted/Crossed Out Feel */}
          <div className="relative group">
            <div className="bg-slate-900/80 backdrop-blur-sm rounded-3xl p-8 border border-white/5 relative overflow-hidden h-full">
              {/* Subtle "outdated" overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent" />
              
              {/* Header */}
              <div className="flex items-center justify-between mb-8 relative z-10">
                <span className="text-white/40 text-sm font-medium uppercase tracking-wide">
                  Traditional Agency
                </span>
                <span className="px-3 py-1 bg-white/5 rounded-full text-white/30 text-xs">
                  The Old Way
                </span>
              </div>
              
              {/* Metrics - muted styling */}
              <div className="space-y-6 relative z-10">
                <div className="flex items-center justify-between py-4 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-white/30" />
                    <span className="text-white/50">Timeline</span>
                  </div>
                  <span className="text-white/70 font-semibold">3-6 weeks</span>
                </div>
                <div className="flex items-center justify-between py-4 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-white/30" />
                    <span className="text-white/50">Investment</span>
                  </div>
                  <span className="text-white/70 font-semibold">$5,000 - $15,000</span>
                </div>
                <div className="flex items-center justify-between py-4 border-b border-white/5">
                  <span className="text-white/50">Revisions</span>
                  <span className="text-white/70 font-semibold">3-5 rounds</span>
                </div>
                <div className="flex items-center justify-between py-4">
                  <span className="text-white/50">Strategy Included</span>
                  <span className="text-white/70 font-semibold">Extra $$$</span>
                </div>
              </div>

              {/* Pain points */}
              <div className="mt-6 pt-6 border-t border-white/5 space-y-3 relative z-10">
                <div className="flex items-center gap-3 text-white/40">
                  <XCircle className="w-4 h-4 text-red-400/50 flex-shrink-0" />
                  <span className="text-sm">Wait weeks to validate messaging</span>
                </div>
                <div className="flex items-center gap-3 text-white/40">
                  <XCircle className="w-4 h-4 text-red-400/50 flex-shrink-0" />
                  <span className="text-sm">Competitors launch while you're in revisions</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* PageConsult - Vibrant/Highlighted */}
          <div className="relative group">
            {/* Glow effect */}
            <div className="absolute -inset-[1px] bg-gradient-to-b from-purple-500/50 via-cyan-500/50 to-purple-500/50 rounded-3xl blur-sm opacity-60" />
            
            <div className="relative bg-slate-900 backdrop-blur-sm rounded-3xl p-8 border border-white/10 overflow-hidden h-full">
              {/* Premium gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-cyan-500/10" />
              
              {/* Header */}
              <div className="flex items-center justify-between mb-8 relative z-10">
                <span className="text-white text-sm font-medium uppercase tracking-wide flex items-center gap-2">
                  PageConsult AI
                  <Zap className="w-4 h-4 text-cyan-400" />
                </span>
                <span className="px-3 py-1 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 rounded-full text-cyan-300 text-xs font-medium">
                  ✦ Smarter
                </span>
              </div>
              
              {/* Metrics - vibrant styling */}
              <div className="space-y-6 relative z-10">
                <div className="flex items-center justify-between py-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-cyan-400" />
                    <span className="text-white/70">Timeline</span>
                  </div>
                  <span className="text-white font-semibold">10 minutes</span>
                </div>
                <div className="flex items-center justify-between py-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-cyan-400" />
                    <span className="text-white/70">Investment</span>
                  </div>
                  <span className="text-white font-semibold">From $29/mo</span>
                </div>
                <div className="flex items-center justify-between py-4 border-b border-white/10">
                  <span className="text-white/70">Revisions</span>
                  <span className="text-white font-semibold">Unlimited AI edits</span>
                </div>
                <div className="flex items-center justify-between py-4">
                  <span className="text-white/70">Strategy Included</span>
                  <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent font-semibold">
                    Built-in ✓
                  </span>
                </div>
              </div>

              {/* Benefits */}
              <div className="mt-6 pt-6 border-t border-white/10 space-y-3 relative z-10">
                <div className="flex items-center gap-3 text-white/80">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="text-sm">Live and collecting data in minutes</span>
                </div>
                <div className="flex items-center gap-3 text-white/80">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="text-sm">Test 10 variations for the cost of one</span>
                </div>
              </div>
            </div>
          </div>
          
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-6 rounded-2xl bg-slate-900/50 backdrop-blur-sm border border-white/5">
            <div className="text-left">
              <p className="text-lg font-semibold text-white">
                Stop waiting. Start validating.
              </p>
              <p className="text-white/50">
                Your competitor isn't waiting 6 weeks for their agency.
              </p>
            </div>
            <Button 
              size="lg" 
              onClick={() => navigate('/wizard')}
              className="group whitespace-nowrap bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-400 hover:to-cyan-400 text-white border-0"
            >
              Build Your Page Now
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TimelineComparison;
