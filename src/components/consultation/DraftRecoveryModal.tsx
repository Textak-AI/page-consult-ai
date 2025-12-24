import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileText, Plus, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Props {
  isOpen: boolean;
  draftDate: Date;
  draftBusinessName?: string;
  onContinue: () => void;
  onStartFresh: () => void;
  onDiscard: () => void;
}

export function DraftRecoveryModal({ 
  isOpen, 
  draftDate, 
  draftBusinessName,
  onContinue, 
  onStartFresh,
  onDiscard 
}: Props) {
  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-xl text-white">Welcome Back</DialogTitle>
          <DialogDescription className="text-slate-400">
            Choose how to continue with your consultation.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-slate-300 mb-6">
            You have an unfinished consultation
            {draftBusinessName && <span className="text-cyan-400 font-medium"> for "{draftBusinessName}"</span>}
            {' '}from {formatDistanceToNow(draftDate, { addSuffix: true })}.
          </p>
          
          <div className="space-y-3">
            <Button
              onClick={onContinue}
              className="w-full justify-start gap-3 bg-cyan-600 hover:bg-cyan-700 text-white h-12"
            >
              <FileText className="w-5 h-5" />
              Continue where I left off
            </Button>
            
            <Button
              onClick={onStartFresh}
              variant="outline"
              className="w-full justify-start gap-3 border-slate-600 bg-slate-800 text-white hover:bg-slate-700 h-12"
            >
              <Plus className="w-5 h-5" />
              Start a new consultation
            </Button>
            
            <Button
              onClick={onDiscard}
              variant="ghost"
              className="w-full justify-start gap-3 text-slate-400 hover:text-red-400 hover:bg-red-500/10 h-12"
            >
              <Trash2 className="w-5 h-5" />
              Discard draft and start fresh
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
