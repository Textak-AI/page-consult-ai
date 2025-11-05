import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useSession } from "@/contexts/SessionContext";

export default function WizardReview() {
  const navigate = useNavigate();
  const { sessionToken } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [consultationId, setConsultationId] = useState<string | null>(null);
  
  // Form state
  const [industry, setIndustry] = useState("");
  const [goal, setGoal] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [challenge, setChallenge] = useState("");
  const [uniqueValue, setUniqueValue] = useState("");
  const [offer, setOffer] = useState("");

  useEffect(() => {
    loadConsultation();
  }, []);

  const loadConsultation = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/signup");
      return;
    }

    // Load the most recent in-progress or completed consultation
    const { data: consultation, error } = await supabase
      .from("consultations")
      .select("*")
      .eq("user_id", session.user.id)
      .in("status", ["in_progress", "completed"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !consultation) {
      console.error("Error loading consultation:", error);
      toast({
        title: "Error",
        description: "Could not load your consultation. Please try again.",
        variant: "destructive"
      });
      navigate("/wizard");
      return;
    }

    setConsultationId(consultation.id);
    setIndustry(consultation.industry || "");
    setGoal(consultation.goal || "");
    setTargetAudience(consultation.target_audience || "");
    setServiceType(consultation.service_type || "");
    setChallenge(consultation.challenge || "");
    setUniqueValue(consultation.unique_value || "");
    setOffer(consultation.offer || "");
    setLoading(false);
  };

  const handleSaveChanges = async () => {
    if (!consultationId) {
      toast({
        title: "Error",
        description: "Session not found. Please try again.",
        variant: "destructive"
      });
      return;
    }

    // Validate required fields
    if (!industry.trim() || !goal.trim() || !targetAudience.trim() || !challenge.trim() || !uniqueValue.trim() || !offer.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);

    const updates = {
      industry: industry.trim(),
      goal: goal.trim(),
      target_audience: targetAudience.trim(),
      service_type: serviceType.trim() || null,
      challenge: challenge.trim(),
      unique_value: uniqueValue.trim(),
      offer: offer.trim(),
      status: "in_progress"
    };

    const { error } = await supabase
      .from("consultations")
      .update(updates)
      .eq("id", consultationId);

    setSaving(false);

    if (error) {
      console.error("Error saving changes:", error);
      toast({
        title: "Error",
        description: "Could not save changes. Please try again.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "✓ Changes Saved",
      description: "Your consultation has been updated."
    });

    navigate("/wizard");
  };

  const handleBackToSummary = () => {
    navigate("/wizard");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-card">
        <Button variant="ghost" size="sm" onClick={handleBackToSummary}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Summary
        </Button>
        <h1 className="font-bold text-lg">Review & Edit Your Answers</h1>
        <Button onClick={handleSaveChanges} disabled={saving} size="sm">
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-card border border-border rounded-xl p-8 space-y-8">
          <div className="space-y-2">
            <Label htmlFor="industry" className="text-base font-semibold">
              1. What industry are you in?
            </Label>
            <Textarea
              id="industry"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="e.g., B2B SaaS, Professional Services, Healthcare..."
              className="min-h-[80px]"
              maxLength={100}
            />
            <div className="text-xs text-muted-foreground">{industry.length}/100</div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="goal" className="text-base font-semibold">
              2. What's your main goal for this landing page?
            </Label>
            <Textarea
              id="goal"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g., Generate Leads, Drive Sales, Book Meetings..."
              className="min-h-[80px]"
              maxLength={100}
            />
            <div className="text-xs text-muted-foreground">{goal.length}/100</div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetAudience" className="text-base font-semibold">
              3. Who exactly are your ideal clients?
            </Label>
            <Textarea
              id="targetAudience"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="e.g., CFOs at mid-market companies, marketing managers at startups..."
              className="min-h-[120px]"
              maxLength={200}
            />
            <div className="text-xs text-muted-foreground">{targetAudience.length}/200</div>
          </div>

          {serviceType !== null && (
            <div className="space-y-2">
              <Label htmlFor="serviceType" className="text-base font-semibold">
                4. What type of professional service do you provide? (Optional)
              </Label>
              <Textarea
                id="serviceType"
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                placeholder="e.g., driveway replacement, legal services, accounting..."
                className="min-h-[100px]"
                maxLength={100}
              />
              <div className="text-xs text-muted-foreground">{serviceType.length}/100</div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="challenge" className="text-base font-semibold">
              {serviceType ? "5" : "4"}. What's the biggest challenge your audience faces?
            </Label>
            <Textarea
              id="challenge"
              value={challenge}
              onChange={(e) => setChallenge(e.target.value)}
              placeholder="e.g., Wasting 10 hours per week on manual tasks..."
              className="min-h-[120px]"
              maxLength={150}
            />
            <div className="text-xs text-muted-foreground">{challenge.length}/150</div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="uniqueValue" className="text-base font-semibold">
              {serviceType ? "6" : "5"}. What makes your solution uniquely valuable?
            </Label>
            <Textarea
              id="uniqueValue"
              value={uniqueValue}
              onChange={(e) => setUniqueValue(e.target.value)}
              placeholder="e.g., Automates workflows in 5 minutes vs 2 hours manually..."
              className="min-h-[120px]"
              maxLength={200}
            />
            <div className="text-xs text-muted-foreground">{uniqueValue.length}/200</div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="offer" className="text-base font-semibold">
              {serviceType ? "7" : "6"}. What are you offering to capture conversions?
            </Label>
            <Textarea
              id="offer"
              value={offer}
              onChange={(e) => setOffer(e.target.value)}
              placeholder="e.g., Free 14-day trial, Free consultation..."
              className="min-h-[100px]"
              maxLength={150}
            />
            <div className="text-xs text-muted-foreground">{offer.length}/150</div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex gap-4 mt-8 justify-between">
          <Button variant="outline" onClick={handleBackToSummary} size="lg">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Summary
          </Button>
          <Button onClick={handleSaveChanges} disabled={saving} size="lg">
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Everything Looks Good"
            )}
          </Button>
        </div>
      </main>
    </div>
  );
}
