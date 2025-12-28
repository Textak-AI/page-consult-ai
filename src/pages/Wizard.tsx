import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Send, Loader2, Bot, User, Search, CheckCircle2, ArrowRight, Sparkles, PanelRightClose, PanelRight } from "lucide-react";
import iconmark from "@/assets/iconmark-darkmode.svg";
import { getAuthHeaders } from "@/lib/authHelpers";
import { motion, AnimatePresence } from "framer-motion";
import { IntelligencePanel, IntelligenceTile, getDefaultTiles } from "@/components/wizard/IntelligencePanel";
import PrefillBanner from "@/components/wizard/PrefillBanner";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  role: "assistant" | "user";
  content: string;
  type?: "research_finding" | "strategy";
};

type Phase = "intake" | "researching" | "presenting" | "strategy" | "building";

type ResearchStep = {
  label: string;
  done: boolean;
};

const iconMapForTiles: Record<string, IntelligenceTile["icon"]> = {
  industry: "Building2",
  audience: "Target",
  value: "Gem",
  competitive: "Shield",
  goals: "Rocket",
  swagger: "Gauge",
};

const categoryNames: Record<string, string> = {
  industry: "Industry & Market",
  audience: "Target Audience",
  value: "Value Proposition",
  competitive: "Competitive Position",
  goals: "Goals & Objectives",
  swagger: "Swagger Level",
};

const INITIAL_MESSAGE = "Hey — I'm your AI Associate at PageConsult. Before I dig into your market and prepare for our consultation, tell me a bit about what brings you here today.";
const PREFILLED_MESSAGE = "Welcome back! I've got your intelligence from our earlier chat. Let me summarize what we know and what we still need to build your perfect page.";

