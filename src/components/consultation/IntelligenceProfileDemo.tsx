import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ChevronDown, AlertCircle, Check, Loader2, Sparkles } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import type { IntelligenceScore, StrategicLevel, FieldScore } from '@/types/intelligenceScore';
import { CATEGORY_COLORS, LEVEL_COLORS } from '@/types/intelligenceScore';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  type IndustryDetection, 
  INDUSTRY_OPTIONS, 
  optionToVariant, 
  variantToDisplayName 
} from '@/lib/industryDetection';
import type { MarketResearch } from '@/contexts/IntelligenceContext';
import { type AestheticMode, isConfidentHybrid } from '@/lib/targetAesthetic';

// Category configuration for Demo view (only key fields)
const DEMO_CATEGORIES = [
  {
    key: 'whoYouAre' as const,
    label: 'Who You Are',
    fields: [
      { key: 'industry' as const, label: 'Industry' },
      { key: 'audience' as const, label: 'Audience' },
    ],
  },
  {
    key: 'whatYouOffer' as const,
    label: 'What You Offer',
    fields: [
      { key: 'valueProp' as const, label: 'Value Prop' },
      { key: 'edge' as const, label: 'Edge' },
    ],
  },
  {
    key: 'buyerReality' as const,
    label: 'Buyer Reality',
    fields: [
      { key: 'painPoints' as const, label: 'Pain Points' },
      { key: 'objections' as const, label: 'Objections' },
    ],
  },
  {
    key: 'proofCredibility' as const,
    label: 'Proof & Credibility',
    fields: [
      { key: 'results' as const, label: 'Results' },
      { key: 'socialProof' as const, label: 'Social Proof' },
    ],
  },
];

const LEVEL_CONFIG: Record<StrategicLevel, { label: string; sublabel?: string }> = {
  unqualified: { label: 'GETTING STARTED' },
  identified: { label: 'IDENTIFIED' },
  positioned: { label: 'POSITIONED', sublabel: 'Trial Unlocked' },
  armed: { label: 'ARMED', sublabel: 'Generate Ready' },
  proven: { label: 'PROVEN', sublabel: 'Premium Ready' },
};

interface Props {
  score: IntelligenceScore;
  industryDetection?: IndustryDetection | null;
  aestheticMode?: AestheticMode | null;
  marketResearch?: MarketResearch | null;
  onContinue?: () => void;
  onKeepChatting?: () => void;
  onIndustryCorrection?: (variant: string) => void;
  isThinking?: boolean;
  className?: string;
}

