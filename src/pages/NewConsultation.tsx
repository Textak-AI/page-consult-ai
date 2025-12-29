import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";
import { StrategicConsultation, StrategyBriefReview, ConsultationIntro, shouldShowIntro, type ConsultationData } from "@/components/consultation";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import iconmark from "@/assets/iconmark-darkmode.svg";
import { DevToolbar, useDevMode } from "@/components/dev/DevToolbar";
import { mockConsultation, mockStrategyBrief, mockAiSeoData, mockStructuredBrief } from "@/lib/mockDevData";
import { AIWorkingLoader } from "@/components/editor/AIWorkingLoader";
import { BrandExtractor } from "@/components/consultation/BrandExtractor";
import { WebsiteAnalyzer } from "@/components/consultation/WebsiteAnalyzer";
import { ExtractedBrand } from "@/lib/brandExtraction";
import type { AISeoData } from "@/services/intelligence/types";
import { DraftRecoveryModal } from "@/components/consultation/DraftRecoveryModal";

type Stage = 'loading' | 'checking-draft' | 'brand-extractor' | 'website-analyzer' | 'intro' | 'consultation' | 'brief-review' | 'generating' | 'dev-loading';

// Type for prefill data from landing demo
interface PrefillData {
  extracted?: {
    industry?: string | null;
    audience?: string | null;
    valueProp?: string | null;
    businessType?: 'B2B' | 'B2C' | 'Both' | null;
  };
  market?: {
    marketSize?: string | null;
    buyerPersona?: string | null;
    commonObjections?: string[];
    industryInsights?: string[];
  };
  email?: string | null;
  source?: string;
  sessionId?: string;
}

interface ExistingDraft {
  id: string;
  wizard_data: any;
  updated_at: string;
}

// Check localStorage synchronously to determine initial stage
const getInitialStage = (): Stage => {
  if (typeof window !== 'undefined') {
    const savedBrandData = localStorage.getItem('pageconsult_brand_data');
    if (savedBrandData) {
      try {
        const brandData = JSON.parse(savedBrandData);
        if (brandData.websiteUrl || brandData.logo || brandData.companyName) {
          console.log('🚀 Initial stage set to consultation (brand data exists)');
          return 'consultation';
        }
      } catch (e) {}
    }
  }
  return 'loading';
};