export default function Wizard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Ref to track if session was loaded - prevents race conditions
  const sessionLoadedRef = useRef(false);
  const initCompleteRef = useRef(false);
  
  // Ref to store session data - survives re-renders and auth state changes
  const sessionDataRef = useRef<any>(null);
  
  // Loading state for session fetch
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  
  // Start with empty messages - will be set by initialization logic
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("intake");
  const [collectedInfo, setCollectedInfo] = useState<Record<string, any>>({});
  const [tiles, setTiles] = useState<IntelligenceTile[]>(getDefaultTiles());
  const [overallReadiness, setOverallReadiness] = useState(0);
  const [showPanel, setShowPanel] = useState(true);
  const [researchSteps, setResearchSteps] = useState<ResearchStep[]>([
    { label: "Analyzing your industry landscape", done: false },
    { label: "Researching competitor positioning", done: false },
    { label: "Identifying audience pain points", done: false },
    { label: "Finding market statistics", done: false },
  ]);
  const [researchData, setResearchData] = useState<any>(null);
  const [showPrefillBanner, setShowPrefillBanner] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    if (phase === "intake" || phase === "presenting") {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [phase]);

  // Check auth
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/signup");
        return;
      }
      setUserId(session.user.id);
    };
    checkAuth();
  }, [navigate]);

  // State for conversation history from demo
  const [conversationHistory, setConversationHistory] = useState<Array<{role: string; content: string}>>([]);

  // Function to apply session data to wizard state
  const applySessionData = useCallback((data: any) => {
    const extracted = data.extracted_intelligence || {};
    const market = data.market_research || {};
    const messages = data.messages || [];
    
    // Get values from session data
    const industry = extracted.industry || '';
    const audience = extracted.audience || '';
    const valueProp = extracted.valueProp || '';
    const competitive = extracted.competitive || '';
    const goals = extracted.goals || '';
    const swagger = extracted.swagger || '';
    const businessType = extracted.businessType || '';
    
    // Market research
    const marketSize = market.marketSize || '';
    const industryInsights = market.industryInsights || [];
    const commonObjections = market.commonObjections || [];
    const researchComplete = industryInsights.length > 0;
    
    // Build tiles from session data
    const prefilledTiles = getDefaultTiles().map(tile => {
      let insight = "Not yet known";
      let fill = 0;
      let tileState: IntelligenceTile["state"] = "empty";
      
      switch (tile.id) {
        case "industry":
          if (industry) {
            insight = industry;
            fill = 100;
            tileState = "confirmed";
          }
          break;
        case "audience":
          if (audience) {
            insight = audience;
            fill = 100;
            tileState = "confirmed";
          }
          break;
        case "value":
          if (valueProp) {
            insight = valueProp;
            fill = 100;
            tileState = "confirmed";
          }
          break;
        case "competitive":
          if (competitive || marketSize || industryInsights.length) {
            insight = competitive || marketSize || industryInsights[0] || "Market research available";
            fill = competitive ? 100 : 80;
            tileState = competitive ? "confirmed" : "developing";
          }
          break;
        case "goals":
          if (goals) {
            insight = goals;
            fill = 100;
            tileState = "confirmed";
          }
          break;
        case "swagger":
          if (swagger) {
            insight = swagger;
            fill = 100;
            tileState = "confirmed";
          }
          break;
      }
      
      return { ...tile, insight, fill, state: tileState };
    });
    
    console.log('🎯 [Wizard] Applying session tiles:', prefilledTiles.map(t => ({
      id: t.id,
      fill: t.fill,
      state: t.state,
      insight: t.insight.substring(0, 50)
    })));
    
    // NUCLEAR FIX: Delay state updates to run AFTER React's render cycle
    // This ensures updates happen after any auth-related re-renders
    setTimeout(() => {
      console.log('⏰ [Wizard] Delayed state update executing');
      
      setTiles(prefilledTiles);
      setOverallReadiness(data.readiness || 0);
      setShowPrefillBanner(true);
      
      // Conversation history for AI context
      if (messages.length > 0) {
        setConversationHistory(messages.map((m: any) => ({ role: m.role, content: m.content })));
      }
      
      // Market research
      if (researchComplete) {
        setResearchData({
          industryInsights,
          commonObjections,
          marketSize,
          buyerPersona: market.buyerPersona,
        });
        setResearchSteps(prev => prev.map(step => ({ ...step, done: true })));
      }
      
      // Build welcome message
      let msg = `Welcome back! I've loaded your strategy session.\n\n`;
      msg += `**What I know:**\n`;
      if (industry) msg += `• Industry: ${industry}\n`;
      if (audience) msg += `• Audience: ${audience}\n`;
      if (valueProp) msg += `• Value Prop: ${valueProp.substring(0, 50)}...\n`;
      msg += `\nYou're at **${data.readiness || 0}% readiness**.`;
      
      if (data.readiness >= 70) {
        msg += `\n\nWe have enough information to generate your page! Would you like to proceed, or add more details?`;
      } else {
        msg += `\n\nLet's continue building your page strategy.`;
      }
      
      setMessages([{ id: "1", role: "assistant", content: msg }]);
      
      setCollectedInfo({
        industry,
        targetAudience: audience,
        valueProposition: valueProp,
        competitivePosition: competitive,
        goals: goals ? [goals] : [],
        swagger,
        businessType,
        marketResearch: market,
        fromDemo: true,
      });
      
      console.log('✅ [Wizard] Delayed state update complete');
    }, 100);
    
    // Backup: force re-apply after 500ms if auth causes reset
    setTimeout(() => {
      console.log('⏰ [Wizard] Backup re-apply check');
      // Re-apply tiles directly to ensure they persist
      setTiles(prefilledTiles);
    }, 500);
    
  }, []);

  // Listen for auth state changes and re-apply session data after auth completes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 [Wizard] Auth state changed:', event);
        
        // Check URL first, then localStorage as fallback (survives auth redirect)
        const sessionIdFromUrl = searchParams.get('session');
        const sessionIdFromStorage = localStorage.getItem('pageconsult_session_id');
        const sessionId = sessionIdFromUrl || sessionIdFromStorage;
        
        console.log('🔐 [Wizard] Debug:', {
          event,
          sessionIdFromUrl,
          sessionIdFromStorage,
          sessionId,
          hasSessionDataRef: !!sessionDataRef.current,
          isSignedIn: event === 'SIGNED_IN',
          isTokenRefreshed: event === 'TOKEN_REFRESHED',
          isInitialSession: event === 'INITIAL_SESSION'
        });
        
        // When user signs in or token refreshes, reload session data
        if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') && sessionId) {
          console.log('🔄 [Wizard] Reloading session after auth change:', sessionId);
          
          // Small delay to let React settle after auth state change
          setTimeout(async () => {
            // If we have cached data, use it; otherwise fetch fresh
            if (sessionDataRef.current) {
              console.log('📂 [Wizard] Re-applying cached session data after auth');
              applySessionData(sessionDataRef.current);
            } else {
              console.log('📂 [Wizard] Fetching session data after auth (no cache)');
              try {
                const { data, error } = await supabase
                  .from('demo_sessions')
                  .select('*')
                  .eq('session_id', sessionId)
                  .maybeSingle();
                
                console.log('📂 [Wizard] Fetched session:', { hasData: !!data, error: error?.message });
                
                if (data && !error) {
                  sessionDataRef.current = data;
                  applySessionData(data);
                  // Clear localStorage after successful load
                  localStorage.removeItem('pageconsult_session_id');
                  console.log('🧹 [Wizard] Cleared session ID from localStorage');
                }
              } catch (err) {
                console.error('❌ [Wizard] Error fetching session:', err);
              }
            }
          }, 200);
        } else {
          console.log('⏭️ [Wizard] Skipping reload - conditions not met');
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, [searchParams, applySessionData]);

  // Load demo session from Supabase
  useEffect(() => {
    const loadDemoSession = async () => {
      // Already initialized
      if (initCompleteRef.current) return;
      
      // Check URL first, then localStorage as fallback (survives auth redirect)
      const sessionIdFromUrl = searchParams.get('session');
      const sessionIdFromStorage = localStorage.getItem('pageconsult_session_id');
      const sessionId = sessionIdFromUrl || sessionIdFromStorage;
      
      console.log('📂 [Wizard] Session ID sources:', { sessionIdFromUrl, sessionIdFromStorage, sessionId });
      
      if (!sessionId) {
        // No session param - set default message
        if (!initCompleteRef.current) {
          setMessages([{ id: "1", role: "assistant", content: INITIAL_MESSAGE }]);
          initCompleteRef.current = true;
        }
        return;
      }
      
      setIsLoadingSession(true);
      console.log('📂 [Wizard] Loading session from Supabase:', sessionId);
      
      try {
        const { data, error } = await supabase
          .from('demo_sessions')
          .select('*')
          .eq('session_id', sessionId)
          .maybeSingle();
        
        if (error) {
          console.error('Failed to load demo session:', error);
          setMessages([{ id: "1", role: "assistant", content: INITIAL_MESSAGE }]);
          initCompleteRef.current = true;
          setIsLoadingSession(false);
          return;
        }
        
        if (!data) {
          console.warn('⚠️ [Wizard] No session found for ID:', sessionId);
          setMessages([{ id: "1", role: "assistant", content: INITIAL_MESSAGE }]);
          initCompleteRef.current = true;
          setIsLoadingSession(false);
          return;
        }
        
        // Claim session for authenticated user
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.id && !data.claimed_by) {
          await supabase
            .from('demo_sessions')
            .update({ claimed_by: user.id, claimed_at: new Date().toISOString() })
            .eq('session_id', sessionId);
          console.log('🔒 [Wizard] Session claimed by user:', user.id);
        }
        
        // Store session data in ref - survives auth state changes
        sessionDataRef.current = data;
        
        // Mark as loaded
        sessionLoadedRef.current = true;
        initCompleteRef.current = true;
        
        // Apply the data to wizard state
        applySessionData(data);
        
        // Clear localStorage after successful load
        localStorage.removeItem('pageconsult_session_id');
        console.log('🧹 [Wizard] Cleared session ID from localStorage');
        
        console.log('✅ [Wizard] Session loaded successfully, readiness:', data.readiness);
        
      } catch (err) {
        console.error('Error loading session:', err);
        setMessages([{ id: "1", role: "assistant", content: INITIAL_MESSAGE }]);
        initCompleteRef.current = true;
      } finally {
        setIsLoadingSession(false);
      }
    };
    
    loadDemoSession();
  }, [searchParams, applySessionData]);

  // Re-apply session data if state gets reset after auth changes
  useEffect(() => {
    // If we have session data but tiles are all empty, re-apply
    const allTilesEmpty = tiles.every(t => t.fill === 0);
    
    if (sessionDataRef.current && allTilesEmpty && sessionLoadedRef.current) {
      console.log('🔄 [Wizard] Re-applying session data after state reset');
      applySessionData(sessionDataRef.current);
    }
  }, [tiles, applySessionData]);

  // Debug: log tile state changes
  useEffect(() => {
    console.log('🔍 [Wizard] Tiles state changed:', tiles.map(t => ({
      id: t.id, 
      fill: t.fill
    })));
  }, [tiles]);

  // Update tiles from intelligence data (but respect session-loaded data)
  const updateTilesFromIntelligence = useCallback((intelligence: any) => {
    if (!intelligence?.tiles) return;
    
    setTiles(prev => {
      return prev.map(tile => {
        const newData = intelligence.tiles[tile.id];
        if (!newData) return tile;
        
        // Don't overwrite confirmed tiles from session with lower-quality data
        if (sessionLoadedRef.current && tile.state === 'confirmed' && tile.fill === 100) {
          // Only update if new data is better
          if (newData.fill < tile.fill) {
            return tile;
          }
        }
        
        return {
          ...tile,
          fill: newData.fill || 0,
          insight: newData.insight || "Not yet known",
          state: newData.state || "empty"
        };
      });
    });
    
    setOverallReadiness(intelligence.overallReadiness || 0);
  }, []);

  // Run research phase
  const runResearch = useCallback(async () => {
    setPhase("researching");
    
    try {
      const headers = await getAuthHeaders();
      
      // Simulate research steps
      for (let i = 0; i < researchSteps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 2500 + Math.random() * 1500));
        setResearchSteps(prev => prev.map((step, idx) => 
          idx === i ? { ...step, done: true } : step
        ));
      }

      // Generate research insights using the conversation
      const conversationText = messages.map(m => `${m.role}: ${m.content}`).join('\n');
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/intake-chat`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            messages: [
              { role: "user", content: `Based on our conversation, synthesize 3-4 key market insights. Format naturally as paragraphs, not bullet points:

1. A market insight about their industry
2. A positioning opportunity they should leverage  
3. A messaging direction recommendation
4. What competitive angle to lead with

Be specific based on what they shared. Here's our conversation:
${conversationText}` }
            ],
            extractOnly: false
          })
        }
      );

      if (!response.ok) throw new Error("Research failed");
      
      const data = await response.json();
      setResearchData({ ...data, tiles, overallReadiness });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPhase("presenting");
      
      const researchMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: `I've done some research on your market. Here's what I found:\n\n${data.message}\n\nDoes this match what you're seeing? Anything I got wrong or want to add?`,
        type: "research_finding"
      };
      
      setMessages(prev => [...prev, researchMessage]);
      
    } catch (error) {
      console.error("Research error:", error);
      toast({
        title: "Research Error",
        description: "Couldn't complete market research. Let's continue anyway.",
        variant: "destructive"
      });
      setPhase("strategy");
    }
  }, [messages, tiles, overallReadiness, researchSteps]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const headers = await getAuthHeaders();
      
      // Include demo conversation history if available
      const demoContext = conversationHistory.length > 0
        ? `The user already completed a demo consultation. Here's what was discussed:\n\n${
            conversationHistory.map(m => `${m.role}: ${m.content}`).join('\n\n')
          }\n\nDO NOT re-ask questions that were already answered. Continue from where we left off.\n\n`
        : '';
      
      const currentConversation = [...messages, userMessage].map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/intake-chat`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({ 
            messages: currentConversation,
            systemContext: demoContext,
            collectedInfo: collectedInfo,
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Request failed: ${response.status}`);
      }

      const data = await response.json();
      
      // Update intelligence tiles
      if (data.intelligence) {
        updateTilesFromIntelligence(data.intelligence);
      }
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message
      };

      setMessages(prev => [...prev, assistantMessage]);
      setCollectedInfo(prev => ({
        ...prev,
        conversationHistory: [...messages, userMessage, assistantMessage], 
        tiles, 
        intelligence: data.intelligence,
      }));

    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePresentingResponse = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const strategyMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Thanks for that context! Based on our conversation and research, here's what I recommend for your page:

