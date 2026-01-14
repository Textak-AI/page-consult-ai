import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { HuddleRecap } from '@/components/huddle/HuddleRecap';
import { HuddleIntelligenceCards } from '@/components/huddle/HuddleIntelligenceCards';
import { HuddleGapCallout } from '@/components/huddle/HuddleGapCallout';
import { HuddleCTAs } from '@/components/huddle/HuddleCTAs';
import { updateFlowState } from '@/services/flowEngine';
import { Loader2 } from 'lucide-react';

interface HuddleContent {
  recap: string;
  cards: Array<{
    id: string;
    label: string;
    value: string;
    confidence: 'high' | 'medium' | 'low';
    notePrompt: string;
  }>;
  gap: {
    field: string;
    prompt: string;
    placeholder: string;
  } | null;
  nextPreview: string;
  primaryCTA: { label: string; action: string };
  secondaryCTA: { label: string; action: string } | null;
}

interface ConsultationData {
  id: string;
  company_name?: string;
  business_name?: string;
  industry?: string;
  target_audience?: string;
  unique_value?: string;
  competitor_differentiator?: string;
  audience_pain_points?: string[];
  authority_markers?: string[];
  extracted_intelligence?: Record<string, unknown>;
  card_notes?: Record<string, string>;
  readiness_score?: number;
  strategy_brief?: Record<string, unknown>;
  flow_state?: string;
}

