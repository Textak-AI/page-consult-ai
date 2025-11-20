import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { Link } from "react-router-dom";
import { AnimatedChatPreview } from "@/components/AnimatedChatPreview";
import AnimatedStatsCard from "@/components/AnimatedStatsCard";
const Hero = () => {
  return <section className="relative pt-32 pb-20 min-h-screen overflow-x-hidden bg-gradient-to-b from-[#1e1b4b] via-[#0f0a1f] to-[#000000]">
      {/* Background layer - BEHIND everything */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        {/* Animated ambient orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600 rounded-full blur-[120px] opacity-20 animate-pulse-slow" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500 rounded-full blur-[100px] opacity-15 animate-pulse-slow" style={{
        animationDelay: '1s',
        animationDuration: '4s'
      }} />
        <div className="absolute top-1/2 right-1/4 w-72 h-72 bg-pink-500 rounded-full blur-[90px] opacity-10 animate-pulse-slow" style={{
        animationDelay: '2s',
        animationDuration: '5s'
      }} />
      </div>
      
      {/* Floating ambient cards - Decorative layer behind content */}
      <div className="absolute -top-6 left-12 w-56 h-24 hidden lg:block z-0" style={{
      animation: 'fade-in 800ms ease-out 1000ms forwards, float 4s ease-in-out infinite',
      animationFillMode: 'forwards',
      willChange: 'transform',
      opacity: 0
    }}>
        <div className="bg-slate-800/40 backdrop-blur-xl border border-white/5 rounded-2xl p-4 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-green-400/20 flex items-center justify-center">
              <span className="text-green-400 text-sm" style={{
              filter: 'drop-shadow(0 0 8px rgba(6, 182, 212, 0.3))'
            }}>✓</span>
            </div>
            <span className="text-xs text-gray-400">Real-time strategy building</span>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-24 right-12 w-48 h-20 hidden lg:block z-0" style={{
      animation: 'fade-in 800ms ease-out 1000ms forwards, float 5s ease-in-out 1s infinite',
      animationFillMode: 'forwards',
      willChange: 'transform',
      opacity: 0
    }}>
        <div className="bg-slate-800/40 backdrop-blur-xl border border-white/5 rounded-2xl p-4 shadow-2xl">
          <div className="flex items-center gap-3">
            <span className="text-lg" style={{
            filter: 'drop-shadow(0 0 8px rgba(6, 182, 212, 0.3))'
          }}>✨</span>
            <div>
              <div className="text-sm font-medium text-cyan-400">10 min average</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Animated rotating stats card */}
      <AnimatedStatsCard />

      {/* Main content grid - 60/40 split */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        <div className="grid lg:grid-cols-[60%_40%] gap-12 lg:gap-16 items-center">
          
          {/* Left content - 60% */}
          <div className="max-w-2xl" style={{
          animation: 'slide-up 800ms ease-out 200ms forwards',
          animationFillMode: 'forwards',
          opacity: 0
        }}>
            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-white tracking-tight antialiased mb-6" style={{
            lineHeight: '1.2',
            textRendering: 'optimizeLegibility'
          }}>
              <span className="block">Landing Pages</li>
That Start With             </span>
              <span className="block mt-2 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient-x" style={{
              backgroundSize: '200% auto',
              textShadow: '0 0 40px rgba(6, 182, 212, 0.3)',
              lineHeight: '1.2'
            }}>
                Strategy
              </span>
            </h1>
            
            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-gray-300 leading-relaxed mb-12" style={{
            textRendering: 'optimizeLegibility',
            animation: 'fade-in 800ms ease-out 400ms forwards',
            animationFillMode: 'forwards',
            opacity: 0
          }}>
              AI consultant asks intelligent questions, then builds professional
              pages proven to convert. No templates. No guesswork.
            </p>
            
            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6" style={{
            animation: 'fade-in 800ms ease-out 600ms forwards',
            animationFillMode: 'forwards',
            opacity: 0
          }}>
              <Button asChild size="lg" className="text-lg px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white border-0 shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:shadow-[0_0_40px_rgba(6,182,212,0.6)] rounded-xl font-semibold transition-all duration-300 cursor-pointer focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900" aria-label="Start free AI consultation demo">
                <Link to="/wizard">
                  <span className="relative z-10">Try AI Consultant - Free Demo</span>
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 py-4 bg-transparent border-2 border-white/30 text-white hover:border-cyan-400 hover:text-cyan-400 hover:bg-cyan-400/5 hover:shadow-lg hover:shadow-cyan-400/30 rounded-xl font-semibold transition-all duration-300 cursor-pointer focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 group" aria-label="Watch product demo video">
                <a href="#demo" className="flex items-center">
                  <Play className="w-4 h-4 mr-2 text-cyan-400 group-hover:translate-x-0.5 transition-transform duration-300" />
                  Watch How It Works
                </a>
              </Button>
            </div>
            
            {/* Credit card disclaimer */}
            <p className="text-gray-500 text-sm text-center sm:text-left" style={{
            animation: 'fade-in 800ms ease-out 700ms forwards',
            animationFillMode: 'forwards',
            opacity: 0
          }}>
              No credit card required • See results in 2 minutes
            </p>
          </div>

          {/* Right demo - 40% */}
          <div className="relative" style={{
          animation: 'scale-in 1000ms ease-out 800ms forwards',
          animationFillMode: 'forwards',
          opacity: 0
        }}>
            <AnimatedChatPreview />
          </div>
          
        </div>
      </div>
      
      {/* Scroll indicator - Above content */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce-slow hidden md:flex transition-colors duration-300 group cursor-default z-30">
        <span className="text-gray-400 text-xs uppercase tracking-widest animate-pulse">Scroll to explore</span>
        <div className="w-6 h-10 border-2 border-gray-600 group-hover:border-gray-400 rounded-full relative flex justify-center transition-colors duration-300">
          <div className="w-1 h-3 bg-gradient-to-b from-cyan-400 to-transparent rounded-full mt-2" style={{
          animation: 'scroll-pill 2s ease-in-out infinite'
        }} />
        </div>
      </div>
    </section>;
};
export default Hero;