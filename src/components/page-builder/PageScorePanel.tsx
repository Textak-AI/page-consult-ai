import { useState, useMemo, useEffect } from 'react';
import { 
  Twitter, Linkedin, Download, Check, Circle,
  Shield, Users, Award, Sparkles, ChevronDown,
  ChevronUp, Zap, Lightbulb, Palette
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SCORE_CATEGORIES, type ScoreCategoryId } from '@/lib/categoryColors';

interface ScoreFactor {
  id: string;
  label: string;
  present: boolean;
  weight: number;
  hint?: string;
}

interface ScoreCategory {
  id: ScoreCategoryId;
  name: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
  colorLight: string;
  glowColor: string;
  factors: ScoreFactor[];
  score?: number;
}

interface PageScorePanelProps {
  pageData: {
    companyName?: string;
    businessName?: string;
    industry?: string;
    heroHeadline?: string;
    heroSubheadline?: string;
    heroImage?: string;
    ctaText?: string;
    sections?: Array<{
      type: string;
      content?: any;
      locked?: boolean;
    }>;
    stats?: Array<{ value: string; label: string }>;
    testimonials?: Array<{ quote: string; author: string }>;
    faqItems?: Array<{ question: string; answer: string }>;
    features?: Array<{ title: string; description: string }>;
    guaranteeOffer?: string;
    urgencyAngle?: string;
    authorityMarkers?: string[];
    primaryColor?: string;
    logo?: string;
  };
  className?: string;
  onImprovementClick?: (categoryId: string, factorId: string) => void;
}

