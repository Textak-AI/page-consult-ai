import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { needsOnboarding } from '@/lib/onboarding';
import { supabase } from '@/integrations/supabase/client';

export default function WizardChoice() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

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
      
      // No existing work: new accounts get onboarding once, everyone else goes straight to the questions.
      // (The old either/or screen between chat and form is gone: the wizard runs for everyone.)
      if (user) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('onboarded_at')
          .eq('id', user.id)
          .maybeSingle();
        if (needsOnboarding(profile, !!error)) {
          navigate('/welcome', { replace: true });
          return;
        }
      }
      navigate('/wizard/form', { replace: true });
    };
    
    checkExistingData();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="text-center">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-4" />
        <p className="text-slate-400">Checking your progress...</p>
      </div>
    </div>
  );
}