export default function NewConsultation() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [stage, setStage] = useState<Stage>(getInitialStage);
  const [userId, setUserId] = useState<string | null>(null);
  const [consultationData, setConsultationData] = useState<ConsultationData | null>(null);
  const [strategyBrief, setStrategyBrief] = useState<string>('');
  const [structuredBrief, setStructuredBrief] = useState<any>(null);
  const [aiSeoData, setAiSeoData] = useState<AISeoData | null>(null);
  const [consultationStep, setConsultationStep] = useState(1);
  const [prefillData, setPrefillData] = useState<PrefillData | null>(null);
  const [extractedBrand, setExtractedBrand] = useState<ExtractedBrand | null>(null);
  const [extractedWebsiteUrl, setExtractedWebsiteUrl] = useState<string | null>(null);
  const [skipDraftLoad, setSkipDraftLoad] = useState(false);
  const [websiteAnalysis, setWebsiteAnalysis] = useState<any>(null);
  const [isDevModeActive] = useDevMode();
  
  // Draft recovery state
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [existingDraft, setExistingDraft] = useState<ExistingDraft | null>(null);

  // Parse prefill data from query params
  // Only run if we don't already have an extracted brand
  useEffect(() => {
    // Don't set prefill if we already have extracted brand
    if (extractedBrand) return;
    
    const prefillParam = searchParams.get('prefill');
    if (prefillParam) {
      try {
        const parsed = JSON.parse(decodeURIComponent(prefillParam));
        setPrefillData(parsed);
        console.log('📥 Prefill data loaded from demo:', parsed);
        
        // Show toast to acknowledge the prefill
        if (parsed.extracted?.industry) {
          toast({
            title: "Welcome back!",
            description: `Continuing your ${parsed.extracted.industry} strategy session.`,
          });
        }
      } catch (err) {
        console.error('Failed to parse prefill data:', err);
      }
    }
  }, [searchParams, toast, extractedBrand]);

  // Check for saved brand data from EnhancedBrandSetup (populate state, stage already set synchronously)
  useEffect(() => {
    const savedBrandData = localStorage.getItem('pageconsult_brand_data');
    if (savedBrandData) {
      try {
        const brandData = JSON.parse(savedBrandData);
        console.log('📦 Loading brand data from EnhancedBrandSetup:', brandData);
        
        // Apply saved brand data to extracted brand state
        if (brandData.websiteUrl || brandData.logo || brandData.companyName) {
          const brand: ExtractedBrand = {
            domain: brandData.websiteUrl || '',
            companyName: brandData.companyName || null,
            tagline: brandData.tagline || null,
            description: brandData.tagline || null,
            faviconUrl: null,
            ogImage: brandData.logo || null,
            themeColor: brandData.colors?.primary || null,
          };
          setExtractedBrand(brand);
          setExtractedWebsiteUrl(brandData.websiteUrl || null);
          
          // Skip draft load since we have fresh brand data
          setSkipDraftLoad(true);
          // Stage is already set to 'consultation' synchronously via getInitialStage
        }
        
        // Clear the stored data after loading
        localStorage.removeItem('pageconsult_brand_data');
      } catch (e) {
        console.error('Error parsing brand data:', e);
      }
    }
  }, []);

  // Check auth and draft on mount
  useEffect(() => {
    const checkAuthAndDraft = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Preserve prefill data in redirect
        const prefillParam = searchParams.get('prefill');
        const redirectUrl = prefillParam 
          ? `/new?prefill=${encodeURIComponent(prefillParam)}`
          : '/new';
        navigate(`/signup?redirect=${encodeURIComponent(redirectUrl)}`);
        return;
      }
      setUserId(user.id);
      
      // Skip intro and brand extractor if coming from demo with prefill data
      if (prefillData?.source === 'landing_demo') {
        setStage('consultation');
        return;
      }
      
      // Check if we should skip the draft modal (e.g., coming from Edit button)
      const skipModal = searchParams.get('skipDraftModal') === 'true';
      if (skipModal) {
        setSkipDraftLoad(true);
        proceedToStart();
        return;
      }
      
      // Check for existing draft
      setStage('checking-draft');
      const { data: draft } = await supabase
        .from('consultation_drafts')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();
      
      if (draft && draft.wizard_data) {
        // Show draft recovery modal
        setExistingDraft(draft as ExistingDraft);
        setShowDraftModal(true);
        setStage('loading'); // Keep loading until user makes a choice
      } else {
        // No draft, proceed normally
        proceedToStart();
      }
    };
    checkAuthAndDraft();
  }, [navigate, searchParams, prefillData]);

  // Helper to proceed to the starting point
  const proceedToStart = () => {
    if (!shouldShowIntro()) {
      setStage('brand-extractor');
    } else {
      setStage('intro');
    }
  };

  // Draft recovery handlers
  const handleContinueDraft = async () => {
    if (!userId) return;
    
    // First, check if a landing page already exists for a completed consultation
    // This handles the case where user completed the wizard but didn't finish editing
    try {
      // Check for any existing landing page for this user
      const { data: existingPage } = await supabase
        .from('landing_pages')
        .select('id, consultation_id')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (existingPage?.id) {
        // Page exists - go directly to editor
        console.log('📄 [DraftRecovery] Page exists, going to editor:', existingPage.id);
        setShowDraftModal(false);
        navigate(`/generate/${existingPage.id}`);
        return;
      }
    } catch (error) {
      console.error('Error checking for existing page:', error);
      // Continue with draft recovery if check fails
    }
    
    // No page exists - resume the wizard draft
    if (existingDraft?.wizard_data) {
      console.log('📝 [DraftRecovery] No page, resuming wizard draft');
      // Pre-populate the consultation data from draft
      setConsultationData(existingDraft.wizard_data as ConsultationData);
      setSkipDraftLoad(false); // Allow StrategicConsultation to load the draft
    }
    setShowDraftModal(false);
    setStage('consultation');
  };

  const handleStartFresh = () => {
    // Keep draft in DB but start new consultation
    setSkipDraftLoad(true); // Skip loading the draft
    setShowDraftModal(false);
    proceedToStart();
  };

  const handleDiscardDraft = async () => {
    // Delete the draft from database
    if (userId) {
      await supabase
        .from('consultation_drafts')
        .delete()
        .eq('user_id', userId);
    }
    
    // Clear localStorage too
    localStorage.removeItem('pageconsult_consultation_draft');
    
    setExistingDraft(null);
    setSkipDraftLoad(true);
    setShowDraftModal(false);
    proceedToStart();
  };

  // Handle brand extracted - go to website analyzer step
  const handleBrandExtracted = (brand: ExtractedBrand, websiteUrl: string) => {
    console.log('🎨 Brand extracted:', brand);
    
    // Skip loading any saved drafts - this is a fresh start
    setSkipDraftLoad(true);
    
    // CLEAR prefill data so it doesn't override extracted brand
    setPrefillData(null);
    
    setExtractedBrand(brand);
    setExtractedWebsiteUrl(websiteUrl);
    
    sonnerToast.success(`Welcome, ${brand.companyName || brand.domain}!`, {
      description: "We've found your brand info"
    });
    
    // Move to website analyzer step
    setStage('website-analyzer');
  };

  // Handle website analysis complete
  const handleAnalysisComplete = (analysis: any) => {
    console.log('📊 Website analysis complete:', analysis);
    setWebsiteAnalysis(analysis);
    setStage('consultation');
  };

  // Handle skip analysis
  const handleSkipAnalysis = () => {
    setStage('consultation');
  };

  // Handle skip brand extractor
  const handleSkipBrandExtractor = () => {
    setStage('consultation');
  };

  // Handle consultation completion - now includes structuredBrief JSON
  const handleConsultationComplete = (data: ConsultationData, brief: string, seoData?: AISeoData | null, structuredBriefData?: any) => {
    console.log('📋 Consultation complete:', data);
    console.log('📝 Strategy brief generated');
    console.log('📊 structuredBrief present:', !!structuredBriefData);
    if (structuredBriefData) {
      console.log('📊 structuredBrief keys:', Object.keys(structuredBriefData));
    }
    if (seoData) console.log('🔍 AI SEO data available:', seoData.entity?.type);
    setConsultationData(data);
    setStrategyBrief(brief);
    setStructuredBrief(structuredBriefData || null);
    setAiSeoData(seoData || null);
    setStage('brief-review');
  };

  // Handle brief approval - navigate to generate with all data
  const handleBriefApproved = async () => {
    if (!userId || !consultationData) return;
    
    setStage('generating');
    
    try {
      // Create consultation record in database
      const { data: consultationRecord, error: consultationError } = await supabase
        .from("consultations")
        .insert({
          user_id: userId,
          industry: consultationData.industry === 'Other' 
            ? consultationData.industryOther 
            : consultationData.industry,
          service_type: consultationData.mainOffer,
          goal: consultationData.primaryGoal,
          target_audience: consultationData.idealClient,
          challenge: consultationData.clientFrustration,
          unique_value: consultationData.uniqueStrength,
          offer: consultationData.mainOffer,
          status: "completed",
        })
        .select()
        .single();

      if (consultationError) {
        console.error("Failed to save consultation:", consultationError);
        throw consultationError;
      }

      console.log('✅ Consultation saved to database:', consultationRecord.id);

      // Navigate to generate page with all data INCLUDING structuredBrief and aiSeoData
      console.log('🚀 Navigating to /generate with structuredBrief:', !!structuredBrief);
      console.log('🚀 Navigating to /generate with aiSeoData:', !!aiSeoData, aiSeoData?.entity?.type);
      
      // Log heroBackgroundUrl for debugging
      console.log('🖼️ [NewConsultation] heroBackgroundUrl:', consultationData.heroBackgroundUrl);
      
      navigate("/generate", {
        state: {
          consultationData: {
            id: consultationRecord.id,
            industry: consultationData.industry === 'Other' 
              ? consultationData.industryOther 
              : consultationData.industry,
            service_type: consultationData.mainOffer,
            goal: consultationData.primaryGoal,
            target_audience: consultationData.idealClient,
            challenge: consultationData.clientFrustration,
            unique_value: consultationData.uniqueStrength,
            offer: consultationData.mainOffer,
            // Additional strategic data
            businessName: consultationData.businessName,
            yearsInBusiness: consultationData.yearsInBusiness,
            desiredOutcome: consultationData.desiredOutcome,
            clientCount: consultationData.clientCount,
            achievements: consultationData.achievements,
            testimonialText: consultationData.testimonialText,
            offerIncludes: consultationData.offerIncludes,
            investmentRange: consultationData.investmentRange,
            processDescription: consultationData.processDescription,
            ctaText: consultationData.ctaText,
            objectionsToOvercome: consultationData.objectionsToOvercome,
            // Brand settings from customization
            brandSettings: consultationData.brandSettings,
            // Hero background from AI carousel
            heroBackgroundUrl: consultationData.heroBackgroundUrl,
          },
          strategicData: {
            consultationData,
            websiteIntelligence: consultationData.websiteIntelligence,
            strategyBrief,
            // CRITICAL: Include the structured JSON brief for direct mapping
            structuredBrief,
            // CRITICAL: Include AI SEO data for intelligent optimization
            aiSeoData,
            brandSettings: consultationData.brandSettings,
            // CRITICAL: Include hero background URL for direct use
            heroBackgroundUrl: consultationData.heroBackgroundUrl,
          },
          fromStrategicConsultation: true,
        },
      });
    } catch (error) {
      console.error("Error saving consultation:", error);
      toast({
        title: "Error",
        description: "Failed to save consultation. Please try again.",
        variant: "destructive",
      });
      setStage('brief-review');
    }
  };

  // Handle brief edit
  const handleBriefEdit = (editedBrief: string) => {
    setStrategyBrief(editedBrief);
  };

  // Handle restart
  const handleRestart = () => {
    setConsultationData(null);
    setStrategyBrief('');
    setStructuredBrief(null);
    setStage('consultation');
  };

  // Handle back from consultation
  const handleBackFromConsultation = () => {
    navigate("/");
  };

  // Dev mode handlers
  const handleDevJumpToLoading = () => {
    setStage('dev-loading');
    // Auto-complete after 10 seconds
    setTimeout(() => {
      setConsultationData(mockConsultation as unknown as ConsultationData);
      setStrategyBrief(mockStrategyBrief);
      setStructuredBrief(mockStructuredBrief);
      setStage('brief-review');
    }, 10000);
  };

  const handleDevJumpToBriefReview = () => {
    setConsultationData(mockConsultation as unknown as ConsultationData);
    setStrategyBrief(mockStrategyBrief);
    setStructuredBrief(mockStructuredBrief);
    setAiSeoData(mockAiSeoData);
    setStage('brief-review');
  };

  const handleDevJumpToPageBuilder = () => {
    navigate("/generate", {
      state: {
        consultationData: {
          id: 'dev-test-id',
          industry: mockConsultation.industry,
          service_type: mockConsultation.mainOffer,
          goal: mockConsultation.primaryGoal,
          target_audience: mockConsultation.idealClient,
          challenge: mockConsultation.clientFrustration,
          unique_value: mockConsultation.uniqueStrength,
          offer: mockConsultation.mainOffer,
          businessName: mockConsultation.businessName,
        },
        strategicData: {
          consultationData: mockConsultation,
          websiteIntelligence: mockConsultation.websiteIntelligence,
          strategyBrief: mockStrategyBrief,
          // CRITICAL: Include structured brief for direct mapping
          structuredBrief: mockStructuredBrief,
          // CRITICAL: Include AI SEO data
          aiSeoData: mockAiSeoData,
        },
        fromStrategicConsultation: true,
      },
    });
  };

  const handleDevJumpToStep = (step: number) => {
    setConsultationStep(step);
    setStage('consultation');
  };

  // Loading state
  if (stage === 'loading' || stage === 'checking-draft') {
    return (
      <>
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
            <p className="text-slate-400">Loading...</p>
          </motion.div>
        </div>
        
        {/* Draft Recovery Modal */}
        {existingDraft && (
          <DraftRecoveryModal
            isOpen={showDraftModal}
            draftDate={new Date(existingDraft.updated_at)}
            draftBusinessName={existingDraft.wizard_data?.businessName}
            onContinue={handleContinueDraft}
            onStartFresh={handleStartFresh}
            onDiscard={handleDiscardDraft}
          />
        )}
      </>
    );
  }

  // Intro state - after intro, show brand extractor
  if (stage === 'intro') {
    return (
      <ConsultationIntro onComplete={() => setStage('brand-extractor')} />
    );
  }

  // Brand extractor state
  if (stage === 'brand-extractor') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-8 max-w-lg w-full"
        >
          <BrandExtractor
            onExtracted={handleBrandExtracted}
            onSkip={handleSkipBrandExtractor}
          />
        </motion.div>
      </div>
    );
  }

  // Website analyzer state
  if (stage === 'website-analyzer') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <WebsiteAnalyzer
          websiteUrl={extractedWebsiteUrl || ''}
          extractedBrand={extractedBrand}
          onAnalysisComplete={handleAnalysisComplete}
          onSkip={handleSkipAnalysis}
        />
      </div>
    );
  }

  // Dev loading state (shows AI working loader for 10 seconds)
  if (stage === 'dev-loading') {
    return <AIWorkingLoader />;
  }

  // Generating state
  if (stage === 'generating') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Preparing Your Page...</h2>
          <p className="text-slate-400">Setting up generation with your strategy brief</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={stage === 'consultation' ? handleBackFromConsultation : handleRestart}
            className="text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {stage === 'consultation' ? 'Home' : 'Back'}
          </Button>
          
          <div className="flex items-center gap-3 ml-4">
            <img src={iconmark} alt="PageConsult" className="h-8 w-8" />
            <span className="text-lg font-semibold text-white">PageConsult AI</span>
          </div>
          
          {/* Stage indicator */}
          <div className="ml-auto flex items-center gap-2 text-sm">
            <span className={`px-3 py-1 rounded-full ${
              stage === 'consultation' 
                ? 'bg-cyan-500/20 text-cyan-400' 
                : 'bg-purple-500/20 text-purple-400'
            }`}>
              {stage === 'consultation' && 'Discovery'}
              {stage === 'brief-review' && 'Strategy Review'}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-8 px-4 relative z-10">
        {stage === 'consultation' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <StrategicConsultation
              onComplete={handleConsultationComplete}
              onBack={handleBackFromConsultation}
              prefillData={prefillData}
              extractedBrand={extractedBrand ? {
                ...extractedBrand,
                websiteUrl: extractedWebsiteUrl || undefined
              } : null}
              skipDraftLoad={skipDraftLoad}
              websiteAnalysis={websiteAnalysis}
            />
          </motion.div>
        )}

        {stage === 'brief-review' && consultationData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <StrategyBriefReview
              brief={strategyBrief}
              consultationData={consultationData}
              aiSeoData={aiSeoData}
              onApprove={handleBriefApproved}
              onEdit={handleBriefEdit}
              onRestart={handleRestart}
            />
          </motion.div>
        )}
      </main>

      {/* Dev Toolbar */}
      {isDevModeActive && (
        <DevToolbar
          onJumpToLoading={handleDevJumpToLoading}
          onJumpToBriefReview={handleDevJumpToBriefReview}
          onJumpToPageBuilder={handleDevJumpToPageBuilder}
          onJumpToStep={handleDevJumpToStep}
          currentStep={consultationStep}
          totalSteps={6}
        />
      )}
    </div>
  );
}
