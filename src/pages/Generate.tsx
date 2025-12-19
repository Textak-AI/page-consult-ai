import { useEffect, useState, useCallback } from "react";
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
import type { PersonaIntelligence, GeneratedContent } from "@/services/intelligence/types";
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
  
  // Intelligence data from wizard or strategic consultation
  const navigationState = location.state as {
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
    };
    fromStrategicConsultation?: boolean;
  } | null;
  
  const isDevMode = navigationState?.devMode === true;
  const fromStrategicConsultation = navigationState?.fromStrategicConsultation === true;
  const strategicData = navigationState?.strategicData || null;
  
  const [intelligence, setIntelligence] = useState<PersonaIntelligence | null>(
    navigationState?.intelligenceData || null
  );
  const [preGeneratedContent, setPreGeneratedContent] = useState<GeneratedContent | null>(
    navigationState?.generatedContentData || null
  );
  // Landing page best practices from market research
  const [landingPageBestPractices, setLandingPageBestPractices] = useState<any>(
    navigationState?.landingPageBestPractices || null
  );
  const [isRegenerating, setIsRegenerating] = useState(false);

  const loadingMessages = [
    { icon: Check, text: "Analyzing your strategy" },
    { icon: Check, text: "Writing compelling copy" },
    { icon: Check, text: "Optimizing for conversion" },
  ];

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

      // SECOND: Check if data was passed from demo via React Router state
      const demoData = location.state?.consultationData;

      console.log('🔍 Generate page load - checking for consultation data...');
      console.log('📦 location.state:', location.state);
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
      
      // Prepare insert data with optional strategic fields
      const insertData: any = {
        user_id: userId,
        consultation_id: consultationData.id,
        title: strategicData?.consultationData?.businessName 
          ? `${strategicData.consultationData.businessName} Landing Page`
          : `${consultationData.industry} Landing Page`,
        slug,
        sections: generatedSections,
        meta_title: `${consultationData.offer} - ${consultationData.industry}`,
        meta_description: consultationData.unique_value,
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
        
        const { data: result, error } = await supabase.functions.invoke('generate-page-content', {
          body: {
            strategyBrief: strategicData.strategyBrief,
            strategicConsultation: strategicData.consultationData,
            industry: consultationData.industry,
          }
        });
        
        if (error) {
          console.warn('⚠️ Strategy brief generation failed:', error);
        } else if (result?.success && result?.content) {
          console.log('✅ Strategy brief generated content:', result.content);
          return await mapStrategyBriefContentToSections(result.content, consultationData, strategicData.consultationData);
        }
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

    // Hero
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
        trustBadges: ["100% Satisfaction Guarantee", "Same-Day Response", "Award-Winning Service"],
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
  const mapStrategyBriefContentToSections = async (
    content: any,
    consultationData: any,
    strategicConsultation: any
  ): Promise<Section[]> => {
    // Fetch images
    const heroImageUrl = await fetchHeroImage(
      strategicConsultation?.businessName || consultationData.industry
    );
    const galleryImages = await fetchGalleryImages([]);

    const sections: Section[] = [];
    let order = 0;

    // Build trust badges from social proof
    const trustBadges: string[] = [];
    if (content.socialProof?.yearsInBusiness) {
      trustBadges.push(`${content.socialProof.yearsInBusiness} in Business`);
    }
    if (content.socialProof?.clientCount) {
      trustBadges.push(`${content.socialProof.clientCount} Clients Served`);
    }
    if (content.socialProof?.achievements) {
      trustBadges.push(content.socialProof.achievements);
    }

    // Hero
    sections.push({
      type: "hero",
      order: order++,
      visible: true,
      content: {
        headline: content.headline,
        subheadline: content.subheadline,
        ctaText: content.ctaText || strategicConsultation?.ctaText || "Get Started",
        ctaLink: "#signup",
        backgroundImage: heroImageUrl,
        trustBadges: trustBadges.length > 0 ? trustBadges : undefined,
      },
    });

    // Stats Bar (from social proof)
    const statisticsToShow: Array<{ value: string; label: string }> = [];
    if (content.socialProof?.clientCount) {
      const countMatch = content.socialProof.clientCount.match(/(\d+[\d,+]*)/);
      if (countMatch) {
        statisticsToShow.push({
          value: countMatch[1] + "+",
          label: "Happy Clients",
        });
      }
    }
    if (content.socialProof?.yearsInBusiness) {
      const yearsMatch = content.socialProof.yearsInBusiness.match(/(\d+)/);
      if (yearsMatch) {
        statisticsToShow.push({
          value: yearsMatch[1] + "+",
          label: "Years Experience",
        });
      }
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
    if (content.features && content.features.length > 0) {
      sections.push({
        type: "features",
        order: order++,
        visible: true,
        content: {
          features: content.features.map((f: any) => ({
            title: f.title,
            description: f.description,
            icon: f.icon || "CheckCircle",
          })),
        },
      });
    }

    // Process Steps (if provided - from processDescription)
    if (content.processSteps && content.processSteps.length > 0) {
      sections.push({
        type: "how-it-works",
        order: order++,
        visible: true,
        content: {
          steps: content.processSteps,
        },
      });
    }

    // Gallery (if we have images)
    if (galleryImages.length > 0) {
      sections.push({
        type: "photo-gallery",
        order: order++,
        visible: true,
        content: {
          images: galleryImages,
          title: `${strategicConsultation?.businessName || consultationData.industry} Gallery`,
        },
      });
    }

    // Social Proof with testimonials - use actual testimonials or placeholder format
    const testimonials = content.testimonials || [];
    const firstTestimonial = testimonials[0] || {
      quote: "[Testimonial will be added - describe the transformation your client experienced]",
      author: "[Client Name]",
      title: "[Their Role/Company]",
    };

    sections.push({
      type: "social-proof",
      order: order++,
      visible: true,
      content: {
        stats: [],
        industry: strategicConsultation?.industry || consultationData.industry,
        testimonial: {
          quote: firstTestimonial.quote,
          name: firstTestimonial.author,
          title: firstTestimonial.title,
          company: "",
          rating: 5,
        },
        additionalTestimonials: testimonials.slice(1),
      },
    });

    // Final CTA
    sections.push({
      type: "final-cta",
      order: order++,
      visible: true,
      content: {
        headline: "Ready to Get Started?",
        subheadline: content.solutionStatement?.split(".")[0] || "Take the next step today.",
        ctaText: content.ctaText || strategicConsultation?.ctaText || "Get Started",
        ctaLink: "#signup",
      },
    });

    return sections;
  };

  // Map old generation format
  const mapOldGeneratedContent = async (generated: any, consultationData: any): Promise<Section[]> => {
    const heroImageUrl = await fetchHeroImage(generated.images?.hero || consultationData.industry);
    const galleryImages = await fetchGalleryImages(generated.images?.gallery || []);

    const mappedSections: Section[] = generated.sections.map((sectionType: string, index: number) => {
      switch (sectionType) {
        case "hero":
          return {
            type: "hero",
            order: index,
            visible: true,
            content: {
              headline: generated.headline,
              subheadline: generated.subheadline,
              ctaText: generated.ctaText,
              ctaLink: "#signup",
              backgroundImage: heroImageUrl,
            },
          };
        case "features":
          return {
            type: "features",
            order: index,
            visible: true,
            content: { features: generated.features },
          };
        case "problem-solution":
          return {
            type: "problem-solution",
            order: index,
            visible: true,
            content: {
              problem: generated.problemStatement,
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
            },
          };
        case "final_cta":
          return {
            type: "final-cta",
            order: index,
            visible: true,
            content: {
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
      const consultationData = navigationState?.consultationData || consultation;
      
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
      const consultationData = navigationState?.consultationData || consultation;
      
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
        
        <LivePreview sections={sections} onSectionsChange={setSections} />
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
