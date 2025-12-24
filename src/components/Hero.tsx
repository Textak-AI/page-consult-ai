import { Button } from "@/components/ui/button";
import { Play, ArrowRight, TrendingUp, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { HeroFlowAnimation } from "@/components/landing/HeroFlowAnimation";
import { useContext, useState } from "react";
import IntelligenceContext from "@/contexts/IntelligenceContext";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

const Hero = () => {
  const navigate = useNavigate();
  const [isNavigating, setIsNavigating] = useState(false);
  
  // Try to get intelligence context (may be null if not in provider)
  const intelligenceContext = useContext(IntelligenceContext);
  const extractedIndustry = intelligenceContext?.state?.extracted?.industry;

  // Dynamic headline based on detected industry
  const headline = extractedIndustry
    ? `Landing Pages for ${extractedIndustry}`
    : "Landing Pages That Start With Strategy";

  // Handle CTA click - check for brand first
  const handleStartConsultation = async () => {
    setIsNavigating(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/signup');
        return;
      }
      
      // Check for existing brand setup
      const { data: brandBrief } = await supabase
        .from('brand_briefs')
        .select('id, logo_url')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();
      
      // If no brand or no logo, go to brand setup first
      if (!brandBrief || !brandBrief.logo_url) {
        navigate('/brand-setup');
      } else {
        navigate('/consultation');
      }
    } catch (error) {
      console.error('Error checking brand:', error);
      navigate('/brand-setup');
    } finally {
      setIsNavigating(false);
    }
  };

  return (
    <section className="relative min-h-[90vh] flex items-center py-20 overflow-x-hidden bg-gradient-to-b from-[#1e1b4b] via-[#0f0a1f] to-[#000000]">
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

      {/* Main content */}
      <div className="container mx-auto px-6 relative z-20">
        
        {/* Main hero grid - centered with max-width */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center max-w-6xl mx-auto">
          
          {/* Left content */}
          <div style={{
            animation: 'slide-up 800ms ease-out 200ms forwards',
            animationFillMode: 'forwards',
            opacity: 0
          }}>
            {/* Headline with animation on change */}
            <AnimatePresence mode="wait">
              <motion.h1 
                key={headline}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight antialiased mb-6" 
                style={{
                  lineHeight: '1.2',
                  textRendering: 'optimizeLegibility'
                }}
              >
                {extractedIndustry ? (
                  <>
                    <span className="block">Landing Pages for</span>
                    <span className="block mt-2">
                      <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient-x" style={{
                        backgroundSize: '200% auto',
                        textShadow: '0 0 40px rgba(6, 182, 212, 0.3)'
                      }}>
                        {extractedIndustry}
                      </span>
                    </span>
                  </>
                ) : (
                  <>
                    <span className="block">Landing Pages</span>
                    <span className="block mt-2">
                      That Start With{' '}
                      <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient-x" style={{
                        backgroundSize: '200% auto',
                        textShadow: '0 0 40px rgba(6, 182, 212, 0.3)'
                      }}>
                        Strategy
                      </span>
                    </span>
                  </>
                )}
              </motion.h1>
            </AnimatePresence>
            
            {/* Subheadline */}
            <p className="text-lg md:text-xl text-gray-300 leading-relaxed mb-8" style={{
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
              <Button 
                onClick={handleStartConsultation}
                disabled={isNavigating}
                size="lg" 
                className="group/btn text-lg px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white border-0 animate-pulse-glow hover:scale-105 rounded-xl font-semibold transition-all duration-300 cursor-pointer focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900" 
                aria-label="Start free AI consultation demo"
              >
                <span className="relative z-10">Start Strategic Consultation</span>
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover/btn:translate-x-1" />
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

          {/* Right - Animated Flow Demo - aligned to right edge */}
          <div className="flex items-center justify-end" style={{
            animation: 'scale-in 1000ms ease-out 800ms forwards',
            animationFillMode: 'forwards',
            opacity: 0
          }}>
            <HeroFlowAnimation />
          </div>
          
        </div>

        {/* Stats row - BELOW grid, CENTERED */}
        <div 
          className="flex flex-wrap justify-center gap-6 mt-16 max-w-2xl mx-auto"
          style={{
            animation: 'fade-in 800ms ease-out 1000ms forwards',
            animationFillMode: 'forwards',
            opacity: 0
          }}
        >
          <div className="flex items-center gap-3 bg-slate-800/40 backdrop-blur-xl border border-white/5 rounded-2xl px-5 py-3">
            <div className="w-10 h-10 rounded-xl bg-green-400/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <div className="text-lg font-bold text-green-400">3.4x more conversions</div>
              <div className="text-xs text-gray-400">with interactive tools</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-slate-800/40 backdrop-blur-xl border border-white/5 rounded-2xl px-5 py-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-400/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="text-lg font-bold text-cyan-400">10 min average</div>
              <div className="text-xs text-gray-400">to build your page</div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="text-center mt-12">
          <span className="text-xs text-slate-500 uppercase tracking-wider">Scroll to explore</span>
        </div>
        
      </div>
    </section>
  );
};

export default Hero;
