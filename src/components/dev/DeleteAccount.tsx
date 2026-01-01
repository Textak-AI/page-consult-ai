import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Skull, Loader2 } from 'lucide-react';
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

export function DeleteAccount() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (confirmText !== 'DELETE') {
      toast({
        title: "Confirmation required",
        description: "Please type DELETE to confirm.",
        variant: "destructive"
      });
      return;
    }

    setIsDeleting(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Not logged in",
          description: "No user to delete.",
          variant: "destructive"
        });
        return;
      }

      console.log('💀 [DeleteAccount] Starting full account deletion for:', user.id, user.email);

      // 1. Delete all user data first (respecting foreign keys)
      const tablesToDelete = [
        'landing_pages',
        'beta_pages',
        'consultations',
        'consultation_sessions',
        'consultation_drafts',
        'brand_briefs',
        'user_usage',
        'user_plans',
        'usage_log',
        'persona_intelligence',
        'generation_logs',
        'testimonial_requests',
        'subscriptions',
        'prospect_pages',
        'admin_roles'
      ] as const;

      for (const tableName of tablesToDelete) {
        try {
          const { error } = await supabase
            .from(tableName)
            .delete()
            .eq('user_id', user.id);
          
          if (error) {
            console.error(`Error deleting from ${tableName}:`, error);
          } else {
            console.log(`✅ ${tableName} deleted`);
          }
        } catch (e) {
          console.error(`Error deleting from ${tableName}:`, e);
        }
      }

      // 2. Clear all local storage
      localStorage.clear();
      sessionStorage.clear();
      console.log('✅ Local storage cleared');

      // 3. Delete the auth user via edge function
      const { error: deleteAuthError } = await supabase.functions.invoke('delete-user', {
        body: { userId: user.id }
      });

      if (deleteAuthError) {
        console.error('Error deleting auth user:', deleteAuthError);
        toast({
          title: "Partial Deletion",
          description: "Data deleted but account removal failed. Contact support.",
          variant: "destructive"
        });
        return;
      }
      
      console.log('✅ Auth user deleted');

      // 4. Sign out
      await supabase.auth.signOut();
      console.log('✅ Signed out');

      toast({
        title: "Account Deleted",
        description: "Your account has been completely removed. Redirecting...",
      });

      // 5. Redirect to homepage
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);

    } catch (error) {
      console.error('Delete account error:', error);
      toast({
        title: "Deletion Failed",
        description: "Something went wrong. Check console for details.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="border border-destructive/50 rounded-xl p-6 bg-destructive/5">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-lg bg-destructive/20">
          <Skull className="w-6 h-6 text-destructive" />
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground mb-1">
            Delete Entire Account
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Nuclear option: Completely removes your account from the system. 
            You'll need to sign up again with the same email as a brand new user. 
            All data will be permanently destroyed.
          </p>
          
          <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive" 
                disabled={isDeleting}
                className="gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Skull className="w-4 h-4" />
                    Delete My Account
                  </>
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-background border-destructive/50">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-destructive flex items-center gap-2">
                  <Skull className="w-5 h-5" />
                  Delete Your Account?
                </AlertDialogTitle>
                <AlertDialogDescription asChild>
                  <div className="space-y-4">
                    <p>This will permanently delete:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Your user account</li>
                      <li>All landing pages</li>
                      <li>All consultations</li>
                      <li>All session data</li>
                      <li>Everything associated with your email</li>
                    </ul>
                    <p className="text-destructive font-medium">
                      ⚠️ You will need to sign up again to use PageConsult.
                    </p>
                    <div className="pt-2">
                      <label className="text-sm font-medium text-foreground">
                        Type DELETE to confirm:
                      </label>
                      <Input
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        placeholder="Type DELETE"
                        className="mt-2 bg-background border-border"
                      />
                    </div>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel 
                  onClick={() => setConfirmText('')}
                >
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={confirmText !== 'DELETE' || isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? 'Deleting...' : 'Permanently Delete Account'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
