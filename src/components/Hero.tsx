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
  // CRITICAL: Only complete demo if intelligence was gathered in THIS session (not from localStorage)
  useEffect(() => {
    if (!extracted) return;
    
    // Don't auto-complete if already completed (prevents re-triggering from stale localStorage)
    if (demoState === 'completed') return;
    
    const hasSubstantialContent = 
      extracted.industry && 
      (extracted.audience || extracted.valueProp) &&
      readiness >= 40;
    
    // Only complete if we have FRESH intelligence from current session
    // Check that conversation exists in context (proves this is a real session, not cold start)
    const hasActiveConversation = intelligenceContext?.state?.conversation?.length > 0;
    
    if (hasSubstantialContent && demoState === 'idle' && hasActiveConversation) {
      // Generate personalized content from extracted intelligence
      const content: PersonalizedContent = {
        company_name: extracted.industryFull || extracted.industry || '',
        industry: formatForHeadline(extracted.industry || ''),
        headline: generateHeadline(extracted),
        subhead: generateSubhead(extracted),
        cta_text: 'Build My Full Landing Page',
      };
      
      // Final validation before completing
      if (content.headline.length >= 15 && content.subhead.length >= 30) {
        completeDemo(content);
      }
    }
  }, [extracted, readiness, demoState, completeDemo, intelligenceContext?.state?.conversation?.length]);

  // Generate personalized headline from extracted data
  function generateHeadline(data: typeof extracted): string {
    const industry = data?.industry ? formatForHeadline(data.industry) : null;
    const audience = data?.audience || null;
    const valueProp = data?.valueProp || null;
    
    // Best case: We have value prop - craft a benefit-driven headline
    if (valueProp && valueProp.length > 10) {
      // Clean up and make it punchy
      const cleaned = valueProp
        .replace(/^we\s+/i, '')
        .replace(/^i\s+/i, '')
        .replace(/^help\s+/i, 'Help ')
        .replace(/^provide\s+/i, '');
      
      // Capitalize first letter
      const headline = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
      
      // Truncate if too long but keep it meaningful - preserve word boundaries
      if (headline.length > 70) {
        // Find last space before character 67 to preserve word boundaries
        const truncatePoint = headline.lastIndexOf(' ', 67);
        if (truncatePoint > 40) { // Only truncate if we can preserve a meaningful portion
          return headline.slice(0, truncatePoint).replace(/[,\s]+$/, '') + '...';
        }
        // If no good break point, use the whole headline up to 80 chars
        return headline.slice(0, 80);
      }
      return headline;
    }
    
    // Good case: Industry + audience combo
    if (industry && audience) {
      return `${industry} That Converts ${audience} Into Customers`;
    }
    
    // Okay case: Just industry
    if (industry) {
      return `High-Converting ${industry} Landing Pages`;
    }
    
    // Fallback
    return 'Your Custom Landing Page Is Ready';
  }

  // Generate personalized subhead from extracted data
  function generateSubhead(data: typeof extracted): string {
    const industry = data?.industry ? formatForHeadline(data.industry) : null;
    const audience = data?.audience || null;
    const painPoints = data?.painPoints || null;
    const edge = data?.competitorDifferentiator || null;
    
    // Best case: Audience + pain point
    if (audience && painPoints) {
      return `Built specifically to help ${audience} overcome ${painPoints.toLowerCase()} with a page that actually converts.`;
    }
    
    // Good case: Audience + edge
    if (audience && edge) {
      return `Show ${audience} why you're different — ${edge.toLowerCase()}.`;
    }
    
    // Okay case: Just audience
    if (audience) {
      return `Strategic messaging designed to resonate with ${audience} and drive action.`;
    }
    
    // Industry fallback
    if (industry) {
      return `AI-crafted messaging tailored to what ${industry.toLowerCase()} buyers actually care about.`;
    }
    
    // Generic fallback
    return 'AI-powered landing pages built around your unique strategy and market positioning.';
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
          <div className="min-h-[400px]">
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
                  transition={{ duration: 0.5 }}
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
          <motion.div 
            className="flex items-center justify-end"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <HeroFlowAnimation />
          </motion.div>
          
        </div>

        {/* Stats row - BELOW grid, CENTERED */}
        <motion.div 
          className="flex flex-wrap justify-center gap-6 mt-16 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="flex items-center gap-3 bg-card/40 backdrop-blur-xl border border-border rounded-lg px-5 py-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
            <div>
              <div className="text-lg font-bold text-success">3.4x more conversions</div>
              <div className="text-xs text-muted-foreground">with interactive tools</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-card/40 backdrop-blur-xl border border-border rounded-lg px-5 py-3">
            <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <div className="text-lg font-bold text-secondary">10 min average</div>
              <div className="text-xs text-muted-foreground">to build your page</div>
            </div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <div className="text-center mt-12">
          <span className="text-xs text-slate-500 uppercase tracking-wider">Scroll to explore</span>
        </div>
        
      </div>
    </section>
  );
};

export default Hero;
