import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SessionProvider } from "@/contexts/SessionContext";
import Index from "./pages/Index";
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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SessionProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/new" element={<NewConsultation />} />
            <Route path="/wizard" element={<Wizard />} />
            <Route path="/wizard/review" element={<WizardReview />} />
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
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </SessionProvider>
  </QueryClientProvider>
);

export default App;
