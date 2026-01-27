import { useEffect, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import SoftLockDemo from "@/components/landing/SoftLockDemo";
import AIQuestionsShowcase from "@/components/landing/AIQuestionsShowcase";
import WhyThisMattersSection from "@/components/landing/WhyThisMattersSection";
import HowItWorks from "@/components/HowItWorks";
import TimelineComparison from "@/components/TimelineComparison";
import Features from "@/components/Features";
import SocialProof from "@/components/SocialProof";
import FAQ from "@/components/FAQ";
import Pricing from "@/components/Pricing";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";
import { IntelligenceProvider, useIntelligence } from "@/contexts/IntelligenceContext";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/hooks/use-toast";

// Inner component that can access IntelligenceContext
interface IndexContentProps {
  autoOpen?: boolean;
}

const IndexContent = ({ autoOpen = false }: IndexContentProps) => {
  const { state } = useIntelligence();
  const [isDemoLocked, setIsDemoLocked] = useState(autoOpen);
  
  // Show WhyThisMatters only after user has interacted with demo
  const showWhyThisMatters = state.extracted.industry || state.readiness >= 30;

  // Auto-open the demo if returning from signup
  useEffect(() => {
    if (autoOpen && !isDemoLocked) {
      setIsDemoLocked(true);
    }
  }, [autoOpen]);

  return (
    <div className="min-h-screen">
      {/* Header - hide when demo is locked */}
      <AnimatePresence>
        {!isDemoLocked && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, filter: 'blur(8px)' }}
            transition={{ duration: 0.4 }}
          >
            <Header />
          </motion.div>
        )}
      </AnimatePresence>
      
      <main>
        {/* Hero - fade and blur when demo is locked */}
        <div
          className={`transition-all duration-400 ease-out ${
            isDemoLocked 
              ? 'opacity-20 blur-lg pointer-events-none' 
              : 'opacity-100 blur-0'
          }`}
        >
          <Hero />
        </div>
        
        {/* Demo section with soft lock */}
        <SoftLockDemo onLockChange={setIsDemoLocked} autoLock={autoOpen} />
        
        {/* Content below demo - fade and blur when locked */}
        <div
          className={`transition-all duration-400 ease-out ${
            isDemoLocked 
              ? 'opacity-20 blur-lg pointer-events-none' 
              : 'opacity-100 blur-0'
          }`}
        >
          <AIQuestionsShowcase />
          
          {/* Conditionally show WhyThisMatters with fade-in animation */}
          <AnimatePresence>
            {showWhyThisMatters && (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <WhyThisMattersSection />
              </motion.div>
            )}
          </AnimatePresence>
          
          <HowItWorks />
          <TimelineComparison />
          <Features />
          <SocialProof />
          <FAQ />
          <Pricing />
          <FinalCTA />
        </div>
      </main>
      
      {/* Footer - fade when locked */}
      <div
        className={`transition-all duration-400 ease-out ${
          isDemoLocked 
            ? 'opacity-20 blur-lg pointer-events-none' 
            : 'opacity-100 blur-0'
        }`}
      >
        <Footer />
      </div>
    </div>
  );
};

const Index = () => {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [autoOpenSession, setAutoOpenSession] = useState(false);

  // Check for session restoration from signup page
  useEffect(() => {
    const sessionId = searchParams.get('session');
    const autoOpen = searchParams.get('autoOpen');
    
    if (sessionId && autoOpen === 'true') {
      console.log('[Index] Session restoration requested:', sessionId);
      setAutoOpenSession(true);
      
      // Show welcome back toast
      toast({
        title: "👋 Welcome back!",
        description: "Your conversation is right where you left it.",
        duration: 3000,
      });
      
      // Clean up URL params without triggering navigation (keep session for IntelligenceProvider)
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('autoOpen');
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Scroll to top on mount, or to #demo if hash is present
  useEffect(() => {
    if (location.hash === '#demo' || window.location.hash === '#demo') {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        const demoSection = document.getElementById('demo');
        if (demoSection) {
          demoSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else if (!autoOpenSession) {
      // Only scroll to top if not restoring a session
      window.scrollTo(0, 0);
    }
  }, [location.hash, autoOpenSession]);

  return (
    <IntelligenceProvider>
      <IndexContent autoOpen={autoOpenSession} />
    </IntelligenceProvider>
  );
};

export default Index;
