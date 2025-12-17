import { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import iconmark from "@/assets/iconmark.svg";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Check, Sparkles, Wand2, Palette, Undo2, Redo2, Brain, Target, User, AlertTriangle, Heart, ShieldAlert, MessageSquare, BarChart3, ChevronDown } from "lucide-react";
import { SectionManager } from "@/components/editor/SectionManager";
import { LivePreview } from "@/components/editor/LivePreview";
import { PublishModal } from "@/components/editor/PublishModal";
import { AIConsultantSidebar } from "@/components/editor/AIConsultantSidebar";
import { CalculatorUpgradeModal } from "@/components/editor/CalculatorUpgradeModal";
import { StylePicker } from "@/components/editor/StylePicker";
import { EditingProvider, useEditing } from "@/contexts/EditingContext";
import { generateIntelligentContent, runIntelligencePipeline } from "@/services/intelligence";
import type { PersonaIntelligence, GeneratedContent } from "@/services/intelligence/types";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import logo from "/logo/whiteAsset_3combimark_darkmode.svg";

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
  
  // Intelligence data from wizard
  const navigationState = location.state as {
    consultationData?: any;
    intelligenceData?: PersonaIntelligence;
    generatedContentData?: GeneratedContent;
  } | null;
  
  const [intelligence, setIntelligence] = useState<PersonaIntelligence | null>(
    navigationState?.intelligenceData || null
  );
  const [preGeneratedContent, setPreGeneratedContent] = useState<GeneratedContent | null>(
    navigationState?.generatedContentData || null
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

      if (demoData) {
        // Data came from demo - use it directly
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
      
      const { data: pageData, error } = await supabase
        .from("landing_pages")
        .insert({
          user_id: userId,
          consultation_id: consultationData.id,
          title: `${consultationData.industry} Landing Page`,
          slug,
          sections: generatedSections,
          meta_title: `${consultationData.offer} - ${consultationData.industry}`,
          meta_description: consultationData.unique_value,
        })
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
    // 1. Pre-generated content from wizard (fastest, already done)
    // 2. Generate with intelligence context (best quality, uses market research + persona)
    // 3. Fallback to old generation without intelligence (backwards compatibility)
    try {
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
      },
    });

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

    // Social Proof
    sections.push({
      type: "social-proof",
      order: order++,
      visible: true,
      content: {
        stats: [{ label: content.socialProof, value: "" }],
        industry: consultationData.industry,
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

  // Phase 2: Building animation
  if (phase === "building") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0f0a1f] via-[#1a1332] to-[#0f0a1f] relative overflow-hidden">
        {/* Ambient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        
        {/* Animated iconmark */}
        <div className="relative z-10 flex flex-col items-center space-y-8">
          <div className="w-32 h-32 animate-pulse">
            <img 
              src={iconmark} 
              alt="Loading" 
              className="w-full h-full object-contain animate-[spin_3s_ease-in-out_infinite]"
            />
          </div>
          
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold text-white animate-fade-in">
              Generating Your Page...
            </h2>
            <p className="text-lg text-gray-300 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Crafting conversion-optimized sections with AI
            </p>
          </div>

          {/* Strategy preview card */}
          <div className="mt-8 space-y-4 bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 animate-fade-in max-w-md" style={{ animationDelay: '0.4s' }}>
            <h3 className="text-lg font-bold text-white">📄 Your Strategy</h3>
            <div className="space-y-2 text-sm">
              <p className="text-gray-300">
                <strong className="text-cyan-400">Industry:</strong> {consultation?.industry}
              </p>
              <p className="text-gray-300">
                <strong className="text-cyan-400">Goal:</strong> {consultation?.goal}
              </p>
              <p className="text-gray-300">
                <strong className="text-cyan-400">Audience:</strong> {consultation?.target_audience?.slice(0, 50)}...
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 p-8 relative overflow-hidden z-10 hidden">
          <div className="space-y-4 hidden">
            {buildStep >= 1 && (
              <div className="animate-slide-up bg-white/5 backdrop-blur-md p-8 rounded-2xl border border-white/10">
                <h1 className="text-4xl font-bold mb-4 text-white">Hero Section</h1>
                <p className="text-gray-400">Headline and CTA</p>
              </div>
            )}
            {buildStep >= 2 && (
              <div className="animate-slide-up bg-white/5 backdrop-blur-md p-8 rounded-2xl border border-white/10">
                <h2 className="text-2xl font-bold text-white">Problem / Solution</h2>
              </div>
            )}
            {buildStep >= 3 && (
              <div className="animate-slide-up bg-white/5 backdrop-blur-md p-8 rounded-2xl border border-white/10">
                <h2 className="text-2xl font-bold text-white">Features</h2>
              </div>
            )}
            {buildStep >= 5 && (
              <div className="animate-slide-up bg-white/5 backdrop-blur-md p-8 rounded-2xl border border-white/10">
                <h2 className="text-2xl font-bold text-white">Social Proof</h2>
              </div>
            )}
            {buildStep >= 6 && (
              <div className="animate-slide-up bg-white/5 backdrop-blur-md p-8 rounded-2xl border border-white/10">
                <h2 className="text-2xl font-bold text-white">Final CTA</h2>
              </div>
            )}
          </div>
        </div>

        {showConfetti && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50 animate-fade-in">
            <div className="bg-white/10 backdrop-blur-xl p-8 rounded-2xl shadow-lg max-w-lg text-center space-y-4 border border-white/20">
              <Sparkles className="w-12 h-12 text-cyan-400 mx-auto" />
              <h2 className="text-3xl font-bold text-white">✨ Your Page is Ready! ✨</h2>
              <p className="text-gray-300">
                Built with strategic headline and 6 conversion-optimized sections
              </p>
            </div>
          </div>
        )}
      </div>
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
}: any) {
  const { toast } = useToast();
  const { pageStyle, setPageStyle } = useEditing();

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
              onClick={handleRegenerate}
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
        {/* Left sidebar with Persona Insights + Section Manager */}
        <div className="w-72 border-r border-white/10 bg-white/5 backdrop-blur-md flex flex-col overflow-hidden">
          {/* Persona Insights Panel */}
          {intelligence?.synthesizedPersona && (
            <Collapsible defaultOpen className="border-b border-white/10">
              <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-2 text-purple-300">
                  <Brain className="w-4 h-4" />
                  <span className="text-sm font-medium">Persona Insights</span>
                </div>
                <ChevronDown className="w-4 h-4 text-purple-400 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent className="px-4 pb-4 space-y-4">
                {/* Persona Name */}
                <div className="flex items-center gap-2 text-white">
                  <User className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm font-semibold">{intelligence.synthesizedPersona.name || "Target Customer"}</span>
                </div>
                
                {/* Primary Pain */}
                {intelligence.synthesizedPersona.painPoints?.[0] && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-red-400">
                      <AlertTriangle className="w-3 h-3" />
                      <span className="text-xs font-medium">Primary Pain</span>
                    </div>
                    <p className="text-xs text-gray-300 pl-4">
                      {intelligence.synthesizedPersona.painPoints[0].pain}
                    </p>
                  </div>
                )}
                
                {/* Primary Desire */}
                {intelligence.synthesizedPersona.desires?.[0] && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-green-400">
                      <Heart className="w-3 h-3" />
                      <span className="text-xs font-medium">Primary Desire</span>
                    </div>
                    <p className="text-xs text-gray-300 pl-4">
                      {intelligence.synthesizedPersona.desires[0].desire}
                    </p>
                  </div>
                )}
                
                {/* Key Objection */}
                {intelligence.synthesizedPersona.objections?.[0] && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-yellow-400">
                      <ShieldAlert className="w-3 h-3" />
                      <span className="text-xs font-medium">Key Objection</span>
                    </div>
                    <p className="text-xs text-gray-300 pl-4">
                      {intelligence.synthesizedPersona.objections[0].objection}
                    </p>
                    {intelligence.synthesizedPersona.objections[0].counterArgument && (
                      <p className="text-xs text-cyan-300 pl-4">
                        → {intelligence.synthesizedPersona.objections[0].counterArgument}
                      </p>
                    )}
                  </div>
                )}
                
                {/* Language Patterns */}
                {intelligence.synthesizedPersona.languagePatterns?.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-purple-400">
                      <MessageSquare className="w-3 h-3" />
                      <span className="text-xs font-medium">They Say Things Like</span>
                    </div>
                    <div className="pl-4 space-y-1">
                      {intelligence.synthesizedPersona.languagePatterns.slice(0, 4).map((phrase: string, i: number) => (
                        <p key={i} className="text-xs text-gray-400 italic">
                          "{phrase}"
                        </p>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Market Stats */}
                {intelligence.marketResearch?.claims?.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-cyan-400">
                      <BarChart3 className="w-3 h-3" />
                      <span className="text-xs font-medium">Market Intelligence</span>
                    </div>
                    <div className="pl-4 space-y-1">
                      {intelligence.marketResearch.claims.slice(0, 2).map((claim: any, i: number) => (
                        <p key={i} className="text-xs text-gray-300">
                          • {claim.claim}
                          {claim.source && (
                            <span className="text-gray-500 ml-1">({claim.source})</span>
                          )}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Confidence Score */}
                {intelligence.confidenceScore > 0 && (
                  <div className="flex items-center justify-between pt-2 border-t border-white/10">
                    <span className="text-xs text-gray-400">Research Confidence</span>
                    <span className={cn(
                      "text-xs font-medium",
                      intelligence.confidenceScore >= 0.8 ? "text-green-400" :
                      intelligence.confidenceScore >= 0.5 ? "text-yellow-400" : "text-red-400"
                    )}>
                      {Math.round(intelligence.confidenceScore * 100)}%
                    </span>
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
          )}
          
          {/* Section Manager */}
          <div className="flex-1 overflow-auto">
            <SectionManager
              sections={sections}
              onSectionsChange={setSections}
              onSave={handleSave}
              onAddCalculator={() => setCalculatorUpgradeOpen(true)}
              onRegenerateSection={handleRegenerateSection}
              isRegenerating={isRegenerating}
            />
          </div>
        </div>
        
        <LivePreview sections={sections} onSectionsChange={setSections} />
      </div>

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
        onStyleSelect={(style) => {
          setPageStyle(style);
          toast({
            title: "Style updated",
            description: `Applied ${style} style to all sections`,
          });
        }}
      />

      <CalculatorUpgradeModal
        open={calculatorUpgradeOpen}
        onOpenChange={setCalculatorUpgradeOpen}
        onAddCalculator={handleAddCalculator}
        industry={consultation?.industry}
      />
    </div>
  );
}
