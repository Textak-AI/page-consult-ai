import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import LiveDemoSection from "@/components/landing/LiveDemoSection";
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

// Inner component that can access IntelligenceContext
const IndexContent = () => {
  const { state } = useIntelligence();
  
  // Show WhyThisMatters only after user has interacted with demo
  const showWhyThisMatters = state.extracted.industry || state.readiness >= 30;

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <LiveDemoSection />
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
      </main>
      <Footer />
    </div>
  );
};

const Index = () => {
  const location = useLocation();

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
    } else {
      window.scrollTo(0, 0);
    }
  }, [location.hash]);

  return (
    <IntelligenceProvider>
      <IndexContent />
    </IntelligenceProvider>
  );
};

export default Index;
