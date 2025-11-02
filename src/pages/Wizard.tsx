import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { MessageCircle, Loader2 } from "lucide-react";

type Message = {
  role: "ai" | "user";
  content: string;
  isTyping?: boolean;
};

type IndustryType = "b2b_saas" | "ecommerce" | "professional" | "healthcare" | "food" | "education" | "real_estate" | "other";
type GoalType = "leads" | "sales" | "signups" | "meetings";

const industries = [
  { id: "b2b_saas", icon: "🖥️", title: "B2B SaaS", subtitle: "Software, platforms" },
  { id: "ecommerce", icon: "🛒", title: "E-commerce", subtitle: "Products, retail" },
  { id: "professional", icon: "💼", title: "Professional Services", subtitle: "Legal, finance" },
  { id: "healthcare", icon: "🏥", title: "Healthcare", subtitle: "Medical, wellness" },
  { id: "food", icon: "🍔", title: "Food & Beverage", subtitle: "Restaurants" },
  { id: "education", icon: "📚", title: "Education", subtitle: "Courses, training" },
  { id: "real_estate", icon: "🏢", title: "Real Estate", subtitle: "Residential, commercial" },
  { id: "other", icon: "✏️", title: "Other", subtitle: "Tell me more..." }
];

const goals = [
  { id: "leads", icon: "📊", title: "Generate Leads", subtitle: "Free trials, demos, consultations" },
  { id: "sales", icon: "💰", title: "Drive Sales", subtitle: "Direct purchases, subscriptions" },
  { id: "signups", icon: "📝", title: "Collect Signups", subtitle: "Newsletter, waitlist, access" },
  { id: "meetings", icon: "📞", title: "Book Meetings", subtitle: "Sales calls, product demos" }
];