export function IntelligenceProfileDemo({
  score,
  industryDetection,
  aestheticMode,
  marketResearch,
  onContinue,
  onKeepChatting,
  onIndustryCorrection,
  isThinking = false,
  className,
}: Props) {
  const levelConfig = LEVEL_CONFIG[score.level];
  const levelColors = LEVEL_COLORS[score.level];
  
  // Mobile collapsed state
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Industry correction UI state
  const [showIndustryCorrection, setShowIndustryCorrection] = useState(false);
  
  // Track previous score for animations
  const prevScoreRef = useRef(score.totalScore);
  const [animatingFields, setAnimatingFields] = useState<Set<string>>(new Set());
  
  // Track industry changes for pulse animation
  const prevIndustryRef = useRef(industryDetection?.variant);
  const [industryJustChanged, setIndustryJustChanged] = useState(false);
  
  // Detect field changes for animations
  useEffect(() => {
    if (prevScoreRef.current !== score.totalScore) {
      // Find newly filled fields
      const newAnimating = new Set<string>();
      
      DEMO_CATEGORIES.forEach(cat => {
        const category = score[cat.key];
        cat.fields.forEach(field => {
          const fieldData = category[field.key] as FieldScore;
          if (fieldData.value) {
            newAnimating.add(`${cat.key}-${field.key}`);
          }
        });
      });
      
      setAnimatingFields(newAnimating);
      
      // Clear animation state after delay
      setTimeout(() => setAnimatingFields(new Set()), 600);
      
      prevScoreRef.current = score.totalScore;
    }
  }, [score]);
  
  // Detect industry variant change for pulse animation
  useEffect(() => {
    if (industryDetection?.variant && prevIndustryRef.current !== industryDetection.variant) {
      if (prevIndustryRef.current) { // Only animate if there was a previous value
        setIndustryJustChanged(true);
        setTimeout(() => setIndustryJustChanged(false), 1500);
      }
      prevIndustryRef.current = industryDetection.variant;
    }
  }, [industryDetection?.variant]);
  
  const showCTA = score.level !== 'unqualified';
  
  // Scroll indicator state
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollHint, setShowScrollHint] = useState(false);
  
  // Check if content overflows and needs scroll indicator
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    
    const checkScroll = () => {
      const hasMore = el.scrollHeight > el.clientHeight;
      const notAtBottom = el.scrollTop + el.clientHeight < el.scrollHeight - 20;
      setShowScrollHint(hasMore && notAtBottom);
    };
    
    checkScroll();
    el.addEventListener('scroll', checkScroll);
    return () => el.removeEventListener('scroll', checkScroll);
  }, [marketResearch]); // Re-check when market research changes
  
  // Get filled fields count for mobile header
  const filledCount = DEMO_CATEGORIES.reduce((acc, cat) => {
    const category = score[cat.key];
    return acc + cat.fields.filter(f => (category[f.key] as FieldScore).value).length;
  }, 0);
  const totalFields = DEMO_CATEGORIES.reduce((acc, cat) => acc + cat.fields.length, 0);
  
  // Check if market research has data
  const hasMarketResearchData = marketResearch && 
    !marketResearch.isLoading && 
    (marketResearch.marketSize || marketResearch.buyerPersona || 
     (marketResearch.commonObjections && marketResearch.commonObjections.length > 0));
  
  // Industry correction handler
  const handleIndustrySelect = (option: string) => {
    const variant = optionToVariant(option);
    onIndustryCorrection?.(variant);
    setShowIndustryCorrection(false);
  };
  
  // Render industry variant badge with confidence OR aesthetic mode
  const renderDesignMode = () => {
    // Check if we have a hybrid aesthetic mode
    const hasHybridMode = aestheticMode && aestheticMode.blend === 'hybrid';
    const isHybridConfident = aestheticMode && isConfidentHybrid(aestheticMode);
    
    // Get confirmation state from industryDetection
    const isConfirmed = industryDetection?.manuallyConfirmed;
    
    // If hybrid mode, show split view with edit capability
    if (hasHybridMode && aestheticMode) {
      return (
        <div className="px-4 py-3 border-b border-slate-800/50">
          <div className="space-y-2">
            {/* Header with confirm/edit */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                Design Mode
              </span>
              {isConfirmed ? (
                <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                  <Check className="w-3 h-3" />
                  Locked
                </span>
              ) : (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => industryDetection && onIndustryCorrection?.(industryDetection.variant)}
                    className="flex items-center gap-1 px-2 py-0.5 text-[10px] rounded-full border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 transition-colors"
                  >
                    <Check className="w-3 h-3" />
                    Confirm
                  </button>
                  <button
                    onClick={() => setShowIndustryCorrection(!showIndustryCorrection)}
                    className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors px-1"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>
            
            {/* Your Industry (provider) */}
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Your Industry</span>
              <span className="text-slate-200">{aestheticMode.secondary}</span>
            </div>
            
            {/* Target Market (buyer's industry) - Primary driver */}
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Target Market</span>
              <span className="text-cyan-400 font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                {aestheticMode.primary}
              </span>
            </div>
            
            {/* Blend explanation */}
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-lg p-2 mt-2 border border-cyan-500/20"
            >
              <p className="text-[11px] text-slate-300 leading-relaxed">
                <span className="text-cyan-400 font-medium">Design approach:</span>{' '}
                {aestheticMode.rationale}
              </p>
            </motion.div>
            
            {/* Industry correction UI for hybrid mode */}
            <AnimatePresence>
              {showIndustryCorrection && !isConfirmed && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="p-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
                    <p className="text-[10px] text-slate-400 mb-2">Select your industry:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {INDUSTRY_OPTIONS.map(option => (
                        <button
                          key={option}
                          onClick={() => handleIndustrySelect(option)}
                          className={cn(
                            "px-2 py-1 text-[10px] rounded-full border transition-all",
                            industryDetection && optionToVariant(option) === industryDetection.variant
                              ? "border-cyan-500 bg-cyan-500/20 text-cyan-400"
                              : "border-slate-600 text-slate-400 hover:border-slate-500 hover:text-slate-300"
                          )}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      );
    }
    
    // Fall back to original industry detection display
    if (!industryDetection || industryDetection.variant === 'default') return null;
    
    const displayName = variantToDisplayName(industryDetection.variant);
    const isLowConfidence = industryDetection.confidence === 'low';
    
    return (
      <div className="px-4 py-2 border-b border-slate-800/50">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider">
            Design Mode
          </span>
          <div className="flex items-center gap-2">
            <motion.span
              animate={industryJustChanged ? { 
                scale: [1, 1.1, 1],
                color: ['rgb(148, 163, 184)', 'rgb(34, 211, 238)', 'rgb(148, 163, 184)']
              } : {}}
              transition={{ duration: 0.5 }}
              className={cn(
                "text-xs font-medium",
                isLowConfidence ? "text-amber-400" : "text-cyan-400"
              )}
            >
              {displayName}
            </motion.span>
            
            {/* Confirmed state - show locked indicator */}
            {isConfirmed ? (
              <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                <Check className="w-3 h-3" />
                Locked
              </span>
            ) : (
              /* Not confirmed - show confirm button and edit option */
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onIndustryCorrection?.(industryDetection.variant)}
                  className="flex items-center gap-1 px-2 py-0.5 text-[10px] rounded-full border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 transition-colors"
                >
                  <Check className="w-3 h-3" />
                  Confirm
                </button>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setShowIndustryCorrection(!showIndustryCorrection)}
                      className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors px-1"
                    >
                      Edit
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="bg-slate-900 border-slate-700 text-slate-200 p-2 max-w-[200px]">
                    <p className="text-xs">
                      Wrong industry? Click to correct.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
            )}
          </div>
        </div>
        
        {/* Industry correction UI */}
        <AnimatePresence>
          {showIndustryCorrection && !isConfirmed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-2 p-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <p className="text-[10px] text-slate-400 mb-2">Select your industry:</p>
                <div className="flex flex-wrap gap-1.5">
                  {INDUSTRY_OPTIONS.map(option => (
                    <button
                      key={option}
                      onClick={() => handleIndustrySelect(option)}
                      className={cn(
                        "px-2 py-1 text-[10px] rounded-full border transition-all",
                        optionToVariant(option) === industryDetection.variant
                          ? "border-cyan-500 bg-cyan-500/20 text-cyan-400"
                          : "border-slate-600 text-slate-400 hover:border-slate-500 hover:text-slate-300"
                      )}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };
  
  return (
    <TooltipProvider delayDuration={200}>
      {/* Desktop Layout (lg+) */}
      <div
        className={cn(
          "hidden lg:flex flex-col rounded-xl border overflow-hidden",
          "bg-slate-900/40 backdrop-blur-xl",
          "h-full max-h-[calc(100vh-120px)]",
          levelColors.border,
          className
        )}
      >
        {/* Header - Fixed at top */}
        <div className="flex-shrink-0 p-4 border-b border-slate-800/50">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-light tracking-wide text-white">
              Intelligence Profile
            </h2>
            <motion.span
              key={score.totalScore}
              initial={{ scale: 1.2, color: 'rgb(34, 211, 238)' }}
              animate={{ scale: 1, color: 'rgb(148, 163, 184)' }}
              className="text-sm font-mono"
            >
              {score.totalScore}/100
            </motion.span>
          </div>
          
          {/* Total Progress Bar */}
          <div className="mt-2 h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
            <motion.div
              className={cn("h-full rounded-full bg-gradient-to-r", levelColors.gradient)}
              initial={{ width: 0 }}
              animate={{ width: `${score.totalPercentage}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
          
          {/* Level Badge */}
          <motion.p
            key={score.level}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={cn("text-xs mt-2 font-medium tracking-wider", levelColors.text)}
          >
            {levelConfig.label}
            {levelConfig.sublabel && (
              <span className="font-normal opacity-80"> — {levelConfig.sublabel}</span>
            )}
          </motion.p>
        </div>
        
        {/* Industry/Aesthetic Mode Display */}
        {renderDesignMode()}
        {/* Scrollable Content Area */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3 relative">
          {DEMO_CATEGORIES.map((cat) => {
            const category = score[cat.key];
            const catColors = CATEGORY_COLORS[cat.key];
            
            return (
              <div key={cat.key} className="space-y-1">
                {/* Category Header */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                    {cat.label}
                  </span>
                  <span className="text-[10px] text-slate-600 font-mono">
                    {category.total}/{category.maxPoints}
                  </span>
                </div>
                
                {/* Category Progress */}
                <div className="h-1 bg-slate-700/30 rounded-full overflow-hidden">
                  <motion.div
                    className={cn("h-full rounded-full bg-gradient-to-r", catColors.gradient)}
                    initial={{ width: 0 }}
                    animate={{ width: `${category.percentage}%` }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                  />
                </div>
                
                {/* Fields */}
                <div className="space-y-0.5">
                  {cat.fields.map((field) => {
                    const fieldData = category[field.key] as FieldScore;
                    const hasValue = !!fieldData.value;
                    const isAnimating = animatingFields.has(`${cat.key}-${field.key}`);
                    
                    const fieldContent = (
                      <div className="flex items-center gap-2 py-0.5 group">
                        {/* Vertical bar indicator */}
                        <motion.div
                          className={cn(
                            "w-1 h-5 rounded-full flex-shrink-0 transition-all duration-300",
                            hasValue
                              ? `bg-gradient-to-b ${catColors.gradient}`
                              : isThinking ? "bg-slate-600" : "bg-slate-700"
                          )}
                          animate={{
                            scaleY: isAnimating ? [1, 1.3, 1] : 1,
                            opacity: isThinking && !hasValue ? [0.5, 0.8, 0.5] : 1,
                          }}
                          transition={{
                            scaleY: { duration: 0.4, ease: 'easeOut' },
                            opacity: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
                          }}
                        />
                        
                        {/* Label */}
                        <span className={cn(
                          "text-xs min-w-[70px] flex-shrink-0 transition-colors",
                          hasValue ? "text-slate-300" : "text-slate-600"
                        )}>
                          {field.label}
                        </span>
                        
                        {/* Value - show full text or smart truncation with tooltip */}
                        <AnimatePresence mode="wait">
                          {hasValue && (
                            <motion.span
                              initial={{ opacity: 0, x: 10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -5 }}
                              className={cn(
                                "text-xs ml-auto text-right",
                                catColors.text
                              )}
                              style={{ maxWidth: '150px', wordBreak: 'break-word' }}
                              title={fieldData.value || undefined}
                            >
                              {/* Smart truncation: show full text if short, word-boundary truncate if long */}
                              {fieldData.value && fieldData.value.length > 25
                                ? fieldData.value.slice(0, 25).replace(/\s+\S*$/, '') + '...'
                                : fieldData.value}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                    
                    // Wrap with tooltip if has summary
                    if (hasValue && fieldData.summary) {
                      return (
                        <Tooltip key={field.key}>
                          <TooltipTrigger asChild>
                            <div className="cursor-help">{fieldContent}</div>
                          </TooltipTrigger>
                          <TooltipContent
                            side="left"
                            className="max-w-[250px] bg-slate-900 border-slate-700 text-slate-200 p-3"
                          >
                            <p className="text-xs leading-relaxed">{fieldData.summary}</p>
                          </TooltipContent>
                        </Tooltip>
                      );
                    }
                    
                    return <div key={field.key}>{fieldContent}</div>;
                  })}
                </div>
              </div>
            );
          })}
          
          {/* MARKET RESEARCH section - appears when data loads */}
          {hasMarketResearchData && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="pt-4 border-t border-slate-700/50"
            >
              <div className="text-[10px] text-cyan-400 uppercase tracking-wider mb-3 flex items-center justify-between">
                <span>MARKET RESEARCH</span>
                <span className="flex items-center gap-1">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative rounded-full h-1.5 w-1.5 bg-cyan-500"></span>
                  </span>
                  <span className="text-[9px] text-slate-500">LIVE</span>
                </span>
              </div>
              
              <div className="space-y-2">
                {marketResearch?.marketSize && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Market Size</span>
                    <span className="text-slate-200 text-right max-w-[60%] truncate">
                      {marketResearch.marketSize}
                    </span>
                  </div>
                )}
                
                {marketResearch?.buyerPersona && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Buyer</span>
                    <span className="text-slate-200 text-right max-w-[60%] truncate">
                      {marketResearch.buyerPersona}
                    </span>
                  </div>
                )}
                
                {/* Expandable objections */}
                {marketResearch?.commonObjections && marketResearch.commonObjections.length > 0 && (
                  <details className="group">
                    <summary className="flex justify-between text-sm cursor-pointer list-none">
                      <span className="text-slate-400">Objections</span>
                      <span className="text-amber-400 flex items-center gap-1">
                        {marketResearch.commonObjections.length} found
                        <ChevronDown className="w-3 h-3 group-open:rotate-180 transition-transform" />
                      </span>
                    </summary>
                    <ul className="mt-2 space-y-1 pl-2 border-l border-slate-700">
                      {marketResearch.commonObjections.map((obj, i) => (
                        <li key={i} className="text-xs text-slate-400">{obj}</li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            </motion.div>
          )}
          
          {/* Loading state for market research */}
          {marketResearch?.isLoading && (
            <div className="pt-4 border-t border-slate-700/50">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Loader2 className="w-3 h-3 animate-spin text-cyan-400" />
                Researching your market...
              </div>
            </div>
          )}
          
          {/* Scroll indicator */}
          <AnimatePresence>
            {showScrollHint && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="sticky bottom-0 left-0 right-0 pointer-events-none"
              >
                <div className="h-12 bg-gradient-to-t from-slate-900 to-transparent" />
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
                  <ChevronDown className="w-4 h-4 text-cyan-400 animate-bounce" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Footer - Fixed at bottom */}
        <div className="flex-shrink-0 p-4 border-t border-slate-800/50">
          {/* Gate generation behind score >= 70 (armed level) */}
          {score.totalScore >= 70 && onContinue ? (
            <div className="space-y-2">
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={onContinue}
                className={cn(
                  "w-full py-2.5 rounded-lg text-xs font-medium transition-all",
                  score.level === 'proven'
                    ? "bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400"
                    : "bg-purple-500/10 border border-purple-500/30 text-purple-400"
                )}
              >
                {score.level === 'proven' ? '⭐ Generate Premium Page' : 'Generate Page →'}
              </motion.button>
              
              {onKeepChatting && (
                <button
                  onClick={onKeepChatting}
                  className="w-full py-1.5 text-xs text-slate-500 hover:text-slate-400 transition-colors"
                >
                  Keep Chatting
                </button>
              )}
            </div>
          ) : showCTA ? (
            <div className="space-y-2">
              {/* Show progress toward generation */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Generation unlocks at 70</span>
                <span className="text-cyan-400 font-mono">{score.totalScore}/70</span>
              </div>
              <div className="h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-purple-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (score.totalScore / 70) * 100)}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
              <p className="text-xs text-slate-500 text-center">
                {70 - score.totalScore} points to unlock
              </p>
            </div>
          ) : null}
        </div>
      </div>

      {/* Tablet Layout (md to lg) - Horizontal bar */}
      <div
        className={cn(
          "hidden md:flex lg:hidden flex-col rounded-xl border overflow-hidden",
          "bg-slate-900/40 backdrop-blur-xl p-4",
          levelColors.border,
          className
        )}
      >
        {/* Header row */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-light tracking-wide text-white">Intelligence Profile</h2>
            <div className="flex items-center gap-2">
              <span className={cn("text-xs font-medium tracking-wider", levelColors.text)}>
                {levelConfig.label}
              </span>
              <span className="text-xs text-slate-500">• {score.totalScore}/100</span>
            </div>
          </div>
          {score.totalScore >= 70 && onContinue ? (
            <button
              onClick={onContinue}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-medium transition-all",
                score.level === 'proven'
                  ? "bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400"
                  : "bg-purple-500/10 border border-purple-500/30 text-purple-400"
              )}
            >
              Generate Page →
            </button>
          ) : showCTA && (
            <span className="text-xs text-slate-500">
              {score.totalScore}/70 to unlock
            </span>
          )}
        </div>
        
        {/* Horizontal captured fields */}
        <div className="flex flex-wrap gap-3">
          {DEMO_CATEGORIES.map(cat => {
            const category = score[cat.key];
            const catColors = CATEGORY_COLORS[cat.key];
            
            return cat.fields.map(field => {
              const fieldData = category[field.key] as FieldScore;
              if (!fieldData.value) return null;
              
              return (
                <Tooltip key={`${cat.key}-${field.key}`}>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2 cursor-help">
                      <div className={cn("w-1 h-5 rounded-full bg-gradient-to-b flex-shrink-0", catColors.gradient)} />
                      <span className="text-slate-400 text-xs">{field.label}:</span>
                      <span className={cn("text-xs truncate max-w-[100px]", catColors.text)}>
                        {fieldData.value}
                      </span>
                    </div>
                  </TooltipTrigger>
                  {fieldData.summary && (
                    <TooltipContent className="max-w-[250px] bg-slate-900 border-slate-700 text-slate-200 p-3">
                      <p className="text-xs leading-relaxed">{fieldData.summary}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              );
            });
          })}
          {filledCount === 0 && (
            <p className="text-xs text-slate-600">Share about your business to see insights...</p>
          )}
        </div>
      </div>

      {/* Mobile Layout (<md) - Collapsible card */}
      <div
        className={cn(
          "flex md:hidden flex-col rounded-xl border overflow-hidden",
          "bg-slate-900/40 backdrop-blur-xl",
          levelColors.border,
          className
        )}
      >
        {/* Collapsed header - always visible */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between p-4 w-full text-left"
        >
          <div className="flex items-center gap-3">
            <div className={cn("w-1 h-8 rounded-full bg-gradient-to-b", levelColors.gradient)} />
            <div>
              <h2 className="text-sm font-light tracking-wide text-white">Intelligence Profile</h2>
              <div className="flex items-center gap-2">
                <span className={cn("text-xs font-medium tracking-wider", levelColors.text)}>
                  {levelConfig.label}
                </span>
                <span className="text-xs text-slate-500">• {filledCount}/{totalFields} captured</span>
              </div>
            </div>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-5 h-5 text-slate-400" />
          </motion.div>
        </button>
        
        {/* Expandable content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-3">
                {DEMO_CATEGORIES.map(cat => {
                  const category = score[cat.key];
                  const catColors = CATEGORY_COLORS[cat.key];
                  
                  return (
                    <div key={cat.key} className="space-y-1">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                        {cat.label}
                      </span>
                      {cat.fields.map(field => {
                        const fieldData = category[field.key] as FieldScore;
                        const hasValue = !!fieldData.value;
                        
                        return (
                          <div key={field.key} className="flex items-center gap-2">
                            <div className={cn(
                              "w-1 h-5 rounded-full flex-shrink-0",
                              hasValue ? `bg-gradient-to-b ${catColors.gradient}` : "bg-slate-700"
                            )} />
                            <span className={cn(
                              "text-xs min-w-[70px]",
                              hasValue ? "text-slate-300" : "text-slate-600"
                            )}>
                              {field.label}
                            </span>
                            {hasValue && (
                              <span className={cn("text-xs truncate ml-auto", catColors.text)}>
                                {fieldData.value}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
                
                {/* Mobile CTA */}
                {showCTA && onContinue && (
                  <button
                    onClick={onContinue}
                    className={cn(
                      "w-full py-2.5 rounded-lg text-xs font-medium mt-2",
                      levelColors.bg,
                      levelColors.border,
                      "border",
                      levelColors.text
                    )}
                  >
                    Continue →
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  );
}

export default IntelligenceProfileDemo;
