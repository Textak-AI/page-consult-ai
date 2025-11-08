import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { MessageCircle, Loader2 } from "lucide-react";

export default function Signup() {
  const navigate = useNavigate();
  const location = useLocation();
  const consultationData = location.state?.consultationData;
  const redirectTo = location.state?.redirectTo || "/wizard";
  const [isLogin, setIsLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;

        toast({
          title: "Welcome back!",
          description: "Redirecting..."
        });
        
        // If we have consultation data, save it and redirect to generate
        if (consultationData) {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await saveConsultationData(user.id);
          }
          navigate(redirectTo, { state: { consultationData } });
        } else {
          navigate(redirectTo);
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

        toast({
          title: "Account created!",
          description: "Redirecting..."
        });
        
        // If we have consultation data, save it and redirect to generate
        if (consultationData && data.user) {
          await saveConsultationData(data.user.id);
          navigate(redirectTo, { state: { consultationData } });
        } else {
          navigate(redirectTo);
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
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <MessageCircle className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">PageConsult AI</h1>
          </div>
          <p className="text-muted-foreground">
            {isLogin ? "Welcome back" : "Create your account to start building"}
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-8 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
              />
              {!isLogin && (
                <p className="text-xs text-muted-foreground">
                  Must be at least 6 characters
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              disabled={loading}
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <button
              onClick={() => navigate("/")}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors w-full"
              disabled={loading}
            >
              ← Back to home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}