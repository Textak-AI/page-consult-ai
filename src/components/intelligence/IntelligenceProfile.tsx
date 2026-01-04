import { useState, useEffect } from 'react';
import { Sparkles, ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Subcategory {
  id: string;
  label: string;
  shortLabel: string;
  value: string | null;
  confidence: number;
  source?: 'demo' | 'consultation';
  justFilled?: boolean;
}

interface Category {
  id: string;
  name: string;
  weight: number;
  score: number;
  subcategories: Subcategory[];
}

interface IntelligenceProfileProps {
  categories: Category[];
  totalReadiness: number;
  readinessLevel: 'IDENTIFIED' | 'POSITIONED' | 'ARMED' | 'PROVEN';
  nextQuestion?: string;
  showDemoImportBadge?: boolean;
}

export function IntelligenceProfile({ 
  categories, 
  totalReadiness, 
  readinessLevel,
  nextQuestion,
  showDemoImportBadge = false,
}: IntelligenceProfileProps) {
  return (
    <div className="bg-slate-900/95 backdrop-blur-xl border border-cyan-500/20 rounded-xl overflow-hidden">
      {/* Header - Compact */}
      <div className="p-3 border-b border-cyan-500/10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <h3 className="text-xs font-semibold text-white">
              Intelligence Profile
            </h3>
          </div>
          <span className={cn(
            "text-sm font-bold tabular-nums transition-colors",
            totalReadiness >= 71 ? 'text-cyan-400' : 'text-slate-400'
          )}>
            {totalReadiness}%
          </span>
        </div>
        
        {/* Total Progress Bar */}
        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div 
            className={cn(
              "h-full transition-all duration-500 ease-out rounded-full",
              totalReadiness >= 71 
                ? 'bg-cyan-400 shadow-[0_0_10px_rgba(0,255,255,0.4)]'
                : 'bg-gradient-to-r from-cyan-600 to-cyan-400'
            )}
            style={{ width: `${totalReadiness}%` }}
          />
        </div>
        
        {/* Readiness Level Badge - Inline */}
        <div className="flex items-center gap-2 mt-2">
          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider bg-cyan-500/20 text-cyan-400 uppercase">
            {readinessLevel}
          </span>
          
          {showDemoImportBadge && (
            <span className="text-[9px] text-emerald-400 flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-emerald-400" />
              Demo loaded
            </span>
          )}
        </div>
      </div>

      {/* Categories - Compact spacing */}
      <div className="p-3 space-y-1">
        {categories.map((category, index) => (
          <CategorySection key={category.id} category={category} animationDelay={index * 50} />
        ))}
      </div>
      
      {/* Next Question Hint - Compact */}
      {nextQuestion && totalReadiness < 71 && (
        <div className="px-3 pb-3">
          <div className="p-2 rounded-lg bg-slate-800/50 border border-cyan-500/10">
            <div className="flex items-start gap-1.5">
              <span className="text-cyan-400 text-[10px]">🎯</span>
              <p className="text-[10px] text-slate-300 leading-tight">
                <span className="text-cyan-400 font-medium">Next:</span>{' '}
                {nextQuestion}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Ready to Generate - Compact */}
      {totalReadiness >= 71 && (
        <div className="px-3 pb-3">
          <div className="p-2 rounded-lg bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20">
            <div className="flex items-center gap-1.5">
              <span className="animate-pulse text-xs">✨</span>
              <p className="text-[11px] text-cyan-300 font-medium">
                Ready to generate!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CategorySection({ 
  category, 
  animationDelay = 0 
}: { 
  category: Category;
  animationDelay?: number;
}) {
  const [animate, setAnimate] = useState(false);
  const [isExpanded, setIsExpanded] = useState(category.score > 0);
  const isComplete = category.score === 100;
  
  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), animationDelay);
    return () => clearTimeout(timer);
  }, [animationDelay]);

  // Auto-expand when score increases from 0
  useEffect(() => {
    if (category.score > 0 && !isExpanded) {
      setIsExpanded(true);
    }
  }, [category.score]);

  const filledSubs = category.subcategories.filter(s => s.confidence >= 70);
  const emptySubsLabels = category.subcategories
    .filter(s => s.confidence < 70)
    .map(s => s.shortLabel);

  // Collapsed state for 0% categories
  if (category.score === 0 && !isExpanded) {
    return (
      <button 
        onClick={() => setIsExpanded(true)}
        className={cn(
          "w-full flex items-center gap-1.5 py-1 px-1 hover:bg-slate-800/30 rounded transition-all duration-300",
          animate ? "opacity-100" : "opacity-0"
        )}
      >
        <ChevronRight className="w-2.5 h-2.5 text-slate-600 flex-shrink-0" />
        <div className="h-1 w-8 bg-slate-700/30 rounded-full flex-shrink-0" />
        <span className="text-[9px] text-slate-500 uppercase tracking-wider flex-1 text-left truncate">
          {category.name}
        </span>
        <span className="text-[9px] text-slate-600 font-mono flex-shrink-0">0%</span>
      </button>
    );
  }
  
  return (
    <div 
      className={cn(
        "transition-opacity duration-300",
        animate ? "opacity-100" : "opacity-0"
      )}
    >
      {/* Category Header - Clickable to collapse */}
      <button 
        onClick={() => category.score === 0 && setIsExpanded(!isExpanded)}
        className={cn(
          "w-full flex items-center gap-1.5 py-0.5",
          category.score === 0 && "cursor-pointer hover:bg-slate-800/20 rounded"
        )}
      >
        {category.score === 0 ? (
          <ChevronDown className="w-2.5 h-2.5 text-slate-600 flex-shrink-0" />
        ) : (
          /* Progressive bar */
          <div className="relative w-0.5 h-3 bg-slate-700 rounded-full overflow-hidden flex-shrink-0">
            <div 
              className={cn(
                "absolute bottom-0 left-0 w-full transition-all duration-500 rounded-full",
                isComplete ? 'bg-cyan-400' : 'bg-cyan-600'
              )}
              style={{ height: `${category.score}%` }}
            />
            {isComplete && (
              <div className="absolute inset-0 bg-cyan-400 animate-[header-complete-glow_2s_ease-in-out_infinite]" />
            )}
          </div>
        )}
        
        {/* Category name */}
        <span className={cn(
          "text-[10px] font-medium transition-colors flex-1 text-left",
          isComplete ? 'text-cyan-400' : 'text-slate-400'
        )}>
          {category.name}
        </span>
        
        {/* Percentage */}
        <span className={cn(
          "text-[9px] tabular-nums flex-shrink-0",
          isComplete ? 'text-cyan-400' : 'text-slate-500'
        )}>
          {category.score}%
        </span>
      </button>
      
      {/* Filled subcategories - Wrapping format */}
      {filledSubs.length > 0 && (
        <div className="pl-3 space-y-1 mt-0.5">
          {filledSubs.map((sub) => (
            <div key={sub.id} className="flex items-start gap-1">
              <div className="w-0.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_4px_rgba(0,255,255,0.3)] flex-shrink-0 mt-0.5" />
              <span className="text-[9px] text-slate-400 flex-shrink-0">
                {sub.shortLabel}:
              </span>
              {sub.source === 'demo' && (
                <span className="text-cyan-400 text-[7px] flex-shrink-0">•</span>
              )}
              <span className="text-[10px] text-cyan-400 leading-tight break-words">
                {sub.value}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Empty subcategories - Compact single row */}
      {emptySubsLabels.length > 0 && (
        <div className="pl-3 mt-0.5 flex flex-wrap gap-x-2 gap-y-0.5">
          {emptySubsLabels.map((label) => (
            <span key={label} className="flex items-center gap-0.5">
              <span className="w-0.5 h-2 rounded-full bg-slate-700 flex-shrink-0" />
              <span className="text-[8px] text-slate-600">{label}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default IntelligenceProfile;