export function PageScorePanel({ 
  pageData, 
  className,
  onImprovementClick 
}: PageScorePanelProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [animatedScores, setAnimatedScores] = useState<Record<string, number>>({});
  
  const scoreBreakdown = useMemo(() => {
    const sections = pageData.sections || [];
    const sectionTypes = sections.map(s => s.type);
    
    // Brand Identity Factors
    const brandFactors: ScoreFactor[] = [
      { 
        id: 'company_name',
        label: 'Company Name', 
        present: !!(pageData.companyName || pageData.businessName), 
        weight: 20,
        hint: 'Add your company name to the hero section'
      },
      { 
        id: 'hero_headline',
        label: 'Hero Headline', 
        present: !!(pageData.heroHeadline && pageData.heroHeadline.length > 10), 
        weight: 25,
        hint: 'Create a compelling headline that speaks to your audience'
      },
      { 
        id: 'value_prop',
        label: 'Value Proposition', 
        present: !!(pageData.heroSubheadline && pageData.heroSubheadline.length > 20), 
        weight: 25,
        hint: 'Add a subheadline explaining your unique value'
      },
      { 
        id: 'hero_image',
        label: 'Hero Visual', 
        present: !!pageData.heroImage, 
        weight: 15,
        hint: 'Add an image or video to your hero section'
      },
      { 
        id: 'cta_button',
        label: 'Call-to-Action', 
        present: !!(pageData.ctaText && pageData.ctaText.length > 2), 
        weight: 15,
        hint: 'Add a clear CTA button'
      },
    ];
    
    // Authority Factors
    const hasStats = (pageData.stats && pageData.stats.length > 0) || 
                     sectionTypes.includes('stats');
    const statsCount = pageData.stats?.length || 0;
    
    const authorityFactors: ScoreFactor[] = [
      { 
        id: 'statistics',
        label: 'Key Statistics', 
        present: hasStats, 
        weight: 30,
        hint: 'Add 3-4 impressive numbers (clients served, years experience, etc.)'
      },
      { 
        id: 'stats_quality',
        label: 'Multiple Stats', 
        present: statsCount >= 3, 
        weight: 20,
        hint: 'Include at least 3 statistics for credibility'
      },
      { 
        id: 'expertise_claims',
        label: 'Expertise Signals', 
        present: !!(pageData.heroHeadline?.match(/expert|proven|leading|trusted|#1|best|top/i) ||
                   pageData.authorityMarkers?.length), 
        weight: 25,
        hint: 'Include expertise language or credentials'
      },
      { 
        id: 'industry_specific',
        label: 'Industry Focus', 
        present: !!(pageData.industry && pageData.heroHeadline?.toLowerCase().includes(pageData.industry.toLowerCase().split(' ')[0])), 
        weight: 25,
        hint: 'Reference your specific industry in messaging'
      },
    ];
    
    // Social Proof Factors
    const hasTestimonials = (pageData.testimonials && pageData.testimonials.length > 0) || 
                            sectionTypes.includes('social-proof');
    const testimonialCount = pageData.testimonials?.length || 0;
    
    const socialFactors: ScoreFactor[] = [
      { 
        id: 'testimonials',
        label: 'Testimonials', 
        present: hasTestimonials, 
        weight: 35,
        hint: 'Add customer testimonials to build trust'
      },
      { 
        id: 'testimonial_quality',
        label: 'Multiple Reviews', 
        present: testimonialCount >= 2, 
        weight: 20,
        hint: 'Include 2-3 testimonials for stronger proof'
      },
      { 
        id: 'testimonial_details',
        label: 'Named Sources', 
        present: pageData.testimonials?.some(t => t.author && t.author.length > 3) || false, 
        weight: 25,
        hint: 'Include names and titles with testimonials'
      },
      { 
        id: 'social_section',
        label: 'Proof Section', 
        present: sectionTypes.includes('social-proof'), 
        weight: 20,
        hint: 'Add a dedicated social proof section'
      },
    ];
    
    // Trust Factors
    const hasFAQ = (pageData.faqItems && pageData.faqItems.length > 0) || 
                   sectionTypes.includes('faq');
    const faqCount = pageData.faqItems?.length || 0;
    
    const trustFactors: ScoreFactor[] = [
      { 
        id: 'guarantee',
        label: 'Guarantee', 
        present: !!pageData.guaranteeOffer, 
        weight: 30,
        hint: 'Add a money-back guarantee or risk-free offer'
      },
      { 
        id: 'faq',
        label: 'FAQ Section', 
        present: hasFAQ, 
        weight: 25,
        hint: 'Add FAQ to address common objections'
      },
      { 
        id: 'faq_quality',
        label: 'Complete FAQ', 
        present: faqCount >= 3, 
        weight: 20,
        hint: 'Include 3-5 frequently asked questions'
      },
      { 
        id: 'urgency',
        label: 'Urgency Element', 
        present: !!pageData.urgencyAngle, 
        weight: 25,
        hint: 'Add a reason to act now (limited offer, deadline, etc.)'
      },
    ];
    
    const calculateCategoryScore = (factors: ScoreFactor[]) => {
      const earned = factors.filter(f => f.present).reduce((sum, f) => sum + f.weight, 0);
      const max = factors.reduce((sum, f) => sum + f.weight, 0);
      return Math.round((earned / max) * 100);
    };
    
    const categories: ScoreCategory[] = [
      {
        id: 'brand',
        name: SCORE_CATEGORIES.brand.name,
        icon: Palette,
        color: SCORE_CATEGORIES.brand.color,
        colorLight: SCORE_CATEGORIES.brand.colorLight,
        glowColor: `${SCORE_CATEGORIES.brand.color}4D`,
        factors: brandFactors,
      },
      {
        id: 'authority',
        name: SCORE_CATEGORIES.authority.name,
        icon: Award,
        color: SCORE_CATEGORIES.authority.color,
        colorLight: SCORE_CATEGORIES.authority.colorLight,
        glowColor: `${SCORE_CATEGORIES.authority.color}4D`,
        factors: authorityFactors,
      },
      {
        id: 'proof',
        name: SCORE_CATEGORIES.proof.name,
        icon: Users,
        color: SCORE_CATEGORIES.proof.color,
        colorLight: SCORE_CATEGORIES.proof.colorLight,
        glowColor: `${SCORE_CATEGORIES.proof.color}4D`,
        factors: socialFactors,
      },
      {
        id: 'trust',
        name: SCORE_CATEGORIES.trust.name,
        icon: Shield,
        color: SCORE_CATEGORIES.trust.color,
        colorLight: SCORE_CATEGORIES.trust.colorLight,
        glowColor: `${SCORE_CATEGORIES.trust.color}4D`,
        factors: trustFactors,
      },
    ];
    
    const categoryScores = categories.map(cat => ({
      ...cat,
      score: calculateCategoryScore(cat.factors),
    }));
    
    const overallScore = Math.round(
      categoryScores.reduce((sum, cat) => sum + (cat.score || 0), 0) / categoryScores.length
    );
    
    return { categories: categoryScores, overallScore };
  }, [pageData]);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      const newScores: Record<string, number> = {
        overall: scoreBreakdown.overallScore,
      };
      scoreBreakdown.categories.forEach(cat => {
        newScores[cat.id] = cat.score || 0;
      });
      setAnimatedScores(newScores);
    }, 100);
    return () => clearTimeout(timer);
  }, [scoreBreakdown]);
  
  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Conversion-Ready';
    if (score >= 75) return 'Strong Foundation';
    if (score >= 60) return 'Good Progress';
    if (score >= 40) return 'Building Up';
    return 'Getting Started';
  };
  
  const getOverallGradient = (score: number) => {
    if (score >= 90) return 'from-emerald-500 via-green-500 to-teal-500';
    if (score >= 75) return 'from-blue-500 via-cyan-500 to-teal-500';
    if (score >= 60) return 'from-amber-500 via-yellow-500 to-orange-500';
    return 'from-orange-500 via-red-500 to-pink-500';
  };

  return (
    <div className={cn(
      "bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden",
      className
    )}>
      {/* Header - Overall Score */}
      <div className="relative p-5 border-b border-slate-700/50">
        <div 
          className={cn(
            "absolute inset-0 opacity-20 bg-gradient-to-br",
            getOverallGradient(scoreBreakdown.overallScore)
          )}
        />
        
        <div className="relative flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-white">Page Score</span>
            </div>
            <p className="text-sm text-slate-400">
              {getScoreLabel(scoreBreakdown.overallScore)}
            </p>
          </div>
          
          {/* Animated score circle */}
          <div className="relative">
            <div 
              className="absolute inset-0 blur-xl opacity-50 rounded-full"
              style={{
                background: `radial-gradient(circle, 
                  ${scoreBreakdown.overallScore >= 75 ? '#10b981' : '#f59e0b'} 0%, 
                  ${scoreBreakdown.overallScore >= 90 ? '#06b6d4' : '#ef4444'} 50%, 
                  ${scoreBreakdown.overallScore >= 75 ? '#8b5cf6' : '#f97316'} 100%)`
              }}
            />
            
            <div className="relative w-20 h-20">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-slate-700/50"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                  style={{
                    stroke: `url(#scoreGradient)`,
                    strokeDasharray: `${(animatedScores.overall || 0) * 2.64} 264`,
                  }}
                />
                <defs>
                  <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="50%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
              </svg>
              
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {animatedScores.overall || 0}
                </span>
                <span className="text-sm text-slate-400">%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Categories */}
      <div className="divide-y divide-slate-700/30">
        {scoreBreakdown.categories.map((category) => {
          const isExpanded = expandedCategory === category.id;
          const Icon = category.icon;
          const missingFactors = category.factors.filter(f => !f.present);
          
          return (
            <div key={category.id}>
              <button
                onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
                className="w-full p-3 flex items-center gap-3 hover:bg-slate-800/80 transition-colors"
              >
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ 
                    boxShadow: `0 0 20px ${category.glowColor}`,
                    backgroundColor: `${category.color}20`
                  }}
                >
                  <Icon className="w-4 h-4" style={{ color: category.color }} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-white">
                      {category.name}
                    </span>
                    <span className="text-sm font-semibold" style={{ color: category.colorLight }}>
                      {category.score}%
                    </span>
                  </div>
                  
                  {/* Edge-glow progress bar */}
                  <div className="relative h-2.5 bg-slate-800 rounded-full overflow-visible">
                    {/* Left edge glow */}
                    <div 
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-4 rounded-full blur-sm opacity-60"
                      style={{ backgroundColor: category.color }}
                    />
                    
                    {/* The fill */}
                    <div 
                      className="h-full bg-slate-600 rounded-full relative transition-all duration-700"
                      style={{ width: `${animatedScores[category.id] || 0}%` }}
                    >
                      {/* Right edge glow (at fill point) */}
                      <div 
                        className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-4 rounded-full blur-sm opacity-80"
                        style={{ backgroundColor: category.color }}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {missingFactors.length > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700/50 text-slate-400">
                      +{missingFactors.length}
                    </span>
                  )}
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </button>
              
              {isExpanded && (
                <div className="bg-slate-800/30">
                  <div className="p-3 space-y-2">
                    {category.factors.map((factor) => (
                      <div 
                        key={factor.id}
                        className={cn(
                          "flex items-center justify-between p-2 rounded-lg transition-colors",
                          !factor.present && "hover:bg-slate-700/30 cursor-pointer"
                        )}
                        onClick={() => {
                          if (!factor.present && onImprovementClick) {
                            onImprovementClick(category.id, factor.id);
                          }
                        }}
                      >
                        <div className="flex items-center gap-2">
                          {factor.present ? (
                            <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                              <Check className="w-3 h-3 text-emerald-400" />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-slate-700/50 flex items-center justify-center">
                              <Circle className="w-3 h-3 text-slate-500" />
                            </div>
                          )}
                          <span className={cn(
                            "text-sm",
                            factor.present ? "text-slate-300" : "text-slate-400"
                          )}>
                            {factor.label}
                          </span>
                        </div>
                        
                        {!factor.present && (
                          <span className="text-xs text-purple-400 flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            Fix
                          </span>
                        )}
                      </div>
                    ))}
                    
                    {missingFactors.length > 0 && (
                      <div className="pt-2 border-t border-slate-700/30">
                        <div className="flex items-start gap-2 text-xs text-slate-400">
                          <Lightbulb className="w-3.5 h-3.5 mt-0.5 text-amber-400 shrink-0" />
                          <span>Tip: {missingFactors[0].hint}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Share Section */}
      <div className="p-4 border-t border-slate-700/50">
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          Share your score
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 bg-slate-800/50 border-slate-600/50 hover:bg-slate-700/50 text-slate-300"
            onClick={() => {
              const text = `Just scored ${scoreBreakdown.overallScore}% on my landing page conversion readiness with @PageConsultAI`;
              window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
            }}
          >
            <Twitter className="w-3.5 h-3.5 mr-1" />
            Tweet
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 bg-slate-800/50 border-slate-600/50 hover:bg-slate-700/50 text-slate-300"
            onClick={() => {
              window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://pageconsult.ai')}`, '_blank');
            }}
          >
            <Linkedin className="w-3.5 h-3.5 mr-1" />
            Share
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="bg-slate-800/50 border-slate-600/50 hover:bg-slate-700/50 text-slate-300"
          >
            <Download className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
      
      {/* Footer */}
      <div className="px-4 py-2 bg-slate-800/30 border-t border-slate-700/30">
        <p className="text-[10px] text-slate-500 text-center">
          Powered by PageConsult AI
        </p>
      </div>
    </div>
  );
}
