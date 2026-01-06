import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useResetDemoShortcut } from "@/hooks/useResetDemoShortcut";
import { OrchestratorProvider } from "@/contexts/OrchestratorContext";

// Disable automatic scroll restoration to prevent flash on refresh
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { SessionProvider } from "@/contexts/SessionContext";
import { CompanionProvider } from "@/contexts/CompanionContext";
import { CompanionBar } from "@/components/companion";
import { DevFloatingButton } from "@/components/dev";
import HomePage from "./pages/HomePage";
import Wizard from "./pages/Wizard";
import WizardReview from "./pages/WizardReview";
import Signup from "./pages/Signup";
import Generate from "./pages/Generate";
import NewConsultation from "./pages/NewConsultation";
import GalleryTest from "./pages/GalleryTest";
import HeroShowcase from "./pages/HeroShowcase";
import SectionSelectorDemo from "./pages/SectionSelectorDemo";
import Chat from "./pages/Chat";
import NotFound from "./pages/NotFound";
import DevTest from "./pages/DevTest";
import AILoaderPreview from "./pages/AILoaderPreview";
import IntroPreview from "./pages/IntroPreview";
import DesignSystemTest from "./pages/DesignSystemTest";
import TestPage from "./pages/TestPage";
import Settings from "./pages/Settings";
import BrandSetup from "./pages/BrandSetup";
import TestimonialRequest from "./pages/TestimonialRequest";
import Admin from "./pages/Admin";
import Brief from "./pages/Brief";
import BrandIntake from "./pages/BrandIntake";
import WizardChoice from "./pages/WizardChoice";
import EnhancedBrandSetup from "./pages/EnhancedBrandSetup";
import PricingPage from "./pages/PricingPage";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Dev from "./pages/Dev";
import PublicPage from "./pages/PublicPage";
import ProspectPage from "./pages/ProspectPage";
import ProspectsDashboard from "./pages/ProspectsDashboard";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
    },
  },
});

const App = () => {
  // Global keyboard shortcut to reset demo state (Alt+R)
  useResetDemoShortcut();
  
  // Handle hydration and scroll restoration
  useEffect(() => {
    // Get saved scroll position
    const savedPosition = sessionStorage.getItem('scrollPosition');
    
    // Mark as hydrated
    document.documentElement.classList.add('hydrated');
    
    // Restore scroll position after a brief delay (let content render)
    if (savedPosition) {
      requestAnimationFrame(() => {
        window.scrollTo(0, parseInt(savedPosition, 10));
        sessionStorage.removeItem('scrollPosition');
      });
    }
    
    // Save scroll position before unload
    const handleBeforeUnload = () => {
      sessionStorage.setItem('scrollPosition', window.scrollY.toString());
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <OrchestratorProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
            <CompanionProvider>
              <DevFloatingButton />
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/new" element={<Navigate to="/wizard/form" replace />} />
                
                {/* Brand Setup - entry point */}
                <Route path="/brand-setup" element={<EnhancedBrandSetup />} />
                <Route path="/brand-setup-new" element={<EnhancedBrandSetup />} />
                <Route path="/brand-setup-old" element={<BrandSetup />} />
                
                {/* Wizard Choice - decision point */}
                <Route path="/wizard" element={<WizardChoice />} />
                
                {/* Wizard Paths */}
                <Route path="/wizard/chat" element={<Wizard />} />
                <Route path="/wizard/form" element={<NewConsultation key={Date.now()} />} />
                <Route path="/wizard/review" element={<WizardReview />} />
                
                {/* Backwards compatibility */}
                <Route path="/consultation" element={<Navigate to="/wizard/form" replace />} />
                <Route path="/wizard-choice" element={<Navigate to="/wizard" replace />} />
                
                <Route path="/signup" element={<Signup />} />
                <Route path="/generate" element={<Generate />} />
                <Route path="/generate/:pageId" element={<Generate />} />
                <Route path="/gallery-test" element={<GalleryTest />} />
                <Route path="/hero-showcase" element={<HeroShowcase />} />
                <Route path="/section-selector" element={<SectionSelectorDemo />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/dev-test" element={<DevTest />} />
                <Route path="/ai-loader-preview" element={<AILoaderPreview />} />
                <Route path="/intro-preview" element={<IntroPreview />} />
                <Route path="/design-system-test" element={<DesignSystemTest />} />
                <Route path="/test-page" element={<TestPage />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/settings/brand" element={<Settings />} />
                <Route path="/review/:businessSlug" element={<TestimonialRequest />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/brief/:sessionId" element={<Brief />} />
                <Route path="/brand-intake" element={<BrandIntake />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/dev" element={<Dev />} />
                <Route path="/prospects" element={<ProspectsDashboard />} />
                <Route path="/dev" element={<Dev />} />
                
                {/* Public page routes - accessible without authentication */}
                <Route path="/page/:slug" element={<PublicPage />} />
                <Route path="/p/:slug" element={<ProspectPage />} />
                
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              <CompanionBar />
            </CompanionProvider>
          </BrowserRouter>
        </TooltipProvider>
      </OrchestratorProvider>
    </SessionProvider>
  </QueryClientProvider>
</HelmetProvider>
  );
};

export default App;
