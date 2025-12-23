import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { StrategicConsultation, StrategyBriefReview, ConsultationIntro, shouldShowIntro, type ConsultationData } from "@/components/consultation";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import iconmark from "@/assets/iconmark-darkmode.svg";
import { DevToolbar, useDevMode } from "@/components/dev/DevToolbar";
import { mockConsultation, mockStrategyBrief, mockAiSeoData, mockStructuredBrief } from "@/lib/mockDevData";
import { AIWorkingLoader } from "@/components/editor/AIWorkingLoader";
import type { AISeoData } from "@/services/intelligence/types";

type Stage = 'loading' | 'intro' | 'consultation' | 'brief-review' | 'generating' | 'dev-loading';

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

export default function NewConsultation() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [stage, setStage] = useState<Stage>('loading');
  const [userId, setUserId] = useState<string | null>(null);
  const [consultationData, setConsultationData] = useState<ConsultationData | null>(null);
  const [strategyBrief, setStrategyBrief] = useState<string>('');
  const [structuredBrief, setStructuredBrief] = useState<any>(null);
  const [aiSeoData, setAiSeoData] = useState<AISeoData | null>(null);
  const [consultationStep, setConsultationStep] = useState(1);
  const [prefillData, setPrefillData] = useState<PrefillData | null>(null);
  const isDevMode = useDevMode();

  // Parse prefill data from query params
  useEffect(() => {
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
  }, [searchParams, toast]);

  // Check auth on mount
  useEffect(() => {
    const checkAuth = async () => {
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
      // Skip intro if coming from demo with prefill data
      if (prefillData?.source === 'landing_demo' || !shouldShowIntro()) {
        setStage('consultation');
      } else {
        setStage('intro');
      }
    };
    checkAuth();
  }, [navigate, searchParams, prefillData]);

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
  if (stage === 'loading') {
    return (
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
    );
  }

  // Intro state
  if (stage === 'intro') {
    return (
      <ConsultationIntro onComplete={() => setStage('consultation')} />
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
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-xl sticky top-0 z-10">
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
      <main className="py-8 px-4">
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
      {isDevMode && (
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
