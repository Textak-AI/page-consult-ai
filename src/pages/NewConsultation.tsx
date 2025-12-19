import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { StrategicConsultation, StrategyBriefReview, ConsultationIntro, shouldShowIntro, type ConsultationData } from "@/components/consultation";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import iconmark from "@/assets/iconmark-darkmode.svg";
import { DevToolbar, useDevMode } from "@/components/dev/DevToolbar";
import { mockConsultation, mockStrategyBrief } from "@/lib/mockDevData";
import { AIWorkingLoader } from "@/components/editor/AIWorkingLoader";

type Stage = 'loading' | 'intro' | 'consultation' | 'brief-review' | 'generating' | 'dev-loading';

export default function NewConsultation() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stage, setStage] = useState<Stage>('loading');
  const [userId, setUserId] = useState<string | null>(null);
  const [consultationData, setConsultationData] = useState<ConsultationData | null>(null);
  const [strategyBrief, setStrategyBrief] = useState<string>('');
  const [consultationStep, setConsultationStep] = useState(1);
  const isDevMode = useDevMode();
  // Check auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/signup");
        return;
      }
      setUserId(user.id);
      // Check if we should show intro
      if (shouldShowIntro()) {
        setStage('intro');
      } else {
        setStage('consultation');
      }
    };
    checkAuth();
  }, [navigate]);

  // Handle consultation completion
  const handleConsultationComplete = (data: ConsultationData, brief: string) => {
    console.log('📋 Consultation complete:', data);
    console.log('📝 Strategy brief generated');
    setConsultationData(data);
    setStrategyBrief(brief);
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

      // Navigate to generate page with all data
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
          },
          strategicData: {
            consultationData,
            websiteIntelligence: consultationData.websiteIntelligence,
            strategyBrief,
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
      setStage('brief-review');
    }, 10000);
  };

  const handleDevJumpToBriefReview = () => {
    setConsultationData(mockConsultation as unknown as ConsultationData);
    setStrategyBrief(mockStrategyBrief);
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
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
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
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Preparing Your Page...</h2>
          <p className="text-muted-foreground">Setting up generation with your strategy brief</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={stage === 'consultation' ? handleBackFromConsultation : handleRestart}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {stage === 'consultation' ? 'Home' : 'Back'}
          </Button>
          
          <div className="flex items-center gap-3 ml-4">
            <img src={iconmark} alt="PageConsult" className="h-8 w-8" />
            <span className="text-lg font-semibold text-foreground">PageConsult AI</span>
          </div>
          
          {/* Stage indicator */}
          <div className="ml-auto flex items-center gap-2 text-sm">
            <span className={`px-3 py-1 rounded-full ${
              stage === 'consultation' 
                ? 'bg-primary/20 text-primary' 
                : 'bg-accent/20 text-accent'
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
