// StrataQuest™ Buyer Archetype Assignment — Pillar 2
// Derives archetype from existing consultation/brief data (no new extraction needed)

export type ArchetypeName = 'analytical_validator' | 'emotional_connector' | 'decisive_commander' | 'cautious_researcher';

interface ArchetypeSignal {
  archetype: ArchetypeName;
  source: string;
  weight: number;
}

export interface ArchetypeAssignment {
  primary: ArchetypeName;
  label: string;
  description: string;
  internalMonologue: string;
  confidence: 'High' | 'Moderate' | 'Low';
  signalCount: number;
  signals: string[];
  voiceMatch: string;
}

const ARCHETYPE_META: Record<ArchetypeName, { label: string; description: string; monologue: string; voice: string }> = {
  analytical_validator: {
    label: 'Analytical Validator',
    description: 'Data-driven. Compares options. Needs logical justification.',
    monologue: '"Prove it. Show me the numbers."',
    voice: 'Precise, evidence-based, confident but not arrogant',
  },
  emotional_connector: {
    label: 'Emotional Connector',
    description: 'Trust-driven. Values relationships. Needs to feel understood.',
    monologue: '"Do I trust these people? Do they get me?"',
    voice: 'Warm, empathetic, story-driven with genuine care',
  },
  decisive_commander: {
    label: 'Decisive Commander',
    description: 'Results-focused. Moves fast. Needs clear superiority.',
    monologue: '"Is this the best option? Great, let\'s go."',
    voice: 'Bold, direct, credential-heavy with authority',
  },
  cautious_researcher: {
    label: 'Cautious Researcher',
    description: 'Thorough. Risk-averse. Needs comprehensive answers.',
    monologue: '"What am I missing? What could go wrong?"',
    voice: 'Transparent, thorough, reassuring with guarantees',
  },
};

export function assignArchetype(briefData: Record<string, any>): ArchetypeAssignment {
  const signals: ArchetypeSignal[] = [];
  const signalDescriptions: string[] = [];

  // Signal from industry
  const industry = (briefData.industry || '').toLowerCase();
  if (/saas|fintech|healthcare|enterprise|b2b|tech|software|ai|automation/.test(industry)) {
    signals.push({ archetype: 'analytical_validator', source: 'technical_industry', weight: 2 });
    signalDescriptions.push('B2B enterprise context');
  }
  if (/coaching|wellness|creative|nonprofit|lifestyle|personal/.test(industry)) {
    signals.push({ archetype: 'emotional_connector', source: 'relationship_industry', weight: 2 });
    signalDescriptions.push('Relationship-driven industry');
  }
  if (/agency|luxury|executive|consulting|law|legal/.test(industry)) {
    signals.push({ archetype: 'decisive_commander', source: 'authority_industry', weight: 2 });
    signalDescriptions.push('Authority-driven industry');
  }

  // Signal from target audience
  const audience = (briefData.targetAudience || briefData.audience || briefData.target_audience || '').toLowerCase();
  if (/vp|director|cto|cfo|head of|manager|operations/.test(audience)) {
    signals.push({ archetype: 'analytical_validator', source: 'executive_audience', weight: 2 });
    signalDescriptions.push('Technical decision-maker audience');
  }
  if (/founder|ceo|owner|president/.test(audience)) {
    signals.push({ archetype: 'decisive_commander', source: 'founder_audience', weight: 2 });
    signalDescriptions.push('Founder/CEO audience');
  }

  // Signal from competitive edge / value prop language
  const edge = (briefData.competitiveEdge || briefData.competitorDifferentiator || briefData.competitor_differentiator || briefData.valueProp || briefData.unique_value || '').toLowerCase();
  if (/data|ai|automation|analytics|ml|algorithm|metric|roi|performance/.test(edge)) {
    signals.push({ archetype: 'analytical_validator', source: 'technical_differentiator', weight: 1 });
    signalDescriptions.push('Data/ROI-focused language');
  }
  if (/trust|relationship|partner|care|personal|support/.test(edge)) {
    signals.push({ archetype: 'emotional_connector', source: 'relationship_differentiator', weight: 1 });
    signalDescriptions.push('Relationship-focused differentiator');
  }

  // Signal from pain points
  const pains = (briefData.painPoints || '').toLowerCase();
  if (/slow|inefficient|manual|fragmented|costly|waste|complex/.test(pains)) {
    signals.push({ archetype: 'analytical_validator', source: 'efficiency_pain', weight: 1 });
    signalDescriptions.push('Efficiency-focused pain points');
  }
  if (/trust|connect|understand|feel|relationship|overwhelm/.test(pains)) {
    signals.push({ archetype: 'emotional_connector', source: 'relationship_pain', weight: 1 });
    signalDescriptions.push('Relationship-driven pain points');
  }
  if (/risk|compliance|security|uncertain|afraid|worried/.test(pains)) {
    signals.push({ archetype: 'cautious_researcher', source: 'risk_pain', weight: 1 });
    signalDescriptions.push('Risk-averse pain points');
  }

  // Signal from proof elements
  const proof = (briefData.proofElements || briefData.proof || '').toLowerCase();
  if (/\d+%|\d+x|\d+ (clients|customers|users)|roi|revenue/.test(proof)) {
    signals.push({ archetype: 'analytical_validator', source: 'quantified_proof', weight: 1 });
    signalDescriptions.push('Quantified proof points');
  }

  // Signal from sales cycle indicators
  if (/enterprise|long.?cycle|committee|procurement|rfp/.test(audience + ' ' + industry)) {
    signals.push({ archetype: 'analytical_validator', source: 'long_sales_cycle', weight: 1 });
    signalDescriptions.push('Long sales cycle indicated');
  }

  // Tally scores per archetype
  const scores: Record<ArchetypeName, number> = {
    analytical_validator: 0,
    emotional_connector: 0,
    decisive_commander: 0,
    cautious_researcher: 0,
  };

  for (const s of signals) {
    scores[s.archetype] += s.weight;
  }

  // Find winner
  const sorted = (Object.entries(scores) as [ArchetypeName, number][]).sort((a, b) => b[1] - a[1]);
  const winner = sorted[0][0];
  const winnerScore = sorted[0][1];
  const meta = ARCHETYPE_META[winner];

  // Deduplicate signal descriptions
  const uniqueSignals = [...new Set(signalDescriptions)];

  const confidence: 'High' | 'Moderate' | 'Low' = 
    winnerScore >= 4 ? 'High' : 
    winnerScore >= 2 ? 'Moderate' : 'Low';

  return {
    primary: winner,
    label: meta.label,
    description: meta.description,
    internalMonologue: meta.monologue,
    confidence,
    signalCount: uniqueSignals.length,
    signals: uniqueSignals,
    voiceMatch: meta.voice,
  };
}
