import { useEffect } from "react";
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
import { IntelligenceProvider } from "@/contexts/IntelligenceContext";

const Index = () => {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <IntelligenceProvider>
      <div className="min-h-screen">
        <Header />
        <main>
          <Hero />
          <LiveDemoSection />
          <AIQuestionsShowcase />
          <WhyThisMattersSection />
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
    </IntelligenceProvider>
  );
};

export default Index;
