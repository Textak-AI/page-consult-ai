import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { MessageCircle, Loader2 } from "lucide-react";
import { useSession } from "@/contexts/SessionContext";
import { WelcomeBackModal } from "@/components/editor/WelcomeBackModal";
import iconmark from "@/assets/iconmark-darkmode.svg";
import { useIntelligence } from "@/hooks/useIntelligence";
import IntelligenceGathering from "@/components/wizard/IntelligenceGathering";
import type { PersonaIntelligence, GeneratedContent } from "@/services/intelligence/types";

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
  const { saveSession, setUserEmail, loadSession, sessionToken } = useSession();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [consultationId, setConsultationId] = useState<string | null>(null);
  
  // Session modals
  const [welcomeBackOpen, setWelcomeBackOpen] = useState(false);
  const [welcomeBackData, setWelcomeBackData] = useState<any>(null);
  
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
  const [serviceType, setServiceType] = useState("");
  const [challenge, setChallenge] = useState("");
  const [uniqueValue, setUniqueValue] = useState("");
  const [offer, setOffer] = useState("");
  
  // Intelligence state
  const [intelligenceData, setIntelligenceData] = useState<PersonaIntelligence | null>(null);
  const [generatedContentData, setGeneratedContentData] = useState<GeneratedContent | null>(null);

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
      
      // Determine next question based on industry and what's filled
      const isProfessional = mapDemoIndustryToType(demoIndustry) === "professional";
      const nextQuestion = (demoAudience && demoAudience !== ".") 
        ? (isProfessional 
          ? "What type of professional service do you provide?\n\n(Examples: driveway replacement, legal services, accounting, home improvement, consulting...)"
          : `What's the biggest challenge or frustration ${demoAudience} face that you solve?\n\n(Be specific - this becomes your compelling headline)`)
        : "Who exactly are your ideal clients? Be specific about their role, situation, or what they're looking for.";
      
      const questionsRemaining = isProfessional ? (audienceText ? "5" : "6") : (audienceText ? "4" : "5");
      
      addAIMessage(
        `Perfect! Based on our demo chat, here's what I understand:\n\n` +
        `• Industry: ${demoIndustry}\n` +
        `• Goal: ${demoGoal}\n` +
        audienceText +
        `Great start! Let me ask ${questionsRemaining} more strategic questions.\n\n` +
        nextQuestion
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
      
      // Check if this is a returning visitor (has progress beyond step 1)
      // AND is coming from outside the wizard (not already in the flow)
      const hasProgress = existingConsultation.industry || existingConsultation.goal || existingConsultation.target_audience;
      const isReturningFromOutside = !sessionStorage.getItem('wizard_active');
      
      if (hasProgress && isReturningFromOutside) {
        // Show welcome back modal only when returning from outside
        const progressText = existingConsultation.offer 
          ? "Almost done - just need to finalize"
          : existingConsultation.unique_value 
          ? "Halfway through - 3 questions left"
          : existingConsultation.target_audience
          ? "Started - 5 questions to go"
          : "Just beginning";
        
        setWelcomeBackData({
          industry: existingConsultation.industry,
          goal: existingConsultation.goal,
          progress: progressText
        });
        setWelcomeBackOpen(true);
      }
      
      // Mark that wizard is active
      sessionStorage.setItem('wizard_active', 'true');
      
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
      if (existingConsultation.service_type) {
        setServiceType(existingConsultation.service_type);
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
      
      // Determine next step based on what's been answered
      let nextStep = 1;
      if (existingConsultation.industry) nextStep = 2;
      if (existingConsultation.goal) nextStep = 3;
      if (existingConsultation.target_audience) {
        // For professional services, check if service_type is filled
        const isProfessional = mapDemoIndustryToType(existingConsultation.industry) === "professional";
        nextStep = isProfessional && !existingConsultation.service_type ? 4 : (isProfessional ? 5 : 4);
      }
      if (existingConsultation.service_type) nextStep = 5;
      if (existingConsultation.challenge) nextStep = 6;
      if (existingConsultation.unique_value) nextStep = 7;
      if (existingConsultation.offer) nextStep = 8;
      
      console.log("📍 Resuming at step:", nextStep);
      setStep(nextStep);
      setLoading(false);
      
      // Show appropriate message for current step
      const isProfessional = mapDemoIndustryToType(existingConsultation.industry) === "professional";
      const stepMessages: Record<number, string> = {
        1: "Hey! I'm excited to help you build a landing page that converts.\n\nBefore we jump into design, let's have a quick strategy chat—this ensures we build exactly what your business needs.\n\nFirst up: What industry are you in?",
        2: "What's your main goal for this landing page?",
        3: "Who exactly are you trying to reach?\n\nBe specific—their role, company type, or situation. The clearer you are, the better I can help.",
        4: isProfessional 
          ? "What type of professional service do you provide?\n\n(Examples: driveway replacement, legal services, accounting, home improvement, consulting...)"
          : `What's the biggest problem or challenge your audience faces that your solution solves?\n\n(This becomes your compelling headline)`,
        5: isProfessional && existingConsultation.service_type
          ? `What's the biggest challenge ${existingConsultation.target_audience || "your audience"} face with ${existingConsultation.service_type}?\n\n(This becomes your compelling headline)`
          : `What's the biggest problem or challenge your audience faces that your solution solves?\n\n(This becomes your compelling headline)`,
        6: "What makes your solution uniquely valuable?\n\nWhy should they choose you over alternatives?",
        7: `What are you offering to capture ${existingConsultation.goal || "conversions"}?`
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

  // Intelligence gathering hook
  const handleIntelligenceComplete = useCallback((intelligence: PersonaIntelligence | null, content: GeneratedContent | null) => {
    console.log('✅ Intelligence gathering complete', { hasIntelligence: !!intelligence, hasContent: !!content });
    setIntelligenceData(intelligence);
    setGeneratedContentData(content);
    // Don't auto-advance - user clicks "Continue" button
  }, []);
  
  const {
    stage: intelligenceStage,
    progress: intelligenceProgress,
    error: intelligenceError,
    intelligence: liveIntelligence,
    gatherIntelligence,
    isGathering,
    isComplete: isIntelligenceComplete
  } = useIntelligence({
    consultationId,
    userId,
    onComplete: handleIntelligenceComplete
  });
  
  // Build persona preview for the UI
  const personaPreview = liveIntelligence?.synthesizedPersona ? {
    name: liveIntelligence.synthesizedPersona.name,
    primaryPain: liveIntelligence.synthesizedPersona.painPoints?.[0]?.pain,
    primaryDesire: liveIntelligence.synthesizedPersona.desires?.[0]?.desire,
    keyObjection: liveIntelligence.synthesizedPersona.objections?.[0]?.objection,
    confidenceScore: liveIntelligence.confidenceScore
  } : undefined;
  
  // Handle continue from intelligence gathering
  const handleIntelligenceContinue = useCallback(() => {
    const isProfessional = selectedIndustry === "professional";
    setStep(5);
    
    addAIMessage(
      liveIntelligence 
        ? `I've researched your market and built a detailed customer persona.\n\n` +
          (isProfessional 
            ? `Now, what type of professional service do you provide?\n\n(Examples: driveway replacement, legal services, accounting, home improvement...)`
            : `What's the biggest problem or challenge your audience faces that your solution solves?\n\n(This becomes your compelling headline)`)
        : (isProfessional
            ? `What type of professional service do you provide?\n\n(Examples: driveway replacement, legal services, accounting, home improvement...)`
            : `What's the biggest challenge your audience faces that you solve?\n\n(This becomes your compelling headline)`)
    );
  }, [selectedIndustry, liveIntelligence]);
  
  // Trigger intelligence gathering when entering step 4
  useEffect(() => {
    if (step === 4 && intelligenceStage === 'idle' && targetAudience && !isGathering) {
      const industryTitle = selectedIndustry === "other" 
        ? customIndustry 
        : industries.find(i => i.id === selectedIndustry)?.title || "";
      const goalTitle = goals.find(g => g.id === selectedGoal)?.title || "";
      
      gatherIntelligence({
        industry: industryTitle,
        targetAudience: targetAudience,
        serviceType: serviceType || undefined,
        goal: goalTitle,
        challenge: challenge || undefined
      });
    }
  }, [step, intelligenceStage, targetAudience, selectedIndustry, customIndustry, selectedGoal, serviceType, challenge, gatherIntelligence, isGathering]);

  const saveProgress = async (updates: any) => {
    if (!consultationId) return;
    
    // Save to consultations table
    await supabase
      .from("consultations")
      .update(updates)
      .eq("id", consultationId);
    
    // Also save to session
    await saveSession({
      consultation_answers: {
        ...updates,
        step
      },
      current_step: `step_${step}`
    });
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
    
    // Go to intelligence gathering step (step 4)
    setStep(4);
    addAIMessage(
      `Perfect! ${targetAudience.split(" ")[0]}s are a valuable target.\n\n` +
      `Let me research your market and build a detailed customer persona...`
    );
  };

  const handleServiceTypeSubmit = async () => {
    if (serviceType.trim().length < 5) {
      toast({
        title: "Too short",
        description: "Please describe your service type.",
        variant: "destructive"
      });
      return;
    }
    
    console.log("💬 Submitting service type:", serviceType);
    addUserMessage(serviceType);
    await saveProgress({ service_type: serviceType });
    
    setStep(6); // Step 6: Challenge (for professional services)
    setChallenge(""); // Clear input for next question
    addAIMessage(
      `Perfect! ${serviceType} is a valuable service.\n\n` +
      `Now here's the key question:\n\n` +
      `What's the biggest challenge ${targetAudience} face with ${serviceType}?\n\n` +
      `(This becomes your compelling headline)`
    );
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
    
    setStep(selectedIndustry === "professional" ? 7 : 6); // UniqueValue step
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
    
    setStep(selectedIndustry === "professional" ? 8 : 7); // Offer step
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
    
    // Go directly to summary after offer
    addAIMessage(`Perfect offer for ${targetAudience}. That aligns well with your goal.\n\nI have everything needed to build your page!`);
    setTimeout(() => showSummary(), 1500);
  };


  const showSummary = async () => {
    await saveProgress({ status: "completed" });
    const finalStep = selectedIndustry === "professional" ? 9 : 8; // Summary step
    setStep(finalStep);
    addAIMessage("Perfect! I have everything I need. Here's your custom landing page strategy:");
  };

  const handleBuildPage = async () => {
    if (!consultationId) {
      toast({
        title: "Error",
        description: "Session not found. Please try again.",
        variant: "destructive"
      });
      return;
    }

    // Mark consultation as completed before navigating
    const { error } = await supabase
      .from("consultations")
      .update({ status: "completed" })
      .eq("id", consultationId);

    if (error) {
      console.error("Error marking consultation as completed:", error);
      toast({
        title: "Error",
        description: "Could not complete consultation. Please try again.",
        variant: "destructive"
      });
      return;
    }

    // Pass consultation data via navigation state for immediate access
    const industryTitle = selectedIndustry === "other" 
      ? customIndustry 
      : industries.find(i => i.id === selectedIndustry)?.title || "";
    
    const goalTitle = goals.find(g => g.id === selectedGoal)?.title || "";

    navigate("/generate", {
      state: {
        consultationData: {
          id: consultationId,
          industry: industryTitle,
          specificService: serviceType,
          service_type: serviceType,
          goal: goalTitle,
          targetAudience: targetAudience,
          target_audience: targetAudience,
          challenge: challenge,
          uniqueValue: uniqueValue,
          unique_value: uniqueValue,
          offer: offer,
          timestamp: new Date().toISOString()
        },
        // Pass intelligence data to the generate page
        intelligence: intelligenceData,
        generatedContent: generatedContentData
      }
    });
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      // Don't clear any state - preserve all answers when going back
    } else {
      // On step 1, go back to landing page
      navigate("/");
    }
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

  // New flow: 1-Industry, 2-Goal, 3-Audience, 4-Intelligence, 5-ServiceType(pro)/Challenge, 6-Challenge(pro)/UniqueValue, 7-UniqueValue(pro)/Offer, 8-Offer(pro)/Summary, 9-Summary(pro)
  const totalSteps = selectedIndustry === "professional" ? 8 : 7;
  const currentStep = step > totalSteps ? totalSteps : step;
  const progressPercentage = (currentStep / totalSteps) * 100;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f0a1f] via-[#1a1332] to-[#0f0a1f]">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-gradient-to-br from-[#0f0a1f] via-[#1a1332] to-[#0f0a1f]">
      {/* Ambient Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-40 right-20 w-80 h-80 bg-purple-500/20 rounded-full blur-[100px] animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-pink-500/10 rounded-full blur-[90px] animate-pulse delay-2000" />
      </div>

      {/* Header */}
      <header className="relative z-10 h-20 border-b border-white/10 flex items-center justify-between px-6 backdrop-blur-xl bg-black/30">
        <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <img 
            src="/public/logo/whiteAsset_3combimark_darkmode.svg" 
            alt="PageConsult AI" 
            className="h-7 w-auto brightness-110"
          />
        </a>
        
        <div className="flex-1 max-w-md mx-8">
          <div className="text-sm text-white/70 mb-2 text-center font-medium">
            {currentStep <= totalSteps ? `Question ${currentStep} of ${totalSteps}` : "Complete"}
          </div>
          <Progress value={progressPercentage} className="h-2 bg-white/10" />
        </div>
        
        <div className="flex items-center gap-2">
          {step > 1 && step < 8 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleBack}
              className="text-white hover:bg-white/10"
            >
              ← Back
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleStartFresh}
            className="text-white hover:bg-white/10"
          >
            Start Fresh
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleSaveExit}
            className="text-white hover:bg-white/10 border border-white/20"
          >
            Save & Exit
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto py-8 px-4">
          {/* Messages */}
          <div className="space-y-4 mb-8">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 items-start ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "ai" && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center p-1.5">
                    <img src={iconmark} alt="AI" className="w-full h-full object-contain" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-5 py-4 ${
                    message.role === "user"
                      ? "bg-gradient-to-r from-cyan-500/90 to-purple-500/90 text-white ml-auto shadow-lg shadow-cyan-500/20"
                      : "bg-white/5 backdrop-blur-xl border border-white/10 text-white"
                  } animate-fade-in`}
                >
                  <p className="whitespace-pre-line leading-relaxed">{message.content}</p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex gap-3 items-start justify-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center p-1.5">
                  <img src={iconmark} alt="AI" className="w-full h-full object-contain" />
                </div>
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-5 py-4">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-75" />
                    <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse delay-150" />
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
                      className="group bg-white/5 backdrop-blur-xl border-2 border-white/10 rounded-xl p-4 text-center hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-500/20 hover:border-cyan-500/50 transition-all duration-300"
                    >
                      <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{industry.icon}</div>
                      <div className="font-semibold text-white">{industry.title}</div>
                      <div className="text-sm text-white/60">{industry.subtitle}</div>
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
                    className="min-h-[60px] bg-white/5 backdrop-blur-xl border-white/10 text-white placeholder:text-white/40 focus:border-cyan-500/50 focus:ring-cyan-500/20"
                  />
                  <Button 
                    onClick={handleCustomIndustry}
                    disabled={customIndustry.trim().length < 3}
                    className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white shadow-lg shadow-cyan-500/20"
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
                      className="group bg-white/5 backdrop-blur-xl border-2 border-white/10 rounded-xl p-6 text-left hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-500/20 hover:border-purple-500/50 transition-all duration-300"
                    >
                      <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{goal.icon}</div>
                      <div className="font-semibold text-lg text-white mb-1">{goal.title}</div>
                      <div className="text-sm text-white/60">{goal.subtitle}</div>
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
                    className="min-h-[120px] bg-white/5 backdrop-blur-xl border-white/10 text-white placeholder:text-white/40 focus:border-cyan-500/50 focus:ring-cyan-500/20"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/60">
                      {targetAudience.length}/200
                    </span>
                    {targetAudience.length >= 10 && (
                      <span className="text-sm text-green-400">✓ That's specific and powerful!</span>
                    )}
                  </div>
                  <Button 
                    onClick={handleAudienceSubmit}
                    disabled={targetAudience.trim().length < 10}
                    className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white shadow-lg shadow-cyan-500/20"
                  >
                    Continue
                  </Button>
                </div>
              )}

              {/* Step 4: Intelligence Gathering - Full Screen Overlay */}
              {step === 4 && (
                <IntelligenceGathering
                  stage={intelligenceStage}
                  progress={intelligenceProgress}
                  error={intelligenceError || undefined}
                  persona={personaPreview}
                  onContinue={handleIntelligenceContinue}
                />
              )}

              {/* Step 5: Service Type (Professional Services Only) */}
              {step === 5 && selectedIndustry === "professional" && (
                <div className="space-y-4 animate-fade-in">
                  <Textarea
                    placeholder="e.g., driveway replacement and repair, legal services, accounting, home improvement, business consulting..."
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    maxLength={100}
                    className="min-h-[100px] bg-white/5 backdrop-blur-xl border-white/10 text-white placeholder:text-white/40 focus:border-cyan-500/50 focus:ring-cyan-500/20"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/60">
                      {serviceType.length}/100
                    </span>
                  </div>
                  <Button 
                    onClick={handleServiceTypeSubmit}
                    disabled={serviceType.trim().length < 5}
                    className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white shadow-lg shadow-cyan-500/20"
                  >
                    Continue
                  </Button>
                </div>
              )}

              {/* Step 5/6: Challenge */}
              {((step === 5 && selectedIndustry !== "professional") || (step === 6 && selectedIndustry === "professional")) && (
                <div className="space-y-4 animate-fade-in">
                  <Textarea
                    placeholder="e.g., Wasting 10 hours per week on manual tasks, Struggling to prove ROI to leadership..."
                    value={challenge}
                    onChange={(e) => setChallenge(e.target.value)}
                    maxLength={150}
                    className="min-h-[120px] bg-white/5 backdrop-blur-xl border-white/10 text-white placeholder:text-white/40 focus:border-cyan-500/50 focus:ring-cyan-500/20"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/60">
                      {challenge.length}/150
                    </span>
                  </div>
                  <Button 
                    onClick={handleChallengeSubmit}
                    disabled={challenge.trim().length < 10}
                    className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white shadow-lg shadow-cyan-500/20"
                  >
                    Continue
                  </Button>
                </div>
              )}

              {/* Step 6/7: Unique Value */}
              {((step === 6 && selectedIndustry !== "professional") || (step === 7 && selectedIndustry === "professional")) && (
                <div className="space-y-4 animate-fade-in">
                  <Textarea
                    placeholder="e.g., Automates workflows in 5 minutes vs 2 hours manually, Integrates with existing tools..."
                    value={uniqueValue}
                    onChange={(e) => setUniqueValue(e.target.value)}
                    maxLength={200}
                    className="min-h-[120px] bg-white/5 backdrop-blur-xl border-white/10 text-white placeholder:text-white/40 focus:border-cyan-500/50 focus:ring-cyan-500/20"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/60">
                      {uniqueValue.length}/200
                    </span>
                  </div>
                  <Button 
                    onClick={handleValueSubmit}
                    disabled={uniqueValue.trim().length < 10}
                    className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white shadow-lg shadow-cyan-500/20"
                  >
                    Continue
                  </Button>
                </div>
              )}

              {/* Step 7/8: Offer */}
              {((step === 7 && selectedIndustry !== "professional") || (step === 8 && selectedIndustry === "professional")) && (
                <div className="space-y-4 animate-fade-in">
                  <Textarea
                    placeholder="e.g., Free 14-day trial, Free consultation (30 min), Limited-time discount..."
                    value={offer}
                    onChange={(e) => setOffer(e.target.value)}
                    maxLength={150}
                    className="min-h-[100px] bg-white/5 backdrop-blur-xl border-white/10 text-white placeholder:text-white/40 focus:border-cyan-500/50 focus:ring-cyan-500/20"
                  />
                  <Button 
                    onClick={handleOfferSubmit}
                    disabled={offer.trim().length < 5}
                    className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white shadow-lg shadow-cyan-500/20"
                  >
                    Continue
                  </Button>
                </div>
              )}


              {/* Step 8/9: Summary */}
              {(step === 8 || step === 9) && (
                <div className="space-y-6 animate-fade-in">
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                    <h3 className="font-bold text-xl mb-6 flex items-center gap-2 text-white">
                      📄 Your Landing Page Strategy
                    </h3>
                    <div className="space-y-4 text-sm">
                      <div>
                        <span className="font-semibold text-white/70">Industry:</span> <span className="text-white">{selectedIndustry === "other" ? customIndustry : industries.find(i => i.id === selectedIndustry)?.title}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-white/70">Goal:</span> <span className="text-white">{goals.find(g => g.id === selectedGoal)?.title}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-white/70">Target Audience:</span> <span className="text-white">{targetAudience}</span>
                      </div>
                      {serviceType && (
                        <div>
                          <span className="font-semibold text-white/70">Service:</span> <span className="text-white">{serviceType}</span>
                        </div>
                      )}
                      <div className="pt-3 border-t border-white/10">
                        <div className="font-semibold mb-3 text-white">Page Structure:</div>
                        <ul className="space-y-2 ml-4 text-white/80">
                          <li>✓ Hero: Headline targeting {targetAudience.split(",")[0]}</li>
                          <li>✓ Problem/Solution showing {uniqueValue.substring(0, 30)}...</li>
                          <li>✓ Key Features highlighting value prop</li>
                          <li>✓ Social proof & trust signals</li>
                          <li>✓ Clear CTA: {offer}</li>
                        </ul>
                      </div>
                      <div className="pt-3 border-t border-white/10 text-white/60">
                        Optimized for: {selectedIndustry === "other" ? customIndustry : industries.find(i => i.id === selectedIndustry)?.title} best practices + conversion
                      </div>
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="mb-4 text-white/70 text-lg">Ready to see this built?</p>
                    <p className="mb-6 text-sm text-white/60">Watch your page come together in the next 10 seconds...</p>
                    <Button 
                      onClick={handleBuildPage} 
                      size="lg" 
                      className="w-full md:w-auto bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white shadow-lg shadow-cyan-500/20"
                    >
                      Build My Page
                    </Button>
                    <button 
                      onClick={() => navigate("/wizard/review")}
                      className="block w-full md:w-auto mx-auto mt-4 text-sm text-white/60 hover:text-white transition-colors"
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
      
      {/* Modals removed - users are already authenticated */}
      <WelcomeBackModal
        open={welcomeBackOpen}
        onOpenChange={setWelcomeBackOpen}
        sessionData={welcomeBackData || { progress: "" }}
        onContinue={() => {
          setWelcomeBackOpen(false);
          // Continue with loaded session
        }}
        onStartNew={async () => {
          setWelcomeBackOpen(false);
          // Clear session and start fresh
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await supabase
              .from("consultations")
              .update({ status: "abandoned" })
              .eq("user_id", user.id)
              .eq("status", "in_progress");
            
            window.location.reload();
          }
        }}
      />
    </div>
  );
}