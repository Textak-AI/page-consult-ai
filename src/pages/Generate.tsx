import { useEffect, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Check, Sparkles, Wand2, Palette, Undo2, Redo2, Brain } from "lucide-react";
import { PersonaInsightsPanel } from "@/components/editor/PersonaInsightsPanel";
import { SectionManager } from "@/components/editor/SectionManager";
import { LivePreview } from "@/components/editor/LivePreview";
import { PublishModal } from "@/components/editor/PublishModal";
import { AIConsultantSidebar } from "@/components/editor/AIConsultantSidebar";
import { CalculatorUpgradeModal } from "@/components/editor/CalculatorUpgradeModal";
import { StylePicker } from "@/components/editor/StylePicker";
import { PageGenerationLoader } from "@/components/editor/PageGenerationLoader";
import { StrategyBriefPanel } from "@/components/builder/StrategyBriefPanel";
import { EditingProvider, useEditing } from "@/contexts/EditingContext";
import { generateIntelligentContent, runIntelligencePipeline } from "@/services/intelligence";
import type { PersonaIntelligence, GeneratedContent, AISeoData } from "@/services/intelligence/types";
import { cn } from "@/lib/utils";
import logo from "/logo/whiteAsset_3combimark_darkmode.svg";
import { useAIActions, type AIActionType } from "@/hooks/useAIActions";
import { useCredits } from "@/hooks/useCredits";
import { StylePresetName } from "@/styles/presets";
import {
  UsageIndicator,
  ActionConfirmModal,
  ZeroBalanceModal,
  LowBalanceAlert,
  UsageHistoryModal,
} from "@/components/usage";
import { CreditDisplay, UpgradeDrawer } from "@/components/credits";
import { generateSEOAssets, createFAQSectionConfig, isAISeoDataValid, generateSEOHeadData, type SEOHeadData } from "@/lib/aiSeoIntegration";
import { mapBriefToSections, isStructuredBriefContent, type StructuredBrief } from "@/utils/sectionMapper";
import { generateDesignSystem, designSystemToCSSVariables } from "@/config/designSystem";
import type { DesignSystem } from "@/config/designSystem";
import { SEOHead } from "@/components/seo/SEOHead";
import { applyBrandColors } from "@/lib/colorUtils";

