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
      
      // A consultation from the demo continues in the form wizard with its answers
      if (consultationId) {
        console.log('🔄 [WizardChoice] Continuing consultation in the form wizard:', consultationId);
        sessionStorage.removeItem('pendingConsultationId'); // Clean up
        navigate(`/wizard/form?consultationId=${consultationId}`, { replace: true });
        return;
      }
      
      // If user has a session from demo, go to brand setup
      if (sessionId) {
        console.log('🔄 [WizardChoice] Redirecting to brand setup - user has session:', sessionId);
        navigate(`/brand-setup?session=${sessionId}`, { replace: true });
        return;
      }
      
      const { data: { user } } = await supabase.auth.getUser();

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
