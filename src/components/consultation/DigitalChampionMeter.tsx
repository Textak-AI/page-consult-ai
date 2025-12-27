import { useEffect, useRef, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { CompletenessState } from '@/lib/pageCompleteness';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Trophy, Unlock, Sparkles, Palette, Award, Users, Shield, ChevronRight, ChevronDown, Check, Circle } from 'lucide-react';
import { SCORE_CATEGORIES } from '@/lib/categoryColors';

interface ScoreFactor {
  id: string;
  label: string;
  complete: boolean;
  points: number;
  section?: string;
}

interface DigitalChampionMeterProps {
  completeness: CompletenessState;
  brandName?: string;
  logoUrl?: string;
  className?: string;
  onScrollToSection?: (sectionType: string) => void;
}

// Factor definitions for each category
function getFactorsForCategory(
  categoryId: string,
  completeness: CompletenessState,
  logoUrl?: string
): ScoreFactor[] {
  const { unlockedSections, milestones, score } = completeness;
  
  const factors: Record<string, ScoreFactor[]> = {
    brand: [
      { id: 'hero', label: 'Hero section', complete: unlockedSections.includes('hero'), points: 25, section: 'hero' },
      { id: 'headline', label: 'Compelling headline', complete: score >= 20, points: 25, section: 'hero' },
      { id: 'logo', label: 'Logo uploaded', complete: !!logoUrl, points: 25, section: 'hero' },
      { id: 'color', label: 'Brand color set', complete: true, points: 25, section: 'hero' },
    ],
    authority: [
      { id: 'stats', label: 'Statistics section', complete: unlockedSections.includes('stats-bar'), points: 25, section: 'stats-bar' },
      { id: 'features', label: 'Features section', complete: unlockedSections.includes('features'), points: 25, section: 'features' },
      { id: 'howItWorks', label: 'How it works section', complete: unlockedSections.includes('how-it-works'), points: 25, section: 'how-it-works' },
      { id: 'credentials', label: 'Credentials shown', complete: score >= 50, points: 25, section: 'features' },
    ],
    proof: [
      { id: 'testimonials', label: 'Testimonials section', complete: unlockedSections.includes('social-proof'), points: 25, section: 'social-proof' },
      { id: 'multipleReviews', label: '2+ testimonials', complete: milestones.some(m => m.name.includes('testimonial') && m.achieved), points: 25, section: 'social-proof' },
      { id: 'namedSources', label: 'Named sources', complete: score >= 60, points: 25, section: 'social-proof' },
      { id: 'proofSection', label: 'Dedicated proof section', complete: unlockedSections.includes('social-proof'), points: 25, section: 'social-proof' },
    ],
    trust: [
      { id: 'faq', label: 'FAQ section', complete: unlockedSections.includes('faq'), points: 25, section: 'faq' },
      { id: 'faqItems', label: '3+ FAQ items', complete: score >= 70, points: 25, section: 'faq' },
      { id: 'guarantee', label: 'Guarantee statement', complete: unlockedSections.includes('final-cta'), points: 25, section: 'final-cta' },
      { id: 'cta', label: 'Clear CTA', complete: unlockedSections.includes('final-cta'), points: 25, section: 'final-cta' },
    ],
  };
  
  return factors[categoryId] || [];
}

