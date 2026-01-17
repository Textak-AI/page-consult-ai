import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowRight, Download, Edit, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { calculateIntelligenceScore, type GenericIntelligence } from '@/lib/intelligenceScoreCalculator';
import { intelligenceConcierge, type IntelligenceAccumulator, type MarketData as ConciergeMarketData } from '@/lib/intelligenceConcierge';

// Color scheme matching Intelligence Profile
const SECTION_COLORS = {
  whoYouAre: {
    section: 'text-cyan-400',
    cardBg: 'bg-cyan-500/10',
    cardBorder: 'border-cyan-500/20',
    text: 'text-cyan-100',
    textMuted: 'text-cyan-300/70',
    accent: 'bg-cyan-500/30 text-cyan-200',
    badgeBg: 'bg-cyan-500/20',
    badgeBorder: 'border-cyan-500/30',
    badgeText: 'text-cyan-300',
    scoreText: 'text-cyan-400',
  },
  whatYouOffer: {
    section: 'text-green-400',
    cardBg: 'bg-green-500/10',
    cardBorder: 'border-green-500/20',
    text: 'text-green-100',
    textMuted: 'text-green-300/70',
    accent: 'bg-green-500/30 text-green-200',
    badgeBg: 'bg-green-500/20',
    badgeBorder: 'border-green-500/30',
    badgeText: 'text-green-300',
    scoreText: 'text-green-400',
  },
  buyerReality: {
    section: 'text-purple-400',
    cardBg: 'bg-purple-500/10',
    cardBorder: 'border-purple-500/20',
    text: 'text-purple-100',
    textMuted: 'text-purple-300/70',
    accent: 'bg-purple-500/30 text-purple-200',
    badgeBg: 'bg-purple-500/20',
    badgeBorder: 'border-purple-500/30',
    badgeText: 'text-purple-300',
    scoreText: 'text-purple-400',
  },
  proofCredibility: {
    section: 'text-yellow-400',
    cardBg: 'bg-yellow-500/10',
    cardBorder: 'border-yellow-500/20',
    text: 'text-yellow-100',
    textMuted: 'text-yellow-300/70',
    accent: 'bg-yellow-500/30 text-yellow-200',
    badgeBg: 'bg-yellow-500/20',
    badgeBorder: 'border-yellow-500/30',
    badgeText: 'text-yellow-300',
    scoreText: 'text-yellow-400',
  },
  contentStrategy: {
    section: 'text-indigo-400',
    cardBg: 'bg-indigo-500/10',
    cardBorder: 'border-indigo-500/20',
    text: 'text-indigo-100',
    textMuted: 'text-indigo-300/70',
    accent: 'bg-indigo-500/30 text-indigo-200',
  },
  design: {
    section: 'text-gray-300',
    cardBg: 'bg-gray-800/50',
    cardBorder: 'border-gray-700',
    text: 'text-gray-200',
    textMuted: 'text-gray-400',
    accent: 'bg-gray-900/50 border border-gray-700',
  },
};

interface ConsultationData {
  id: string;
  industry?: string | null;
  target_audience?: string | null;
  unique_value?: string | null;
  competitor_differentiator?: string | null;
  extracted_intelligence?: GenericIntelligence | null;
  strategy_brief?: any | null;
}

