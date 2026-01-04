import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, TrendingUp, Users, AlertCircle, Lightbulb, ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState, forwardRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { MarketResearch } from '@/contexts/IntelligenceContext';

interface MarketResearchPanelProps {
  market: MarketResearch;
  industry: string | null;
  className?: string;
  onLoad?: () => void;
}

// Clean markdown syntax and extract key content
const cleanMarkdown = (text: string): string => {
  if (!text) return '';
  
  return text
    // Remove markdown headers (### 1. Title, ## Title, etc.)
    .replace(/^#{1,6}\s*\d*\.?\s*/gm, '')
    // Remove bold/italic markers
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    // Remove bullet points at start
    .replace(/^[-*•]\s*/gm, '')
    // Remove numbered lists
    .replace(/^\d+\.\s*/gm, '')
    // Clean up extra whitespace
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

// Extract the most important sentence/phrase from longer text
const extractKeyInsight = (text: string, maxLength: number = 100): string => {
  const cleaned = cleanMarkdown(text);
  
  // If short enough, return as-is
  if (cleaned.length <= maxLength) return cleaned;
  
  // Try to find first complete sentence
  const firstSentence = cleaned.match(/^[^.!?]+[.!?]/);
  if (firstSentence && firstSentence[0].length <= maxLength) {
    return firstSentence[0].trim();
  }
  
  // Otherwise truncate at word boundary
  const truncated = cleaned.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  return (lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated) + '…';
};

// Parse objections/insights into clean bullet points
const parseListItems = (items: string[]): string[] => {
  return items
    .map(item => cleanMarkdown(item))
    .map(item => extractKeyInsight(item, 60))
    .filter(item => item.length > 0)
    .slice(0, 3); // Max 3 items
};

const MarketResearchPanel = forwardRef<HTMLDivElement, MarketResearchPanelProps>(
  ({ market, industry, className = '', onLoad }, ref) => {
    const { toast } = useToast();
    const [showScrollHint, setShowScrollHint] = useState(false);
    const [showPointsBadge, setShowPointsBadge] = useState(false);
    const [highlightActive, setHighlightActive] = useState(false);
    const hasNotified = useRef(false);
    const internalRef = useRef<HTMLDivElement>(null);
    
    // Combine refs
    const combinedRef = (node: HTMLDivElement | null) => {
      internalRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    };

    // Check if we have any data
    const hasData = market.marketSize || market.buyerPersona || 
                    market.commonObjections.length > 0 || 
                    market.industryInsights.length > 0;

    // Trigger animations when data loads
    useEffect(() => {
      if (hasData && !market.isLoading && !hasNotified.current) {
        hasNotified.current = true;
        
        // Show toast notification
        toast({
          title: "🔍 Market Research Unlocked!",
          description: "Scroll down to view your industry insights",
          duration: 4000,
        });
        
        // Trigger highlight animation
        setHighlightActive(true);
        setTimeout(() => setHighlightActive(false), 2000);
        
        // Show animated points badge
        setShowPointsBadge(true);
        setTimeout(() => setShowPointsBadge(false), 3000);
        
        // Show scroll hint with pulsing
        setShowScrollHint(true);
        setTimeout(() => setShowScrollHint(false), 4000);
        
        // NOTE: Removed auto-scroll - it was scrolling the whole page, not just the sidebar.
        // The visual indicators (toast, highlight, points badge, scroll hint) are enough to draw attention.
        
        // Notify parent
        onLoad?.();
      }
    }, [hasData, market.isLoading, toast, onLoad]);

    // Clean and prepare display content
    const displayMarketSize = market.marketSize ? extractKeyInsight(market.marketSize, 120) : null;
    const displayBuyerPersona = market.buyerPersona ? extractKeyInsight(market.buyerPersona, 80) : null;
    const displayObjections = parseListItems(market.commonObjections);
    const displayInsights = parseListItems(market.industryInsights);

    // Loading state
    if (market.isLoading) {
      return (
        <motion.div
          ref={combinedRef}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 ${className}`}
        >
          <div className="flex items-center gap-3 text-secondary">
            <Loader2 className="w-5 h-5 animate-spin" />
            <div>
              <p className="text-sm font-medium">Researching your market...</p>
              <p className="text-xs text-muted-foreground mt-0.5">Analyzing {industry || 'your industry'}</p>
            </div>
          </div>
          
          {/* Shimmer placeholders */}
          <div className="mt-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-lg bg-card/50 animate-pulse" />
            ))}
          </div>
        </motion.div>
      );
    }

    if (!hasData) {
      return null;
    }

    return (
      <motion.div
        ref={combinedRef}
        initial={{ opacity: 0, y: 10 }}
        animate={{ 
          opacity: 1, 
          y: 0,
          boxShadow: highlightActive 
            ? '0 0 30px rgba(6, 182, 212, 0.4), inset 0 0 20px rgba(6, 182, 212, 0.1)' 
            : '0 0 0px transparent'
        }}
        transition={{ 
          boxShadow: { duration: 0.5, ease: 'easeOut' }
        }}
        className={`p-4 space-y-4 relative ${className} ${
          highlightActive ? 'ring-2 ring-secondary/50 rounded-lg' : ''
        }`}
      >
        {/* Header with animated badge */}
        <div className="flex items-center gap-2 text-sm font-medium text-secondary">
          <TrendingUp className="w-4 h-4" />
          <span>Market Research</span>
          
          {/* Animated +10 pts badge */}
          <AnimatePresence>
            {showPointsBadge && (
              <motion.span
                initial={{ opacity: 0, scale: 0.5, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, y: -20, scale: 0.8 }}
                transition={{ 
                  type: 'spring', 
                  stiffness: 400, 
                  damping: 15 
                }}
                className="ml-auto px-2 py-0.5 rounded-full bg-secondary/20 text-secondary text-xs font-semibold"
              >
                +10 pts
              </motion.span>
            )}
          </AnimatePresence>
          
          {/* Static badge when animation done */}
          {!showPointsBadge && (
            <span className="ml-auto text-xs text-muted-foreground">+10 pts</span>
          )}
        </div>

        {/* Scroll hint indicator */}
        <AnimatePresence>
          {showScrollHint && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ 
                opacity: [0, 1, 1, 1, 0.7, 1, 1, 0],
                y: [0, 0, 5, 0, 0, 5, 0, 0]
              }}
              exit={{ opacity: 0 }}
              transition={{ 
                duration: 3,
                times: [0, 0.1, 0.2, 0.3, 0.5, 0.6, 0.7, 1]
              }}
              className="absolute -top-8 left-1/2 -translate-x-1/2 flex items-center gap-1 px-3 py-1.5 rounded-full bg-secondary/20 border border-secondary/30 text-secondary text-xs font-medium"
            >
              <ChevronDown className="w-3 h-3 animate-bounce" />
              Market Research Ready
            </motion.div>
          )}
        </AnimatePresence>

        {/* Market Size Card */}
        {displayMarketSize && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="p-3 rounded-lg bg-gradient-to-r from-primary/10 to-transparent border border-primary/20"
          >
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-primary">
                <TrendingUp className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs font-medium">Market Size</span>
              </div>
              <p className="text-sm text-foreground/90 leading-relaxed pl-6">
                {displayMarketSize}
              </p>
            </div>
          </motion.div>
        )}

        {/* Buyer Persona Card */}
        {displayBuyerPersona && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="p-3 rounded-lg bg-gradient-to-r from-secondary/10 to-transparent border border-secondary/20"
          >
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-secondary">
                <Users className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs font-medium">Your Buyer</span>
              </div>
              <p className="text-sm text-foreground/90 leading-relaxed pl-6">
                {displayBuyerPersona}
              </p>
            </div>
          </motion.div>
        )}

        {/* Common Objections Card */}
        {displayObjections.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="p-3 rounded-lg bg-gradient-to-r from-warning/10 to-transparent border border-warning/20"
          >
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-warning">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs font-medium">Key Objections</span>
              </div>
              <ul className="text-sm text-foreground/90 space-y-1 pl-6">
                {displayObjections.map((objection, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-warning/60 mt-1">•</span>
                    <span className="leading-relaxed">{objection}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}

        {/* Industry Insights Card */}
        {displayInsights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="p-3 rounded-lg bg-gradient-to-r from-success/10 to-transparent border border-success/20"
          >
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-success">
                <Lightbulb className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs font-medium">Positioning Insight</span>
              </div>
              <ul className="text-sm text-foreground/90 space-y-1 pl-6">
                {displayInsights.slice(0, 2).map((insight, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-success/60 mt-1">•</span>
                    <span className="leading-relaxed">{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </motion.div>
    );
  }
);

MarketResearchPanel.displayName = 'MarketResearchPanel';

export default MarketResearchPanel;
