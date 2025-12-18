import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { History, Filter, Zap, RefreshCw, Wand2, Palette, Brain, FileText } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { UsageLogEntry, AIActionType } from '@/hooks/useAIActions';

interface UsageHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  usageLog: UsageLogEntry[];
  available: number;
  limit: number;
  rollover: number;
  isPro: boolean;
  daysUntilReset: number;
}

const ACTION_ICONS: Record<AIActionType, typeof Zap> = {
  page_generation: FileText,
  section_regeneration: RefreshCw,
  ai_improvement: Wand2,
  intelligence_refresh: Brain,
  style_change: Palette,
};

const ACTION_LABELS: Record<AIActionType, string> = {
  page_generation: 'Generated page',
  section_regeneration: 'Regenerated section',
  ai_improvement: 'AI improvement',
  intelligence_refresh: 'Refreshed intelligence',
  style_change: 'Changed style',
};

export function UsageHistoryModal({
  isOpen,
  onClose,
  usageLog,
  available,
  limit,
  rollover,
  isPro,
  daysUntilReset,
}: UsageHistoryModalProps) {
  const [filterType, setFilterType] = useState<string>('all');

  const filteredLog = useMemo(() => {
    if (filterType === 'all') return usageLog;
    return usageLog.filter(entry => entry.action_type === filterType);
  }, [usageLog, filterType]);

  const totalUsed = usageLog.reduce((sum, entry) => sum + entry.action_cost, 0);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg bg-slate-900 border-slate-700 max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <History className="w-5 h-5 text-cyan-400" />
            Usage History
          </DialogTitle>
        </DialogHeader>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 text-center">
            <p className="text-2xl font-bold text-cyan-400">{available}</p>
            <p className="text-xs text-slate-500">Remaining</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 text-center">
            <p className="text-2xl font-bold text-slate-300">{totalUsed}</p>
            <p className="text-xs text-slate-500">Used</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 text-center">
            <p className="text-2xl font-bold text-slate-300">{daysUntilReset}</p>
            <p className="text-xs text-slate-500">Days left</p>
          </div>
        </div>

        {isPro && rollover > 0 && (
          <div className="px-3 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
            <p className="text-sm text-cyan-300">
              <span className="font-medium">Pro perk:</span> {rollover} actions rolled over from last month
            </p>
          </div>
        )}

        {/* Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-48 bg-slate-800 border-slate-700 text-slate-300">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="all">All actions</SelectItem>
              <SelectItem value="page_generation">Page generation</SelectItem>
              <SelectItem value="section_regeneration">Section regeneration</SelectItem>
              <SelectItem value="ai_improvement">AI improvement</SelectItem>
              <SelectItem value="intelligence_refresh">Intelligence refresh</SelectItem>
              <SelectItem value="style_change">Style change</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Log entries */}
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-2">
            {filteredLog.length === 0 ? (
              <p className="text-center text-slate-500 py-8">
                No actions recorded yet
              </p>
            ) : (
              filteredLog.map((entry) => {
                const Icon = ACTION_ICONS[entry.action_type] || Zap;
                return (
                  <div
                    key={entry.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700/30"
                  >
                    <div className="p-2 rounded-lg bg-slate-700/50">
                      <Icon className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">
                        {ACTION_LABELS[entry.action_type]}
                        {entry.section_type && (
                          <span className="text-slate-400"> • {entry.section_type}</span>
                        )}
                      </p>
                      <p className="text-xs text-slate-500">
                        {format(new Date(entry.created_at), 'MMM d, h:mm a')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={cn(
                        'text-sm font-medium',
                        entry.action_cost > 1 ? 'text-amber-400' : 'text-slate-400'
                      )}>
                        -{entry.action_cost}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export default UsageHistoryModal;