export default function StrategyDocument() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const consultationId = searchParams.get('consultationId') || searchParams.get('id');
  
  const [loading, setLoading] = useState(true);
  const [consultation, setConsultation] = useState<ConsultationData | null>(null);
  const [accumulator, setAccumulator] = useState<IntelligenceAccumulator | null>(null);

  // Load consultation and accumulator data
  useEffect(() => {
    const loadData = async () => {
      if (!consultationId) {
        setLoading(false);
        return;
      }

      // Load consultation
      const { data, error } = await supabase
        .from('consultations')
        .select('*')
        .eq('id', consultationId)
        .maybeSingle();

      if (data) {
        setConsultation({
          id: data.id,
          industry: data.industry,
          target_audience: data.target_audience,
          unique_value: data.unique_value,
          competitor_differentiator: data.competitor_differentiator,
          extracted_intelligence: data.extracted_intelligence as GenericIntelligence | null,
          strategy_brief: data.strategy_brief,
        });
      }

      // Load accumulator
      const acc = await intelligenceConcierge.getBySessionId(consultationId);
      if (acc) {
        setAccumulator(acc);
        console.log('📊 [Strategy Document] Loaded accumulator:', acc);
      }

      setLoading(false);
    };

    loadData();
  }, [consultationId]);

  // Calculate intelligence score
  const intelligence = useMemo(() => {
    const intel = consultation?.extracted_intelligence || 
      (accumulator?.consultationData as unknown as GenericIntelligence | undefined);
    return intel || null;
  }, [consultation, accumulator]);

  const score = useMemo(() => {
    return calculateIntelligenceScore(intelligence, {
      marketResearchComplete: !!accumulator?.marketData,
    });
  }, [intelligence, accumulator]);

  // Get strategy data
  const strategyData = useMemo((): Record<string, any> => {
    const brief = consultation?.strategy_brief || accumulator?.strategyData;
    return brief || {};
  }, [consultation, accumulator]);

  // Get market data with proper typing
  const marketData = useMemo((): Partial<ConciergeMarketData> => {
    return accumulator?.marketData || {};
  }, [accumulator]);

  // Extract pain points as array
  const painPointsArray = useMemo(() => {
    const painPoints = intelligence?.painPoints || accumulator?.consultationData?.painPoints;
    if (Array.isArray(painPoints)) return painPoints;
    if (typeof painPoints === 'string') return painPoints.split(',').map(p => p.trim()).filter(Boolean);
    return [];
  }, [intelligence, accumulator]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex items-center gap-3 text-white">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading Strategy Document...</span>
        </div>
      </div>
    );
  }

  if (!consultationId || !consultation) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">No Strategy Found</h1>
          <p className="text-gray-400 mb-6">Complete a strategy session to view your document.</p>
          <Button onClick={() => navigate('/')}>Start Strategy Session</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header Section */}
      <header className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-b border-purple-500/20 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)}
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button variant="outline" className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10">
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
          </div>
          
          <h1 className="text-4xl font-bold mb-2">Your Strategic Blueprint</h1>
          <p className="text-gray-400">A comprehensive strategy for your landing page</p>
          
          {/* Intelligence Score Badge */}
          <div className="mt-6 flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="text-5xl font-bold text-purple-400">{score.totalScore}/100</div>
              <div>
                <div className="text-sm text-gray-400">Intelligence Score</div>
                <div className="text-xs text-green-400">✓ Ready for Generation</div>
              </div>
            </div>
            
            {/* Intelligence Breakdown - SAME COLORS AS PANEL */}
            <div className="flex flex-wrap gap-3">
              <div className={`px-3 py-2 ${SECTION_COLORS.whoYouAre.badgeBg} border ${SECTION_COLORS.whoYouAre.badgeBorder} rounded-lg`}>
                <div className={`text-xs ${SECTION_COLORS.whoYouAre.badgeText}`}>Who You Are</div>
                <div className={`font-semibold ${SECTION_COLORS.whoYouAre.scoreText}`}>{score.whoYouAre.total}/25</div>
              </div>
              <div className={`px-3 py-2 ${SECTION_COLORS.whatYouOffer.badgeBg} border ${SECTION_COLORS.whatYouOffer.badgeBorder} rounded-lg`}>
                <div className={`text-xs ${SECTION_COLORS.whatYouOffer.badgeText}`}>What You Offer</div>
                <div className={`font-semibold ${SECTION_COLORS.whatYouOffer.scoreText}`}>{score.whatYouOffer.total}/25</div>
              </div>
              <div className={`px-3 py-2 ${SECTION_COLORS.buyerReality.badgeBg} border ${SECTION_COLORS.buyerReality.badgeBorder} rounded-lg`}>
                <div className={`text-xs ${SECTION_COLORS.buyerReality.badgeText}`}>Buyer Reality</div>
                <div className={`font-semibold ${SECTION_COLORS.buyerReality.scoreText}`}>{score.buyerReality.total}/25</div>
              </div>
              <div className={`px-3 py-2 ${SECTION_COLORS.proofCredibility.badgeBg} border ${SECTION_COLORS.proofCredibility.badgeBorder} rounded-lg`}>
                <div className={`text-xs ${SECTION_COLORS.proofCredibility.badgeText}`}>Proof & Credibility</div>
                <div className={`font-semibold ${SECTION_COLORS.proofCredibility.scoreText}`}>{score.proofCredibility.total}/25</div>
              </div>
            </div>
            
            {/* Design Mode Badge */}
            {marketData.designConventions && (
              <div className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                <div className="text-xs text-gray-400">Design Mode</div>
                <div className="font-semibold">
                  {marketData.designConventions.colorMode === 'dark' ? '🌙' : '☀️'} {marketData.designConventions.colorMode} • {marketData.designConventions.cardStyle}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-8 space-y-12">
        
        {/* Section 1: Executive Summary (WHO YOU ARE - Cyan) */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <span className="text-3xl">🏢</span>
            <span className={SECTION_COLORS.whoYouAre.section}>Executive Summary</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Industry Card - Cyan theme */}
            <div className={`${SECTION_COLORS.whoYouAre.cardBg} border ${SECTION_COLORS.whoYouAre.cardBorder} rounded-lg p-6`}>
              <div className={`text-sm ${SECTION_COLORS.whoYouAre.textMuted} mb-2`}>Industry</div>
              <div className={`font-semibold text-lg ${SECTION_COLORS.whoYouAre.text}`}>
                {consultation.industry || intelligence?.industry || 'Not specified'}
              </div>
            </div>
            
            {/* Audience Card - Cyan theme */}
            <div className={`${SECTION_COLORS.whoYouAre.cardBg} border ${SECTION_COLORS.whoYouAre.cardBorder} rounded-lg p-6`}>
              <div className={`text-sm ${SECTION_COLORS.whoYouAre.textMuted} mb-2`}>Target Audience</div>
              <div className={`font-semibold text-lg ${SECTION_COLORS.whoYouAre.text}`}>
                {consultation.target_audience || intelligence?.audience || 'Not specified'}
              </div>
            </div>
            
            {/* Value Prop Card - Green theme (WHAT YOU OFFER) */}
            <div className={`${SECTION_COLORS.whatYouOffer.cardBg} border ${SECTION_COLORS.whatYouOffer.cardBorder} rounded-lg p-6`}>
              <div className={`text-sm ${SECTION_COLORS.whatYouOffer.textMuted} mb-2`}>Value Proposition</div>
              <div className={`font-semibold text-lg ${SECTION_COLORS.whatYouOffer.text}`}>
                {consultation.unique_value || intelligence?.valueProp || 'Not specified'}
              </div>
            </div>
            
            {/* Competitive Edge - Green theme */}
            <div className={`${SECTION_COLORS.whatYouOffer.cardBg} border ${SECTION_COLORS.whatYouOffer.cardBorder} rounded-lg p-6`}>
              <div className={`text-sm ${SECTION_COLORS.whatYouOffer.textMuted} mb-2`}>Competitive Edge</div>
              <div className={`font-semibold text-lg ${SECTION_COLORS.whatYouOffer.text}`}>
                {consultation.competitor_differentiator || intelligence?.competitiveEdge || 'Not specified'}
              </div>
            </div>
          </div>
          
          <div className={`mt-6 ${SECTION_COLORS.contentStrategy.cardBg} border ${SECTION_COLORS.contentStrategy.cardBorder} rounded-lg p-6`}>
            <div className={`text-sm ${SECTION_COLORS.contentStrategy.textMuted} mb-2`}>Strategic Approach</div>
            <div className="text-gray-300">
              {strategyData.approachSummary || "Technical authority positioning with measurable ROI proof"}
            </div>
          </div>
        </section>

        {/* Section 2: Messaging Architecture (WHAT YOU OFFER - Green) */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <span className="text-3xl">💎</span>
            <span className={SECTION_COLORS.whatYouOffer.section}>Messaging Architecture</span>
          </h2>
          
          <div className="space-y-6">
            {/* Headline Options - Green theme */}
            <div className={`${SECTION_COLORS.whatYouOffer.cardBg} border ${SECTION_COLORS.whatYouOffer.cardBorder} rounded-lg p-6`}>
              <h3 className={`font-semibold text-lg ${SECTION_COLORS.whatYouOffer.textMuted} mb-4`}>Primary Headline Options</h3>
              
              {strategyData.headlineVariants?.length > 0 ? (
                strategyData.headlineVariants.map((variant: any, idx: number) => (
                  <div key={idx} className="mb-4 last:mb-0">
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 px-3 py-1 ${SECTION_COLORS.whatYouOffer.accent} text-sm font-semibold rounded`}>
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <div className="text-xl font-semibold mb-2 text-green-50">
                          "{variant.headline || variant}"
                        </div>
                        {idx === 0 && (
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-1 ${SECTION_COLORS.whatYouOffer.accent} rounded`}>
                              ✓ Recommended
                            </span>
                            <span className={`text-sm ${SECTION_COLORS.whatYouOffer.textMuted}`}>
                              {variant.reasoning || "Leads with measurable outcome"}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className={SECTION_COLORS.whatYouOffer.textMuted}>
                  Headline variants will be generated based on your strategy...
                </div>
              )}
            </div>
            
            {/* Subheadline Strategy - Green theme */}
            <div className={`${SECTION_COLORS.whatYouOffer.cardBg} border ${SECTION_COLORS.whatYouOffer.cardBorder} rounded-lg p-6`}>
              <h3 className={`font-semibold text-lg ${SECTION_COLORS.whatYouOffer.textMuted} mb-3`}>Subheadline Strategy</h3>
              <div className={SECTION_COLORS.whatYouOffer.text}>
                {strategyData.subheadlineApproach || "Amplify the promise with specific benefits and target audience context"}
              </div>
            </div>
            
            {/* Positioning Framework - Green theme */}
            <div className={`${SECTION_COLORS.whatYouOffer.cardBg} border ${SECTION_COLORS.whatYouOffer.cardBorder} rounded-lg p-6`}>
              <h3 className={`font-semibold text-lg ${SECTION_COLORS.whatYouOffer.textMuted} mb-3`}>Positioning Framework</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className={`text-sm ${SECTION_COLORS.whatYouOffer.textMuted} mb-1`}>Primary Angle</div>
                  <div className={SECTION_COLORS.whatYouOffer.text}>{strategyData.primaryAngle || "Results-driven"}</div>
                </div>
                <div>
                  <div className={`text-sm ${SECTION_COLORS.whatYouOffer.textMuted} mb-1`}>Tone</div>
                  <div className={SECTION_COLORS.whatYouOffer.text}>{strategyData.tone || "Professional, authoritative"}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Buyer Psychology Analysis (BUYER REALITY - Purple) */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <span className="text-3xl">🧠</span>
            <span className={SECTION_COLORS.buyerReality.section}>Buyer Psychology Analysis</span>
          </h2>
          
          <div className="space-y-6">
            {/* Pain Point Prioritization - Purple theme */}
            <div className={`${SECTION_COLORS.buyerReality.cardBg} border ${SECTION_COLORS.buyerReality.cardBorder} rounded-lg p-6`}>
              <h3 className={`font-semibold text-lg ${SECTION_COLORS.buyerReality.textMuted} mb-4`}>Pain Point Prioritization</h3>
              {painPointsArray.length > 0 ? (
                painPointsArray.map((pain, idx) => (
                  <div key={idx} className="flex items-start gap-3 mb-3 last:mb-0">
                    <div className={`mt-1 w-8 h-8 rounded-full ${SECTION_COLORS.buyerReality.accent} flex items-center justify-center text-sm font-semibold`}>
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <div className={SECTION_COLORS.buyerReality.text}>{pain}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className={SECTION_COLORS.buyerReality.textMuted}>No pain points captured yet</div>
              )}
            </div>
            
            {/* Objection Handling - Purple theme */}
            <div className={`${SECTION_COLORS.buyerReality.cardBg} border ${SECTION_COLORS.buyerReality.cardBorder} rounded-lg p-6`}>
              <h3 className={`font-semibold text-lg ${SECTION_COLORS.buyerReality.textMuted} mb-4`}>Objection Handling Strategy</h3>
              {marketData.commonObjections?.length > 0 ? (
                marketData.commonObjections.map((objection: any, idx: number) => (
                  <div key={idx} className="mb-4 last:mb-0 p-4 bg-purple-900/30 rounded-lg border border-purple-500/10">
                    <div className="font-semibold text-purple-200 mb-2">
                      {objection.objection || objection}
                    </div>
                    <div className={`text-sm ${SECTION_COLORS.buyerReality.textMuted}`}>
                      Address with: {objection.strategy || "Direct proof and risk reversal"}
                    </div>
                  </div>
                ))
              ) : (
                <div className={SECTION_COLORS.buyerReality.textMuted}>No specific objections identified</div>
              )}
            </div>
            
            {/* Buyer Awareness Level - Purple theme */}
            <div className={`${SECTION_COLORS.buyerReality.cardBg} border ${SECTION_COLORS.buyerReality.cardBorder} rounded-lg p-6`}>
              <h3 className={`font-semibold text-lg ${SECTION_COLORS.buyerReality.textMuted} mb-3`}>Buyer Awareness Assessment</h3>
              <div className="flex items-center gap-4">
                <div className="flex-1 bg-gray-800 h-3 rounded-full relative overflow-hidden">
                  <div 
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full transition-all"
                    style={{ width: `${strategyData.awarenessLevel || 60}%` }}
                  />
                </div>
                <div className={`text-sm ${SECTION_COLORS.buyerReality.textMuted}`}>
                  {strategyData.awarenessStage || "Solution Aware"}
                </div>
              </div>
              <div className={`mt-3 text-sm ${SECTION_COLORS.buyerReality.textMuted}`}>
                {strategyData.awarenessInsight || "Buyers know they need a solution, but need proof your approach works"}
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Content Strategy (Neutral/Indigo - Strategic) */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <span className="text-3xl">📄</span>
            <span className={SECTION_COLORS.contentStrategy.section}>Content Strategy</span>
          </h2>
          
          <div className="space-y-6">
            {/* Page Structure Recommendation */}
            <div className={`${SECTION_COLORS.contentStrategy.cardBg} border ${SECTION_COLORS.contentStrategy.cardBorder} rounded-lg p-6`}>
              <h3 className={`font-semibold text-lg ${SECTION_COLORS.contentStrategy.textMuted} mb-3`}>Recommended Page Structure</h3>
              <div className={`${SECTION_COLORS.contentStrategy.text} mb-4`}>
                {strategyData.pageStructure || "Offer-first approach: Lead with results, then prove credibility"}
              </div>
              <div className={`text-sm ${SECTION_COLORS.contentStrategy.textMuted}`}>
                Why: {strategyData.structureReasoning || "Solution-aware buyers need immediate value clarity"}
              </div>
            </div>
            
            {/* Section-by-Section Breakdown */}
            <div className={`${SECTION_COLORS.contentStrategy.cardBg} border ${SECTION_COLORS.contentStrategy.cardBorder} rounded-lg p-6`}>
              <h3 className={`font-semibold text-lg ${SECTION_COLORS.contentStrategy.textMuted} mb-4`}>Section Breakdown</h3>
              <div className="space-y-4">
                {[
                  { section: "Hero", purpose: "Capture attention with measurable promise", priority: "Critical" },
                  { section: "Stakes Amplify", purpose: "Quantify the cost of inaction", priority: "High" },
                  { section: "Problem/Solution", purpose: "Frame challenge and your unique approach", priority: "High" },
                  { section: "Social Proof", purpose: "Build credibility through results", priority: "Critical" },
                  { section: "Features/Benefits", purpose: "Detail how solution delivers", priority: "Medium" },
                  { section: "Final CTA", purpose: "Remove friction, create urgency", priority: "Critical" }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-4 bg-indigo-900/20 border border-indigo-500/10 rounded-lg">
                    <div className={`mt-1 w-8 h-8 rounded-full ${SECTION_COLORS.contentStrategy.accent} flex items-center justify-center text-sm font-semibold`}>
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <div className={`font-semibold ${SECTION_COLORS.contentStrategy.text}`}>{item.section}</div>
                        <span className={`text-xs px-2 py-1 rounded ${
                          item.priority === 'Critical' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                          item.priority === 'High' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                          'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                        }`}>
                          {item.priority}
                        </span>
                      </div>
                      <div className={`text-sm ${SECTION_COLORS.contentStrategy.textMuted}`}>{item.purpose}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Proof Timing Strategy */}
            <div className={`${SECTION_COLORS.contentStrategy.cardBg} border ${SECTION_COLORS.contentStrategy.cardBorder} rounded-lg p-6`}>
              <h3 className={`font-semibold text-lg ${SECTION_COLORS.contentStrategy.textMuted} mb-3`}>Proof Point Strategy</h3>
              <div className="flex items-center gap-4 mb-3">
                <div className={`px-4 py-2 ${SECTION_COLORS.contentStrategy.cardBg} border ${SECTION_COLORS.contentStrategy.cardBorder} rounded-lg`}>
                  <div className={`text-xs ${SECTION_COLORS.contentStrategy.textMuted}`}>Proof Timing</div>
                  <div className={`font-semibold ${SECTION_COLORS.contentStrategy.text}`}>
                    {marketData.designConventions?.proofTiming === 'early' ? '⚡ Early' : '📊 Late'}
                  </div>
                </div>
                <div className={`flex-1 text-sm ${SECTION_COLORS.contentStrategy.textMuted}`}>
                  {marketData.designConventions?.proofTiming === 'early' 
                    ? "Show results immediately - technical buyers want proof first"
                    : "Build story first, then prove - emotional buyers need context"}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: Design Intelligence (Neutral - Design) */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <span className="text-3xl">🎨</span>
            <span className={SECTION_COLORS.design.section}>Design Intelligence</span>
          </h2>
          
          <div className="space-y-6">
            {/* Design Mode Reasoning */}
            <div className={`${SECTION_COLORS.design.cardBg} border ${SECTION_COLORS.design.cardBorder} rounded-lg p-6`}>
              <h3 className={`font-semibold text-lg ${SECTION_COLORS.design.text} mb-4`}>Visual Design Direction</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-900/50 border border-gray-700 rounded-lg">
                  <div className={`text-sm ${SECTION_COLORS.design.textMuted} mb-2`}>Color Mode</div>
                  <div className={`font-semibold text-lg ${SECTION_COLORS.design.text}`}>
                    {marketData.designConventions?.colorMode === 'dark' ? '🌙 Dark' : '☀️ Light'}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    {marketData.designConventions?.colorMode === 'dark'
                      ? "Technical sophistication"
                      : "Trust and accessibility"}
                  </div>
                </div>
                
                <div className="p-4 bg-gray-900/50 border border-gray-700 rounded-lg">
                  <div className={`text-sm ${SECTION_COLORS.design.textMuted} mb-2`}>Card Style</div>
                  <div className={`font-semibold text-lg ${SECTION_COLORS.design.text} capitalize`}>
                    {marketData.designConventions?.cardStyle || 'Glass'}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    Modern, premium aesthetic
                  </div>
                </div>
                
                <div className="p-4 bg-gray-900/50 border border-gray-700 rounded-lg">
                  <div className={`text-sm ${SECTION_COLORS.design.textMuted} mb-2`}>Visual Weight</div>
                  <div className={`font-semibold text-lg ${SECTION_COLORS.design.text}`}>
                    {strategyData.visualWeight || 'Balanced'}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    Text + imagery harmony
                  </div>
                </div>
              </div>
            </div>
            
            {/* Typography Strategy */}
            <div className={`${SECTION_COLORS.design.cardBg} border ${SECTION_COLORS.design.cardBorder} rounded-lg p-6`}>
              <h3 className={`font-semibold text-lg ${SECTION_COLORS.design.text} mb-3`}>Typography Approach</h3>
              <div className={`${SECTION_COLORS.design.text} mb-3`}>
                {strategyData.typographyStrategy || "Clean, technical sans-serif with clear hierarchy for scanning"}
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="px-3 py-1 bg-gray-900/50 border border-gray-700 rounded">
                  <span className="text-gray-400">Headers: </span>
                  <span className="font-semibold text-gray-200">Bold, authoritative</span>
                </div>
                <div className="px-3 py-1 bg-gray-900/50 border border-gray-700 rounded">
                  <span className="text-gray-400">Body: </span>
                  <span className="font-semibold text-gray-200">Readable, concise</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 6: Conversion Optimization (PROOF & CREDIBILITY - Yellow) */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <span className="text-3xl">⭐</span>
            <span className={SECTION_COLORS.proofCredibility.section}>Conversion Optimization</span>
          </h2>
          
          <div className="space-y-6">
            {/* Trust Signal Hierarchy - Yellow theme */}
            <div className={`${SECTION_COLORS.proofCredibility.cardBg} border ${SECTION_COLORS.proofCredibility.cardBorder} rounded-lg p-6`}>
              <h3 className={`font-semibold text-lg ${SECTION_COLORS.proofCredibility.textMuted} mb-4`}>Trust Signal Hierarchy</h3>
              <div className="space-y-3">
                {(marketData.designConventions?.trustSignalPriority || [
                  "Customer Results",
                  "Technical Credentials", 
                  "Security/Compliance",
                  "Company Logos"
                ]).map((signal: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-4 p-3 bg-yellow-900/20 border border-yellow-500/10 rounded-lg">
                    <div className={`w-8 h-8 rounded-full ${SECTION_COLORS.proofCredibility.accent} flex items-center justify-center font-semibold`}>
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <div className={`font-semibold ${SECTION_COLORS.proofCredibility.text} capitalize`}>
                        {signal.replace(/-/g, ' ')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* CTA Strategy - Yellow theme */}
            <div className={`${SECTION_COLORS.proofCredibility.cardBg} border ${SECTION_COLORS.proofCredibility.cardBorder} rounded-lg p-6`}>
              <h3 className={`font-semibold text-lg ${SECTION_COLORS.proofCredibility.textMuted} mb-4`}>CTA Strategy</h3>
              <div className="space-y-4">
                <div>
                  <div className={`text-sm ${SECTION_COLORS.proofCredibility.textMuted} mb-2`}>Primary CTA Copy</div>
                  <div className="text-xl font-semibold text-yellow-200">
                    {strategyData.primaryCTA || "Schedule Strategic Consultation"}
                  </div>
                  <div className={`text-sm ${SECTION_COLORS.proofCredibility.textMuted} mt-1`}>
                    Why: Low-friction, high-value ask for complex B2B sale
                  </div>
                </div>
                
                <div>
                  <div className={`text-sm ${SECTION_COLORS.proofCredibility.textMuted} mb-2`}>Secondary CTA</div>
                  <div className={`text-lg font-semibold ${SECTION_COLORS.proofCredibility.text}`}>
                    {strategyData.secondaryCTA || "Download Technical Overview"}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Risk Reversal - Yellow theme */}
            <div className={`${SECTION_COLORS.proofCredibility.cardBg} border ${SECTION_COLORS.proofCredibility.cardBorder} rounded-lg p-6`}>
              <h3 className={`font-semibold text-lg ${SECTION_COLORS.proofCredibility.textMuted} mb-3`}>Risk Reversal Elements</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-yellow-900/20 border border-yellow-500/10 rounded-lg">
                  <div className="font-semibold text-yellow-200 mb-1">✓ Free Trial / POC</div>
                  <div className={`text-sm ${SECTION_COLORS.proofCredibility.textMuted}`}>Test before commitment</div>
                </div>
                <div className="p-3 bg-yellow-900/20 border border-yellow-500/10 rounded-lg">
                  <div className="font-semibold text-yellow-200 mb-1">✓ Money-Back Guarantee</div>
                  <div className={`text-sm ${SECTION_COLORS.proofCredibility.textMuted}`}>Zero-risk implementation</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 7: Next Steps */}
        <section className="mb-12">
          <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-500/20 rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Build Your Page?</h2>
            <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
              Your strategic blueprint is complete. Continue to generate a high-converting landing page based on this intelligence.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button 
                variant="outline"
                onClick={() => navigate(`/huddle?type=pre_brief&consultationId=${consultationId}`)}
                className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
              >
                <Edit className="w-4 h-4 mr-2" />
                Refine Strategy
              </Button>
              <Button 
                onClick={() => navigate(`/brand-setup?consultationId=${consultationId}`)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                Continue to Brand Setup
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
