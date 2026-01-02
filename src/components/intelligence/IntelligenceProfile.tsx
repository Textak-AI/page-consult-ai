import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
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
      {/* Header */}
      <div className="p-4 border-b border-cyan-500/10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white">
              Intelligence Profile
            </h3>
          </div>
          <span className={cn(
            "text-lg font-bold tabular-nums transition-colors",
            totalReadiness >= 71 ? 'text-cyan-400' : 'text-slate-400'
          )}>
            {totalReadiness}% Ready
          </span>
        </div>
        
        {/* Total Progress Bar */}
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
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
        
        {/* Readiness Level Badge */}
        <div className="flex items-center gap-2 mt-3">
          <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider bg-cyan-500/20 text-cyan-400 uppercase">
            {readinessLevel}
          </span>
          
          {showDemoImportBadge && (
            <span className="text-[10px] text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Demo progress loaded
            </span>
          )}
        </div>
      </div>

      {/* Categories */}
      <div className="p-4 space-y-4">
        {categories.map((category, index) => (
          <CategorySection key={category.id} category={category} animationDelay={index * 100} />
        ))}
      </div>
      
      {/* Next Question Hint */}
      {nextQuestion && totalReadiness < 71 && (
        <div className="px-4 pb-4">
          <div className="p-3 rounded-lg bg-slate-800/50 border border-cyan-500/10">
            <div className="flex items-start gap-2">
              <span className="text-cyan-400">🎯</span>
              <p className="text-xs text-slate-300">
                <span className="text-cyan-400 font-medium">Next:</span>{' '}
                {nextQuestion}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Ready to Generate */}
      {totalReadiness >= 71 && (
        <div className="px-4 pb-4">
          <div className="p-3 rounded-lg bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20">
            <div className="flex items-center gap-2">
              <span className="animate-pulse">✨</span>
              <p className="text-sm text-cyan-300 font-medium">
                Ready to generate your landing page!
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
  const isComplete = category.score === 100;
  
  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), animationDelay);
    return () => clearTimeout(timer);
  }, [animationDelay]);
  
  return (
    <div 
      className={cn(
        "transition-opacity duration-300",
        animate ? "opacity-100" : "opacity-0"
      )}
    >
      {/* Category Header */}
      <div className="flex items-center gap-2 mb-2">
        {/* Progressive bar */}
        <div className="relative w-1 h-4 bg-slate-700 rounded-full overflow-hidden">
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
        
        {/* Category name */}
        <span className={cn(
          "text-xs font-medium transition-colors",
          isComplete ? 'text-cyan-400' : 'text-slate-400'
        )}>
          {category.name}
        </span>
        
        {/* Percentage */}
        <span className={cn(
          "text-[10px] tabular-nums ml-auto",
          isComplete ? 'text-cyan-400' : 'text-slate-500'
        )}>
          {category.score}%
        </span>
      </div>
      
      {/* Subcategories Grid */}
      <div className="grid grid-cols-2 gap-1.5 pl-3">
        {category.subcategories.map((sub, subIndex) => (
          <SubcategoryItem 
            key={sub.id} 
            subcategory={sub} 
            animationDelay={animationDelay + (subIndex * 50)}
          />
        ))}
      </div>
    </div>
  );
}

function SubcategoryItem({ 
  subcategory,
  animationDelay = 0
}: { 
  subcategory: Subcategory;
  animationDelay?: number;
}) {
  const [showGlow, setShowGlow] = useState(false);
  const [animate, setAnimate] = useState(false);
  const isFilled = subcategory.value && subcategory.confidence >= 70;
  
  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), animationDelay);
    return () => clearTimeout(timer);
  }, [animationDelay]);
  
  // Trigger glow animation when justFilled changes
  useEffect(() => {
    if (subcategory.justFilled) {
      setShowGlow(true);
      const timer = setTimeout(() => setShowGlow(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [subcategory.justFilled]);
  
  return (
    <div 
      className={cn(
        "flex items-start gap-1.5 p-1.5 rounded-md transition-all duration-300",
        animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1",
        showGlow && "animate-[bar-glow_0.6s_ease-out]"
      )}
    >
      {/* Vertical bar indicator */}
      <div 
        className={cn(
          "w-0.5 h-full min-h-[24px] rounded-full transition-all duration-300",
          isFilled 
            ? 'bg-cyan-400 shadow-[0_0_8px_rgba(0,255,255,0.4)]' 
            : 'bg-slate-700'
        )}
      />
      
      {/* Label and value */}
      <div className="flex-1 min-w-0">
        <span className="flex items-center gap-1">
          <span className={cn(
            "text-[10px] transition-colors",
            isFilled ? 'text-slate-300' : 'text-slate-500'
          )}>
            {subcategory.shortLabel}
          </span>
          {subcategory.source === 'demo' && isFilled && (
            <span className="text-cyan-400 text-[8px]">•</span>
          )}
        </span>
        <span className={cn(
          "text-xs truncate block transition-colors",
          isFilled ? 'text-cyan-400' : 'text-slate-600'
        )}>
          {subcategory.value || '—'}
        </span>
      </div>
    </div>
  );
}

export default IntelligenceProfile;
