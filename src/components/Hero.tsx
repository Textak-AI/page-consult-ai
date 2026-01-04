import { useNavigate } from "react-router-dom";
import { HeroFlowAnimation } from "@/components/landing/HeroFlowAnimation";
import { useContext, useState, useEffect } from "react";
import IntelligenceContext from "@/contexts/IntelligenceContext";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, Clock } from "lucide-react";
import { DefaultHero } from "@/components/landing/DefaultHero";
import { PersonalizedHero, type PersonalizedContent } from "@/components/landing/PersonalizedHero";
import { GeneratingHero } from "@/components/landing/GeneratingHero";
import { useDemoState, type DemoState } from "@/hooks/useDemoState";
import { formatForHeadline } from "@/utils/formatForDisplay";

const Hero = () => {
  const navigate = useNavigate();
  const [isNavigating, setIsNavigating] = useState(false);
  
  // Demo state management
  const { demoState, personalizedContent, completeDemo, resetDemo } = useDemoState();
  
  // Try to get intelligence context (may be null if not in provider)
  const intelligenceContext = useContext(IntelligenceContext);
  const extracted = intelligenceContext?.state?.extracted;
  const readiness = intelligenceContext?.state?.readiness || 0;

  // Watch for demo completion based on intelligence extraction
  useEffect(() => {
    if (!extracted) return;
    
    const hasSubstantialContent = 
      extracted.industry && 
      (extracted.audience || extracted.valueProp) &&
      readiness >= 40;
    
    if (hasSubstantialContent && demoState === 'idle') {
      // Generate personalized content from extracted intelligence
      const content: PersonalizedContent = {
        company_name: extracted.industryFull || extracted.industry || '',
        industry: formatForHeadline(extracted.industry || ''),
        headline: generateHeadline(extracted),
        subhead: generateSubhead(extracted),
        cta_text: 'Build My Full Landing Page',
      };
      
      completeDemo(content);
    }
  }, [extracted, readiness, demoState, completeDemo]);

  // Generate personalized headline from extracted data
  function generateHeadline(data: typeof extracted): string {
    if (data?.valueProp) {
      return data.valueProp.length > 60 
        ? data.valueProp.slice(0, 57) + '...'
        : data.valueProp;
    }
    if (data?.industry) {
      return `Landing Pages for ${formatForHeadline(data.industry)}`;
    }
    return 'Your Custom Landing Page';
  }

  // Generate personalized subhead from extracted data
  function generateSubhead(data: typeof extracted): string {
    if (data?.audience && data?.valueProp) {
      return `Help ${data.audience} achieve ${data.valueProp.toLowerCase().includes('help') ? 'their goals' : data.valueProp.toLowerCase()}`;
    }
    if (data?.audience) {
      return `Built specifically to convert ${data.audience} into customers`;
    }
    if (data?.painPoints?.length) {
      return `Solving ${data.painPoints[0]} with strategic, conversion-focused design`;
    }
    return 'AI-powered landing pages built around your unique strategy';
  }

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

  const handleReset = () => {
    resetDemo();
    intelligenceContext?.resetIntelligence?.();
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
          
          {/* Left content - Animated transitions between states */}
          <div>
            <AnimatePresence mode="wait">
              {demoState === 'generating' ? (
                <motion.div
                  key="generating"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <GeneratingHero industry={extracted?.industry} />
                </motion.div>
              ) : demoState === 'completed' && personalizedContent ? (
                <motion.div
                  key="personalized"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  <PersonalizedHero
                    content={personalizedContent}
                    onReset={handleReset}
                    onStartConsultation={handleStartConsultation}
                    isNavigating={isNavigating}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="default"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    animation: 'slide-up 800ms ease-out 200ms forwards',
                    animationFillMode: 'forwards',
                    opacity: 0
                  }}
                >
                  <DefaultHero
                    onStartConsultation={handleStartConsultation}
                    isNavigating={isNavigating}
                  />
                </motion.div>
              )}
            </AnimatePresence>
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
