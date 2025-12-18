import { useState } from 'react';
import { Zap, Sparkles, ArrowRight, Gift } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ZeroBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestGrace: () => Promise<{ success: boolean; error?: string }>;
  graceAlreadyUsed: boolean;
}

export function ZeroBalanceModal({
  isOpen,
  onClose,
  onRequestGrace,
  graceAlreadyUsed,
}: ZeroBalanceModalProps) {
  const [requesting, setRequesting] = useState(false);
  const [graceGranted, setGraceGranted] = useState(false);

  const handleRequestGrace = async () => {
    setRequesting(true);
    const result = await onRequestGrace();
    setRequesting(false);
    
    if (result.success) {
      setGraceGranted(true);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg bg-slate-900 border-slate-700">
        <DialogHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-cyan-400" />
          </div>
          <DialogTitle className="text-xl text-white">
            You've been busy optimizing!
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            You've used all your AI actions this billing period. Great work on building your page!
          </DialogDescription>
        </DialogHeader>

        {graceGranted ? (
          <div className="py-6 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/30 mb-4">
              <Gift className="w-5 h-5 text-emerald-400" />
              <span className="text-emerald-300 font-medium">3 grace actions granted!</span>
            </div>
            <p className="text-slate-400 text-sm">
              You now have 3 more actions to finish up. Use them wisely!
            </p>
            <Button
              onClick={onClose}
              className="mt-6 bg-cyan-500 hover:bg-cyan-600 text-white"
            >
              Continue Editing
            </Button>
          </div>
        ) : (
          <div className="py-4 space-y-4">
            {/* Upgrade CTA */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/20">
              <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                <Zap className="w-5 h-5 text-cyan-400" />
                Upgrade to Pro
              </h3>
              <ul className="space-y-2 text-sm text-slate-300 mb-4">
                <li className="flex items-center gap-2">
                  <span className="text-cyan-400">✓</span>
                  150 AI Actions per month (5x more!)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-cyan-400">✓</span>
                  Roll over up to 50 unused actions
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-cyan-400">✓</span>
                  Free AI Suggestions
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-cyan-400">✓</span>
                  Priority support
                </li>
              </ul>
              <Button className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white">
                Upgrade Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            {/* Grace actions */}
            {!graceAlreadyUsed && (
              <div className="text-center pt-2">
                <p className="text-sm text-slate-500 mb-2">
                  Need to finish something urgent?
                </p>
                <Button
                  variant="ghost"
                  onClick={handleRequestGrace}
                  disabled={requesting}
                  className="text-slate-400 hover:text-white"
                >
                  {requesting ? 'Requesting...' : 'Get 3 grace actions (one-time)'}
                </Button>
              </div>
            )}

            {graceAlreadyUsed && (
              <p className="text-center text-sm text-slate-500">
                You've already used your grace actions this billing period.
              </p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default ZeroBalanceModal;