export default function Wizard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [consultationId, setConsultationId] = useState<string | null>(null);
  
  // Prevent duplicate initialization in React StrictMode
  const initializedRef = useRef(false);
  
  // Check for pre-filled data from demo
  const demoIndustry = searchParams.get("industry");
  const demoGoal = searchParams.get("goal");
  const demoAudience = searchParams.get("audience");
  const hasPrefilledData = !!(demoIndustry && demoGoal); // Only require industry + goal
  
  const [step, setStep] = useState(1); // Will be updated after loading existing consultation
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  
  const [selectedIndustry, setSelectedIndustry] = useState<IndustryType | null>(
    demoIndustry ? mapDemoIndustryToType(demoIndustry) : null
  );
  const [customIndustry, setCustomIndustry] = useState("");
  const [selectedGoal, setSelectedGoal] = useState<GoalType | null>(
    demoGoal ? mapDemoGoalToType(demoGoal) : null
  );
  const [targetAudience, setTargetAudience] = useState(demoAudience && demoAudience !== "." ? demoAudience : "");
  const [challenge, setChallenge] = useState("");
  const [uniqueValue, setUniqueValue] = useState("");
  const [offer, setOffer] = useState("");
  const [wantsCalculator, setWantsCalculator] = useState<boolean | null>(null);

  // Helper functions to map demo values to wizard types
  function mapDemoIndustryToType(industry: string): IndustryType {
    const map: Record<string, IndustryType> = {
      "B2B SaaS": "b2b_saas",
      "E-commerce": "ecommerce",
      "Professional Services": "professional",
    };
    return map[industry] || "other";
  }

  function mapDemoGoalToType(goal: string): GoalType {
    const map: Record<string, GoalType> = {
      "Generate Leads": "leads",
      "Drive Sales": "sales",
      "Book Meetings": "meetings",
    };
    return map[goal] || "leads";
  }

  useEffect(() => {
    // Prevent double execution in React StrictMode
    if (initializedRef.current) return;
    initializedRef.current = true;
    
    checkAuth();
  }, []);

  const checkAuth = async () => {
    console.log("🔍 Starting checkAuth, hasPrefilledData:", hasPrefilledData);
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/signup");
      return;
    }
    
    setUserId(session.user.id);
    
    // If coming from demo, ALWAYS start fresh
    if (hasPrefilledData) {
      console.log("📝 Demo mode: clearing existing consultations");
      
      // Mark ALL existing consultations as abandoned
      await supabase
        .from("consultations")
        .update({ status: "abandoned" })
        .eq("user_id", session.user.id)
        .eq("status", "in_progress");
      
      // Create fresh consultation with ONLY demo data
      const { data: newConsultation, error } = await supabase
        .from("consultations")
        .insert({ 
          user_id: session.user.id,
          industry: demoIndustry,
          goal: demoGoal,
          ...(demoAudience && demoAudience !== "." ? { target_audience: demoAudience } : {})
        })
        .select()
        .single();
      
      if (error) {
        console.error("❌ Error creating consultation:", error);
        toast({
          title: "Error",
          description: "Failed to start consultation. Please try again.",
          variant: "destructive"
        });
        return;
      }
      
      console.log("✅ Created new consultation:", newConsultation.id);
      setConsultationId(newConsultation.id);
      
      // Determine starting step based on what demo provided
      const startStep = (demoAudience && demoAudience !== ".") ? 4 : 3;
      console.log("📍 Starting at step:", startStep);
      setStep(startStep);
      
      setLoading(false);
      
      // Show SINGLE contextual message
      const audienceText = demoAudience && demoAudience !== "." 
        ? `• Target Audience: ${demoAudience}\n\n` 
        : "";
      
      addAIMessage(
        `Perfect! Based on our demo chat, here's what I understand:\n\n` +
        `• Industry: ${demoIndustry}\n` +
        `• Goal: ${demoGoal}\n` +
        audienceText +
        `Great start! Let me ask ${audienceText ? "4" : "5"} more strategic questions.\n\n` +
        (audienceText 
          ? `What's the biggest challenge or frustration ${demoAudience} face that you solve?\n\n(Be specific - this becomes your compelling headline)`
          : `Who exactly are your ideal clients? Be specific about their role, situation, or what they're looking for.`)
      );
      
      return; // Exit early for demo flow
    }
    
    // Non-demo flow: check for existing consultation
    const { data: existingConsultation } = await supabase
      .from("consultations")
      .select("*")
      .eq("user_id", session.user.id)
      .eq("status", "in_progress")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (existingConsultation) {
      console.log("📂 Resuming existing consultation");
      setConsultationId(existingConsultation.id);
      
      // Load existing answers
      if (existingConsultation.industry) {
        setSelectedIndustry(mapDemoIndustryToType(existingConsultation.industry));
      }
      if (existingConsultation.goal) {
        setSelectedGoal(mapDemoGoalToType(existingConsultation.goal));
      }
      if (existingConsultation.target_audience) {
        setTargetAudience(existingConsultation.target_audience);
      }
      if (existingConsultation.challenge) {
        setChallenge(existingConsultation.challenge);
      }
      if (existingConsultation.unique_value) {
        setUniqueValue(existingConsultation.unique_value);
      }
      if (existingConsultation.offer) {
        setOffer(existingConsultation.offer);
      }
      if (existingConsultation.wants_calculator !== null) {
        setWantsCalculator(existingConsultation.wants_calculator);
      }
      
      // Determine next step based on what's been answered
      let nextStep = 1;
      if (existingConsultation.industry) nextStep = 2;
      if (existingConsultation.goal) nextStep = 3;
      if (existingConsultation.target_audience) nextStep = 4;
      if (existingConsultation.challenge) nextStep = 5;
      if (existingConsultation.unique_value) nextStep = 6;
      if (existingConsultation.offer) nextStep = 7;
      if (existingConsultation.wants_calculator !== null) nextStep = 8;
      
      console.log("📍 Resuming at step:", nextStep);
      setStep(nextStep);
      setLoading(false);
      
      // Show appropriate message for current step
      const stepMessages: Record<number, string> = {
        1: "Hey! I'm excited to help you build a landing page that converts.\n\nBefore we jump into design, let's have a quick strategy chat—this ensures we build exactly what your business needs.\n\nFirst up: What industry are you in?",
        2: "What's your main goal for this landing page?",
        3: "Who exactly are you trying to reach?\n\nBe specific—their role, company type, or situation. The clearer you are, the better I can help.",
        4: `What's the biggest problem or challenge your audience faces that your solution solves?\n\n(This becomes your compelling headline)`,
        5: "What makes your solution uniquely valuable?\n\nWhy should they choose you over alternatives?",
        6: `What are you offering to capture ${existingConsultation.goal || "conversions"}?`,
        7: "Want to add an interactive calculator? These boost conversions by 40%+ because visitors get personalized value.",
        8: "Perfect! I have everything I need. Here's your custom landing page strategy:"
      };
      
      if (stepMessages[nextStep]) {
        addAIMessage(stepMessages[nextStep], 300);
      }
    } else {
      // Create new consultation (non-demo)
      console.log("🆕 Creating new consultation");
      const { data: newConsultation, error } = await supabase
        .from("consultations")
        .insert({ user_id: session.user.id })
        .select()
        .single();
      
      if (error) {
        console.error("❌ Error creating consultation:", error);
        toast({
          title: "Error",
          description: "Failed to start consultation. Please try again.",
          variant: "destructive"
        });
        return;
      }
      
      setConsultationId(newConsultation.id);
      setLoading(false);
      
      addAIMessage(
        "Hey! I'm excited to help you build a landing page that converts.\n\n" +
        "Before we jump into design, let's have a quick strategy chat—this ensures we build exactly what your business needs.\n\n" +
        "First up: What industry are you in?"
      );
    }
  };

  const addAIMessage = (content: string, delay = 800) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => {
        // Prevent duplicate messages
        const messageExists = prev.some(msg => msg.content === content && msg.role === "ai");
        if (messageExists) {
          console.log("⚠️ Duplicate message prevented:", content.substring(0, 50));
          return prev;
        }
        return [...prev, { role: "ai", content }];
      });
    }, delay);
  };

  const addUserMessage = (content: string) => {
    setMessages(prev => [...prev, { role: "user", content }]);
  };

  const saveProgress = async (updates: any) => {
    if (!consultationId) return;
    
    await supabase
      .from("consultations")
      .update(updates)
      .eq("id", consultationId);
  };

  const handleIndustrySelect = async (industry: IndustryType) => {
    setSelectedIndustry(industry);
    
    if (industry !== "other") {
      const selected = industries.find(i => i.id === industry);
      addUserMessage(selected!.title);
      await saveProgress({ industry: selected!.title });
      
      setStep(2);
      
      // Contextual response based on industry
      const responses: Record<string, string> = {
        b2b_saas: "Perfect! SaaS buyers are research-driven and ROI-focused.\n\nWhat's your main goal for this landing page?",
        ecommerce: "Great choice! E-commerce is all about clear product value and easy checkout.\n\nWhat's your main goal for this landing page?",
        professional: "Excellent! Professional services need to build trust and demonstrate expertise.\n\nWhat's your main goal for this landing page?",
        healthcare: "Perfect! Healthcare buyers value credentials, privacy, and clear outcomes.\n\nWhat's your main goal for this landing page?",
        food: "Nice! F&B is about appetite appeal and convenience.\n\nWhat's your main goal for this landing page?",
        education: "Great! Education buyers want transformation and proof of outcomes.\n\nWhat's your main goal for this landing page?",
        real_estate: "Perfect! Real estate is about location, value, and trust.\n\nWhat's your main goal for this landing page?"
      };
      
      addAIMessage(responses[industry]);
    }
  };

  const handleCustomIndustry = async () => {
    if (customIndustry.trim().length < 3) return;
    
    addUserMessage(customIndustry);
    await saveProgress({ industry: customIndustry });
    
    setStep(2);
    addAIMessage("Interesting! For your industry, landing pages need clear value and trust signals.\n\nWhat's your main goal for this landing page?");
  };

  const handleGoalSelect = async (goal: GoalType) => {
    setSelectedGoal(goal);
    const selected = goals.find(g => g.id === goal);
    addUserMessage(selected!.title);
    await saveProgress({ goal: selected!.title });
    
    setStep(3);
    
    const responses: Record<GoalType, string> = {
      leads: "Got it—optimizing for lead conversion.\n\nWho exactly are you trying to reach?\n\nBe specific—their role, company type, or situation. The clearer you are, the better I can help.",
      sales: "Perfect—focused on driving sales.\n\nWho are your ideal buyers?\n\nBe specific about their role, needs, or situation.",
      signups: "Great—building an audience.\n\nWho do you want to attract?\n\nTell me about their interests, role, or what they're looking for.",
      meetings: "Excellent—booking qualified meetings.\n\nWho are you trying to get on a call?\n\nBe specific about their role, company size, or decision-making power."
    };
    
    addAIMessage(responses[goal]);
  };

  const handleAudienceSubmit = async () => {
    if (targetAudience.trim().length < 10) {
      toast({
        title: "Too short",
        description: "Please provide more details about your target audience.",
        variant: "destructive"
      });
      return;
    }
    
    console.log("💬 Submitting audience:", targetAudience);
    addUserMessage(targetAudience);
    await saveProgress({ target_audience: targetAudience });
    
    setStep(4);
    setChallenge(""); // Clear input for next question
    addAIMessage(`Thanks! ${targetAudience.split(" ")[0]}s are worth understanding deeply.\n\nNow here's the key question:\n\nWhat's the biggest problem or challenge your audience faces that your solution solves?\n\n(This becomes your compelling headline)`);
  };

  const handleChallengeSubmit = async () => {
    if (challenge.trim().length < 10) {
      toast({
        title: "Too short",
        description: "Please describe the challenge in more detail.",
        variant: "destructive"
      });
      return;
    }
    
    console.log("💬 Submitting challenge:", challenge);
    addUserMessage(challenge);
    await saveProgress({ challenge });
    
    setStep(5);
    setUniqueValue(""); // Clear input for next question
    addAIMessage("That's a real pain point. Strong foundation for your headline.\n\nWhat makes your solution uniquely valuable?\n\nWhy should they choose you over alternatives?");
  };

  const handleValueSubmit = async () => {
    if (uniqueValue.trim().length < 10) {
      toast({
        title: "Too short",
        description: "Please describe your unique value in more detail.",
        variant: "destructive"
      });
      return;
    }
    
    console.log("💬 Submitting unique value:", uniqueValue);
    addUserMessage(uniqueValue);
    await saveProgress({ unique_value: uniqueValue });
    
    setStep(6);
    setOffer(""); // Clear input for next question
    addAIMessage(`Almost there! What are you offering to capture ${selectedGoal === "leads" ? "leads" : selectedGoal === "sales" ? "sales" : selectedGoal === "signups" ? "signups" : "meetings"}?`);
  };

  const handleOfferSubmit = async () => {
    if (offer.trim().length < 5) {
      toast({
        title: "Too short",
        description: "Please describe your offer.",
        variant: "destructive"
      });
      return;
    }
    
    console.log("💬 Submitting offer:", offer);
    addUserMessage(offer);
    await saveProgress({ offer });
    
    setStep(7);
    addAIMessage(`Perfect offer for ${targetAudience}. That aligns well with your goal.\n\nOne more thing—and this is where it gets interesting.\n\nWant to add an interactive calculator? These boost conversions by 40%+ because visitors get personalized value.\n\nFor your audience, I'd recommend an ROI Calculator.`);
  };

  const handleCalculatorChoice = async (wants: boolean) => {
    setWantsCalculator(wants);
    await saveProgress({ wants_calculator: wants });
    
    if (wants) {
      addUserMessage("Yes, add calculator");
      addAIMessage("✓ Calculator configured! This will be a powerful conversion tool.");
    } else {
      addUserMessage("Not now");
      addAIMessage("No problem! You can always add a calculator later from the editor.");
    }
    
    setTimeout(() => showSummary(), 1500);
  };

  const showSummary = async () => {
    await saveProgress({ status: "completed" });
    setStep(8);
    addAIMessage("Perfect! I have everything I need. Here's your custom landing page strategy:");
  };

  const handleBuildPage = () => {
    navigate("/generate");
  };

  const handleSaveExit = async () => {
    toast({
      title: "✓ Progress saved",
      description: "You can resume this consultation anytime."
    });
    navigate("/");
  };

  const handleStartFresh = async () => {
    if (consultationId) {
      // Mark current consultation as abandoned
      await supabase
        .from("consultations")
        .update({ status: "abandoned" })
        .eq("id", consultationId);
    }
    
    toast({
      title: "Starting fresh",
      description: "Redirecting to homepage..."
    });
    
    // Redirect to homepage to start over
    setTimeout(() => {
      navigate("/");
    }, 500);
  };

  const progressPercentage = (step / 7) * 100;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-card">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-6 h-6 text-primary" />
          <span className="font-bold text-lg">PageConsult AI</span>
        </div>
        
        <div className="flex-1 max-w-md mx-8">
          <div className="text-sm text-muted-foreground mb-1 text-center">
            {step <= 7 ? `Question ${step} of 7` : "Complete"}
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleStartFresh}>
            Start Fresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleSaveExit}>
            Save & Exit
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto py-8 px-4">
          {/* Messages */}
          <div className="space-y-4 mb-8">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground ml-auto"
                      : "bg-muted text-foreground"
                  } animate-fade-in`}
                >
                  <p className="whitespace-pre-line">{message.content}</p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse delay-75" />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse delay-150" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Areas */}
          {!isTyping && (
            <>
              {/* Step 1: Industry Selection */}
              {step === 1 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in">
                  {industries.map((industry) => (
                    <button
                      key={industry.id}
                      onClick={() => handleIndustrySelect(industry.id as IndustryType)}
                      className="bg-card border-2 border-border rounded-xl p-4 text-center hover:-translate-y-1 hover:shadow-lg hover:border-primary transition-all duration-200"
                    >
                      <div className="text-4xl mb-2">{industry.icon}</div>
                      <div className="font-semibold text-sm mb-1">{industry.title}</div>
                      <div className="text-xs text-muted-foreground">{industry.subtitle}</div>
                    </button>
                  ))}
                </div>
              )}

              {selectedIndustry === "other" && step === 1 && (
                <div className="mt-4 space-y-4 animate-fade-in">
                  <Textarea
                    placeholder="e.g., Nonprofit, Government..."
                    value={customIndustry}
                    onChange={(e) => setCustomIndustry(e.target.value)}
                    className="min-h-[60px]"
                  />
                  <Button 
                    onClick={handleCustomIndustry}
                    disabled={customIndustry.trim().length < 3}
                    className="w-full"
                  >
                    Continue
                  </Button>
                </div>
              )}

              {/* Step 2: Goal Selection */}
              {step === 2 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                  {goals.map((goal) => (
                    <button
                      key={goal.id}
                      onClick={() => handleGoalSelect(goal.id as GoalType)}
                      className="bg-card border-2 border-border rounded-xl p-6 text-left hover:-translate-y-1 hover:shadow-lg hover:border-primary transition-all duration-200"
                    >
                      <div className="text-4xl mb-3">{goal.icon}</div>
                      <div className="font-semibold mb-1">{goal.title}</div>
                      <div className="text-sm text-muted-foreground">{goal.subtitle}</div>
                    </button>
                  ))}
                </div>
              )}

              {/* Step 3: Target Audience */}
              {step === 3 && (
                <div className="space-y-4 animate-fade-in">
                  <Textarea
                    placeholder="e.g., CFOs at mid-market companies, marketing managers at startups, small business owners in retail..."
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    maxLength={200}
                    className="min-h-[120px]"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {targetAudience.length}/200
                    </span>
                    {targetAudience.length >= 10 && (
                      <span className="text-sm text-green-600">✓ That's specific and powerful!</span>
                    )}
                  </div>
                  <Button 
                    onClick={handleAudienceSubmit}
                    disabled={targetAudience.trim().length < 10}
                    className="w-full"
                  >
                    Continue
                  </Button>
                </div>
              )}

              {/* Step 4: Challenge */}
              {step === 4 && (
                <div className="space-y-4 animate-fade-in">
                  <Textarea
                    placeholder="e.g., Wasting 10 hours per week on manual tasks, Struggling to prove ROI to leadership..."
                    value={challenge}
                    onChange={(e) => setChallenge(e.target.value)}
                    maxLength={150}
                    className="min-h-[120px]"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {challenge.length}/150
                    </span>
                  </div>
                  <Button 
                    onClick={handleChallengeSubmit}
                    disabled={challenge.trim().length < 10}
                    className="w-full"
                  >
                    Continue
                  </Button>
                </div>
              )}

              {/* Step 5: Unique Value */}
              {step === 5 && (
                <div className="space-y-4 animate-fade-in">
                  <Textarea
                    placeholder="e.g., Automates workflows in 5 minutes vs 2 hours manually, Integrates with existing tools..."
                    value={uniqueValue}
                    onChange={(e) => setUniqueValue(e.target.value)}
                    maxLength={200}
                    className="min-h-[120px]"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {uniqueValue.length}/200
                    </span>
                  </div>
                  <Button 
                    onClick={handleValueSubmit}
                    disabled={uniqueValue.trim().length < 10}
                    className="w-full"
                  >
                    Continue
                  </Button>
                </div>
              )}

              {/* Step 6: Offer */}
              {step === 6 && (
                <div className="space-y-4 animate-fade-in">
                  <Textarea
                    placeholder="e.g., Free 14-day trial, Free consultation (30 min), Limited-time discount..."
                    value={offer}
                    onChange={(e) => setOffer(e.target.value)}
                    maxLength={150}
                    className="min-h-[100px]"
                  />
                  <Button 
                    onClick={handleOfferSubmit}
                    disabled={offer.trim().length < 5}
                    className="w-full"
                  >
                    Continue
                  </Button>
                </div>
              )}

              {/* Step 7: Calculator Choice */}
              {step === 7 && wantsCalculator === null && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                  <button
                    onClick={() => handleCalculatorChoice(true)}
                    className="bg-card border-2 border-border rounded-xl p-8 text-center hover:-translate-y-1 hover:shadow-lg hover:border-primary transition-all duration-200"
                  >
                    <div className="text-5xl mb-4">🧮</div>
                    <div className="font-semibold text-lg mb-2">Yes, Add Calculator</div>
                    <div className="text-sm text-muted-foreground">I'll help you configure it</div>
                    <div className="text-xs text-primary mt-2">(Recommended for your page)</div>
                  </button>
                  
                  <button
                    onClick={() => handleCalculatorChoice(false)}
                    className="bg-card border-2 border-border rounded-xl p-8 text-center hover:-translate-y-1 hover:shadow-lg hover:border-border transition-all duration-200"
                  >
                    <div className="text-5xl mb-4">⏭️</div>
                    <div className="font-semibold text-lg mb-2">Not Now</div>
                    <div className="text-sm text-muted-foreground">I can add one later</div>
                  </button>
                </div>
              )}

              {/* Step 8: Summary */}
              {step === 8 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="bg-card border-2 border-border rounded-xl p-6">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                      📄 Your Landing Page Strategy
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="font-semibold">Industry:</span> {selectedIndustry === "other" ? customIndustry : industries.find(i => i.id === selectedIndustry)?.title}
                      </div>
                      <div>
                        <span className="font-semibold">Goal:</span> {goals.find(g => g.id === selectedGoal)?.title}
                      </div>
                      <div>
                        <span className="font-semibold">Target Audience:</span> {targetAudience}
                      </div>
                      <div className="pt-3 border-t border-border">
                        <div className="font-semibold mb-2">Page Structure:</div>
                        <ul className="space-y-1 ml-4">
                          <li>✓ Hero: Headline targeting {targetAudience.split(",")[0]}</li>
                          <li>✓ Problem/Solution showing {uniqueValue.substring(0, 30)}...</li>
                          {wantsCalculator && <li>✓ ROI Calculator (interactive)</li>}
                          <li>✓ Key Features highlighting value prop</li>
                          <li>✓ Social proof & trust signals</li>
                          <li>✓ Clear CTA: {offer}</li>
                        </ul>
                      </div>
                      <div className="pt-3 border-t border-border text-muted-foreground">
                        Optimized for: {selectedIndustry === "other" ? customIndustry : industries.find(i => i.id === selectedIndustry)?.title} best practices + conversion
                      </div>
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="mb-4 text-muted-foreground">Ready to see this built?</p>
                    <p className="mb-6 text-sm">Watch your page come together in the next 10 seconds...</p>
                    <Button onClick={handleBuildPage} size="lg" className="w-full md:w-auto">
                      Build My Page
                    </Button>
                    <button 
                      onClick={() => setStep(1)}
                      className="block w-full md:w-auto mx-auto mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Let me adjust something
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}