export default function Huddle() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [consultation, setConsultation] = useState<ConsultationData | null>(null);
  const [huddleContent, setHuddleContent] = useState<HuddleContent | null>(null);
  const [cardNotes, setCardNotes] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const huddleType = searchParams.get('type') || 'pre_brief';
  // Accept both consultationId and session params
  const consultationId = searchParams.get('consultationId') || searchParams.get('session');

  useEffect(() => {
    loadConsultationAndGenerateHuddle();
  }, [consultationId, huddleType]);

  async function loadConsultationAndGenerateHuddle() {
    if (!consultationId) {
      console.error('❌ [Huddle] No consultationId or session param');
      navigate('/demo');
      return;
    }

    console.log('📂 [Huddle] Loading consultation:', consultationId);
    setLoading(true);
    setError(null);

    // First try consultations table
    let { data, error: consultationError } = await supabase
      .from('consultations')
      .select('*')
      .eq('id', consultationId)
      .maybeSingle();

    // If not found in consultations, check demo_sessions table
    if (!data) {
      console.log('📂 [Huddle] Not in consultations, checking demo_sessions...');
      const { data: demoSession, error: demoError } = await supabase
        .from('demo_sessions')
        .select('*')
        .eq('session_id', consultationId)
        .maybeSingle();

      if (demoSession) {
        console.log('✅ [Huddle] Found demo_session, converting to consultation format');
        const intel = demoSession.extracted_intelligence as Record<string, unknown> || {};
        
        // Convert demo_session to consultation-like format
        data = {
          id: demoSession.session_id,
          industry: intel?.industry as string,
          target_audience: intel?.audience as string,
          unique_value: intel?.valueProp as string || intel?.uniqueValue as string,
          competitor_differentiator: intel?.competitorDifferentiator as string,
          extracted_intelligence: intel,
          readiness_score: demoSession.readiness || (intel?.readinessScore as number),
          business_name: intel?.companyName as string || intel?.businessName as string,
          audience_pain_points: intel?.painPoints as string[],
          authority_markers: intel?.proofElements as string[],
        } as any;
      } else {
        console.error('❌ [Huddle] Not found in demo_sessions either:', demoError?.message);
      }
    }

    if (!data) {
      console.error('❌ [Huddle] No data found for ID:', consultationId);
      setError('Could not load your consultation data. The session may have expired.');
      setLoading(false);
      return;
    }

    console.log('✅ [Huddle] Loaded data:', {
      id: data.id,
      businessName: data.business_name,
      industry: data.industry,
      hasIntelligence: !!data.extracted_intelligence
    });

    setConsultation(data as ConsultationData);
    setCardNotes((data.card_notes as Record<string, string>) || {});

    // Generate huddle content
    const content = await generateHuddleContent(data as ConsultationData, huddleType);
    setHuddleContent(content);

    // Only update if we have a real consultation record
    if (data.id && !data.id.includes('-')) {
      await supabase
        .from('consultations')
        .update({
          last_huddle_type: huddleType,
          last_huddle_at: new Date().toISOString()
        })
        .eq('id', consultationId);
    }

    setLoading(false);
  }

  async function generateHuddleContent(consultation: ConsultationData, type: string): Promise<HuddleContent> {
    // Extract intelligence from consultation
    const intel = (consultation.extracted_intelligence || {}) as Record<string, unknown>;
    const companyName = consultation.company_name || consultation.business_name || (intel.companyName as string) || 'your company';
    const industry = consultation.industry || (intel.industry as string) || 'your industry';
    const audience = consultation.target_audience || (intel.audience as string) || 'your target audience';
    const valueProp = consultation.unique_value || (intel.valueProp as string) || '';
    const edge = consultation.competitor_differentiator || (intel.competitorDifferentiator as string) || '';
    const painPoints = consultation.audience_pain_points || (intel.painPoints as string[]) || [];
    const proofElements = consultation.authority_markers || (intel.proofElements as string[]) || [];

    // Determine confidence levels based on data presence
    const getConfidence = (value: unknown): 'high' | 'medium' | 'low' => {
      if (!value || (Array.isArray(value) && value.length === 0)) return 'low';
      if (typeof value === 'string' && value.length < 20) return 'medium';
      return 'high';
    };

    // Build cards based on huddle type
    const cards = [
      {
        id: 'industry',
        label: 'YOUR INDUSTRY',
        value: industry,
        confidence: getConfidence(industry),
        notePrompt: 'Any nuance about your positioning?'
      },
      {
        id: 'audience',
        label: 'YOUR AUDIENCE',
        value: audience,
        confidence: getConfidence(audience),
        notePrompt: 'Who else do you serve?'
      },
      {
        id: 'edge',
        label: 'YOUR EDGE',
        value: edge || valueProp,
        confidence: getConfidence(edge || valueProp),
        notePrompt: 'What makes this your real differentiator?'
      },
      {
        id: 'proof',
        label: 'YOUR PROOF',
        value: Array.isArray(proofElements) ? proofElements.join(', ') : String(proofElements || ''),
        confidence: getConfidence(proofElements),
        notePrompt: 'How should I frame this?'
      }
    ];

    // Find the weakest card for gap callout
    const weakestCard = cards.find(c => c.confidence === 'low') || 
                        cards.find(c => c.confidence === 'medium');

    const gap = weakestCard && weakestCard.confidence !== 'high' ? {
      field: weakestCard.id,
      prompt: `What's ${weakestCard.label.toLowerCase().replace('your ', '')}?`,
      placeholder: weakestCard.notePrompt
    } : null;

    // Build recap based on type
    let recap = '';
    let nextPreview = '';
    let primaryCTA = { label: '', action: '' };
    let secondaryCTA: { label: string; action: string } | null = null;

    if (type === 'pre_brief') {
      recap = `Here's my read on ${companyName}. You're in ${industry}, helping ${audience}. ${edge ? `Your edge is ${edge}.` : ''} ${proofElements.length > 0 ? `You've got proof: ${Array.isArray(proofElements) ? proofElements[0] : proofElements}.` : ''}`;
      nextPreview = "When you continue, I'll generate your Strategy Brief — the strategic foundation for your landing page.";
      primaryCTA = { label: 'Generate My Strategy Brief', action: 'generate_brief' };
      secondaryCTA = { label: 'Edit Brand Details First', action: 'brand_setup' };
    } else if (type === 'pre_page') {
      recap = `Your Strategy Brief is locked. Here's how I'm translating it to design for ${companyName}.`;
      nextPreview = "When you continue, I'll generate your landing page based on this brief.";
      primaryCTA = { label: 'Build My Page', action: 'generate_page' };
      secondaryCTA = { label: 'Review Brief Again', action: 'brief' };
    }

    return {
      recap,
      cards,
      gap,
      nextPreview,
      primaryCTA,
      secondaryCTA
    };
  }

  async function handleNoteChange(cardId: string, note: string) {
    const newNotes = { ...cardNotes, [cardId]: note };
    setCardNotes(newNotes);

    // Save to database
    await supabase
      .from('consultations')
      .update({ card_notes: newNotes })
      .eq('id', consultationId);

    // Check if this is a strategic pivot (for YOUR EDGE card)
    if (cardId === 'edge' && note.length > 50) {
      console.log('📝 Note on EDGE card may be strategic:', note);
    }
  }

  async function handlePrimaryCTA() {
    if (!consultation || !huddleContent) return;

    setGenerating(true);

    const action = huddleContent.primaryCTA.action;

    if (action === 'generate_brief') {
      // Save card notes first
      await supabase
        .from('consultations')
        .update({ card_notes: cardNotes })
        .eq('id', consultationId);

      // Update flow state
      await updateFlowState(consultationId!, 'brief_generated', 'huddle_complete');

      // Generate the strategy brief
      const brief = await generateStrategyBrief(consultation, cardNotes);

      // Save brief to consultation
      await supabase
        .from('consultations')
        .update({
          strategy_brief: brief as unknown as import('@/integrations/supabase/types').Json,
          active_brief_version: 1,
          brief_versions: [{
            version: 1,
            generated_at: new Date().toISOString(),
            trigger: 'huddle_generation',
            positioning_summary: String(brief.positioning || '')
          }] as unknown as import('@/integrations/supabase/types').Json
        })
        .eq('id', consultationId);

      // Navigate to Brand Setup (not to a separate Brief page)
      navigate(`/brand-setup?consultationId=${consultationId}`);
    } else if (action === 'generate_page') {
      await updateFlowState(consultationId!, 'brief_generated', 'huddle_primary_cta');
      navigate(`/generate?consultationId=${consultationId}`);
    }

    setGenerating(false);
  }

  async function generateStrategyBrief(consultation: ConsultationData, notes: Record<string, string>): Promise<Record<string, unknown>> {
    // Build brief from consultation + notes
    const intel = (consultation.extracted_intelligence || {}) as Record<string, unknown>;
    
    return {
      positioning: notes.edge || consultation.competitor_differentiator || (intel.competitorDifferentiator as string) || '',
      targetAudience: notes.audience || consultation.target_audience || (intel.audience as string) || '',
      industry: notes.industry || consultation.industry || (intel.industry as string) || '',
      headlines: {
        primary: `${consultation.unique_value || intel.valueProp || 'Transform your business'}`,
        supporting: `For ${consultation.target_audience || intel.audience || 'businesses'} who ${consultation.audience_pain_points?.[0] || 'need results'}`
      },
      valueProps: consultation.unique_value || intel.valueProp || '',
      proofPoints: consultation.authority_markers || intel.proofElements || [],
      objectionHandlers: consultation.audience_pain_points || intel.painPoints || [],
      ctaStrategy: {
        primary: 'Get Started',
        secondary: 'Learn More'
      },
      cardNotes: notes
    };
  }

  function handleSecondaryCTA() {
    if (!huddleContent?.secondaryCTA) return;

    const action = huddleContent.secondaryCTA.action;
    if (action === 'brand_setup') {
      navigate(`/brand-setup?consultationId=${consultationId}`);
    } else if (action === 'brief') {
      navigate(`/strategy-brief?consultationId=${consultationId}`);
    }
  }

  function handleSkip() {
    // Skip huddle and go to next logical step
    if (huddleType === 'pre_brief') {
      navigate(`/brand-setup?consultationId=${consultationId}`);
    } else {
      navigate(`/dashboard`);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0d1a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0d0d1a] flex items-center justify-center">
        <div className="text-center max-w-md">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => navigate('/demo')}
            className="text-purple-400 hover:text-purple-300 underline"
          >
            Start a new session
          </button>
        </div>
      </div>
    );
  }

  if (!huddleContent) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-violet-600 flex items-center justify-center text-lg">
              🎯
            </div>
            <h1 className="text-xl font-semibold">Strategy Huddle</h1>
          </div>
          <button
            onClick={handleSkip}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Skip →
          </button>
        </div>

        {/* Recap */}
        <HuddleRecap text={huddleContent.recap} />

        {/* Intelligence Cards */}
        <HuddleIntelligenceCards 
          cards={huddleContent.cards} 
          notes={cardNotes}
          onNoteChange={handleNoteChange}
        />

        {/* Gap Callout */}
        {huddleContent.gap && (
          <HuddleGapCallout
            field={huddleContent.gap.field}
            prompt={huddleContent.gap.prompt}
            placeholder={huddleContent.gap.placeholder}
            value={cardNotes[huddleContent.gap.field] || ''}
            onChange={(value) => handleNoteChange(huddleContent.gap!.field, value)}
          />
        )}

        {/* Next Preview */}
        <div className="text-center text-gray-400 text-sm mb-8">
          {huddleContent.nextPreview}
        </div>

        {/* CTAs */}
        <HuddleCTAs
          primaryLabel={huddleContent.primaryCTA.label}
          secondaryLabel={huddleContent.secondaryCTA?.label}
          onPrimary={handlePrimaryCTA}
          onSecondary={handleSecondaryCTA}
          loading={generating}
        />

        {/* Escape Hatch */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate(`/brand-setup?consultationId=${consultationId}`)}
            className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
          >
            Not quite right? Edit details
          </button>
        </div>
      </div>
    </div>
  );
}
