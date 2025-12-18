import { useState } from 'react';
import { Zap, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface ActionConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  actionType: string;
  actionCost: number;
  remaining: number;
  dontShowAgain: boolean;
  onDontShowAgainChange: (value: boolean) => void;
}

const ACTION_LABELS: Record<string, string> = {
  page_generation: 'Generate Page',
  section_regeneration: 'Regenerate Section',
  ai_improvement: 'AI Improvement',
  intelligence_refresh: 'Refresh Intelligence',
  style_change: 'Change Style',
};

export function ActionConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  actionType,
  actionCost,
  remaining,
  dontShowAgain,
  onDontShowAgainChange,
}: ActionConfirmModalProps) {
  const afterAction = remaining - actionCost;
  const isLowAfter = afterAction <= 5;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Zap className="w-5 h-5 text-cyan-400" />
            Confirm AI Action
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            This action will use AI credits from your account.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <div>
              <p className="font-medium text-white">
                {ACTION_LABELS[actionType] || actionType}
              </p>
              <p className="text-sm text-slate-400">Action cost</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-cyan-400">-{actionCost}</p>
              <p className="text-xs text-slate-500">credits</p>
            </div>
          </div>

          <div className="flex items-center justify-between px-4">
            <span className="text-slate-400">Current balance</span>
            <span className="font-medium text-white">{remaining} credits</span>
          </div>
          
          <div className="flex items-center justify-between px-4">
            <span className="text-slate-400">After this action</span>
            <span className={cn(
              'font-medium',
              isLowAfter ? 'text-amber-400' : 'text-emerald-400'
            )}>
              {afterAction} credits
            </span>
          </div>

          {isLowAfter && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-amber-200">
                You're running low on credits. Consider upgrading for more actions.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2 mr-auto">
            <Checkbox
              id="dontShow"
              checked={dontShowAgain}
              onCheckedChange={(checked) => onDontShowAgainChange(checked as boolean)}
              className="border-slate-600"
            />
            <label
              htmlFor="dontShow"
              className="text-sm text-slate-400 cursor-pointer"
            >
              Don't show again this session
            </label>
          </div>
          <Button variant="outline" onClick={onClose} className="border-slate-600 text-slate-300">
            Cancel
          </Button>
          <Button onClick={onConfirm} className="bg-cyan-500 hover:bg-cyan-600 text-white">
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ActionConfirmModal;
