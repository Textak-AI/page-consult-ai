import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Check, Sparkles, Wand2, Palette } from "lucide-react";
import { SectionManager } from "@/components/editor/SectionManager";
import { LivePreview } from "@/components/editor/LivePreview";
import { PublishModal } from "@/components/editor/PublishModal";
import { AIConsultantSidebar } from "@/components/editor/AIConsultantSidebar";
import { CalculatorUpgradeModal } from "@/components/editor/CalculatorUpgradeModal";
import { StylePicker } from "@/components/editor/StylePicker";
import { EditingProvider, useEditing } from "@/contexts/EditingContext";
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
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
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

  const loadingMessages = [
    { icon: Check, text: "Analyzing your strategy" },
    { icon: Check, text: "Writing compelling copy" },
    { icon: Check, text: "Optimizing for conversion" },
  ];

  useEffect(() => {
    loadConsultation();
  }, []);

  const loadConsultation = async () => {
    try {
      // FIRST: Check if data was passed from demo via React Router state
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

      // Create page in database
      const slug = `${consultationData.industry?.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`;
      console.log("💾 Saving page to database with slug:", slug);
      
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
    try {
      // Use new intelligent content generation
      const { generateIntelligentContent } = await import("@/lib/generateIntelligentContent");

      console.log("🚀 Starting intelligent content generation...");
      const generated = await generateIntelligentContent({
        industry: consultationData.industry,
        service_type: consultationData.service_type,
        goal: consultationData.goal,
        target_audience: consultationData.target_audience,
        challenge: consultationData.challenge,
        unique_value: consultationData.unique_value,
        offer: consultationData.offer,
      });

      console.log("✅ Generated content with sections:", generated.sections);
      console.log("🖼️ Image queries:", generated.images);

      // Fetch all images in parallel for speed
      const imagePromises: Promise<any>[] = [];

      // Hero image
      imagePromises.push(
        supabase.functions.invoke("unsplash-search", {
          body: { query: generated.images.hero || `${consultationData.industry} professional`, count: 1 },
        }),
      );

      // Gallery images (limit to 3 for speed)
      const galleryQueries = generated.images.gallery?.slice(0, 3) || [];
      for (const query of galleryQueries) {
        imagePromises.push(
          supabase.functions.invoke("unsplash-search", {
            body: { query, count: 1 },
          }),
        );
      }

      // Wait for all images in parallel (much faster!)
      const imageResults = await Promise.allSettled(imagePromises);

      const heroImageUrl =
        imageResults[0]?.status === "fulfilled" ? imageResults[0].value?.data?.results?.[0]?.urls?.regular || "" : "";

      const galleryImages: string[] = imageResults
        .slice(1)
        .filter((r) => r.status === "fulfilled")
        .map((r) => (r as any).value?.data?.results?.[0]?.urls?.regular)
        .filter(Boolean);

      // Map generated sections to Section format
      const mappedSections: Section[] = generated.sections.map((sectionType, index) => {
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
              content: {
                features: generated.features,
              },
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
            // For other section types, create placeholder
            return {
              type: sectionType,
              order: index,
              visible: true,
              content: {
                title: sectionType.replace(/_/g, " ").toUpperCase(),
              },
            };
        }
      });

      return mappedSections;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("❌ AI CONTENT GENERATION FAILED:", {
        error: errorMessage,
        fullError: error,
      });

      // Show error to user instead of silently falling back
      toast({
        title: "AI Content Generation Failed",
        description: `Error: ${errorMessage}. Using template content instead.`,
        variant: "destructive",
      });

      // Fallback to template-based generation
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
          content: {
            headline,
            subheadline,
            ctaText: cta.text,
            ctaLink: "#signup",
          },
        },
        {
          type: "problem-solution",
          order: 1,
          visible: true,
          content: {
            problem: problemStatement,
            solution: solutionStatement,
          },
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
          content: {
            ...socialProof,
            industry: consultationData.industry,
          },
        },
        {
          type: "final-cta",
          order: 4,
          visible: true,
          content: {
            headline: "Ready to Get Started?",
            ctaText: cta.text,
            ctaLink: "#signup",
          },
        },
      ];
    }
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
      <div className="min-h-screen flex bg-gradient-to-br from-[#0f0a1f] via-[#1a1332] to-[#0f0a1f] relative overflow-hidden">
        {/* Ambient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        
        <div className="w-1/3 p-8 border-r border-white/10 flex items-center justify-center relative z-10">
          <div className="space-y-4 bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
            <h3 className="text-xl font-bold mb-4 text-white">📄 Your Strategy</h3>
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
              <div className="mt-6 space-y-2 text-gray-400">
                <p>Building your page with:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Strategic headline</li>
                  <li>6 conversion sections</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 p-8 relative overflow-hidden z-10">
          <div className="space-y-4">
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
        setSections={setSections}
        handleSave={handleSave}
        handlePreview={handlePreview}
        publishModalOpen={publishModalOpen}
        setPublishModalOpen={setPublishModalOpen}
        aiConsultantOpen={aiConsultantOpen}
        setAiConsultantOpen={setAiConsultantOpen}
        stylePickerOpen={stylePickerOpen}
        setStylePickerOpen={setStylePickerOpen}
        calculatorUpgradeOpen={calculatorUpgradeOpen}
        setCalculatorUpgradeOpen={setCalculatorUpgradeOpen}
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
  handlePreview,
  publishModalOpen,
  setPublishModalOpen,
  aiConsultantOpen,
  setAiConsultantOpen,
  stylePickerOpen,
  setStylePickerOpen,
  calculatorUpgradeOpen,
  setCalculatorUpgradeOpen,
}: any) {
  const { toast } = useToast();
  const { pageStyle, setPageStyle } = useEditing();

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
        <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <img src={logo} alt="PageConsult AI" className="h-8 w-auto" />
        </a>
        <div className="flex items-center gap-2">
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
            Save Draft
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
        <SectionManager
          sections={sections}
          onSectionsChange={setSections}
          onSave={handleSave}
          onAddCalculator={() => setCalculatorUpgradeOpen(true)}
        />
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
