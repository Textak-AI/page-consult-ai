import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface WelcomeBackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionData: {
    industry?: string;
    goal?: string;
    progress: string;
  };
  onContinue: () => void;
  onStartNew: () => void;
}

export function WelcomeBackModal({
  open,
  onOpenChange,
  sessionData,
  onContinue,
  onStartNew
}: WelcomeBackModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">👋 Welcome back!</DialogTitle>
          <DialogDescription className="text-base pt-2">
            You were building a landing page:
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 py-4 px-1">
          {sessionData.industry && (
            <div className="flex gap-2">
              <span className="font-semibold">Industry:</span>
              <span className="text-muted-foreground">{sessionData.industry}</span>
            </div>
          )}
          {sessionData.goal && (
            <div className="flex gap-2">
              <span className="font-semibold">Goal:</span>
              <span className="text-muted-foreground">{sessionData.goal}</span>
            </div>
          )}
          <div className="flex gap-2">
            <span className="font-semibold">Progress:</span>
            <span className="text-muted-foreground">{sessionData.progress}</span>
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={onStartNew}
            className="flex-1"
          >
            Start New
          </Button>
          <Button
            onClick={onContinue}
            className="flex-1"
          >
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
