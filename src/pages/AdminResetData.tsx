import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, Trash2, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface DeletionResult {
  success: boolean;
  totalDeleted: number;
  deletionCounts: Record<string, number>;
  email: string;
}

export default function AdminResetData() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isChecked, setIsChecked] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletionResult, setDeletionResult] = useState<DeletionResult | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/signup?redirect=/admin/reset-data');
    }
  }, [user, isLoading, navigate]);

  const handleDeleteClick = () => {
    if (!isChecked) return;
    setShowConfirmDialog(true);
    setConfirmText('');
  };

  const handleConfirmDelete = async () => {
    if (confirmText !== 'DELETE') return;
    
    setIsDeleting(true);
    setShowConfirmDialog(false);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Not authenticated",
          description: "Please sign in to continue.",
          variant: "destructive",
        });
        navigate('/signup');
        return;
      }

      const response = await supabase.functions.invoke('reset-user-data', {});
      
      if (response.error) {
        throw new Error(response.error.message);
      }

      const result = response.data as DeletionResult;
      setDeletionResult(result);

      // Clear local storage
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
          key.includes('session') || 
          key.includes('consultation') || 
          key.includes('demo') ||
          key.includes('pageconsult') ||
          key.includes('wizard') ||
          key.includes('intelligence') ||
          key.includes('brand')
        )) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      sessionStorage.clear();

      toast({
        title: "Data Deleted Successfully",
        description: `Deleted ${result.totalDeleted} records across all tables.`,
      });

      // Redirect after 3 seconds
      setTimeout(() => {
        navigate('/');
      }, 3000);

    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Deletion Failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Show success state
  if (deletionResult) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Data Deleted</h1>
          <p className="text-muted-foreground mb-6">
            Successfully deleted {deletionResult.totalDeleted} records.
          </p>
          
          <div className="bg-muted/50 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm font-medium text-foreground mb-2">Deletion Summary:</p>
            <div className="space-y-1">
              {Object.entries(deletionResult.deletionCounts)
                .filter(([_, count]) => count > 0)
                .map(([table, count]) => (
                  <div key={table} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{table}</span>
                    <span className="text-foreground font-medium">{count}</span>
                  </div>
                ))}
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Redirecting to homepage in 3 seconds...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Warning Card */}
        <div className="bg-destructive/5 border-2 border-destructive/30 rounded-2xl p-8">
          {/* Big Warning Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 text-destructive" />
            </div>
          </div>

          {/* Warning Title */}
          <h1 className="text-2xl font-bold text-destructive text-center mb-4">
            ⚠️ Danger Zone
          </h1>

          {/* Warning Text */}
          <div className="bg-destructive/10 rounded-xl p-6 mb-6">
            <p className="text-destructive font-medium text-center text-lg mb-4">
              This will delete ALL your data:
            </p>
            <ul className="space-y-2 text-destructive/90">
              <li className="flex items-center gap-2">
                <Trash2 className="w-4 h-4 flex-shrink-0" />
                All consultation data and history
              </li>
              <li className="flex items-center gap-2">
                <Trash2 className="w-4 h-4 flex-shrink-0" />
                All generated landing pages
              </li>
              <li className="flex items-center gap-2">
                <Trash2 className="w-4 h-4 flex-shrink-0" />
                All brands and brand settings
              </li>
              <li className="flex items-center gap-2">
                <Trash2 className="w-4 h-4 flex-shrink-0" />
                All prospects and prospect pages
              </li>
              <li className="flex items-center gap-2">
                <Trash2 className="w-4 h-4 flex-shrink-0" />
                All demo sessions and saved progress
              </li>
              <li className="flex items-center gap-2">
                <Trash2 className="w-4 h-4 flex-shrink-0" />
                All generation logs and analytics
              </li>
            </ul>
          </div>

          <p className="text-center text-destructive font-bold text-lg mb-8">
            This action CANNOT be undone!
          </p>

          {/* User Info */}
          <div className="bg-muted/50 rounded-lg p-4 mb-6">
            <p className="text-sm text-muted-foreground text-center">
              Logged in as: <span className="font-medium text-foreground">{user.email}</span>
            </p>
          </div>

          {/* Checkbox */}
          <div className="flex items-start gap-3 mb-6 p-4 bg-background rounded-lg border border-border">
            <Checkbox
              id="understand"
              checked={isChecked}
              onCheckedChange={(checked) => setIsChecked(checked === true)}
              className="mt-0.5 border-destructive data-[state=checked]:bg-destructive data-[state=checked]:border-destructive"
            />
            <label 
              htmlFor="understand" 
              className="text-sm text-foreground cursor-pointer leading-relaxed"
            >
              I understand this will <span className="font-bold text-destructive">permanently delete all my data</span> and this action cannot be undone.
            </label>
          </div>

          {/* Delete Button */}
          <Button
            variant="destructive"
            size="lg"
            className="w-full gap-2 text-lg h-14"
            disabled={!isChecked || isDeleting}
            onClick={handleDeleteClick}
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-5 h-5" />
                Delete All My Data
              </>
            )}
          </Button>
        </div>

        {/* Note */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          This is a developer tool. Your account will remain active — only your project data will be deleted.
        </p>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Final Confirmation
            </DialogTitle>
            <DialogDescription>
              Type <span className="font-mono font-bold text-foreground">DELETE</span> to confirm you want to permanently delete all your data.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Input
              placeholder="Type DELETE to confirm"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
              className="text-center font-mono text-lg tracking-widest"
              autoFocus
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={confirmText !== 'DELETE'}
              onClick={handleConfirmDelete}
              className="gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