export function DigitalChampionMeter({ 
  completeness, 
  brandName = 'YOUR BRAND',
  logoUrl,
  className,
  onScrollToSection
}: DigitalChampionMeterProps) {
  const { score, unlockedSections, milestones } = completeness;
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  
  const prevUnlockedRef = useRef<string[]>([]);
  const prevMilestonesRef = useRef<string[]>([]);

  // Calculate individual stats from completeness data
  const stats = useMemo(() => ({
    brand: Math.min(100, Math.round((score * 1.2) + (logoUrl ? 15 : 0))),
    authority: Math.min(100, Math.round(score * 0.9)),
    proof: Math.min(100, Math.round((milestones.filter(m => m.achieved).length / Math.max(milestones.length, 1)) * 100)),
    trust: Math.min(100, Math.round(score * 0.85)),
  }), [score, logoUrl, milestones]);

  // Toast on unlock (keeping existing behavior)
  useEffect(() => {
    if (prevUnlockedRef.current.length === 0) {
      prevUnlockedRef.current = unlockedSections;
      return;
    }
    const newlyUnlocked = unlockedSections.filter(
      s => !prevUnlockedRef.current.includes(s)
    );
    newlyUnlocked.forEach(section => {
      toast.success(
        <div className="flex items-center gap-2">
          <Unlock className="w-4 h-4 text-purple-400" />
          <span className="text-sm">{section.replace(/-/g, ' ')} unlocked!</span>
        </div>,
        { duration: 3000 }
      );
    });
    prevUnlockedRef.current = unlockedSections;
  }, [unlockedSections]);

  // Toast on milestone
  useEffect(() => {
    const achievedMilestones = milestones.filter(m => m.achieved).map(m => m.name);
    if (prevMilestonesRef.current.length === 0) {
      prevMilestonesRef.current = achievedMilestones;
      return;
    }
    const newMilestones = achievedMilestones.filter(
      m => !prevMilestonesRef.current.includes(m)
    );
    newMilestones.forEach(milestone => {
      toast.success(
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-500" />
          <span className="text-sm">Achievement: {milestone}</span>
        </div>,
        { duration: 4000 }
      );
    });
    prevMilestonesRef.current = achievedMilestones;
  }, [milestones]);

  const getScoreLabel = (s: number) => {
    if (s >= 90) return 'Conversion-Ready';
    if (s >= 75) return 'Strong Foundation';
    if (s >= 50) return 'Good Progress';
    if (s >= 25) return 'Building Up';
    return 'Getting Started';
  };

  const categories = [
    { 
      id: 'brand', 
      name: 'Brand Identity', 
      value: stats.brand, 
      color: SCORE_CATEGORIES.brand.color,
      Icon: Palette 
    },
    { 
      id: 'authority', 
      name: 'Authority', 
      value: stats.authority, 
      color: SCORE_CATEGORIES.authority.color,
      Icon: Award 
    },
    { 
      id: 'proof', 
      name: 'Social Proof', 
      value: stats.proof, 
      color: SCORE_CATEGORIES.proof.color,
      Icon: Users 
    },
    { 
      id: 'trust', 
      name: 'Trust Signals', 
      value: stats.trust, 
      color: SCORE_CATEGORIES.trust.color,
      Icon: Shield 
    },
  ];

  return (
    <div className={cn(
      "bg-slate-900/95 backdrop-blur-xl rounded-xl border border-slate-700/50 overflow-hidden",
      className
    )}>
      {/* Header */}
      <div className="p-4 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <span className="font-semibold text-white">Page Score</span>
          </div>
          <motion.span 
            className="text-2xl font-bold text-white"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            key={score}
          >
            {score}%
          </motion.span>
        </div>
        <p className={cn(
          "text-sm mt-1",
          score >= 75 ? "text-emerald-400" : score >= 50 ? "text-amber-400" : "text-slate-400"
        )}>
          {getScoreLabel(score)}
        </p>
      </div>

      {/* Score Bars - Now Expandable */}
      <div className="divide-y divide-slate-700/30">
        {categories.map(({ id, name, value, color, Icon }) => {
          const isExpanded = expandedCategory === id;
          const factors = getFactorsForCategory(id, completeness, logoUrl);
          const missingFactors = factors.filter(f => !f.complete);
          
          return (
            <div key={id}>
              <button
                onClick={() => setExpandedCategory(isExpanded ? null : id)}
                className="w-full p-3 flex items-center gap-3 hover:bg-slate-800/50 transition-colors cursor-pointer"
              >
                {/* Chevron indicator */}
                <div className="flex items-center justify-center w-4">
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  )}
                </div>
                
                <Icon className="w-4 h-4 shrink-0" style={{ color }} />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="text-slate-300">{name}</span>
                    <div className="flex items-center gap-2">
                      {missingFactors.length > 0 && (
                        <span className="text-xs px-1.5 py-0.5 rounded-full bg-slate-700/50 text-slate-400">
                          +{missingFactors.length}
                        </span>
                      )}
                      <span className="text-white font-medium">{value}%</span>
                    </div>
                  </div>
                  
                  {/* Edge-glow progress bar */}
                  <div className="relative h-2 bg-slate-800 rounded-full overflow-visible">
                    <motion.div 
                      className="h-full bg-slate-600 rounded-full relative"
                      initial={{ width: 0 }}
                      animate={{ width: `${value}%` }}
                      transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
                    >
                      <div 
                        className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-3 rounded-full blur-sm opacity-80"
                        style={{ backgroundColor: color }}
                      />
                    </motion.div>
                  </div>
                </div>
              </button>
              
              {/* Expandable breakdown */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="pl-8 pr-3 pb-3 pt-1 space-y-2 border-l-2 border-slate-700 ml-5">
                      {factors.map(factor => (
                        <div 
                          key={factor.id} 
                          className="flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2">
                            {factor.complete ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Circle className="w-3.5 h-3.5 text-slate-600" />
                            )}
                            <span className={factor.complete ? "text-slate-500" : "text-slate-300"}>
                              {factor.label}
                            </span>
                          </div>
                          
                          {!factor.complete && factor.section && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                onScrollToSection?.(factor.section!);
                              }}
                              className="text-purple-400 hover:text-purple-300 text-xs"
                            >
                              +{factor.points} pts →
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-slate-800/30 border-t border-slate-700/30">
        <p className="text-[10px] text-slate-500 text-center">
          {brandName}
        </p>
      </div>
    </div>
  );
}
