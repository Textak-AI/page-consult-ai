import { useState } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useSession } from "@/contexts/SessionContext";

export default function Signup() {
  const navigate = useNavigate();
  const location = useLocation();
  const { sessionToken } = useSession();
  const consultationData = location.state?.consultationData;
  const redirectTo = location.state?.redirectTo || "/wizard";
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(searchParams.get('mode') === 'login');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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

        toast({
          title: "Welcome back!",
          description: "Redirecting..."
        });
        
        // Check for pending session from Brand Intake flow first
        if (pendingSessionId) {
          console.log('🚀 Login: Found pending session, redirecting to /generate?session=', pendingSessionId);
          sessionStorage.removeItem('pendingSessionId');
          navigate(`/generate?session=${pendingSessionId}`, { replace: true });
          return;
        }
        
        // Check for existing completed consultation
        const { data: { user } } = await supabase.auth.getUser();
        if (user && !consultationData) {
          const { data: existingConsultation } = await supabase
            .from("consultations")
            .select("*")
            .eq("user_id", user.id)
            .eq("status", "completed")
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          if (existingConsultation) {
            // User has a completed consultation, redirect to generate
            console.log('🚀 Login: Found completed consultation, redirecting to /generate');
            navigate("/generate", { replace: true });
            return;
          }
        }
        
        // If we have consultation data, save it and redirect to generate
        if (consultationData) {
          if (user) {
            await saveConsultationData(user.id);
          }
          console.log('🚀 Login: Redirecting to', redirectTo, 'with consultation data:', consultationData);
          navigate(redirectTo, { state: { consultationData }, replace: true });
        } else {
          navigate(redirectTo, { replace: true });
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}${redirectTo}`
          }
        });

        if (error) throw error;

        // Migrate anonymous session if exists
        if (sessionToken && data.user) {
          await migrateAnonymousSession(sessionToken);
        }

        toast({
          title: "Account created!",
          description: "Redirecting..."
        });
        
        // Check for pending session from Brand Intake flow first
        if (pendingSessionId) {
          console.log('🚀 Signup: Found pending session, redirecting to /generate?session=', pendingSessionId);
          sessionStorage.removeItem('pendingSessionId');
          navigate(`/generate?session=${pendingSessionId}`, { replace: true });
          return;
        }
        
        // If we have consultation data, save it and redirect to generate
        if (consultationData && data.user) {
          await saveConsultationData(data.user.id);
          console.log('🚀 Signup: Redirecting to', redirectTo, 'with consultation data:', consultationData);
          navigate(redirectTo, { state: { consultationData }, replace: true });
        } else {
          navigate(redirectTo, { replace: true });
        }
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