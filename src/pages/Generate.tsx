import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Check, Sparkles } from "lucide-react";
import { SectionManager } from "@/components/editor/SectionManager";
import { LivePreview } from "@/components/editor/LivePreview";
import { PublishModal } from "@/components/editor/PublishModal";

type Phase = "loading" | "building" | "editor";
type Section = {
  type: string;
  order: number;
  visible: boolean;
  content: any;
};

export default function Generate() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [phase, setPhase] = useState<Phase>("loading");
  const [progress, setProgress] = useState(0);
  const [buildStep, setBuildStep] = useState(0);
  const [consultation, setConsultation] = useState<any>(null);
  const [pageData, setPageData] = useState<any>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const loadingMessages = [
    { icon: Check, text: "Analyzing your strategy" },
    { icon: Check, text: "Writing compelling copy" },
    { icon: Check, text: "Configuring calculator" },
    { icon: Check, text: "Optimizing for conversion" },
  ];

  useEffect(() => {
    loadConsultation();
  }, []);

  const loadConsultation = async () => {
    const { data: { user } } = await supabase.auth.getUser();
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
      toast({
        title: "No consultation found",
        description: "Please complete the consultation wizard first.",
        variant: "destructive",
      });
      navigate("/wizard");
      return;
    }

    setConsultation(data);
    startGeneration(data, user.id);
  };

  const startGeneration = async (consultationData: any, userId: string) => {
    // Phase 1: Loading animation (3 seconds)
    for (let i = 0; i <= 3; i++) {
      setTimeout(() => setProgress((i / 3) * 100), i * 750);
    }

    setTimeout(() => {
      setPhase("building");
      animatePageBuild(consultationData, userId);
    }, 3000);
  };

  const animatePageBuild = async (consultationData: any, userId: string) => {
    const generatedSections = generateSections(consultationData);
    
    // Animate each section appearing
    const steps = [0, 1, 2, 3, 4, 5];
    for (let i = 0; i < steps.length; i++) {
      setTimeout(() => setBuildStep(i + 1), i * 500);
    }

    // Show confetti after all sections
    setTimeout(() => setShowConfetti(true), 3200);

    // Create page in database
    setTimeout(async () => {
      const slug = `${consultationData.industry?.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`;
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

      if (!error && pageData) {
        setPageData(pageData);
        setSections(generatedSections);
      }
    }, 3500);

    // Transition to editor
    setTimeout(() => {
      setPhase("editor");
      setShowConfetti(false);
    }, 5500);
  };

  const generateSections = (consultationData: any): Section[] => {
    const sections: Section[] = [
      {
        type: "hero",
        order: 0,
        visible: true,
        content: {
          headline: generateHeadline(consultationData),
          subheadline: consultationData.unique_value,
          ctaText: consultationData.offer || "Get Started",
          ctaLink: "#signup",
          fomo: {
            badge: "🔥 127 people viewed this in the last hour",
            urgency: "Limited spots available - 23 left this month",
          },
        },
      },
      {
        type: "problem-solution",
        order: 1,
        visible: true,
        content: {
          problem: consultationData.challenge,
          solution: consultationData.unique_value,
        },
      },
    ];

    if (consultationData.wants_calculator && consultationData.calculator_config) {
      sections.push({
        type: "calculator",
        order: 2,
        visible: true,
        content: consultationData.calculator_config,
      });
    }

    sections.push(
      {
        type: "features",
        order: 3,
        visible: true,
        content: {
          features: extractFeatures(consultationData.unique_value),
        },
      },
      {
        type: "social-proof",
        order: 4,
        visible: true,
        content: {
          stats: [
            { label: "Active Users Today", value: "2,847" },
            { label: "Avg. ROI Increase", value: "340%" },
            { label: "Customer Retention", value: "98.2%" },
          ],
          recentActivity: [
            { name: "Sarah M.", action: "signed up", time: "2 minutes ago", location: "San Francisco" },
            { name: "James K.", action: "upgraded", time: "5 minutes ago", location: "New York" },
            { name: "Lisa T.", action: "joined", time: "8 minutes ago", location: "Austin" },
          ],
        },
      },
      {
        type: "final-cta",
        order: 5,
        visible: true,
        content: {
          headline: `Ready to ${consultationData.goal?.toLowerCase()}?`,
          ctaText: consultationData.offer || "Get Started Now",
          ctaLink: "#signup",
        },
      }
    );

    return sections;
  };

  const generateHeadline = (data: any) => {
    if (data.target_audience && data.challenge) {
      return `${data.challenge.split(" ").slice(0, 6).join(" ")}`;
    }
    return `Transform Your ${data.industry} Business`;
  };

  const extractFeatures = (uniqueValue: string) => {
    const sentences = uniqueValue.split(/[.!?]+/).filter((s) => s.trim());
    return sentences.slice(0, 6).map((feature, i) => ({
      title: feature.trim().split(" ").slice(0, 4).join(" "),
      description: feature.trim(),
      icon: ["Zap", "Target", "Shield", "TrendingUp", "Users", "Award"][i] || "Check",
    }));
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-8 max-w-md px-4">
          <div className="flex justify-center">
            <Loader2 className="w-16 h-16 text-primary animate-spin" />
          </div>
          
          <h2 className="text-2xl font-bold">Crafting your page...</h2>
          
          <div className="space-y-4">
            {loadingMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 transition-opacity duration-300 ${
                  progress > (i / loadingMessages.length) * 100
                    ? "opacity-100"
                    : "opacity-30"
                }`}
              >
                <msg.icon className="w-5 h-5 text-secondary" />
                <span className="text-muted-foreground">{msg.text}</span>
              </div>
            ))}
          </div>
          
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
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
      <div className="min-h-screen flex bg-background">
        <div className="w-1/3 p-8 border-r flex items-center justify-center">
          <div className="space-y-4">
            <h3 className="text-xl font-bold mb-4">📄 Your Strategy</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Industry:</strong> {consultation?.industry}</p>
              <p><strong>Goal:</strong> {consultation?.goal}</p>
              <p><strong>Audience:</strong> {consultation?.target_audience?.slice(0, 50)}...</p>
              <div className="mt-6 space-y-2 text-muted-foreground">
                <p>Building your page with:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Strategic headline</li>
                  {consultation?.wants_calculator && <li>ROI calculator</li>}
                  <li>6 conversion sections</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 p-8 relative overflow-hidden">
          <div className="space-y-4">
            {buildStep >= 1 && (
              <div className="animate-slide-up bg-card p-8 rounded-lg border">
                <h1 className="text-4xl font-bold mb-4">Hero Section</h1>
                <p className="text-muted-foreground">Headline and CTA</p>
              </div>
            )}
            {buildStep >= 2 && (
              <div className="animate-slide-up bg-card p-8 rounded-lg border">
                <h2 className="text-2xl font-bold">Problem / Solution</h2>
              </div>
            )}
            {buildStep >= 3 && consultation?.wants_calculator && (
              <div className="animate-slide-up bg-card p-8 rounded-lg border">
                <h2 className="text-2xl font-bold">Calculator</h2>
              </div>
            )}
            {buildStep >= 4 && (
              <div className="animate-slide-up bg-card p-8 rounded-lg border">
                <h2 className="text-2xl font-bold">Features</h2>
              </div>
            )}
            {buildStep >= 5 && (
              <div className="animate-slide-up bg-card p-8 rounded-lg border">
                <h2 className="text-2xl font-bold">Social Proof</h2>
              </div>
            )}
            {buildStep >= 6 && (
              <div className="animate-slide-up bg-card p-8 rounded-lg border">
                <h2 className="text-2xl font-bold">Final CTA</h2>
              </div>
            )}
          </div>

          {showConfetti && (
            <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50 animate-fade-in">
              <div className="bg-card p-8 rounded-lg shadow-lg max-w-lg text-center space-y-4">
                <Sparkles className="w-12 h-12 text-secondary mx-auto" />
                <h2 className="text-3xl font-bold">✨ Your Page is Ready! ✨</h2>
                <p className="text-muted-foreground">
                  Built with strategic headline, {consultation?.wants_calculator ? "ROI calculator, " : ""}
                  and 6 conversion-optimized sections
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
    <div className="h-screen flex flex-col bg-background">
      {/* Top toolbar */}
      <header className="h-14 border-b flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <span className="font-bold text-primary">PageConsult AI</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleSave}>
            Save Draft
          </Button>
          <Button variant="outline" size="sm" onClick={handlePreview}>
            Preview
          </Button>
          <Button size="sm" onClick={() => setPublishModalOpen(true)}>
            Publish
          </Button>
        </div>
      </header>

      {/* Editor layout */}
      <div className="flex-1 flex overflow-hidden">
        <SectionManager
          sections={sections}
          onSectionsChange={setSections}
          onSave={handleSave}
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
    </div>
  );
}