Hero: Lead with your strongest differentiator and a specific result you deliver
Structure: Problem → Solution → Proof → Process → CTA
Tone: Confident but approachable — expert without being corporate
CTA: Clear action that feels low-risk to take

Ready to build this? Or want to adjust the approach first?`,
        type: "strategy"
      };

      setMessages(prev => [...prev, strategyMessage]);
      setPhase("strategy");

    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuild = async () => {
    setPhase("building");
    
    try {
      const headers = await getAuthHeaders();
      
      // STEP 1: Extract structured consultation data from intelligence tiles
      const extractedData = {
        // Core business info from tiles
        industry: tiles.find(t => t.id === 'industry')?.insight || collectedInfo?.industry || null,
        targetAudience: tiles.find(t => t.id === 'audience')?.insight || collectedInfo?.targetAudience || null,
        uniqueValue: tiles.find(t => t.id === 'value')?.insight || collectedInfo?.valueProposition || null,
        competitivePosition: tiles.find(t => t.id === 'competitive')?.insight || collectedInfo?.competitivePosition || null,
        goal: tiles.find(t => t.id === 'goals')?.insight || collectedInfo?.goals?.[0] || 'Generate qualified leads',
        swaggerLevel: tiles.find(t => t.id === 'swagger')?.insight || 'confident',
        
        // Additional fields from collected info
        businessName: collectedInfo?.businessName || null,
        challenge: collectedInfo?.marketResearch?.commonObjections?.[0] || null,
        offer: collectedInfo?.goals?.[0] || null,
        
        // Research data if available
        industryInsights: researchData?.intelligence?.tiles || null,
        marketResearch: researchData?.tiles || null,
        
        // Meta
        conversationHistory: messages.map(m => ({ role: m.role, content: m.content })),
        overallReadiness: overallReadiness,
      };
      
      console.log('📋 [Wizard] Extracted consultation data:', extractedData);
      console.log('📋 [Wizard] Tiles state:', tiles.map(t => ({ id: t.id, insight: t.insight, fill: t.fill })));
      
      // STEP 2: Generate strategy brief from extracted data
      console.log('📋 [Wizard] Calling generate-strategy-brief...');
      const briefResponse = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-strategy-brief`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            consultationData: {
              businessName: extractedData.businessName,
              industry: extractedData.industry,
              idealClient: extractedData.targetAudience,
              clientFrustration: extractedData.challenge,
              uniqueStrength: extractedData.uniqueValue,
              mainOffer: extractedData.offer,
              primaryGoal: extractedData.goal,
              achievements: extractedData.competitivePosition,
              // Pass conversation for additional context
              conversationContext: extractedData.conversationHistory
                .filter(m => m.role === 'user')
                .map(m => m.content)
                .join('\n'),
            }
          })
        }
      );
      
      let strategyBrief = null;
      let structuredBrief = null;
      
      if (briefResponse.ok) {
        const briefData = await briefResponse.json();
        if (briefData.success) {
          strategyBrief = briefData.strategyBrief;
          structuredBrief = briefData.structuredBrief;
          console.log('✅ [Wizard] Strategy brief generated:', {
            hasMarkdown: !!strategyBrief,
            hasStructured: !!structuredBrief,
            headlines: structuredBrief?.headlines,
          });
        } else {
          console.warn('⚠️ [Wizard] Strategy brief generation failed:', briefData.error);
        }
      } else {
        console.warn('⚠️ [Wizard] Strategy brief request failed:', briefResponse.status);
      }
      
      // STEP 3: Navigate to generate with complete data
      navigate("/generate", {
        state: {
          // New strategic consultation format
          fromStrategicConsultation: true,
          strategicData: {
            consultationData: {
              businessName: extractedData.businessName,
              industry: extractedData.industry,
              targetAudience: extractedData.targetAudience,
              uniqueStrength: extractedData.uniqueValue,
              goal: extractedData.goal,
              challenge: extractedData.challenge,
              offer: extractedData.offer,
            },
            strategyBrief: strategyBrief,
            structuredBrief: structuredBrief,
            websiteIntelligence: null,
            aiSeoData: null,
            heroBackgroundUrl: null,
          },
          // Legacy format for fallback
          consultationData: {
            ...extractedData,
            industry: extractedData.industry,
            target_audience: extractedData.targetAudience,
            unique_value: extractedData.uniqueValue,
            service_type: extractedData.industry,
          },
          researchData: researchData,
          tiles: tiles,
          intelligence: collectedInfo?.intelligence,
          fromWizard: true,
        }
      });
      
    } catch (error) {
      console.error('❌ [Wizard] Build preparation failed:', error);
      toast({
        title: 'Error',
        description: 'Failed to prepare page generation. Please try again.',
        variant: 'destructive',
      });
      setPhase('strategy');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (phase === "presenting") {
        handlePresentingResponse();
      } else if (phase === "intake") {
        sendMessage();
      }
    }
  };

  const isResearchReady = overallReadiness >= 80;

  // Show loading state while fetching session from Supabase
  if (isLoadingSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f0a1f] via-[#1a1332] to-[#0f0a1f] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-500 mx-auto mb-4" />
          <p className="text-slate-300">Loading your strategy session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0a1f] via-[#1a1332] to-[#0f0a1f] flex flex-col">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-3">
          <img src={iconmark} alt="PageConsult" className="h-8 w-8" />
          <span className="text-lg font-semibold text-white">PageConsult AI</span>
          
          {/* Phase indicator */}
          <div className="ml-4 flex items-center gap-2 text-sm">
            <span className={cn(
              "px-3 py-1 rounded-full",
              phase === "intake" ? "bg-cyan-500/20 text-cyan-400" :
              phase === "researching" ? "bg-yellow-500/20 text-yellow-400" :
              phase === "presenting" ? "bg-purple-500/20 text-purple-400" :
              phase === "strategy" ? "bg-green-500/20 text-green-400" :
              "bg-cyan-500/20 text-cyan-400"
            )}>
              {phase === "intake" && "Discovery"}
              {phase === "researching" && "Researching..."}
              {phase === "presenting" && "Review Insights"}
              {phase === "strategy" && "Strategy"}
              {phase === "building" && "Building..."}
            </span>
          </div>
          
          {/* Panel toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPanel(!showPanel)}
            className="ml-auto text-white/60 hover:text-white hover:bg-white/10"
          >
            {showPanel ? <PanelRightClose className="w-5 h-5" /> : <PanelRight className="w-5 h-5" />}
          </Button>
        </div>
      </header>

      {/* Research Progress Overlay */}
      <AnimatePresence>
        {phase === "researching" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#0f0a1f]/95 backdrop-blur-xl flex items-center justify-center"
          >
            <div className="max-w-md w-full mx-4">
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                  <Search className="w-8 h-8 text-white animate-pulse" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Researching Your Market</h2>
                <p className="text-white/60">This takes about 15-30 seconds...</p>
              </div>
              
              <div className="space-y-4">
                {researchSteps.map((step, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.2 }}
                    className="flex items-center gap-3"
                  >
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center",
                      step.done 
                        ? "bg-green-500" 
                        : researchSteps.findIndex(s => !s.done) === idx 
                          ? "bg-cyan-500 animate-pulse" 
                          : "bg-white/20"
                    )}>
                      {step.done ? (
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      ) : researchSteps.findIndex(s => !s.done) === idx ? (
                        <Loader2 className="w-4 h-4 text-white animate-spin" />
                      ) : null}
                    </div>
                    <span className={cn("text-sm", step.done ? "text-white" : "text-white/50")}>
                      {step.label}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content - Split Screen */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Area */}
        <div className={cn(
          "flex-1 flex flex-col transition-all duration-300",
          showPanel ? "w-[60%]" : "w-full"
        )}>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
              {/* Session Loaded Banner */}
              <AnimatePresence>
                {showPrefillBanner && collectedInfo?.fromDemo && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg px-4 py-3 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2 text-cyan-400 text-sm">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Your demo session has been loaded</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPrefillBanner(false)}
                      className="text-cyan-400 hover:text-cyan-300 h-auto p-1"
                    >
                      Dismiss
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn("flex gap-4", message.role === "user" ? "flex-row-reverse" : "")}
                >
                  <div className={cn(
                    "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
                    message.role === "assistant" 
                      ? "bg-gradient-to-br from-cyan-500 to-purple-600" 
                      : "bg-gradient-to-br from-purple-500 to-pink-600"
                  )}>
                    {message.role === "assistant" ? (
                      <Bot className="w-5 h-5 text-white" />
                    ) : (
                      <User className="w-5 h-5 text-white" />
                    )}
                  </div>

                  <div className={cn("max-w-[80%]", message.role === "user" ? "text-right" : "")}>
                    <div className={cn(
                      "inline-block rounded-2xl px-5 py-3",
                      message.role === "assistant"
                        ? message.type === "research_finding" 
                          ? "bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-500/30 text-white/90 rounded-tl-sm"
                          : message.type === "strategy"
                            ? "bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 text-white/90 rounded-tl-sm"
                            : "bg-white/10 backdrop-blur-sm text-white/90 rounded-tl-sm"
                        : "bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-tr-sm"
                    )}>
                      <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl rounded-tl-sm px-5 py-3">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t border-white/10 bg-black/30 backdrop-blur-xl">
            <div className="max-w-2xl mx-auto px-4 py-4">
              {phase === "strategy" ? (
                <div className="flex gap-3 justify-center">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setPhase("presenting");
                      inputRef.current?.focus();
                    }}
                    className="px-6 py-6 border-white/20 text-white hover:bg-white/10"
                  >
                    Let's Adjust
                  </Button>
                  <Button
                    onClick={handleBuild}
                    className="px-8 py-6 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-semibold gap-2"
                  >
                    <Sparkles className="w-5 h-5" />
                    Build My Page
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </div>
              ) : (phase === "intake" || phase === "presenting") && (
                <>
                  <div className="flex gap-3 items-center">
                    <Input
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={phase === "presenting" ? "Any corrections or additional context..." : "Type your message..."}
                      disabled={isLoading}
                      className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-xl py-6 px-4 text-[15px] focus-visible:ring-cyan-500/50"
                    />
                    <Button
                      onClick={phase === "presenting" ? handlePresentingResponse : sendMessage}
                      disabled={!input.trim() || isLoading}
                      className="h-12 w-12 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </Button>
                  </div>
                  <p className="text-center text-white/40 text-xs mt-3">
                    Press Enter to send
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Intelligence Panel */}
        <AnimatePresence>
          {showPanel && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "40%", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex-shrink-0 overflow-hidden"
            >
              <IntelligencePanel
                tiles={tiles}
                overallReadiness={overallReadiness}
                onBeginResearch={runResearch}
                isResearchReady={isResearchReady}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