// Helper functions for transforming problem/solution statements
function transformProblemStatement(challenge?: string): string {
  if (!challenge) return "Are you struggling to achieve your business goals?";

  // Transform raw challenge into a compelling problem statement
  const cleaned = challenge
    .replace(/^they\s+/i, "Are you ")
    .replace(/^customers?\s+/i, "Do you ")
    .replace(/don't have/i, "struggling to find")
    .replace(/can't/i, "unable to")
    .replace(/lack/i, "missing")
    .trim();

  // Make it a question if it isn't already
  if (!cleaned.endsWith("?")) {
    return `${cleaned}?`;
  }

  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

function transformSolutionStatement(uniqueValue?: string, industry?: string): string {
  if (!uniqueValue) {
    return "We provide professional solutions designed to solve your specific challenges and deliver measurable results.";
  }

  // Transform into a clear solution statement
  const cleaned = uniqueValue
    .replace(/^(we|our)\s+/i, "Our ")
    .replace(/^have\s+/i, "")
    .replace(/^a\s+/i, "")
    .trim();

  return (
    cleaned.charAt(0).toUpperCase() +
    cleaned.slice(1) +
    ". Proven results you can measure, backed by expert support every step of the way."
  );
}

type Phase = "loading" | "building" | "editor";
type Section = {
  type: string;
  order: number;
  visible: boolean;
  content: any;
};

export default function Generate() {
  return (
    <EditingProvider>
      <GenerateContent />
    </EditingProvider>
  );
}

function GenerateContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const { pageId } = useParams();
  const { toast } = useToast();
  const { pushHistory, undo, redo, canUndo, canRedo, clearHistory } = useEditing();
  const [phase, setPhase] = useState<Phase>("loading");
  const [progress, setProgress] = useState(0);
  const [buildStep, setBuildStep] = useState(0);
  const [consultation, setConsultation] = useState<any>(null);
  const [pageData, setPageData] = useState<any>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [aiConsultantOpen, setAiConsultantOpen] = useState(false);
  const [stylePickerOpen, setStylePickerOpen] = useState(false);
  const [calculatorUpgradeOpen, setCalculatorUpgradeOpen] = useState(false);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Intelligence data from wizard or strategic consultation - type definition
  type NavigationStateType = {
    consultationData?: any;
    intelligenceData?: PersonaIntelligence;
    generatedContentData?: GeneratedContent;
    landingPageBestPractices?: any;
    devMode?: boolean; // Bypass auth for testing
    // New strategic consultation data
    strategicData?: {
      consultationData?: any;
      websiteIntelligence?: any;
      strategyBrief?: string;
      structuredBrief?: any;
      brandSettings?: {
        logoUrl: string | null;
        primaryColor: string;
        secondaryColor: string;
        headingFont: string;
        bodyFont: string;
        modified: boolean;
      };
    };
    fromStrategicConsultation?: boolean;
  } | null;
  
  // Get navigation state from location.state or sessionStorage fallback
  const getInitialNavState = (): NavigationStateType => {
    // 1. First try location.state (normal navigation)
    if (location.state && Object.keys(location.state).length > 0) {
      console.log('📍 [Generate] Using location.state');
      return location.state as NavigationStateType;
    }
    
    // 2. Then try sessionStorage (fallback for edge cases)
    const storedState = sessionStorage.getItem('devPanelState');
    if (storedState) {
      console.log('📍 [Generate] Using sessionStorage state');
      try {
        const parsed = JSON.parse(storedState);
        // Clear after reading so it doesn't persist incorrectly
        sessionStorage.removeItem('devPanelState');
        return parsed as NavigationStateType;
      } catch (e) {
        console.error('Failed to parse stored state:', e);
        sessionStorage.removeItem('devPanelState');
      }
    }
    
    // 3. No state available
    console.log('📍 [Generate] No navigation state found');
    return null;
  };
  
  // Get effective navigation state once on mount
  const [effectiveNavState] = useState<NavigationStateType>(getInitialNavState);
  
  // Derived values from effective nav state
  const isDevMode = effectiveNavState?.devMode === true;
  const fromStrategicConsultation = effectiveNavState?.fromStrategicConsultation === true;
  const strategicData = effectiveNavState?.strategicData || null;
  
  const [intelligence, setIntelligence] = useState<PersonaIntelligence | null>(
    effectiveNavState?.intelligenceData || null
  );
  const [preGeneratedContent, setPreGeneratedContent] = useState<GeneratedContent | null>(
    effectiveNavState?.generatedContentData || null
  );
  // Landing page best practices from market research
  const [landingPageBestPractices, setLandingPageBestPractices] = useState<any>(
    effectiveNavState?.landingPageBestPractices || null
  );
  const [isRegenerating, setIsRegenerating] = useState(false);
  
  // Design system for dynamic theming
  const [designSystem, setDesignSystem] = useState<DesignSystem | null>(null);
  const [cssVariables, setCssVariables] = useState<string>('');
  
  // SEO data for SEOHead component
  const [seoData, setSeoData] = useState<SEOHeadData | null>(null);

  const loadingMessages = [
    { icon: Check, text: "Analyzing your strategy" },
    { icon: Check, text: "Writing compelling copy" },
    { icon: Check, text: "Optimizing for conversion" },
  ];


  // Apply brand colors when nav state is available
  useEffect(() => {
    const primaryColor = effectiveNavState?.strategicData?.brandSettings?.primaryColor ||
                         effectiveNavState?.consultationData?.primaryColor ||
                         null;
    
    if (primaryColor) {
      const cleanup = applyBrandColors(primaryColor);
      return cleanup;
    }
  }, [effectiveNavState]);

  useEffect(() => {
    loadConsultation();
  }, []);

  // Auto-save when sections change (with debounce)
  useEffect(() => {
    if (phase === "editor" && pageData && sections.length > 0) {
      // Clear existing timeout
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }

      // Set new timeout for auto-save after 2 seconds of no changes
      const timeout = setTimeout(() => {
        handleAutoSave();
      }, 2000);

      setAutoSaveTimeout(timeout);

      return () => {
        if (timeout) clearTimeout(timeout);
      };
    }
  }, [sections, phase, pageData]);

  // Initialize history when sections first load
  useEffect(() => {
    if (phase === "editor" && sections.length > 0 && !canUndo && !canRedo) {
      clearHistory();
      pushHistory(sections);
    }
  }, [phase]);

  // Generate SEO data when consultation and AI SEO data are available
  useEffect(() => {
    if (!consultation) return;
    
    const aiSeoData = consultation.aiSeoData || consultation.ai_seo_data;
    if (!isAISeoDataValid(aiSeoData)) return;
    
    // Build strategy brief data from available sources
    const briefData = strategicData?.structuredBrief || {};
    const strategyBriefForSEO = {
      businessName: strategicData?.consultationData?.businessName || consultation.industry,
      processOverview: briefData.problemStatement,
      howItWorks: briefData.processSteps ? {
        steps: briefData.processSteps.map((step: any) => ({
          title: step.title,
          description: step.description,
        })),
      } : undefined,
      offerType: 'service' as const,
      offerName: consultation.offer || briefData.mainOffer,
      valueProposition: consultation.unique_value || briefData.subheadline,
      serviceArea: aiSeoData.entity?.areaServed,
    };
    
    // Generate SEO head data
    const generatedSeoData = generateSEOHeadData(
      {
        industry: consultation.industry,
        offer: consultation.offer,
        uniqueValue: consultation.unique_value,
      },
      aiSeoData,
      undefined, // testimonials
      strategyBriefForSEO,
      pageData?.published_url || undefined,
      undefined // ogImage
    );
    
    setSeoData(generatedSeoData);
    console.log('✅ SEO data generated:', generatedSeoData);
  }, [consultation, strategicData, pageData]);

  const loadConsultation = async () => {
    try {
      // FIRST: Check if we're loading an existing page by ID
      if (pageId) {
        console.log('🔍 Loading existing page:', pageId);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate("/signup");
          return;
        }

        const { data: existingPage, error } = await supabase
          .from("landing_pages")
          .select("*")
          .eq("id", pageId)
          .eq("user_id", user.id)
          .single();

        if (error || !existingPage) {
          console.error("❌ Page not found:", error);
          toast({
            title: "Page not found",
            description: "Could not find the requested page.",
            variant: "destructive",
          });
          navigate("/");
          return;
        }

        console.log("✅ Loaded existing page:", existingPage);
        setPageData(existingPage);
        setSections((existingPage.sections as Section[]) || []);
        setPhase("editor");
        return;
      }

      // SECOND: Check if data was passed from demo via React Router state or sessionStorage
      const demoData = effectiveNavState?.consultationData || location.state?.consultationData;

      console.log('🔍 Generate page load - checking for consultation data...');
      console.log('📦 location.state:', location.state);
      console.log('📦 effectiveNavState:', effectiveNavState);
      console.log('📦 demoData:', demoData);
      console.log('🔧 devMode:', isDevMode);

      if (demoData) {
        // DEV MODE: Skip auth check for testing
        if (isDevMode) {
          console.log("🔧 DEV MODE: Bypassing authentication");
          const devUserId = "dev-test-user-" + Date.now();
          
          // Transform demo data to match expected format
          const transformedData = {
            id: demoData.id || "dev-consultation-" + Date.now(),
            user_id: devUserId,
            industry: demoData.industry,
            service_type: demoData.specificService || demoData.service_type,
            goal: demoData.goal,
            target_audience: demoData.targetAudience || demoData.target_audience,
            challenge: demoData.challenge,
            unique_value: demoData.uniqueValue || demoData.unique_value,
            offer: demoData.offer || demoData.goal,
            status: "completed",
            created_at: demoData.timestamp || new Date().toISOString(),
          };

          setConsultation(transformedData);
          // In dev mode, skip database operations
          await startDevGeneration(transformedData);
          return;
        }

        // Data came from demo - use it directly (normal flow)
        console.log("✅ Using consultation data from demo:", demoData);

        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          navigate("/signup");
          return;
        }

        // Transform demo data to match expected format
        const transformedData = {
          id: demoData.id,
          user_id: user.id,
          industry: demoData.industry,
          service_type: demoData.specificService,
          goal: demoData.goal,
          target_audience: demoData.targetAudience,
          challenge: demoData.challenge,
          unique_value: demoData.uniqueValue,
          offer: demoData.offer || demoData.goal,
          status: "completed",
          created_at: demoData.timestamp,
        };

        setConsultation(transformedData);
        startGeneration(transformedData, user.id);
        return;
      }

      // FALLBACK: If no demo data, try loading from database (old wizard flow)
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        navigate("/signup");
        return;
      }

      const { data, error } = await supabase
        .from("consultations")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "completed")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error || !data) {
        console.error("❌ No consultation found in database");
        toast({
          title: "No consultation found",
          description: "Please complete the consultation demo on the homepage first.",
          variant: "destructive",
        });
        navigate("/#demo");
        return;
      }

      console.log("✅ Using consultation data from database:", data);
      setConsultation(data);
      startGeneration(data, user.id);
    } catch (error) {
      console.error("❌ Error loading consultation:", error);
      toast({
        title: "Error loading page",
        description: "Failed to load consultation data. Please try again.",
        variant: "destructive",
      });
      navigate("/#demo");
    }
  };

  const startGeneration = async (consultationData: any, userId: string) => {
    // Start generation immediately, show loading UI
    setPhase("building");

    // Animate progress bar while API calls happen
    let progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 2, 90));
    }, 200);

    try {
      await animatePageBuild(consultationData, userId);
      clearInterval(progressInterval);
      setProgress(100);
    } catch (error) {
      clearInterval(progressInterval);
      throw error;
    }
  };

  // Dev mode generation - skips database operations
  const startDevGeneration = async (consultationData: any) => {
    setPhase("building");

    let progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 2, 90));
    }, 200);

    try {
      console.log("🔧 DEV MODE: Starting generation without database");
      console.time("⚡ Dev generation time");
      const generatedSections = await generateSections(consultationData);
      console.timeEnd("⚡ Dev generation time");

      if (!generatedSections || generatedSections.length === 0) {
        throw new Error("No sections were generated");
      }

      // Animate sections appearing
      for (let i = 1; i <= generatedSections.length; i++) {
        setBuildStep(i);
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      // Set page data without saving to database
      setPageData({
        id: "dev-page-" + Date.now(),
        title: `${consultationData.industry} Landing Page`,
        slug: "dev-test",
        sections: generatedSections,
      });
      setSections(generatedSections);

      clearInterval(progressInterval);
      setProgress(100);
      setShowConfetti(true);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setPhase("editor");
      setShowConfetti(false);
    } catch (error) {
      clearInterval(progressInterval);
      console.error("❌ Dev generation failed:", error);
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const animatePageBuild = async (consultationData: any, userId: string) => {
    try {
      // Check if a page already exists for this consultation
      const { data: existingPage } = await supabase
        .from("landing_pages")
        .select("*")
        .eq("user_id", userId)
        .eq("consultation_id", consultationData.id)
        .maybeSingle();

      if (existingPage) {
        console.log("✅ Found existing page for consultation, loading it:", existingPage.id);
        setPageData(existingPage);
        setSections((existingPage.sections as Section[]) || []);
        setPhase("editor");
        return;
      }

      // Generate content (parallel API calls inside)
      console.log("🎨 Starting page generation with data:", consultationData);
      console.time("⚡ Total generation time");
      const generatedSections = await generateSections(consultationData);
      console.timeEnd("⚡ Total generation time");
      console.log("✅ Generated sections:", generatedSections);

      if (!generatedSections || generatedSections.length === 0) {
        throw new Error("No sections were generated");
      }

      // Animate sections appearing quickly
      for (let i = 1; i <= generatedSections.length; i++) {
        setBuildStep(i);
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      // Create NEW page in database
      const slug = `${consultationData.industry?.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`;
      console.log("💾 Creating new page in database with slug:", slug);
      
      // Get aiSeoData for meta tags optimization
      const aiSeoData = consultationData.aiSeoData || consultationData.ai_seo_data;
      let optimizedMeta = {
        title: `${consultationData.offer} - ${consultationData.industry}`,
        description: consultationData.unique_value || '',
      };
      
      // Use AI SEO optimized meta tags if available
      if (isAISeoDataValid(aiSeoData)) {
        const seoAssets = generateSEOAssets(
          {
            industry: consultationData.industry,
            offer: consultationData.offer,
            uniqueValue: consultationData.unique_value,
          },
          aiSeoData
        );
        optimizedMeta = {
          title: seoAssets.metaTags.title,
          description: seoAssets.metaTags.description,
        };
        console.log('✅ Using AI SEO optimized meta tags:', optimizedMeta);
      }
      
      // Prepare insert data with optional strategic fields
      const insertData: any = {
        user_id: userId,
        consultation_id: consultationData.id,
        title: strategicData?.consultationData?.businessName 
          ? `${strategicData.consultationData.businessName} Landing Page`
          : `${consultationData.industry} Landing Page`,
        slug,
        sections: generatedSections,
        meta_title: optimizedMeta.title,
        meta_description: optimizedMeta.description,
      };
      
      // Add strategic data if from new consultation flow
      if (fromStrategicConsultation && strategicData) {
        insertData.consultation_data = strategicData.consultationData || {};
        insertData.website_intelligence = strategicData.websiteIntelligence || null;
        insertData.strategy_brief = strategicData.strategyBrief || null;
        console.log("📋 Including strategic consultation data in page record");
      }
      
      const { data: pageData, error } = await supabase
        .from("landing_pages")
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error("❌ Database save error:", error);
        throw error;
      }

      if (pageData) {
        console.log("✅ Page saved successfully:", pageData.id);
        setPageData(pageData);
        setSections(generatedSections);
      }

      // Quick confetti then transition
      setShowConfetti(true);
      await new Promise((resolve) => setTimeout(resolve, 1500));

      console.log("🎉 Transitioning to editor with", generatedSections.length, "sections");
      setPhase("editor");
      setShowConfetti(false);
    } catch (error) {
      console.error("❌ Generation failed:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast({
        title: "Generation failed",
        description: `Error: ${errorMessage}. Please try again.`,
        variant: "destructive",
      });
      navigate("/#demo");
    }
  };

  const generateSections = async (consultationData: any): Promise<Section[]> => {
    // Content Generation Priority:
    // 0. NEW: Generate with strategy brief from strategic consultation (best, most strategic)
    // 1. Pre-generated content from wizard (fastest, already done)
    // 2. Generate with intelligence context (best quality, uses market research + persona)
    // 3. Fallback to old generation without intelligence (backwards compatibility)
    try {
      // PRIORITY 0: Use strategy brief from strategic consultation
      if (fromStrategicConsultation && strategicData?.strategyBrief) {
        console.log('📋 Generating with STRATEGY BRIEF from strategic consultation');
        
        // Generate design system from industry + tone + brand colors
        const structuredBrief = strategicData.structuredBrief;
        const brandSettings = strategicData.brandSettings || strategicData.consultationData?.brandSettings;
        
        // DEBUG: Log brand settings flow
        console.log('🎨 Brand settings from consultationData:', strategicData.consultationData?.brandSettings);
        console.log('🎨 Brand settings from strategicData:', strategicData.brandSettings);
        console.log('🎨 Final brandSettings:', brandSettings);
        
        const ds = generateDesignSystem({
          industry: consultationData.industry || 'default',
          tone: structuredBrief?.tone || 'professional',
          brandOverrides: brandSettings ? {
            primaryColor: brandSettings.primaryColor,
            secondaryColor: brandSettings.secondaryColor,
            extractedColors: strategicData.consultationData?.websiteIntelligence?.brandColors,
          } : strategicData.consultationData?.websiteIntelligence ? {
            primaryColor: strategicData.consultationData.websiteIntelligence.primaryColor,
            extractedColors: strategicData.consultationData.websiteIntelligence.colors,
          } : undefined,
        });
        setDesignSystem(ds);
        setCssVariables(designSystemToCSSVariables(ds));
        console.log('🎨 Generated design system:', ds);
        console.log('🎨 Design system primary color:', ds.colors.primary);
        console.log('🎨 Brand override applied:', brandSettings?.modified ? 'customized' : 'default');
        
        const { data: result, error } = await supabase.functions.invoke('generate-page-content', {
          body: {
            strategyBrief: strategicData.strategyBrief,
            structuredBrief: strategicData.structuredBrief || null,
            strategicConsultation: strategicData.consultationData,
            industry: consultationData.industry,
            pageType: strategicData.consultationData?.pageType || null, // CRITICAL: Pass pageType for beta sections
          }
        });
        
        console.log('[Generate] Passed pageType to generator:', strategicData.consultationData?.pageType);
        
        if (error) {
          console.warn('⚠️ Strategy brief generation failed:', error);
        } else if (result?.success && result?.content) {
          console.log('✅ Strategy brief generated content:', result.content);
          console.log('📐 Page structure from brief:', result.content.pageStructure);
          return await mapStrategyBriefContentToSections(result.content, consultationData, strategicData.consultationData);
        }
      }
      
      // Generate fallback design system for non-strategic flows
      if (!designSystem) {
        const ds = generateDesignSystem({
          industry: consultationData.industry || 'default',
          tone: 'professional',
        });
        setDesignSystem(ds);
        setCssVariables(designSystemToCSSVariables(ds));
        console.log('🎨 Generated fallback design system:', ds.id);
      }

      // PRIORITY 1: Use pre-generated content from wizard if available
      if (preGeneratedContent) {
        console.log('✅ Using pre-generated content from wizard');
        return await mapGeneratedContentToSections(preGeneratedContent, consultationData);
      }

      // PRIORITY 2: Generate with intelligence if available
      if (intelligence) {
        console.log('🧠 Generating with market intelligence');
        const result = await generateIntelligentContent(
          {
            industry: consultationData.industry,
            targetAudience: consultationData.target_audience,
            serviceType: consultationData.service_type,
            challenge: consultationData.challenge,
            goal: consultationData.goal,
            uniqueValue: consultationData.unique_value,
            offer: consultationData.offer,
          },
          intelligence
        );

        if (result.success && result.content) {
          console.log('✅ Intelligence-generated content:', result.content);
          return await mapGeneratedContentToSections(result.content, consultationData);
        } else {
          console.warn('⚠️ Intelligence generation failed, falling back:', result.error);
        }
      }

      // PRIORITY 3: Use old intelligent content generation (no persona)
      const { generateIntelligentContent: oldGenerate } = await import("@/lib/generateIntelligentContent");

      console.log("🚀 Starting fallback content generation...");
      const generated = await oldGenerate({
        industry: consultationData.industry,
        service_type: consultationData.service_type,
        goal: consultationData.goal,
        target_audience: consultationData.target_audience,
        challenge: consultationData.challenge,
        unique_value: consultationData.unique_value,
        offer: consultationData.offer,
      });

      console.log("✅ Generated content with sections:", generated.sections);
      return await mapOldGeneratedContent(generated, consultationData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("❌ AI CONTENT GENERATION FAILED:", {
        error: errorMessage,
        fullError: error,
      });

      // Show error to user
      toast({
        title: "AI Content Generation Failed",
        description: `Error: ${errorMessage}. Using template content instead.`,
        variant: "destructive",
      });

      // Fallback to template-based generation
      return await generateFallbackSections(consultationData);
    }
  };

  // Map new GeneratedContent format to Section[]
  const mapGeneratedContentToSections = async (
    content: GeneratedContent, 
    consultationData: any
  ): Promise<Section[]> => {
    // Fetch images
    const heroImageUrl = await fetchHeroImage(content.images?.hero || consultationData.industry);
    const galleryImages = await fetchGalleryImages(content.images?.gallery || []);

    const sections: Section[] = [];
    let order = 0;

    // Hero - NO hardcoded trust badges
    sections.push({
      type: "hero",
      order: order++,
      visible: true,
      content: {
        headline: content.headline,
        subheadline: content.subheadline,
        ctaText: content.ctaText,
        ctaLink: "#signup",
        backgroundImage: heroImageUrl,
        // trustBadges deliberately omitted - no fabrication
      },
    });

    // Stats Bar (after hero) - use clean statistics from generated content or intelligence
    let statisticsToShow: Array<{ value: string; label: string; source?: string }> = [];
    
    // First priority: use statistics from generated content
    if (content.statistics && Array.isArray(content.statistics) && content.statistics.length > 0) {
      statisticsToShow = content.statistics.slice(0, 3);
    } 
    // Fallback: try to extract from intelligence claims
    else if (intelligence?.marketResearch?.claims) {
      const statClaims = intelligence.marketResearch.claims
        .filter((c: any) => c.category === 'statistic')
        .slice(0, 3);
      
      statisticsToShow = statClaims.map((stat: any) => {
        // Try to parse "21,714 wedding businesses" -> { value: "21,714", label: "wedding businesses" }
        const match = stat.claim.match(/^([\d,.$%]+(?:[KMB])?)\s+(.*)$/i);
        if (match) {
          return { value: match[1], label: match[2], source: stat.source };
        }
        // If no match, try to find number anywhere
        const numMatch = stat.claim.match(/([\d,.$%]+(?:[KMB])?)/);
        if (numMatch) {
          const label = stat.claim.replace(numMatch[0], '').trim();
          return { value: numMatch[1], label: label || 'Market statistic', source: stat.source };
        }
        return null;
      }).filter(Boolean);
    }
    
    if (statisticsToShow.length > 0) {
      sections.push({
        type: "stats-bar",
        order: order++,
        visible: true,
        content: {
          statistics: statisticsToShow,
        },
      });
    }

    // Problem-Solution
    sections.push({
      type: "problem-solution",
      order: order++,
      visible: true,
      content: {
        problem: content.problemStatement,
        solution: content.solutionStatement,
      },
    });

    // Features
    sections.push({
      type: "features",
      order: order++,
      visible: true,
      content: {
        features: content.features,
      },
    });

    // Gallery (if we have images)
    if (galleryImages.length > 0) {
      sections.push({
        type: "photo-gallery",
        order: order++,
        visible: true,
        content: {
          images: galleryImages,
          title: `${consultationData.industry} Gallery`,
        },
      });
    }

    // Social Proof with testimonial (no duplicate stats)
    sections.push({
      type: "social-proof",
      order: order++,
      visible: true,
      content: {
        stats: [], // Stats are shown in stats-bar section
        industry: consultationData.industry,
        testimonial: {
          quote: content.socialProof || `${consultationData.industry} professionals across the region trust us for their most important needs.`,
          name: "Sarah M.",
          title: "Satisfied Customer",
          company: "",
          rating: 5,
        },
      },
    });

    // FAQ Section (from aiSeoData if available)
    const aiSeoData = consultationData.aiSeoData || consultationData.ai_seo_data;
    if (isAISeoDataValid(aiSeoData) && aiSeoData.faqItems?.length > 0) {
      const faqConfig = createFAQSectionConfig(aiSeoData.faqItems);
      sections.push({
        ...faqConfig,
        order: order++,
      });
      console.log('✅ Added FAQ section with', aiSeoData.faqItems.length, 'items');
    }

    // Final CTA
    sections.push({
      type: "final-cta",
      order: order++,
      visible: true,
      content: {
        headline: "Ready to Get Started?",
        ctaText: content.ctaText,
        ctaLink: "#signup",
      },
    });

    return sections;
  };

  // Map strategy brief generated content to Section[]
  // BRIEF-FIRST: Uses the new strict mapper that treats structuredBrief as single source of truth
  const mapStrategyBriefContentToSections = async (
    content: any,
    consultationData: any,
    strategicConsultation: any
  ): Promise<Section[]> => {
    const businessName = strategicConsultation?.businessName || consultationData.industry || 'Our Company';
    const pageType = strategicConsultation?.pageType || null;
    
    console.log('[mapStrategyBriefContentToSections] pageType:', pageType);
    
    // Fetch hero image
    const heroImageUrl = await fetchHeroImage(businessName);

    // Get brand settings for passing to sections
    const brandSettings = strategicConsultation?.brandSettings || effectiveNavState?.strategicData?.brandSettings;
    const logoUrl = brandSettings?.logoUrl || strategicConsultation?.websiteIntelligence?.logoUrl || null;
    const primaryColor = brandSettings?.primaryColor || designSystem?.colors?.primary || null;
    
    console.log('🖼️ Logo URL for sections:', logoUrl);
    console.log('🎨 Primary color for sections:', primaryColor);

    // Check if content is a valid structured brief
    if (isStructuredBriefContent(content)) {
      console.log('📋 Using BRIEF-FIRST mapper with structuredBrief');
      console.log('📐 Page structure:', content.pageStructure);
      console.log('📊 Proof points:', content.proofPoints);
      console.log('🎯 Messaging pillars:', content.messagingPillars?.length);
      console.log('📄 Page type:', pageType);
      
      // Use the strict brief-first mapper - NO FABRICATION
      const sections = mapBriefToSections(content, {
        businessName,
        heroImageUrl,
        logoUrl,
        primaryColor,
        pageType, // CRITICAL: Pass pageType for beta sections
      });
      
      console.log(`✅ Brief-first mapper built ${sections.length} sections`);
      return sections;
    }
    
    // Fallback for legacy content format that doesn't match StructuredBrief
    console.log('⚠️ Content is not a valid StructuredBrief, using legacy mapping');
    return mapLegacyStrategyContent(content, consultationData, strategicConsultation, heroImageUrl);
  };
  
  // Legacy mapping for non-structured brief content
  const mapLegacyStrategyContent = async (
    content: any,
    consultationData: any,
    strategicConsultation: any,
    heroImageUrl: string
  ): Promise<Section[]> => {
    const sections: Section[] = [];
    let order = 0;
    const businessName = strategicConsultation?.businessName || consultationData.industry;
    
    // CRITICAL: Get pageType for beta section mapping
    const pageType = strategicConsultation?.pageType || consultationData.pageType || null;
    const isBetaPage = pageType === 'beta-prelaunch';
    console.log('🏗️ [mapLegacyStrategyContent] pageType:', pageType, '| isBetaPage:', isBetaPage);
    
    // Get brand settings for passing to sections
    const brandSettings = strategicConsultation?.brandSettings || effectiveNavState?.strategicData?.brandSettings;
    const logoUrl = brandSettings?.logoUrl || strategicConsultation?.websiteIntelligence?.logoUrl || null;
    const primaryColor = brandSettings?.primaryColor || designSystem?.colors?.primary || null;

    // Get page structure from brief - this is our blueprint
    // For beta pages, use beta-specific structure if not provided
    const defaultStructure = isBetaPage 
      ? ['hero', 'features', 'founder', 'waitlist-proof', 'final-cta']
      : ['hero', 'stats-bar', 'problem-solution', 'features', 'faq', 'final-cta'];
    const pageStructure: string[] = content.pageStructure || defaultStructure;
    
    console.log('🏗️ Legacy mapping with structure:', pageStructure);

    // Build statistics from proof points (NO fabrication)
    const buildStatistics = () => {
      const stats: Array<{ value: string; label: string }> = [];
      
      if (content.proofPoints?.clientCount) {
        const countMatch = content.proofPoints.clientCount.match(/(\d+[\d,+]*)/);
        if (countMatch) {
          stats.push({ value: countMatch[1] + "+", label: "Clients Served" });
        }
      }
      if (content.proofPoints?.yearsInBusiness) {
        const yearsMatch = content.proofPoints.yearsInBusiness.match(/(\d+)/);
        if (yearsMatch) {
          stats.push({ value: yearsMatch[1] + "+", label: "Years Experience" });
        }
      }
      if (content.proofPoints?.otherStats && Array.isArray(content.proofPoints.otherStats)) {
        content.proofPoints.otherStats.forEach((stat: string) => {
          const match = stat.match(/^([\d,.$%]+(?:[KMB+])?)\s+(.*)$/i);
          if (match) {
            stats.push({ value: match[1], label: match[2] });
          }
        });
      }
      
      return stats.slice(0, 4);
    };

    // Iterate through pageStructure and build sections in order
    for (const sectionType of pageStructure) {
      switch (sectionType) {
        case 'hero':
          sections.push({
            type: isBetaPage ? "beta-hero-teaser" : "hero",
            order: order++,
            visible: true,
            content: isBetaPage ? {
              headline: content.headline,
              subheadline: content.subheadline,
              ctaText: content.ctaText || "Get Early Access",
              ctaLink: "#signup",
              backgroundImage: heroImageUrl,
              productName: strategicConsultation?.productName || businessName,
              launchDate: strategicConsultation?.launchDate || null,
              logoUrl,
              primaryColor,
            } : {
              headline: content.headline,
              subheadline: content.subheadline,
              ctaText: content.ctaText || "Get Started",
              ctaLink: "#contact",
              backgroundImage: heroImageUrl,
              logoUrl,
              primaryColor,
            },
          });
          break;

        case 'stats-bar':
          const statistics = buildStatistics();
          // Only render if we have at least 2 real stats
          if (statistics.length >= 2) {
            sections.push({
              type: "stats-bar",
              order: order++,
              visible: true,
              content: { statistics },
            });
          }
          break;

        case 'problem-solution':
          if (content.problemStatement && content.solutionStatement) {
            sections.push({
              type: "problem-solution",
              order: order++,
              visible: true,
              content: {
                problem: content.problemStatement,
                solution: content.solutionStatement,
              },
            });
          }
          break;

        case 'features':
          if (isBetaPage) {
            // Beta pages use beta-perks instead of features
            sections.push({
              type: "beta-perks",
              order: order++,
              visible: true,
              content: {
                headline: "Early Adopter Perks",
                subheadline: "Exclusive benefits for founding members",
                perks: strategicConsultation?.betaPerks || consultationData.betaPerks || ['lifetime-discount', 'founding-member', 'priority-support'],
                scarcityMessage: `Only ${strategicConsultation?.maxSignups || consultationData.maxSignups || 100} spots available`,
              },
            });
          } else if (content.features && content.features.length > 0) {
            sections.push({
              type: "features",
              order: order++,
              visible: true,
              content: {
                title: 'Why Choose Us',
                subtitle: `What sets ${businessName} apart`,
                features: content.features.map((f: any) => ({
                  title: f.title,
                  description: f.description,
                  icon: f.icon || "CheckCircle",
                })),
              },
            });
          }
          break;

        case 'how-it-works':
          if (content.processSteps && content.processSteps.length > 0) {
            sections.push({
              type: "how-it-works",
              order: order++,
              visible: true,
              content: {
                title: 'How It Works',
                subtitle: 'Your path to results',
                steps: content.processSteps,
              },
            });
          }
          break;

        case 'social-proof':
          const testimonials = content.testimonials || [];
          const firstTestimonial = testimonials[0];
          const hasRealTestimonial = firstTestimonial && 
            !firstTestimonial.author?.includes('[') &&
            !firstTestimonial.quote?.includes('[');

          sections.push({
            type: "social-proof",
            order: order++,
            visible: true,
            content: {
              stats: [],
              industry: businessName,
              testimonial: hasRealTestimonial ? {
                quote: firstTestimonial.quote,
                name: firstTestimonial.author,
                title: firstTestimonial.title,
                company: "",
                rating: 5,
              } : undefined,
            },
          });
          break;
          
        case 'founder':
          // Add founder section for beta pages
          const founder = strategicConsultation?.founder || consultationData.founder;
          sections.push({
            type: "founder",
            order: order++,
            visible: true,
            content: {
              name: strategicConsultation?.founderName || founder?.name || 'Founder',
              title: strategicConsultation?.founderTitle || founder?.title || 'Founder & CEO',
              story: strategicConsultation?.founderStory || founder?.story || '',
              credentials: strategicConsultation?.founderCredentials || founder?.credentials || [],
              photo: strategicConsultation?.founderPhoto || founder?.photo || null,
            },
          });
          break;
          
        case 'waitlist-proof':
          // Add waitlist proof section for beta pages
          sections.push({
            type: "waitlist-proof",
            order: order++,
            visible: true,
            content: {
              totalSignups: 0,
              todaySignups: 0,
              spotsRemaining: strategicConsultation?.maxSignups || consultationData.maxSignups || 100,
            },
          });
          break;

        case 'faq':
          // Use objections as FAQ if available
          if (content.faqItems && content.faqItems.length > 0) {
            sections.push({
              type: "faq",
              order: order++,
              visible: true,
              content: {
                title: "Frequently Asked Questions",
                items: content.faqItems.map((faq: any) => ({
                  question: faq.question,
                  answer: faq.answer,
                })),
              },
            });
          }
          break;

        case 'final-cta':
          sections.push({
            type: isBetaPage ? "beta-final-cta" : "final-cta",
            order: order++,
            visible: true,
            content: isBetaPage ? {
              headline: "Join the Waitlist",
              subheadline: "Be first to experience the future",
              ctaText: content.ctaText || "Get Early Access",
              ctaLink: "#signup",
              spotsRemaining: strategicConsultation?.maxSignups || consultationData.maxSignups || 100,
              primaryColor,
            } : {
              headline: "Ready to Get Started?",
              subheadline: content.solutionStatement?.split(".")[0] || "",
              ctaText: content.ctaText || "Get Started",
              ctaLink: "#contact",
              primaryColor,
            },
          });
          break;

        default:
          console.warn(`⚠️ Unknown section type in pageStructure: ${sectionType}`);
      }
    }

    console.log(`✅ Legacy mapper built ${sections.length} sections from pageStructure (isBeta: ${isBetaPage})`);
    return sections;
  };

  // Map old generation format
  const mapOldGeneratedContent = async (generated: any, consultationData: any): Promise<Section[]> => {
    const heroImageUrl = await fetchHeroImage(generated.images?.hero || consultationData.industry);
    const galleryImages = await fetchGalleryImages(generated.images?.gallery || []);
    
    // CRITICAL: Get pageType for beta section mapping
    const pageType = consultationData.pageType || 
                     effectiveNavState?.strategicData?.consultationData?.pageType ||
                     null;
    const isBetaPage = pageType === 'beta-prelaunch';
    console.log('🔧 [mapOldGeneratedContent] pageType:', pageType, '| isBetaPage:', isBetaPage);

    // Helper function for secondary CTA text
    const getSecondaryCTAText = (type: string): string => {
      const texts: Record<string, string> = {
        'see-demo': 'See How It Works',
        'explore-features': 'Explore Features',
        'view-cases': 'View Case Studies',
        'get-guide': "Get the Buyer's Guide",
        'talk-customer': 'Talk to a Customer',
      };
      return texts[type] || '';
    };

    let mappedSections: Section[] = generated.sections.map((sectionType: string, index: number) => {
      switch (sectionType) {
        case "hero":
          return {
            type: isBetaPage ? "beta-hero-teaser" : "hero",
            order: index,
            visible: true,
            content: {
              headline: generated.headline,
              // USE identitySentence as subheadline if provided
              subheadline: consultationData.identitySentence || generated.subheadline,
              ctaText: isBetaPage ? "Get Early Access" : generated.ctaText,
              ctaLink: "#signup",
              backgroundImage: heroImageUrl,
              productName: consultationData.productName || consultationData.businessName || consultationData.industry,
              launchDate: consultationData.launchDate || null,
              // ADD secondary CTA
              secondaryCTA: consultationData.secondaryCTA && consultationData.secondaryCTA !== 'none' ? {
                type: consultationData.secondaryCTA,
                text: consultationData.secondaryCTA === 'custom' 
                  ? consultationData.secondaryCTACustom 
                  : getSecondaryCTAText(consultationData.secondaryCTA),
              } : null,
            },
          };
        case "features":
          return {
            type: isBetaPage ? "beta-perks" : "features",
            order: index,
            visible: true,
            content: isBetaPage ? {
              headline: "Early Adopter Perks",
              subheadline: "Exclusive benefits for founding members",
              perks: consultationData.betaPerks || ['lifetime-discount', 'founding-member', 'priority-support'],
              scarcityMessage: `Only ${consultationData.maxSignups || 100} spots available`,
            } : { features: generated.features },
          };
        case "problem-solution":
          return {
            type: "problem-solution",
            order: index,
            visible: true,
            content: {
              // Use painSpike as the problem if provided
              problem: consultationData.painSpike || generated.problemStatement,
              solution: generated.solutionStatement,
            },
          };
        case "photo_gallery":
          return {
            type: "photo-gallery",
            order: index,
            visible: true,
            content: {
              images: galleryImages,
              title: `${consultationData.industry} Gallery`,
            },
          };
        case "testimonials":
          return {
            type: "social-proof",
            order: index,
            visible: true,
            content: {
              stats: [{ label: generated.socialProof, value: "" }],
              industry: consultationData.industry,
              // NEW: Concrete proof story callout
              proofStory: consultationData.concreteProofStory || null,
              proofStoryContext: consultationData.proofStoryContext || null,
            },
          };
        case "final_cta":
          return {
            type: isBetaPage ? "beta-final-cta" : "final-cta",
            order: index,
            visible: true,
            content: isBetaPage ? {
              headline: "Join the Waitlist",
              subheadline: "Be first to experience the future",
              ctaText: generated.ctaText || "Get Early Access",
              ctaLink: "#signup",
              spotsRemaining: consultationData.maxSignups || 100,
            } : {
              headline: "Ready to Get Started?",
              ctaText: generated.ctaText,
              ctaLink: "#signup",
            },
          };
        default:
          return {
            type: sectionType,
            order: index,
            visible: true,
            content: { title: sectionType.replace(/_/g, " ").toUpperCase() },
          };
      }
    });

    // FOR BETA PAGES: Filter and enhance
    if (isBetaPage) {
      console.log('🔧 [mapOldGeneratedContent] Filtering for beta page');
      
      // 1. REMOVE sections that don't belong on beta pages
      const betaExcludedTypes = ['video_hero', 'video-hero', 'process_timeline', 'process-timeline', 'stats_bar', 'stats-bar', 'social-proof', 'testimonials', 'problem-solution', 'photo-gallery', 'photo_gallery', 'faq'];
      mappedSections = mappedSections.filter(section => {
        const excluded = betaExcludedTypes.includes(section.type);
        if (excluded) {
          console.log('🔧 [mapOldGeneratedContent] Removing excluded section:', section.type);
        }
        return !excluded;
      });

      // 2. ADD founder section if data exists - check multiple possible locations
      const founderObj = consultationData.founder || {};
      const founderName = founderObj.name || consultationData.founderName || null;
      const founderTitle = founderObj.title || consultationData.founderTitle || null;
      const founderStory = founderObj.story || consultationData.founderStory || null;
      const founderCredentials = founderObj.credentials || consultationData.founderCredentials || [];
      const founderPhoto = founderObj.photo || consultationData.founderPhoto || null;
      
      console.log('🔧 [mapOldGeneratedContent] Founder check - name:', founderName, '| story:', !!founderStory);
      
      if (founderName || founderStory) {
        console.log('🔧 [mapOldGeneratedContent] Adding founder section');
        // Insert before final CTA
        const ctaIndex = mappedSections.findIndex(s => s.type === 'beta-final-cta');
        const founderSection: Section = {
          type: 'founder',
          order: ctaIndex >= 0 ? ctaIndex : mappedSections.length,
          visible: true,
          content: {
            name: founderName || 'Founder',
            title: founderTitle || 'Founder & CEO',
            story: founderStory || '',
            credentials: founderCredentials,
            photo: founderPhoto,
          },
        };
        if (ctaIndex >= 0) {
          mappedSections.splice(ctaIndex, 0, founderSection);
        } else {
          mappedSections.push(founderSection);
        }
      }

      // 3. ADD waitlist-proof section
      console.log('🔧 [mapOldGeneratedContent] Adding waitlist-proof section');
      const ctaIndex = mappedSections.findIndex(s => s.type === 'beta-final-cta');
      const waitlistSection: Section = {
        type: 'waitlist-proof',
        order: ctaIndex >= 0 ? ctaIndex : mappedSections.length,
        visible: true,
        content: {
          totalSignups: 0,
          todaySignups: 0,
          spotsRemaining: consultationData.maxSignups || 100,
        },
      };
      if (ctaIndex >= 0) {
        mappedSections.splice(ctaIndex, 0, waitlistSection);
      } else {
        mappedSections.push(waitlistSection);
      }

      // 4. UPDATE beta-perks to use consultation data perks
      const perksSection = mappedSections.find(s => s.type === 'beta-perks');
      if (perksSection && consultationData.betaPerks && consultationData.betaPerks.length > 0) {
        console.log('🔧 [mapOldGeneratedContent] Using consultation perks:', consultationData.betaPerks);
        perksSection.content.perks = consultationData.betaPerks;
      }

      // 5. REORDER sections
      mappedSections = mappedSections.map((section, index) => ({
        ...section,
        order: index,
      }));

      console.log('🔧 [mapOldGeneratedContent] Final beta sections:', mappedSections.map(s => s.type));
    }

    // ADD differentiator callout if sharpDifferentiator exists
    if (consultationData.sharpDifferentiator) {
      console.log('🔧 [mapOldGeneratedContent] Adding differentiator callout');
      // Insert after hero (index 1)
      const diffSection: Section = {
        type: 'differentiator-callout',
        order: 1,
        visible: true,
        content: {
          text: consultationData.sharpDifferentiator,
        },
      };
      mappedSections.splice(1, 0, diffSection);
    }

    // ADD audience-fit section if audienceExclusion or target_audience exists
    if (consultationData.audienceExclusion || consultationData.target_audience) {
      console.log('🔧 [mapOldGeneratedContent] Adding audience-fit section');
      // Insert before final CTA
      const ctaIndex = mappedSections.findIndex(s => s.type === 'final-cta' || s.type === 'beta-final-cta');
      const audienceSection: Section = {
        type: 'audience-fit',
        order: ctaIndex >= 0 ? ctaIndex : mappedSections.length,
        visible: true,
        content: {
          forWho: consultationData.target_audience || null,
          notForWho: consultationData.audienceExclusion || null,
        },
      };
      if (ctaIndex >= 0) {
        mappedSections.splice(ctaIndex, 0, audienceSection);
      } else {
        mappedSections.push(audienceSection);
      }
    }

    // ADD how-it-works if methodologySteps exists
    const methodologySteps = consultationData.methodologySteps?.filter((s: string) => s && s.trim());
    if (methodologySteps && methodologySteps.length > 0) {
      console.log('🔧 [mapOldGeneratedContent] Adding how-it-works from methodology steps');
      // Check if how-it-works already exists
      const existingHowItWorks = mappedSections.findIndex(s => s.type === 'how-it-works');
      if (existingHowItWorks === -1) {
        // Insert before social-proof or final-cta
        const socialIndex = mappedSections.findIndex(s => s.type === 'social-proof');
        const insertIndex = socialIndex >= 0 ? socialIndex : mappedSections.length - 1;
        
        const howItWorksSection: Section = {
          type: 'how-it-works',
          order: insertIndex,
          visible: true,
          content: {
            title: 'How It Works',
            subtitle: 'What happens in the first 30 days',
            steps: methodologySteps.map((step: string, i: number) => ({
              number: i + 1,
              title: `Week ${i + 1}${i === 2 ? '-4' : ''}`,
              description: step,
            })),
          },
        };
        mappedSections.splice(insertIndex, 0, howItWorksSection);
      }
    }

    // REORDER all sections after insertions
    mappedSections = mappedSections.map((section, index) => ({
      ...section,
      order: index,
    }));

    return mappedSections;
  };

  // Fetch hero image from Unsplash
  const fetchHeroImage = async (query: string): Promise<string> => {
    try {
      const { data } = await supabase.functions.invoke("unsplash-search", {
        body: { query: `${query} professional`, count: 1 },
      });
      return data?.results?.[0]?.urls?.regular || "";
    } catch {
      return "";
    }
  };

  // Fetch gallery images from Unsplash
  const fetchGalleryImages = async (queries: string[]): Promise<string[]> => {
    if (!queries.length) return [];
    try {
      const results = await Promise.allSettled(
        queries.slice(0, 3).map(query =>
          supabase.functions.invoke("unsplash-search", {
            body: { query, count: 1 },
          })
        )
      );
      return results
        .filter((r) => r.status === "fulfilled")
        .map((r) => (r as any).value?.data?.results?.[0]?.urls?.regular)
        .filter(Boolean);
    } catch {
      return [];
    }
  };

  // Fallback template generation
  const generateFallbackSections = async (consultationData: any): Promise<Section[]> => {
    // CRITICAL: Get pageType for beta section mapping
    const pageType = consultationData.pageType || 
                     effectiveNavState?.strategicData?.consultationData?.pageType ||
                     null;
    const isBetaPage = pageType === 'beta-prelaunch';
    console.log('🚀 [generateFallbackSections] pageType:', pageType, '| isBetaPage:', isBetaPage);
    
    const {
      generateHeadline: genHeadline,
      generateSubheadline,
      generateFeatures: genFeatures,
      generateSocialProof: genSocialProof,
      generateCTA,
    } = await import("@/lib/contentGenerator");

    const headline = genHeadline(consultationData);
    const subheadline = generateSubheadline(consultationData);
    const features = genFeatures(consultationData);
    const cta = generateCTA(consultationData);
    const socialProof = await genSocialProof(consultationData);
    const problemStatement = transformProblemStatement(consultationData.challenge);
    const solutionStatement = transformSolutionStatement(consultationData.unique_value, consultationData.industry);

    // BETA PAGE: Use beta-specific section types
    if (isBetaPage) {
      console.log('🚀 [generateFallbackSections] Building BETA sections');
      const sections: Section[] = [
        {
          type: "beta-hero-teaser",
          order: 0,
          visible: true,
          content: { 
            headline, 
            subheadline, 
            ctaText: cta.text || "Get Early Access", 
            ctaLink: "#signup",
            productName: consultationData.productName || consultationData.businessName || consultationData.industry,
            launchDate: consultationData.launchDate || null,
          },
        },
        {
          type: "beta-perks",
          order: 1,
          visible: true,
          content: {
            headline: "Early Adopter Perks",
            subheadline: "Exclusive benefits for founding members",
            perks: consultationData.betaPerks || ['lifetime-discount', 'founding-member', 'priority-support'],
            scarcityMessage: `Only ${consultationData.maxSignups || 100} spots available`,
          },
        },
      ];
      
      // Add founder section if founder data exists
      if (consultationData.founderName || consultationData.founder) {
        console.log('🚀 [generateFallbackSections] Adding founder section');
        sections.push({
          type: "founder",
          order: sections.length,
          visible: true,
          content: {
            name: consultationData.founderName || consultationData.founder?.name || 'Founder',
            title: consultationData.founderTitle || consultationData.founder?.title || 'Founder & CEO',
            story: consultationData.founderStory || consultationData.founder?.story || '',
            credentials: consultationData.founderCredentials || consultationData.founder?.credentials || [],
            photo: consultationData.founderPhoto || consultationData.founder?.photo || null,
          },
        });
      }
      
      // Add waitlist proof section
      sections.push({
        type: "waitlist-proof",
        order: sections.length,
        visible: true,
        content: {
          totalSignups: 0,
          todaySignups: 0,
          spotsRemaining: consultationData.maxSignups || 100,
        },
      });
      
      // Add beta final CTA
      sections.push({
        type: "beta-final-cta",
        order: sections.length,
        visible: true,
        content: { 
          headline: "Join the Waitlist", 
          subheadline: "Be first to experience the future",
          ctaText: cta.text || "Get Early Access", 
          ctaLink: "#signup",
          spotsRemaining: consultationData.maxSignups || 100,
        },
      });
      
      console.log('🚀 [generateFallbackSections] Built', sections.length, 'beta sections:', sections.map(s => s.type));
      return sections;
    }

    // STANDARD PAGE: Use standard section types
    console.log('🚀 [generateFallbackSections] Building STANDARD sections');
    return [
      {
        type: "hero",
        order: 0,
        visible: true,
        content: { headline, subheadline, ctaText: cta.text, ctaLink: "#signup" },
      },
      {
        type: "problem-solution",
        order: 1,
        visible: true,
        content: { problem: problemStatement, solution: solutionStatement },
      },
      {
        type: "features",
        order: 2,
        visible: true,
        content: { features },
      },
      {
        type: "social-proof",
        order: 3,
        visible: true,
        content: { ...socialProof, industry: consultationData.industry },
      },
      {
        type: "final-cta",
        order: 4,
        visible: true,
        content: { headline: "Ready to Get Started?", ctaText: cta.text, ctaLink: "#signup" },
      },
    ];
  };

  // Handle regeneration with intelligence
  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const consultationData = effectiveNavState?.consultationData || consultation;
      
      const result = await generateIntelligentContent(
        {
          industry: consultationData.industry,
          targetAudience: consultationData.target_audience,
          serviceType: consultationData.service_type,
          challenge: consultationData.challenge,
          goal: consultationData.goal,
          uniqueValue: consultationData.unique_value,
          offer: consultationData.offer,
        },
        intelligence
      );

      if (result.success && result.content) {
        const newSections = await mapGeneratedContentToSections(result.content, consultationData);
        setSections(newSections);
        toast({
          title: "Content Regenerated",
          description: intelligence 
            ? "New content generated using market intelligence" 
            : "New content generated",
        });
      } else {
        throw new Error(result.error || "Regeneration failed");
      }
    } catch (err) {
      console.error("Regeneration error:", err);
      toast({
        title: "Regeneration Failed",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  // Handle regeneration of a single section
  const handleRegenerateSection = async (sectionType: string) => {
    setIsRegenerating(true);
    
    try {
      const consultationData = effectiveNavState?.consultationData || consultation;
      
      // Build intelligence context for the API
      const intelligenceContext = intelligence ? {
        persona: {
          name: intelligence.synthesizedPersona?.name,
          primaryPain: intelligence.synthesizedPersona?.painPoints?.[0]?.pain,
          primaryDesire: intelligence.synthesizedPersona?.desires?.[0]?.desire,
          keyObjections: intelligence.synthesizedPersona?.objections?.map((o: any) => o.objection),
          languagePatterns: intelligence.synthesizedPersona?.languagePatterns,
        },
        market: {
          topPainPoints: intelligence.marketResearch?.painPoints,
          keyStatistics: intelligence.marketResearch?.claims?.map((c: any) => c.claim),
        }
      } : null;
      
      // Get current section content for context
      const currentSection = sections.find(s => s.type === sectionType);
      
      // Call edge function for section-specific regeneration
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: {
          action: 'regenerate_section',
          sectionType,
          consultationData: {
            industry: consultationData.industry,
            target_audience: consultationData.target_audience,
            service_type: consultationData.service_type,
            challenge: consultationData.challenge,
            goal: consultationData.goal,
            unique_value: consultationData.unique_value,
            offer: consultationData.offer,
          },
          intelligenceContext,
          currentContent: currentSection?.content
        }
      });
      
      if (error) throw error;
      
      if (data?.success && data?.content) {
        // Update just that section
        setSections(prev => prev.map(section => 
          section.type === sectionType 
            ? { ...section, content: { ...section.content, ...data.content } }
            : section
        ));
        
        // Save to undo history
        pushHistory(sections);
        
        toast({
          title: 'Section Regenerated',
          description: `${sectionType.replace(/-/g, ' ')} updated with fresh content`,
        });
      } else {
        throw new Error(data?.error || 'Regeneration failed');
      }
    } catch (err) {
      console.error('Section regeneration error:', err);
      toast({
        title: 'Regeneration Failed',
        description: err instanceof Error ? err.message : 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleAutoSave = async () => {
    if (!pageData) return;

    setIsSaving(true);
    const { error } = await supabase
      .from("landing_pages")
      .update({ sections, updated_at: new Date().toISOString() })
      .eq("id", pageData.id);

    if (error) {
      console.error("Auto-save failed:", error);
    } else {
      console.log("✓ Auto-saved");
    }
    
    // Show saved indicator for 2 seconds
    setTimeout(() => setIsSaving(false), 2000);
  };

  const handleSave = async () => {
    if (!pageData) return;

    const { error } = await supabase
      .from("landing_pages")
      .update({ sections, updated_at: new Date().toISOString() })
      .eq("id", pageData.id);

    if (error) {
      toast({
        title: "Save failed",
        description: "Could not save changes. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "✓ Saved",
        description: "Your changes have been saved.",
      });
    }
  };

  const handleUndo = () => {
    const previousState = undo();
    if (previousState) {
      setSections(previousState);
      toast({
        title: "Undone",
        description: "Reverted to previous version",
      });
    }
  };

  const handleRedo = () => {
    const nextState = redo();
    if (nextState) {
      setSections(nextState);
      toast({
        title: "Redone",
        description: "Restored next version",
      });
    }
  };

  const updateSections = (newSections: Section[]) => {
    setSections(newSections);
    pushHistory(newSections);
  };

  const handlePreview = () => {
    if (pageData) {
      window.open(`/preview/${pageData.slug}`, "_blank");
    }
  };

  // Phase 1: Loading
  if (phase === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f0a1f] via-[#1a1332] to-[#0f0a1f] relative overflow-hidden">
        {/* Ambient orbs */}
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        
        <div className="text-center space-y-8 max-w-md px-4 relative z-10">
          <div className="flex justify-center">
            <Loader2 className="w-16 h-16 text-cyan-400 animate-spin" />
          </div>

          <h2 className="text-2xl font-bold text-white">Crafting your page...</h2>

          <div className="space-y-4">
            {loadingMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 transition-opacity duration-300 ${
                  progress > (i / loadingMessages.length) * 100 ? "opacity-100" : "opacity-30"
                }`}
              >
                <msg.icon className="w-5 h-5 text-cyan-400" />
                <span className="text-gray-300">{msg.text}</span>
              </div>
            ))}
          </div>

          <div className="w-full bg-white/10 backdrop-blur-sm rounded-full h-2">
            <div
              className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  // Phase 2: Building animation - Premium loader
  if (phase === "building") {
    return (
      <PageGenerationLoader consultation={consultation} />
    );
  }

  // Phase 3: Editor
  return (
    <EditingProvider>
      <EditorContent
        consultation={consultation}
        pageData={pageData}
        sections={sections}
        setSections={updateSections}
        handleSave={handleSave}
        handleUndo={handleUndo}
        handleRedo={handleRedo}
        canUndo={canUndo}
        canRedo={canRedo}
        isSaving={isSaving}
        handlePreview={handlePreview}
        publishModalOpen={publishModalOpen}
        setPublishModalOpen={setPublishModalOpen}
        aiConsultantOpen={aiConsultantOpen}
        setAiConsultantOpen={setAiConsultantOpen}
        stylePickerOpen={stylePickerOpen}
        setStylePickerOpen={setStylePickerOpen}
        calculatorUpgradeOpen={calculatorUpgradeOpen}
        setCalculatorUpgradeOpen={setCalculatorUpgradeOpen}
        intelligence={intelligence}
        preGeneratedContent={preGeneratedContent}
        isRegenerating={isRegenerating}
        handleRegenerate={handleRegenerate}
        handleRegenerateSection={handleRegenerateSection}
        landingPageBestPractices={landingPageBestPractices}
        strategicData={strategicData}
        cssVariables={cssVariables}
        designSystem={designSystem}
        seoData={seoData}
      />
    </EditingProvider>
  );
}

function EditorContent({
  consultation,
  pageData,
  sections,
  setSections,
  handleSave,
  handleUndo,
  handleRedo,
  canUndo,
  canRedo,
  isSaving,
  handlePreview,
  publishModalOpen,
  setPublishModalOpen,
  aiConsultantOpen,
  setAiConsultantOpen,
  stylePickerOpen,
  setStylePickerOpen,
  calculatorUpgradeOpen,
  setCalculatorUpgradeOpen,
  intelligence,
  preGeneratedContent,
  isRegenerating,
  handleRegenerate,
  handleRegenerateSection,
  landingPageBestPractices,
  strategicData,
  cssVariables,
  designSystem,
  seoData,
}: any) {
  const { toast } = useToast();
  const { pageStyle, setPageStyle } = useEditing();
  
  // Get current user
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id || null);
      setUserEmail(user?.email || null);
    });
  }, []);

  // AI Actions usage tracking (pass email for dev mode detection)
  const aiActions = useAIActions(userId, userEmail);
  const { credits } = useCredits(userId);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [zeroBalanceModalOpen, setZeroBalanceModalOpen] = useState(false);
  const [usageHistoryOpen, setUsageHistoryOpen] = useState(false);
  const [upgradeDrawerOpen, setUpgradeDrawerOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    type: AIActionType;
    cost: number;
    callback: () => void;
    sectionType?: string;
  } | null>(null);
  const [showLowBalanceAlert, setShowLowBalanceAlert] = useState(false);

  // Show low balance alert when needed
  useEffect(() => {
    if (aiActions.isLowBalance && !aiActions.isZeroBalance) {
      setShowLowBalanceAlert(true);
    }
  }, [aiActions.isLowBalance, aiActions.isZeroBalance]);

  // Wrapper function to check and track AI actions
  const executeWithUsageCheck = async (
    actionType: AIActionType,
    callback: () => void,
    sectionType?: string
  ) => {
    // DEV MODE or Agency tier: Always allow, skip confirmation
    if (aiActions.devMode || aiActions.isUnlimited) {
      if (aiActions.devMode) {
        console.log(`[DEV MODE] Executing ${actionType} without credit check`);
      }
      callback();
      return;
    }

    const check = aiActions.checkAction(actionType);
    
    if (!check.allowed) {
      setZeroBalanceModalOpen(true);
      return;
    }

    // Skip confirmation if user opted out
    if (aiActions.dontShowConfirm) {
      const result = await aiActions.trackAction(actionType, pageData?.id, sectionType);
      if (result.allowed) {
        callback();
      } else {
        setZeroBalanceModalOpen(true);
      }
      return;
    }

    // Show confirmation modal
    setPendingAction({
      type: actionType,
      cost: check.cost,
      callback,
      sectionType,
    });
    setConfirmModalOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!pendingAction) return;
    
    setConfirmModalOpen(false);
    
    const result = await aiActions.trackAction(
      pendingAction.type,
      pageData?.id,
      pendingAction.sectionType
    );
    
    if (result.allowed) {
      pendingAction.callback();
    } else {
      setZeroBalanceModalOpen(true);
    }
    
    setPendingAction(null);
  };

  // Wrapped handlers with usage tracking
  const handleRegenerateWithUsage = () => {
    executeWithUsageCheck('page_generation', handleRegenerate);
  };

  const handleRegenerateSectionWithUsage = (sectionType: string) => {
    executeWithUsageCheck('section_regeneration', () => handleRegenerateSection(sectionType), sectionType);
  };

  const handleStyleChangeWithUsage = (style: StylePresetName) => {
    executeWithUsageCheck('style_change', () => {
      setPageStyle(style);
      const styleNames: Record<StylePresetName, string> = {
        premium: 'Premium',
        minimal: 'Minimal', 
        bold: 'Bold',
        elegant: 'Elegant'
      };
      toast({
        title: `Style applied: ${styleNames[style] || style}`,
        description: "Your page now uses the new design preset",
      });
    });
  };

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        if (canRedo) handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, handleUndo, handleRedo]);

  const handleAddCalculator = async (config: { type: string; inputs: string[] }) => {
    // Add calculator section to the page
    const newCalculatorSection = {
      type: "calculator",
      order: 2,
      visible: true,
      content: config,
    };

    // Insert calculator after problem-solution section
    const updatedSections = [...sections];
    updatedSections.splice(2, 0, newCalculatorSection);

    // Reorder remaining sections
    updatedSections.forEach((section, index) => {
      section.order = index;
    });

    setSections(updatedSections);

    // Save to database
    if (pageData) {
      await supabase.from("landing_pages").update({ sections: updatedSections }).eq("id", pageData.id);
    }

    toast({
      title: "Calculator added!",
      description: "Your interactive calculator has been added to the page.",
    });
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-[#0f0a1f] via-[#1a1332] to-[#0f0a1f] relative overflow-hidden">
      {/* SEO Head - inject meta tags and schema markup */}
      {seoData && <SEOHead seo={seoData} />}
      
      {/* Ambient orbs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
      
      {/* Top toolbar */}
      <header className="h-14 border-b border-white/10 backdrop-blur-md bg-white/5 flex items-center justify-between px-4 relative z-10">
        <div className="flex items-center gap-4">
          <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img src={logo} alt="PageConsult AI" className="h-8 w-auto" />
          </a>
          
          {/* Dev Mode Indicator */}
          {aiActions.devMode && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/40">
              <span className="text-xs font-medium text-yellow-400">🛠️ DEV MODE</span>
            </div>
          )}
          
          {/* Usage Indicator */}
          {userId && !aiActions.loading && !aiActions.devMode && (
            <UsageIndicator
              available={aiActions.available}
              limit={aiActions.limit}
              percentRemaining={aiActions.percentRemaining}
              daysUntilReset={aiActions.daysUntilReset}
              isUnlimited={aiActions.isUnlimited}
              isPro={aiActions.isPro}
              rollover={aiActions.usage?.ai_actions_rollover}
              onClick={() => setUsageHistoryOpen(true)}
            />
          )}
          
          {/* Intelligence badge */}
          {intelligence && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/20 border border-purple-500/30">
              <Brain className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-purple-300">
                Persona: {intelligence.synthesizedPersona?.name || "Custom"}
              </span>
              {preGeneratedContent?.intelligenceUsed?.confidenceScore > 0 && (
                <span className="text-xs text-purple-400/80">
                  ({Math.round(preGeneratedContent.intelligenceUsed.confidenceScore * 100)}%)
                </span>
              )}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Regenerate button */}
          {intelligence && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRegenerateWithUsage}
              disabled={isRegenerating}
              className="gap-2 bg-purple-500/10 border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
            >
              {isRegenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Wand2 className="w-4 h-4" />
              )}
              Regenerate
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleUndo}
            disabled={!canUndo}
            className="gap-2 bg-white/5 border-white/10 text-white hover:bg-white/10 disabled:opacity-30"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRedo}
            disabled={!canRedo}
            className="gap-2 bg-white/5 border-white/10 text-white hover:bg-white/10 disabled:opacity-30"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" />
          </Button>
          <div className="w-px h-6 bg-white/10 mx-1" />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setStylePickerOpen(true)}
            className="gap-2 relative pl-5 builder-button change-style-btn bg-white/5 border-white/10 text-white hover:bg-white/10"
          >
            <span className="absolute left-0 top-0 w-1 h-full bg-purple-500 rounded-l"></span>
            <Palette className="w-4 h-4" />
            Change Style
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            className="relative pl-5 builder-button save-draft-btn bg-white/5 border-white/10 text-white hover:bg-white/10"
          >
            <span className="absolute left-0 top-0 w-1 h-full bg-yellow-500 rounded-l"></span>
            {isSaving ? "Saving..." : "Save Draft"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreview}
            className="relative pl-5 builder-button preview-btn bg-white/5 border-white/10 text-white hover:bg-white/10"
          >
            <span className="absolute left-0 top-0 w-1 h-full bg-cyan-500 rounded-l"></span>
            Preview
          </Button>
          <Button
            size="sm"
            onClick={() => setPublishModalOpen(true)}
            className="relative pl-5 builder-button publish-btn bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white border-0"
          >
            <span className="absolute left-0 top-0 w-1 h-full bg-green-500 rounded-l"></span>
            Publish
          </Button>
        </div>
      </header>

      {/* Editor layout */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* Left sidebar with Credits + Persona Insights + Section Manager */}
        <div className="w-72 border-r border-white/10 bg-white/5 backdrop-blur-md flex flex-col overflow-hidden">
          {/* Credit Display */}
          {userId && !aiActions.loading && (
            <div className="p-3 border-b border-white/10">
              <CreditDisplay
                available={credits.available}
                total={credits.total}
                resetDate={credits.resetDate}
                isUnlimited={credits.isUnlimited}
                onUpgrade={() => setUpgradeDrawerOpen(true)}
                onGetMoreActions={() => setUpgradeDrawerOpen(true)}
              />
            </div>
          )}
          
          {/* Persona Insights Panel */}
          {intelligence?.synthesizedPersona && (
            <PersonaInsightsPanel 
              intelligence={intelligence} 
              landingPageBestPractices={landingPageBestPractices}
            />
          )}
          
          {/* Section Manager */}
          <div className="flex-1 overflow-auto">
            <SectionManager
              sections={sections}
              onSectionsChange={setSections}
              onSave={handleSave}
              onAddCalculator={() => setCalculatorUpgradeOpen(true)}
              onRegenerateSection={handleRegenerateSectionWithUsage}
              isRegenerating={isRegenerating}
              actionCost={1}
            />
          </div>
        </div>
        
        <LivePreview 
          sections={sections} 
          onSectionsChange={setSections} 
          cssVariables={cssVariables}
          iconStyle={designSystem?.components?.iconStyle}
        />
      </div>

      {/* Strategy Brief Panel - Fixed to right edge */}
      <StrategyBriefPanel
        brief={strategicData?.strategyBrief || (pageData?.strategy_brief as string | null) || null}
        businessName={strategicData?.consultationData?.businessName || (pageData?.consultation_data as any)?.businessName}
      />

      <PublishModal
        open={publishModalOpen}
        onOpenChange={setPublishModalOpen}
        pageData={pageData}
        onPublish={() => {
          toast({
            title: "🎉 Your Page is Live!",
            description: "Your landing page has been published successfully.",
          });
        }}
      />

      <AIConsultantSidebar
        isOpen={aiConsultantOpen}
        onClose={() => setAiConsultantOpen(false)}
        pageContent={{
          headline: sections.find((s) => s.type === "hero")?.content?.headline,
          subheadline: sections.find((s) => s.type === "hero")?.content?.subheadline,
          features: sections.find((s) => s.type === "features")?.content?.features,
          cta: sections.find((s) => s.type === "hero")?.content?.cta?.text,
          industry: consultation?.industry,
          serviceType: consultation?.service_type,
          targetAudience: consultation?.target_audience,
        }}
        onApplySuggestion={(suggestion) => {
          // TODO: Implement applying AI suggestions
          console.log("Apply suggestion:", suggestion);
        }}
      />

      <StylePicker
        open={stylePickerOpen}
        onOpenChange={setStylePickerOpen}
        currentStyle={pageStyle}
        onStyleSelect={handleStyleChangeWithUsage}
      />

      <CalculatorUpgradeModal
        open={calculatorUpgradeOpen}
        onOpenChange={setCalculatorUpgradeOpen}
        onAddCalculator={handleAddCalculator}
        industry={consultation?.industry}
      />

      {/* Usage Tracking Modals */}
      <ActionConfirmModal
        isOpen={confirmModalOpen}
        onClose={() => {
          setConfirmModalOpen(false);
          setPendingAction(null);
        }}
        onConfirm={handleConfirmAction}
        actionType={pendingAction?.type || 'section_regeneration'}
        actionCost={pendingAction?.cost || 1}
        remaining={aiActions.available}
        dontShowAgain={aiActions.dontShowConfirm}
        onDontShowAgainChange={aiActions.setDontShowConfirm}
      />

      <ZeroBalanceModal
        isOpen={zeroBalanceModalOpen}
        onClose={() => setZeroBalanceModalOpen(false)}
        onRequestGrace={aiActions.requestGraceActions}
        graceAlreadyUsed={aiActions.usage?.grace_actions_given || false}
      />

      <UsageHistoryModal
        isOpen={usageHistoryOpen}
        onClose={() => setUsageHistoryOpen(false)}
        usageLog={aiActions.usageLog}
        available={aiActions.available}
        limit={aiActions.limit}
        rollover={aiActions.usage?.ai_actions_rollover || 0}
        isPro={aiActions.isPro}
        daysUntilReset={aiActions.daysUntilReset}
      />

      {showLowBalanceAlert && aiActions.isLowBalance && !aiActions.isZeroBalance && (
        <LowBalanceAlert
          remaining={aiActions.available}
          onUpgrade={() => setUpgradeDrawerOpen(true)}
          onDismiss={() => setShowLowBalanceAlert(false)}
        />
      )}

      <UpgradeDrawer
        open={upgradeDrawerOpen}
        onOpenChange={setUpgradeDrawerOpen}
        currentPlan={credits.plan}
        currentUsage={{ used: credits.used, total: credits.total }}
        onSelectPlan={(planId) => {
          console.log('Selected plan:', planId);
          // TODO: Connect to Stripe checkout
          toast({
            title: "Redirecting to checkout...",
            description: `Upgrading to ${planId} plan`,
          });
        }}
        onPurchaseActions={(amount) => {
          console.log('Purchase actions:', amount);
          // TODO: Connect to Stripe checkout
          toast({
            title: "Redirecting to checkout...",
            description: `Purchasing ${amount} actions`,
          });
        }}
      />
    </div>
  );
}
