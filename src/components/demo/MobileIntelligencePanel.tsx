import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown, FileText, ArrowRight, BarChart3, Check, Circle, Lock, Unlock } from 'lucide-react';
import { calculateIntelligenceScore } from '@/lib/intelligenceScoreCalculator';
import { cn } from '@/lib/utils';

interface ExtractedIntelligence {
  industry?: string;
  audience?: string;
  valueProp?: string;
  businessType?: string;
  competitorDifferentiator?: string;
  painPoints?: string;
  proofElements?: string;
}

interface MobileIntelligencePanelProps {
  extracted: ExtractedIntelligence;
  isExpanded: boolean;
  onToggle: () => void;
  onGenerateClick: () => void;
  onReviewBrief: () => void;
  marketResearchComplete?: boolean;
}

export function MobileIntelligencePanel({
  extracted,
  isExpanded,
  onToggle,
  onGenerateClick,
  onReviewBrief,
  marketResearchComplete = false,
}: MobileIntelligencePanelProps) {
  const score = calculateIntelligenceScore(extracted, {
    marketResearchComplete,
  });
  const canGenerate = score.totalScore >= 70;
  const pointsToUnlock = Math.max(0, 70 - score.totalScore);
  
  // Calculate filled/total for quick view
  const categories = [
    {
      label: 'Identity',
      color: 'cyan',
      items: [
        { name: 'Industry', value: extracted.industry },
        { name: 'Audience', value: extracted.audience },
      ],
    },
    {
      label: 'Value',
      color: 'green',
      items: [
        { name: 'Value Prop', value: extracted.valueProp },
        { name: 'Edge', value: extracted.competitorDifferentiator },
      ],
    },
    {
      label: 'Buyer',
      color: 'purple',
      items: [
        { name: 'Pain Points', value: extracted.painPoints },
      ],
    },
    {
      label: 'Proof',
      color: 'amber',
      items: [
        { name: 'Evidence', value: extracted.proofElements },
      ],
    },
  ];
  
  const totalFilled = categories.reduce((acc, cat) => 
    acc + cat.items.filter(i => i.value).length, 0
  );
  const totalFields = categories.reduce((acc, cat) => acc + cat.items.length, 0);
  
  // Find next missing field for guidance
  const getNextField = () => {
    for (const cat of categories) {
      for (const item of cat.items) {
        if (!item.value) return item.name;
      }
    }
    return null;
  };
  
  return (
    <div className="bg-slate-900 border-t border-slate-700/50 lg:hidden">
      {/* Collapsed header - always visible */}
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          {/* Status icon */}
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center",
            canGenerate 
              ? "bg-emerald-500/20" 
              : "bg-gradient-to-br from-cyan-500/20 to-purple-500/20"
          )}>
            {canGenerate ? (
              <Unlock className="w-4 h-4 text-emerald-400" />
            ) : (
              <BarChart3 className="w-4 h-4 text-cyan-400" />
            )}
          </div>
          
          {/* Score display */}
          <div className="text-left">
            <div className="flex items-baseline gap-1">
              <span className={cn(
                "text-lg font-bold",
                canGenerate ? "text-emerald-400" : "text-cyan-400"
              )}>
                {score.totalScore}
              </span>
              <span className="text-xs text-slate-500">/100</span>
            </div>
            <p className="text-[10px] text-slate-500">
              {canGenerate ? 'Ready to generate' : `${pointsToUnlock} pts to unlock`}
            </p>
          </div>
        </div>
        
        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Quick field count */}
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700">
            <span className="text-xs font-mono text-cyan-400">{totalFilled}</span>
            <span className="text-[10px] text-slate-500">/{totalFields}</span>
          </div>
          
          {canGenerate && (
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Ready
            </span>
          )}
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronUp className="w-5 h-5 text-slate-400" />
          )}
        </div>
      </button>
      
      {/* Progress bar mini - always visible */}
      <div className="px-4 pb-2">
        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
          {/* 70 threshold marker */}
          <div 
            className="absolute top-0 bottom-0 w-0.5 bg-slate-600 z-10"
            style={{ left: '70%' }}
          />
          <motion.div
            className={cn(
              "h-full rounded-full",
              canGenerate 
                ? "bg-gradient-to-r from-emerald-500 to-cyan-500"
                : "bg-gradient-to-r from-cyan-500 to-purple-500"
            )}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(score.totalScore, 100)}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>
      
      {/* Expanded content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4">
              {/* Next step guidance */}
              {!canGenerate && getNextField() && (
                <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg border border-slate-700/30">
                  <span className="text-[10px] text-slate-500 uppercase">Next needed</span>
                  <span className="text-xs text-cyan-400 font-medium">{getNextField()}</span>
                </div>
              )}
              
              {/* Category breakdown - compact grid */}
              <div className="grid grid-cols-2 gap-2">
                {categories.map((category) => {
                  const filled = category.items.filter(i => i.value).length;
                  const total = category.items.length;
                  const isComplete = filled === total;
                  
                  return (
                    <CategoryCard 
                      key={category.label}
                      label={category.label}
                      color={category.color}
                      items={category.items}
                      filled={filled}
                      total={total}
                      isComplete={isComplete}
                    />
                  );
                })}
              </div>
              
              {/* Action buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={onReviewBrief}
                  className="w-full py-2.5 px-4 rounded-lg border border-slate-600/50 text-slate-300 hover:bg-slate-800/50 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <FileText className="w-4 h-4" />
                  Review Brief
                </button>
                
                <button
                  onClick={onGenerateClick}
                  disabled={!canGenerate}
                  className={cn(
                    "w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 text-sm transition-all",
                    canGenerate 
                      ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:from-emerald-400 hover:to-cyan-400"
                      : "bg-slate-800 text-slate-500 cursor-not-allowed"
                  )}
                >
                  {canGenerate ? (
                    <>
                      Generate Your Page
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      {pointsToUnlock} pts to unlock
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Compact category card for mobile grid
function CategoryCard({ 
  label, 
  color,
  items,
  filled,
  total,
  isComplete,
}: { 
  label: string; 
  color: string;
  items: { name: string; value?: string }[];
  filled: number;
  total: number;
  isComplete: boolean;
}) {
  const colorClasses = {
    cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400' },
    green: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400' },
    purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400' },
    amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400' },
  }[color] || { bg: 'bg-slate-500/10', border: 'border-slate-500/30', text: 'text-slate-400' };
  
  return (
    <div className={cn(
      "p-2.5 rounded-lg border transition-all",
      isComplete 
        ? `${colorClasses.bg} ${colorClasses.border}` 
        : "bg-slate-800/30 border-slate-700/30"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className={cn(
          "text-[10px] font-medium uppercase tracking-wide",
          isComplete ? colorClasses.text : "text-slate-400"
        )}>
          {label}
        </span>
        <div className={cn(
          "w-4 h-4 rounded-full flex items-center justify-center text-[10px]",
          isComplete 
            ? `${colorClasses.bg} ${colorClasses.text}` 
            : "bg-slate-700 text-slate-400"
        )}>
          {isComplete ? <Check className="w-2.5 h-2.5" /> : filled}
        </div>
      </div>
      
      {/* Items */}
      <div className="space-y-1">
        {items.map((item) => (
          <div key={item.name} className="flex items-center gap-1.5">
            {item.value ? (
              <Check className={cn("w-3 h-3 flex-shrink-0", colorClasses.text)} />
            ) : (
              <Circle className="w-3 h-3 text-slate-600 flex-shrink-0" />
            )}
            <span className={cn(
              "text-[11px] truncate",
              item.value ? "text-slate-300" : "text-slate-600"
            )}>
              {item.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
