import { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Loader2, Check, Sparkles, FileText, Calculator, Clock, Gift } from "lucide-react";
import { useSession } from "@/contexts/SessionContext";
import { handlePostAuthMigration } from "@/lib/sessionMigration";
import { hasGuestSession } from "@/lib/guestSession";
import { getNextStep, updateFlowState } from "@/services/flowEngine";

interface DemoIntelligence {
  sessionId: string;
  source: string;
  capturedAt: string;
  industry: string | null;
  industrySummary: string | null;
  audience: string | null;
  audienceSummary: string | null;
  valueProp: string | null;
  valuePropSummary: string | null;
  competitorDifferentiator: string | null;
  edgeSummary: string | null;
  painPoints: string | null;
  painSummary: string | null;
  buyerObjections: string | null;
  objectionsSummary: string | null;
  proofElements: string | null;
  proofSummary: string | null;
  marketResearch: {
    marketSize: string | null;
    buyerPersona: string | null;
    commonObjections: string[];
    industryInsights: string[];
  };
  conversationHistory: Array<{
    role: string;
    content: string;
    timestamp: string;
  }>;
  readinessScore: number;
  selectedPath: string;
}

export default function Signup() {
  const navigate = useNavigate();
  const location = useLocation();
  const { sessionToken } = useSession();
  const consultationData = location.state?.consultationData;
  const redirectTo = location.state?.redirectTo || "/wizard";
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(searchParams.get('mode') === 'login');
  const [loading, setLoading] = useState(false);
  
  // Get session/consultationId from URL params - this is the key to preserving data
  // PRIORITY: Check sessionStorage first (stored before signup modal), then URL params
  const storedSessionId = typeof window !== 'undefined' ? sessionStorage.getItem('demo_session_id_for_migration') : null;
  const sessionIdFromUrl = storedSessionId || searchParams.get('session') || searchParams.get('consultationId');
  
  // Log the session ID source for debugging
  useEffect(() => {
    console.log('[Session Persistence] Retrieved after signup:', {
      storedSessionId,
      urlSession: searchParams.get('session'),
      urlConsultation: searchParams.get('consultationId'),
      final: sessionIdFromUrl,
    });
  }, [storedSessionId, searchParams, sessionIdFromUrl]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Demo origin detection
  const isFromDemo = searchParams.get('from') === 'demo';
  const [demoIntelligence, setDemoIntelligence] = useState<DemoIntelligence | null>(null);
  
  // Founders pricing flag
  const [foundersDiscount, setFoundersDiscount] = useState(false);
  const [companyName, setCompanyName] = useState("");
  
  // Load demo data on mount
  useEffect(() => {
    // Always check for Founders pricing from sessionStorage (even if not from demo)
    const savedEmail = sessionStorage.getItem('pageconsult_email');
    const savedCompany = sessionStorage.getItem('pageconsult_company');
    const isFounders = sessionStorage.getItem('pageconsult_founders') === 'true';
    
    if (savedEmail) {
      setEmail(savedEmail);
      console.log('📋 [Signup] Pre-filled email from sessionStorage');
    }
    if (savedCompany) {
      setCompanyName(savedCompany);
      console.log('📋 [Signup] Pre-filled company from sessionStorage');
    }
    if (isFounders) {
      setFoundersDiscount(true);
      console.log('💰 [Signup] Founders discount applied from demo');
    }
    
    if (isFromDemo) {
      const storedIntelligence = sessionStorage.getItem('demoIntelligence');
      if (storedIntelligence) {
        try {
          setDemoIntelligence(JSON.parse(storedIntelligence));
          console.log('📋 [Signup] Loaded demo intelligence from sessionStorage');
        } catch (e) {
          console.error('Failed to parse demo intelligence:', e);
        }
      }
      
      // Pre-fill email if available (legacy)
      const storedEmail = sessionStorage.getItem('demoEmail');
      if (storedEmail && !savedEmail) {
        setEmail(storedEmail);
      }
    }
  }, [isFromDemo]);

  // Helper: Load demo session from database if sessionStorage is empty
  const loadDemoSessionFromDatabase = async (sessionId: string): Promise<DemoIntelligence | null> => {
    console.log('📥 [Signup] Loading demo session from database:', sessionId);
    
    const { data: demoSession, error } = await supabase
      .from('demo_sessions')
      .select('*')
      .eq('session_id', sessionId)
      .maybeSingle();
    
    if (error || !demoSession) {
      console.error('❌ [Signup] Failed to load demo session from DB:', error);
      return null;
    }
    
    console.log('✅ [Signup] Loaded demo session from database:', {
      hasIntelligence: !!demoSession.extracted_intelligence,
      readiness: demoSession.readiness,
    });
    
    const intel = demoSession.extracted_intelligence as any;
    if (!intel) return null;
    
    return {
      sessionId: demoSession.session_id,
      source: 'demo',
      capturedAt: demoSession.created_at || new Date().toISOString(),
      industry: intel.industry || null,
      industrySummary: intel.industrySummary || null,
      audience: intel.audience || null,
      audienceSummary: intel.audienceSummary || null,
      valueProp: intel.valueProp || null,
      valuePropSummary: intel.valuePropSummary || null,
      competitorDifferentiator: intel.competitorDifferentiator || null,
      edgeSummary: intel.edgeSummary || null,
      painPoints: intel.painPoints || null,
      painSummary: intel.painSummary || null,
      buyerObjections: intel.buyerObjections || null,
      objectionsSummary: intel.objectionsSummary || null,
      proofElements: intel.proofElements || null,
      proofSummary: intel.proofSummary || null,
      marketResearch: intel.marketResearch || {
        marketSize: null,
        buyerPersona: null,
        commonObjections: [],
        industryInsights: [],
      },
      conversationHistory: intel.conversationHistory || [],
      readinessScore: demoSession.readiness || intel.readinessScore || 0,
      selectedPath: intel.selectedPath || 'wizard',
    };
  };

  // Helper: Create consultation from demo intelligence (either from sessionStorage or DB)
  const createConsultationFromIntelligence = async (userId: string, intel: DemoIntelligence): Promise<string | null> => {
    // ========== PRE-INSERT LOGGING ==========
    console.log('[Consultation Creation] ========== ATTEMPTING INSERT ==========');
    console.log('[Consultation Creation] User ID:', userId);
    console.log('[Consultation Creation] Intel object keys:', Object.keys(intel));
    console.log('[Consultation Creation] Intel values:', JSON.stringify(intel, null, 2));
    console.log('[Consultation Creation] Readiness score:', intel.readinessScore);
    
    const insertPayload = {
      user_id: userId,
      industry: intel.industry,
      target_audience: intel.audience,
      unique_value: intel.valueProp,
      competitor_differentiator: intel.competitorDifferentiator,
      audience_pain_points: intel.painPoints ? [intel.painPoints] : [],
      authority_markers: intel.proofElements ? [intel.proofElements] : [],
      extracted_intelligence: {
        ...intel,
        source: 'demo',
        transferredAt: new Date().toISOString(),
      },
      consultation_status: intel.industry && intel.audience ? 'identified' : 'not_started',
      status: 'in_progress',
      readiness_score: intel.readinessScore,
      flow_state: 'signed_up',
    };
    
    console.log('[Consultation Creation] Insert payload:', JSON.stringify(insertPayload, null, 2));
    
    const { data: consultation, error } = await supabase
      .from('consultations')
      .insert(insertPayload)
      .select()
      .single();
    
    if (error || !consultation) {
      console.error('[Consultation Creation] ========== FULL ERROR DUMP ==========');
      console.error('[Consultation Creation] Raw error object:', error);
      console.error('[Consultation Creation] JSON stringified:', JSON.stringify(error, null, 2));
      console.error('[Consultation Creation] error.message:', error?.message);
      console.error('[Consultation Creation] error.details:', error?.details);
      console.error('[Consultation Creation] error.hint:', error?.hint);
      console.error('[Consultation Creation] error.code:', error?.code);
      console.error('[Consultation Creation] ========== DATA ATTEMPTED ==========');
      console.error('[Consultation Creation] Insert payload was:', JSON.stringify(insertPayload, null, 2));
      console.error('[Consultation Creation] =====================================');
      return null;
    }
    
    console.log('✅ [Signup] Created consultation:', consultation.id);
    
    // Claim the demo session
    const sessionId = intel.sessionId;
    if (sessionId) {
      await supabase
        .from('demo_sessions')
        .update({ 
          claimed_by: userId, 
          claimed_at: new Date().toISOString() 
        })
        .eq('session_id', sessionId)
        .is('claimed_by', null);
    }
    
    // Clean up sessionStorage
    sessionStorage.removeItem('demoIntelligence');
    sessionStorage.removeItem('demoEmail');
    
    return consultation.id;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check for pending session from Brand Intake flow
      const pendingSessionId = sessionStorage.getItem('pendingSessionId');
      
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;

        // Migrate anonymous session if exists
        if (sessionToken) {
          await migrateAnonymousSession(sessionToken);
        }
        
        // Migrate guest session if exists
        const { data: { user: loggedInUser } } = await supabase.auth.getUser();
        if (loggedInUser && hasGuestSession()) {
          const migrationResult = await handlePostAuthMigration(loggedInUser.id);
          if (migrationResult?.success) {
            console.log('✅ [Signup] Guest session migrated on login');
          }
        }

        toast({
          title: "Welcome back!",
          description: "Redirecting..."
        });
        
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate(redirectTo, { replace: true });
          return;
        }
        
        // PRIORITY 1: If we have a session from URL or stored, use it (don't check for old sessions!)
        if (sessionIdFromUrl) {
          console.log('🚀 [Login] Session found - loading demo session:', sessionIdFromUrl);
          
          // Clear the stored session ID since we're using it now
          sessionStorage.removeItem('demo_session_id_for_migration');
          
          // Try sessionStorage first, then database
          let intel = demoIntelligence;
          if (!intel) {
            intel = await loadDemoSessionFromDatabase(sessionIdFromUrl);
          }
          
          if (intel) {
            const consultationId = await createConsultationFromIntelligence(user.id, intel);
            if (consultationId) {
              // Store consultation ID for brand-setup to find
              sessionStorage.setItem('pendingConsultationId', consultationId);
              console.log('🚀 [Login] Redirecting to brand-setup with consultation:', consultationId);
              navigate(`/brand-setup?consultationId=${consultationId}`, { replace: true });
              return;
            }
          }
          
          // Fallback: go to brand-setup with session
          console.log('⚠️ [Login] No intelligence found, going to brand-setup with session');
          navigate(`/brand-setup?session=${sessionIdFromUrl}`, { replace: true });
          return;
        }
        
        // PRIORITY 2: Handle demo intelligence transfer (from sessionStorage)
        if (isFromDemo && demoIntelligence) {
          await createConsultationFromDemo(user.id);
          return;
        }
        
        // PRIORITY 3: Check for pending session from Brand Intake flow
        if (pendingSessionId) {
          console.log('🚀 Login: Found pending session, redirecting to /generate?session=', pendingSessionId);
          sessionStorage.removeItem('pendingSessionId');
          navigate(`/generate?session=${pendingSessionId}`, { replace: true });
          return;
        }
        
        // PRIORITY 4: If we have consultation data from state, use it
        if (consultationData) {
          await saveConsultationData(user.id);
          console.log('🚀 Login: Redirecting to', redirectTo, 'with consultation data');
          navigate(redirectTo, { state: { consultationData }, replace: true });
          return;
        }
        
        // PRIORITY 5: Check for existing completed consultation (only if no session param)
        const { data: existingConsultation } = await supabase
          .from("consultations")
          .select("id")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (existingConsultation) {
          console.log('🚀 Login: Found existing consultation:', existingConsultation.id);
          navigate(`/huddle?type=pre_brief&consultationId=${existingConsultation.id}`, { replace: true });
          return;
        }
        
        // No session, no consultation - go to default redirect
        navigate(redirectTo, { replace: true });
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/wizard`
          }
        });

        // Handle 422 error (user already exists) gracefully
        if (error) {
          if (error.status === 422 || error.message?.toLowerCase().includes('already registered')) {
            console.log('👤 [Signup] User already exists, switching to login mode');
            
            // Show friendly message
            toast({
              title: "Welcome back!",
              description: "You already have an account. Please log in instead.",
            });
            
            // Switch to login mode (preserves demo data in sessionStorage)
            setIsLogin(true);
            setLoading(false);
            return;
          }
          throw error;
        }

        // Migrate anonymous session if exists
        if (sessionToken && data.user) {
          await migrateAnonymousSession(sessionToken);
        }
        
        // Migrate guest session if exists
        if (data.user && hasGuestSession()) {
          const migrationResult = await handlePostAuthMigration(data.user.id);
          if (migrationResult?.success) {
            console.log('✅ [Signup] Guest session migrated on signup');
          }
        }

        toast({
          title: isFromDemo ? "Trial started!" : "Account created!",
          description: isFromDemo ? "Your strategy profile is ready." : "Redirecting..."
        });
        
        if (!data.user) {
          navigate(redirectTo, { replace: true });
          return;
        }
        
        // PRIORITY 1: If we have a session from URL or stored, use it (don't check for old sessions!)
        if (sessionIdFromUrl) {
          console.log('🚀 [Signup] Session found - loading demo session:', sessionIdFromUrl);
          
          // Clear the stored session ID since we're using it now
          sessionStorage.removeItem('demo_session_id_for_migration');
          
          // Try sessionStorage first, then database
          let intel = demoIntelligence;
          if (!intel) {
            intel = await loadDemoSessionFromDatabase(sessionIdFromUrl);
          }
          
          if (intel) {
            const consultationId = await createConsultationFromIntelligence(data.user.id, intel);
            if (consultationId) {
              // Store consultation ID for brand-setup to find
              sessionStorage.setItem('pendingConsultationId', consultationId);
              console.log('🚀 [Signup] Redirecting to brand-setup with consultation:', consultationId);
              navigate(`/brand-setup?consultationId=${consultationId}`, { replace: true });
              return;
            }
          }
          
          // Fallback: go to brand-setup with session
          console.log('⚠️ [Signup] No intelligence found, going to brand-setup with session');
          navigate(`/brand-setup?session=${sessionIdFromUrl}`, { replace: true });
          return;
        }
        
        // PRIORITY 2: Handle demo intelligence transfer (from sessionStorage only, no URL session)
        if (isFromDemo && demoIntelligence) {
          await createConsultationFromDemo(data.user.id);
          return;
        }
        
        // PRIORITY 3: Check for pending session from Brand Intake flow
        if (pendingSessionId) {
          console.log('🚀 Signup: Found pending session, redirecting to /generate?session=', pendingSessionId);
          sessionStorage.removeItem('pendingSessionId');
          navigate(`/generate?session=${pendingSessionId}`, { replace: true });
          return;
        }
        
        // PRIORITY 4: If we have consultation data from state, use it
        if (consultationData) {
          await saveConsultationData(data.user.id);
          console.log('🚀 Signup: Redirecting to', redirectTo, 'with consultation data');
          navigate(redirectTo, { state: { consultationData }, replace: true });
          return;
        }
        
        // No session, no consultation - go to default redirect
        navigate(redirectTo, { replace: true });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createConsultationFromDemo = async (userId: string) => {
    if (!demoIntelligence) return;
    
    const sessionId = searchParams.get('session');
    const isReady = searchParams.get('ready') === 'true';
    
    console.log('🚀 [Signup] Processing demo:', { 
      sessionId, 
      isReady, 
      readiness: demoIntelligence.readinessScore 
    });
    
    // HIGH READINESS (70%+): Create consultation and go to Huddle first
    if (isReady && sessionId) {
      console.log('🚀 [Signup] High readiness demo - creating consultation for huddle');
      
      try {
        // Claim the demo session
        const { error: claimError } = await supabase
          .from('demo_sessions')
          .update({ 
            claimed_by: userId, 
            claimed_at: new Date().toISOString() 
          })
          .eq('session_id', sessionId)
          .is('claimed_by', null);
        
        if (claimError) {
          console.error('⚠️ [Signup] Failed to claim session:', claimError);
        } else {
          console.log('✅ [Signup] Demo session claimed successfully');
        }
        
        // Create consultation with demo intelligence for the Huddle
        const { data: consultation, error: consultationError } = await supabase
          .from("consultations")
          .insert({
            user_id: userId,
            industry: demoIntelligence.industry,
            target_audience: demoIntelligence.audience,
            unique_value: demoIntelligence.valueProp,
            competitor_differentiator: demoIntelligence.competitorDifferentiator,
            audience_pain_points: demoIntelligence.painPoints ? [demoIntelligence.painPoints] : [],
            authority_markers: demoIntelligence.proofElements ? [demoIntelligence.proofElements] : [],
            extracted_intelligence: {
              ...demoIntelligence,
              source: 'demo',
              transferredAt: new Date().toISOString(),
            },
            consultation_status: 'identified',
            status: "in_progress",
            readiness_score: demoIntelligence.readinessScore,
            flow_state: 'signed_up',
          })
          .select()
          .single();
        
        if (consultationError || !consultation) {
          console.error('❌ [Signup] Failed to create consultation:', consultationError);
          navigate('/wizard', { replace: true });
          return;
        }
        
        console.log('✅ [Signup] Created consultation for high-readiness user:', consultation.id);
        
        // Trigger trial welcome email
        try {
          await supabase.functions.invoke('loops-sync', {
            body: {
              event: 'trial_started',
              email: email,
              userId: userId,
              properties: {
                trial_end: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
                days_remaining: 14,
                industry: demoIntelligence.industry,
                from_demo: true,
                readiness: demoIntelligence.readinessScore,
              },
            },
          });
          console.log('📧 [Signup] Trial welcome email triggered');
        } catch (emailErr) {
          console.error('Failed to trigger trial email:', emailErr);
        }
        
        // Clean up sessionStorage
        sessionStorage.removeItem('demoIntelligence');
        sessionStorage.removeItem('demoEmail');
        
        // Always go to Huddle first - the "prove I listened" moment
        console.log('🚀 [Signup] Redirecting to huddle with consultationId:', consultation.id);
        navigate(`/huddle?type=pre_brief&consultationId=${consultation.id}`, { replace: true });
        return;
        
      } catch (err) {
        console.error('Error in high-readiness flow:', err);
        // Fall through to normal flow on error
      }
    }
    
    // LOW READINESS: Continue with consultation creation
    console.log('🚀 [Signup] Lower readiness - creating consultation');
    
    try {
      // Claim the demo session for this user
      if (sessionId) {
        const { error: claimError } = await supabase
          .from('demo_sessions')
          .update({ 
            claimed_by: userId, 
            claimed_at: new Date().toISOString() 
          })
          .eq('session_id', sessionId)
          .is('claimed_by', null);
        
        if (!claimError) {
          console.log('✅ [Signup] Demo session claimed successfully');
        } else {
          console.error('⚠️ [Signup] Failed to claim session:', claimError);
        }
      }
      
      // Create consultation with demo intelligence pre-filled
      const { data: consultation, error } = await supabase
        .from("consultations")
        .insert({
          user_id: userId,
          industry: demoIntelligence.industry,
          target_audience: demoIntelligence.audience,
          unique_value: demoIntelligence.valueProp,
          competitor_differentiator: demoIntelligence.competitorDifferentiator,
          audience_pain_points: demoIntelligence.painPoints ? [demoIntelligence.painPoints] : [],
          authority_markers: demoIntelligence.proofElements ? [demoIntelligence.proofElements] : [],
          extracted_intelligence: {
            ...demoIntelligence,
            source: 'demo',
            transferredAt: new Date().toISOString(),
          },
          consultation_status: demoIntelligence.industry && demoIntelligence.audience ? 'identified' : 'not_started',
          status: "in_progress",
          readiness_score: demoIntelligence.readinessScore,
        })
        .select()
        .single();
      
      if (error) {
        console.error('Failed to create consultation:', error);
        navigate('/wizard', { replace: true });
        return;
      }
      
      console.log('✅ [Signup] Consultation created:', consultation.id);
      
      // Trigger trial welcome email via Loops.so
      try {
        await supabase.functions.invoke('loops-sync', {
          body: {
            event: 'trial_started',
            email: email,
            userId: userId,
            properties: {
              trial_end: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
              days_remaining: 14,
              industry: demoIntelligence.industry,
              from_demo: true,
            },
          },
        });
        console.log('📧 [Signup] Trial welcome email triggered');
      } catch (emailErr) {
        console.error('Failed to trigger trial email:', emailErr);
      }
      
      // Clean up sessionStorage
      sessionStorage.removeItem('demoIntelligence');
      sessionStorage.removeItem('demoEmail');
      
      // Use Flow Engine for intelligent routing
      await updateFlowState(consultation.id, 'signed_up', 'signup_complete');
      const decision = await getNextStep(consultation.id);
      
      console.log('🧭 [Signup] Flow decision:', decision);
      
      // Navigate based on Flow Engine decision
      if (decision.huddleType) {
        navigate(`/huddle?type=${decision.huddleType}&consultationId=${consultation.id}`, { replace: true });
      } else {
        navigate(`${decision.route}?consultationId=${consultation.id}`, { replace: true });
      }
      
    } catch (err) {
      console.error('Error creating consultation from demo:', err);
      navigate('/wizard', { replace: true });
    }
  };

  const migrateAnonymousSession = async (sessionToken: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      const response = await supabase.functions.invoke('migrate-anonymous-session', {
        body: { session_token: sessionToken }
      });

      if (response.error) {
        console.error('Failed to migrate session:', response.error);
      } else {
        console.log('✅ Anonymous session migrated successfully');
      }
    } catch (error) {
      console.error('Failed to migrate session:', error);
    }
  };

  const saveConsultationData = async (userId: string) => {
    if (!consultationData) return;

    try {
      const { error } = await supabase
        .from("consultations")
        .insert({
          user_id: userId,
          industry: consultationData.industry,
          service_type: consultationData.specificService,
          goal: consultationData.goal,
          target_audience: consultationData.targetAudience,
          challenge: consultationData.challenge,
          unique_value: consultationData.uniqueValue,
          offer: consultationData.goal,
          status: "completed"
        });

      if (error) {
        console.error("Failed to save consultation:", error);
      }
    } catch (error) {
      console.error("Failed to save consultation:", error);
    }
  };

  // Contextual signup UI for demo users
  if (isFromDemo) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
        {/* Premium dark gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f0a1f] via-[#1a1332] to-[#0f0a1f]" />
        
        {/* Ambient orbs - more celebratory */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl" />
        
        <div className="w-full max-w-md relative z-10">
          {/* Header - Trial focused */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-4">
              <img 
                src="/logo/whiteAsset_3combimark_darkmode.svg" 
                alt="PageConsult AI" 
                className="h-12 w-auto"
              />
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-sm font-medium mb-3">
              <Sparkles className="w-4 h-4" />
              Your strategy profile is ready
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
              🚀 Start Your 14-Day Free Trial
            </h1>
            <p className="text-gray-300 text-base">
              Create your account to build your first landing page — no credit card required.
            </p>
          </div>

          {/* Value bullets */}
          <div className="bg-slate-800/40 rounded-xl border border-slate-700/50 p-4 mb-6">
            {/* Founders Discount Banner */}
            {foundersDiscount && (
              <div className="mb-4 p-3 rounded-lg bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30">
                <div className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-medium text-emerald-300">
                    Founders Discount Applied: 50% Off First Year
                  </span>
                </div>
              </div>
            )}
            
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-green-400" />
                </div>
                <span className="text-gray-200 text-sm">
                  <span className="text-white font-medium">Complete AI Strategy Brief</span>
                  <span className="text-gray-400"> (exportable PDF)</span>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-green-400" />
                </div>
                <span className="text-gray-200 text-sm">
                  <span className="text-white font-medium">Full AI consultation</span>
                  <span className="text-gray-400"> (you're already halfway there)</span>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-green-400" />
                </div>
                <span className="text-gray-200 text-sm">
                  <span className="text-white font-medium">1 premium landing page</span>
                  <span className="text-gray-400"> generation</span>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-green-400" />
                </div>
                <span className="text-gray-200 text-sm">
                  <span className="text-white font-medium">ROI calculator</span>
                  <span className="text-gray-400"> built for your offer</span>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Clock className="w-3 h-3 text-green-400" />
                </div>
                <span className="text-gray-200 text-sm">
                  <span className="text-white font-medium">14 days</span>
                  <span className="text-gray-400"> to test everything</span>
                </span>
              </li>
            </ul>
          </div>

          {/* Premium glassmorphism card */}
          <div className="relative group">
            {/* Enhanced glow effect */}
            <div className="absolute inset-0 -m-2 bg-gradient-to-br from-amber-500/30 via-cyan-500/20 to-purple-500/30 rounded-2xl blur-2xl opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
            
            <div className="relative bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-amber-500/20 p-6 shadow-[0_0_40px_rgba(251,191,36,0.1)]">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-200 font-medium">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="bg-slate-800/60 border-white/10 text-white placeholder:text-gray-500 focus:border-amber-500/50 focus:ring-amber-500/20 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-200 font-medium">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    minLength={6}
                    className="bg-slate-800/60 border-white/10 text-white placeholder:text-gray-500 focus:border-amber-500/50 focus:ring-amber-500/20 transition-all"
                  />
                  {!isLogin && (
                    <p className="text-xs text-gray-400">
                      Must be at least 6 characters
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:via-amber-400 hover:to-amber-500 text-white font-semibold py-6 rounded-xl shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-all duration-300 border-0"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      {isLogin ? "Signing in..." : "Starting trial..."}
                    </>
                  ) : (
                    <>{isLogin ? "Sign In" : "Start Free Trial →"}</>
                  )}
                </Button>
              </form>

              <p className="text-center text-xs text-gray-500 mt-4">
                No credit card required • Cancel anytime
              </p>

              <div className="mt-4 text-center">
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-sm text-gray-400 hover:text-amber-400 transition-colors font-medium"
                  disabled={loading}
                >
                  {isLogin ? "Don't have an account? Start trial" : "Already have an account? Sign in"}
                </button>
              </div>

              <div className="mt-4 pt-4 border-t border-white/10">
                <button
                  onClick={() => navigate("/")}
                  className="text-sm text-gray-400 hover:text-amber-400 transition-colors w-full font-medium flex items-center justify-center gap-2"
                  disabled={loading}
                >
                  <span>←</span>
                  <span>Back to demo</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Standard signup UI (non-demo)
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
      {/* Premium dark gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f0a1f] via-[#1a1332] to-[#0f0a1f]" />
      
      {/* Ambient orbs */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-500/10 rounded-full blur-3xl" />
      
      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img 
              src="/logo/whiteAsset_3combimark_darkmode.svg" 
              alt="PageConsult AI" 
              className="h-12 w-auto"
            />
          </div>
          <p className="text-gray-300 text-lg">
            {isLogin ? "Welcome back" : "Create your account to start building"}
          </p>
        </div>

        {/* Premium glassmorphism card */}
        <div className="relative group">
          {/* Enhanced glow effect */}
          <div className="absolute inset-0 -m-2 bg-gradient-to-br from-cyan-500/30 via-purple-500/30 to-pink-500/30 rounded-2xl blur-2xl opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
          
          <div className="relative bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-cyan-500/20 p-8 shadow-[0_0_40px_rgba(6,182,212,0.15)]">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-200 font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="bg-slate-800/60 border-white/10 text-white placeholder:text-gray-500 focus:border-cyan-500/50 focus:ring-cyan-500/20 transition-all"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-200 font-medium">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  minLength={6}
                  className="bg-slate-800/60 border-white/10 text-white placeholder:text-gray-500 focus:border-cyan-500/50 focus:ring-cyan-500/20 transition-all"
                />
                {!isLogin && (
                  <p className="text-xs text-gray-400">
                    Must be at least 6 characters
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-cyan-600 via-cyan-500 to-cyan-600 hover:from-cyan-500 hover:via-cyan-400 hover:to-cyan-500 text-white font-semibold py-6 rounded-xl shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-300 border-0"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {isLogin ? "Signing in..." : "Creating account..."}
                  </>
                ) : (
                  <>{isLogin ? "Sign In" : "Create Account"}</>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-gray-400 hover:text-cyan-400 transition-colors font-medium"
                disabled={loading}
              >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-white/10">
              <button
                onClick={() => navigate("/")}
                className="text-sm text-gray-400 hover:text-cyan-400 transition-colors w-full font-medium flex items-center justify-center gap-2"
                disabled={loading}
              >
                <span>←</span>
                <span>Back to home</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}