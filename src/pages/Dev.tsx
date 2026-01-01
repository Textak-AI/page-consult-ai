import { ResetAccountData } from '@/components/dev/ResetAccountData';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { isDevMode, isDevUser } from '@/config/devMode';
import { ArrowLeft, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DevPage() {
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/');
        return;
      }
      
      setUserEmail(user.email || null);
      
      // Use existing dev mode check from devMode.ts
      if (isDevMode(user.email) || isDevUser(user.email)) {
        setIsAuthorized(true);
      } else {
        navigate('/');
      }
    };
    
    checkAuth();
  }, [navigate]);

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Wrench className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Developer Tools</h1>
        </div>
        
        <p className="text-muted-foreground mb-8">
          Tools for testing and debugging. Logged in as: <span className="text-foreground font-medium">{userEmail}</span>
        </p>

        <div className="space-y-6">
          <ResetAccountData />
          
          {/* Add more dev tools here as needed */}
        </div>
      </div>
    </div>
  );
}
