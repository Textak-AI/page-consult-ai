import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { Link } from "react-router-dom";
import { AnimatedChatPreview } from "@/components/AnimatedChatPreview";

const Hero = () => {
  return (
    <section className="relative pt-32 pb-20 px-6 min-h-screen overflow-hidden bg-gradient-to-b from-[#1e1b4b] via-[#0f0a1f] to-[#000000]">
      {/* Animated ambient orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600 rounded-full blur-[120px] opacity-20 animate-pulse-slow pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500 rounded-full blur-[100px] opacity-15 animate-pulse-slow pointer-events-none" style={{ animationDelay: '1s', animationDuration: '4s' }} />
      <div className="absolute top-1/2 right-1/4 w-72 h-72 bg-pink-500 rounded-full blur-[90px] opacity-10 animate-pulse-slow pointer-events-none" style={{ animationDelay: '2s', animationDuration: '5s' }} />
      
      {/* Floating ambient cards */}
      <div className="absolute -top-6 left-12 w-56 h-24 hidden lg:block z-0 animate-float">
        <div className="bg-slate-800/40 backdrop-blur-xl border border-white/5 rounded-2xl p-4 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-green-400/20 flex items-center justify-center">
              <span className="text-green-400 text-sm">✓</span>
            </div>
            <span className="text-xs text-gray-400">Real-time strategy building</span>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-24 right-12 w-48 h-20 hidden lg:block z-0 animate-float" style={{ animationDelay: '1s', animationDuration: '5s' }}>
        <div className="bg-slate-800/40 backdrop-blur-xl border border-white/5 rounded-2xl p-4 shadow-2xl">
          <div className="flex items-center gap-3">
            <span className="text-lg">✨</span>
            <div>
              <div className="text-xs font-medium text-cyan-400">10 min average</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-64 h-28 hidden xl:block z-0 animate-float" style={{ animationDelay: '2s', animationDuration: '6s' }}>
        <div className="bg-slate-800/40 backdrop-blur-xl border border-white/5 rounded-2xl p-4 shadow-2xl">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📊</span>
            <div>
              <div className="text-sm text-purple-400 font-medium">40% higher conversion</div>
              <div className="text-xs text-gray-500">with AI-generated pages</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-slide-up max-w-2xl">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-2 leading-tight tracking-tight">
              Landing Pages That Start With{" "}
              <span className="block mt-2 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient-x" style={{ backgroundSize: '200% auto', textShadow: '0 0 40px rgba(6, 182, 212, 0.3)' }}>
                Strategy
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 leading-relaxed mt-6 max-w-xl">
              AI consultant asks intelligent questions, then builds professional
              pages proven to convert. No templates. No guesswork.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-12">
              <Button asChild size="lg" className="relative group text-lg px-8 py-4 bg-white text-slate-900 font-bold rounded-xl shadow-xl shadow-white/20 hover:shadow-2xl hover:shadow-white/40 hover:scale-105 transition-all duration-300">
                <Link to="/wizard">
                  <span className="relative z-10">Try AI Consultant - Free Demo</span>
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 py-4 bg-transparent border-2 border-white/30 text-white hover:border-cyan-400 hover:text-cyan-400 hover:shadow-lg hover:shadow-cyan-400/30 rounded-xl font-semibold transition-all duration-300">
                <a href="#demo">
                  <Play className="w-4 h-4 mr-2 text-cyan-400" />
                  Watch How It Works
                </a>
              </Button>
            </div>
            <p className="text-gray-500 text-sm text-center sm:text-left mt-3">
              No credit card required • See results in 2 minutes
            </p>
          </div>

          <div className="animate-scale-in relative">
            <AnimatedChatPreview />
          </div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce-slow hidden md:flex">
        <span className="text-gray-500 text-xs uppercase tracking-widest">Scroll to explore</span>
        <div className="w-6 h-10 border-2 border-gray-600 rounded-full relative flex justify-center">
          <div className="w-1 h-3 bg-gradient-to-b from-cyan-400 to-transparent rounded-full mt-2 animate-bounce-slow" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
