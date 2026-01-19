import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { IntelligenceProvider, useIntelligence } from "@/contexts/IntelligenceContext";
import SoftLockDemo from "@/components/landing/SoftLockDemo";
import { BrandDetectionPrompt } from "@/components/demo/BrandDetectionPrompt";
import { Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

// Inner component that has access to IntelligenceContext
function TryDemoContent() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { updateExtracted } = useIntelligence();
  
  const fromDashboard = searchParams.get('from') === 'dashboard';
  const [brandCheckComplete, setBrandCheckComplete] = useState(false);
  const [showBrandPrompt, setShowBrandPrompt] = useState(false);

  // Debug logging
  console.log('🏢 [TryDemo] Render state:', {
    fromDashboard,
    authLoading,
    user: user?.id || null,
    showBrandPrompt,
    brandCheckComplete,
  });

  // Only show brand detection for authenticated users coming from dashboard
  useEffect(() => {
    console.log('🏢 [TryDemo] Effect triggered:', { fromDashboard, authLoading, hasUser: !!user });
    
    if (authLoading) {
      console.log('🏢 [TryDemo] Auth still loading, waiting...');
      return;
    }

    if (fromDashboard && user) {
      console.log('🏢 [TryDemo] Dashboard entry with user - showing brand prompt');
      setShowBrandPrompt(true);
    } else {
      console.log('🏢 [TryDemo] Non-dashboard entry or no user - skipping brand check');
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
    console.log('🏢 [TryDemo] handleUseBrand called with:', brand.name);
    
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
    console.log('🏢 [TryDemo] handleSkipBrand called');
    setShowBrandPrompt(false);
    setBrandCheckComplete(true);
  };

  const handleClose = () => {
    // Navigate based on auth state
    if (user) {
      navigate('/');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Show brand prompt if needed */}
      {showBrandPrompt && !brandCheckComplete ? (
        <>
          {/* Minimal header for brand prompt */}
          <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
            <div className="container mx-auto px-4 h-14 flex items-center justify-between">
              <Link to="/" className="flex items-center gap-2 group">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  PageConsult
                </span>
              </Link>
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
          <main className="flex-1 pt-14">
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
              <div className="max-w-xl w-full">
                <BrandDetectionPrompt 
                  onUseBrand={handleUseBrand}
                  onSkip={handleSkipBrand}
                />
              </div>
            </div>
          </main>
        </>
      ) : brandCheckComplete ? (
        // Use SoftLockDemo with autoLock to start expanded
        <SoftLockDemo 
          autoLock={true}
          onClose={handleClose}
        />
      ) : null}
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
