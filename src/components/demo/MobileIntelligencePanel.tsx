import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown, FileText, ArrowRight, BarChart3, Check, Circle } from 'lucide-react';
import { calculateIntelligenceScore } from '@/lib/intelligenceScoreCalculator';

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
}

export function MobileIntelligencePanel({
  extracted,
  isExpanded,
  onToggle,
  onGenerateClick,
  onReviewBrief,
}: MobileIntelligencePanelProps) {
  const score = calculateIntelligenceScore(extracted);
  const canGenerate = score.totalScore >= 70;
  
  const categories = [
    {
      label: 'WHO YOU ARE',
      items: [
        { name: 'Industry', value: extracted.industry },
        { name: 'Business Type', value: extracted.businessType },
      ],
    },
    {
      label: 'WHAT YOU OFFER',
      items: [
        { name: 'Value Prop', value: extracted.valueProp },
        { name: 'Edge', value: extracted.competitorDifferentiator },
      ],
    },
    {
      label: 'WHO YOU SERVE',
      items: [
        { name: 'Audience', value: extracted.audience },
        { name: 'Pain Points', value: extracted.painPoints },
      ],
    },
    {
      label: 'YOUR PROOF',
      items: [
        { name: 'Evidence', value: extracted.proofElements },
      ],
    },
  ];
  
  return (
    <div className="bg-slate-900 border-t border-slate-700/50 lg:hidden">
      {/* Collapsed header - always visible */}
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
          </div>
          <span className="text-sm font-medium text-slate-300">
            Intelligence Profile
          </span>
          <span className="text-sm font-bold text-cyan-400">
            {score.totalScore}/100
          </span>
        </div>
        
        <div className="flex items-center gap-2">
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
      
      {/* Progress bar mini */}
      <div className="px-4 pb-2">
        <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-purple-500"
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
              {/* Category breakdown */}
              <div className="space-y-3">
                {categories.map((category) => (
                  <CategoryRow 
                    key={category.label}
                    label={category.label} 
                    items={category.items} 
                  />
                ))}
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
                  className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                >
                  Generate Your Page
                  <ArrowRight className="w-4 h-4" />
                </button>
                
                {!canGenerate && (
                  <p className="text-center text-xs text-slate-500">
                    Share more to unlock generation ({70 - score.totalScore} points needed)
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper component for category rows
function CategoryRow({ 
  label, 
  items 
}: { 
  label: string; 
  items: { name: string; value?: string }[] 
}) {
  const filledCount = items.filter(i => i.value).length;
  
  return (
    <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/30">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">
          {label}
        </span>
        <span className="text-xs text-slate-400">
          {filledCount}/{items.length}
        </span>
      </div>
      <div className="space-y-1.5">
        {items.map((item) => (
          <div key={item.name} className="flex items-start gap-2">
            {item.value ? (
              <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
            ) : (
              <Circle className="w-3.5 h-3.5 text-slate-600 mt-0.5 flex-shrink-0" />
            )}
            <span className={`text-xs ${item.value ? 'text-slate-300' : 'text-slate-600'}`}>
              {item.name}
            </span>
            {item.value && (
              <span className="text-xs text-slate-400 truncate ml-auto max-w-[120px]">
                {item.value}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
