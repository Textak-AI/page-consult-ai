import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MessageSquare, ClipboardList, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function WizardChoice() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isChecking, setIsChecking] = useState(true);

  // Check for existing consultation/demo data and redirect appropriately
  useEffect(() => {
    const checkExistingData = async () => {
      const sessionId = searchParams.get('session');
      const consultationIdFromUrl = searchParams.get('consultationId');
      
      // Also check sessionStorage for pending consultation
      const pendingConsultationId = sessionStorage.getItem('pendingConsultationId');
      const consultationId = consultationIdFromUrl || pendingConsultationId;
      
      // If user has a consultationId, go to huddle (they already have data)
      if (consultationId) {
        console.log('🔄 [WizardChoice] Redirecting to huddle - user has consultation:', consultationId);
        sessionStorage.removeItem('pendingConsultationId'); // Clean up
        navigate(`/huddle?type=pre_brief&consultationId=${consultationId}`, { replace: true });
        return;
      }
      
      // If user has a session from demo, go to brand setup
      if (sessionId) {
        console.log('🔄 [WizardChoice] Redirecting to brand setup - user has session:', sessionId);
        navigate(`/brand-setup?session=${sessionId}`, { replace: true });
        return;
      }
      
      // Check if authenticated user has existing consultation with high readiness
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: consultation } = await supabase
          .from('consultations')
          .select('id, readiness_score, strategy_brief, extracted_intelligence')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (consultation) {
          const score = consultation.readiness_score || 0;
          
          console.log('[Demo Handoff] Route decision:', {
            hasConsultation: true,
            consultationId: consultation.id,
            hasStrategyBrief: !!consultation.strategy_brief,
            score,
            route: score >= 40 ? 'huddle' : 'show wizard choice',
          });
          
          // If they have meaningful consultation data, route to huddle
          if (score >= 40) {
            navigate(`/huddle?type=pre_brief&consultationId=${consultation.id}`, { replace: true });
            return;
          }
        }
      }
      
      // No existing data, show wizard choice
      setIsChecking(false);
    };
    
    checkExistingData();
  }, [searchParams, navigate]);

  // Show loading state while checking for existing data
  if (isChecking) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Checking your progress...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            How would you like to build?
          </h1>
          <p className="text-slate-400 text-lg">
            Choose the experience that fits your style
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <button
            onClick={() => navigate('/wizard/chat')}
            className="group p-8 bg-slate-800/50 border border-slate-700/50 rounded-2xl text-left hover:bg-slate-800 hover:border-purple-500/50 transition-all duration-200"
          >
            <div className="w-14 h-14 rounded-xl bg-purple-500/10 flex items-center justify-center mb-6">
              <MessageSquare className="w-7 h-7 text-purple-400" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Guided Conversation</h2>
            <p className="text-slate-400 mb-6">Tell me about your business and I will ask smart follow-ups</p>
            <div className="mt-6 flex items-center gap-2 text-purple-400 font-medium">
              Start Conversation
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>

          <button
            onClick={() => navigate('/wizard/form')}
            className="group p-8 bg-slate-800/50 border border-slate-700/50 rounded-2xl text-left hover:bg-slate-800 hover:border-cyan-500/50 transition-all duration-200"
          >
            <div className="w-14 h-14 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-6">
              <ClipboardList className="w-7 h-7 text-cyan-400" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Step-by-Step Form</h2>
            <p className="text-slate-400 mb-6">Fill in each field with full control over every detail</p>
            <div className="mt-6 flex items-center gap-2 text-cyan-400 font-medium">
              Start Form
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        </div>

        <p className="text-center text-slate-500 text-sm">
          Both paths create the same high-quality landing page.
        </p>
      </div>
    </div>
  );
}
