import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, Trash2, Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export function ResetAccountData() {
  const [isResetting, setIsResetting] = useState(false);
  const { toast } = useToast();

  const handleReset = async () => {
    setIsResetting(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Not logged in",
          description: "You must be logged in to reset your data.",
          variant: "destructive"
        });
        return;
      }

      console.log('🗑️ [Reset] Starting data reset for user:', user.id);

      // Delete in correct order (respect foreign keys)
      
      // 1. Delete landing pages first (may reference consultations)
      const { error: pagesError } = await supabase
        .from('landing_pages')
        .delete()
        .eq('user_id', user.id);
      
      if (pagesError) {
        console.error('Error deleting landing pages:', pagesError);
      } else {
        console.log('✅ [Reset] Landing pages deleted');
      }

      // 2. Delete beta pages
      const { error: betaPagesError } = await supabase
        .from('beta_pages')
        .delete()
        .eq('user_id', user.id);
      
      if (betaPagesError) {
        console.error('Error deleting beta pages:', betaPagesError);
      } else {
        console.log('✅ [Reset] Beta pages deleted');
      }

      // 3. Delete consultations
      const { error: consultationsError } = await supabase
        .from('consultations')
        .delete()
        .eq('user_id', user.id);
      
      if (consultationsError) {
        console.error('Error deleting consultations:', consultationsError);
      } else {
        console.log('✅ [Reset] Consultations deleted');
      }

      // 4. Delete consultation sessions
      const { error: sessionsError } = await supabase
        .from('consultation_sessions')
        .delete()
        .eq('user_id', user.id);
      
      if (sessionsError) {
        console.error('Error deleting consultation sessions:', sessionsError);
      } else {
        console.log('✅ [Reset] Consultation sessions deleted');
      }

      // 5. Delete consultation drafts
      const { error: draftsError } = await supabase
        .from('consultation_drafts')
        .delete()
        .eq('user_id', user.id);
      
      if (draftsError) {
        console.error('Error deleting consultation drafts:', draftsError);
      } else {
        console.log('✅ [Reset] Consultation drafts deleted');
      }

      // 6. Delete demo sessions (uses claimed_by for user association)
      const { error: demoError } = await supabase
        .from('demo_sessions')
        .delete()
        .eq('claimed_by', user.id);
      
      if (demoError) {
        console.error('Error deleting demo sessions:', demoError);
      } else {
        console.log('✅ [Reset] Demo sessions deleted');
      }

      // 7. Delete persona intelligence
      const { error: personaError } = await supabase
        .from('persona_intelligence')
        .delete()
        .eq('user_id', user.id);
      
      if (personaError) {
        console.error('Error deleting persona intelligence:', personaError);
      } else {
        console.log('✅ [Reset] Persona intelligence deleted');
      }

      // 8. Delete generation logs
      const { error: logsError } = await supabase
        .from('generation_logs')
        .delete()
        .eq('user_id', user.id);
      
      if (logsError) {
        console.error('Error deleting generation logs:', logsError);
      } else {
        console.log('✅ [Reset] Generation logs deleted');
      }

      // 9. Clear localStorage
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
          key.includes('session') || 
          key.includes('consultation') || 
          key.includes('demo') ||
          key.includes('pageconsult') ||
          key.includes('wizard') ||
          key.includes('intelligence')
        )) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      console.log('✅ [Reset] localStorage cleared:', keysToRemove.length, 'keys');

      // 10. Clear sessionStorage too
      sessionStorage.clear();
      console.log('✅ [Reset] sessionStorage cleared');

      toast({
        title: "Account Reset Complete",
        description: "All your consultations, pages, and sessions have been deleted. You can start fresh!",
      });

      // Redirect to homepage after short delay
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);

    } catch (error) {
      console.error('Reset error:', error);
      toast({
        title: "Reset Failed",
        description: "Something went wrong. Check console for details.",
        variant: "destructive"
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="border border-destructive/30 rounded-xl p-6 bg-destructive/5">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-full bg-destructive/10">
          <AlertTriangle className="w-6 h-6 text-destructive" />
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground mb-1">
            Reset Account Data
          </h3>

          <p className="text-sm text-muted-foreground mb-4">
            Delete all your consultations, generated pages, and demo sessions. 
            Your account will remain, but all project data will be permanently removed.
            This is useful for testing the flow from scratch.
          </p>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive" 
                disabled={isResetting}
                className="gap-2"
              >
                {isResetting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Reset All My Data
                  </>
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription asChild>
                  <div>
                    <p className="mb-3">This will permanently delete:</p>
                    <ul className="list-disc list-inside space-y-1 mb-3">
                      <li>All your generated landing pages</li>
                      <li>All consultation history</li>
                      <li>All demo session data</li>
                      <li>All saved progress</li>
                    </ul>
                    <p className="font-medium text-destructive">This action cannot be undone.</p>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleReset} className="bg-destructive hover:bg-destructive/90">
                  Yes, Delete Everything
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
