import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { IntelligenceProvider, useIntelligence } from "@/contexts/IntelligenceContext";
import LiveDemoSection from "@/components/landing/LiveDemoSection";
import { BrandDetectionPrompt } from "@/components/demo/BrandDetectionPrompt";
import { Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

// Inner component that has access to IntelligenceContext
function TryDemoContent() {
  const [searchParams] = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();
  const { updateExtracted } = useIntelligence();
  
  const fromDashboard = searchParams.get('from') === 'dashboard';
  const [brandCheckComplete, setBrandCheckComplete] = useState(!fromDashboard);
  const [showBrandPrompt, setShowBrandPrompt] = useState(false);

  // Only show brand detection for authenticated users coming from dashboard
  useEffect(() => {
    if (fromDashboard && !authLoading && user) {
      setShowBrandPrompt(true);
    } else if (!authLoading) {
      setBrandCheckComplete(true);
    }
  }, [fromDashboard, authLoading, user]);

  const handleUseBrand = (brand: {
    id: string;
    name: string;
    industry: string | null;
    industry_vertical: string | null;
    website: string | null;
    brand_colors: { primary?: string; secondary?: string; accent?: string } | null;
    tone_profile: string[] | null;
  }) => {
    // Prefill the intelligence with brand data
    updateExtracted({
      industry: brand.industry,
      industrySummary: brand.industry_vertical 
        ? `${brand.industry} - ${brand.industry_vertical}` 
        : brand.industry,
    });
    
    setShowBrandPrompt(false);
    setBrandCheckComplete(true);
    
    console.log('🏢 [TryDemo] Brand data prefilled:', {
      name: brand.name,
      industry: brand.industry,
      vertical: brand.industry_vertical,
    });
  };

  const handleSkipBrand = () => {
    setShowBrandPrompt(false);
    setBrandCheckComplete(true);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Minimal header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
              PageConsult
            </span>
          </Link>

          {/* Sign In / Dashboard link */}
          {user ? (
            <Link
              to="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              to="/signup"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </header>

      {/* Full-page demo */}
      <main className="flex-1 pt-14">
        {showBrandPrompt && !brandCheckComplete ? (
          <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
            <div className="max-w-xl w-full">
              <BrandDetectionPrompt 
                onUseBrand={handleUseBrand}
                onSkip={handleSkipBrand}
              />
            </div>
          </div>
        ) : brandCheckComplete ? (
          <LiveDemoSection />
        ) : null}
      </main>
    </div>
  );
}

export default function TryDemo() {
  return (
    <IntelligenceProvider>
      <TryDemoContent />
    </IntelligenceProvider>
  );
}
