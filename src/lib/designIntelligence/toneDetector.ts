/**
 * TONE DETECTION SYSTEM
 * 
 * Analyzes conversation text for linguistic signals that map to typography decisions.
 * Based on Monotype neuro research + Morris/NYT trust studies.
 */

export type ToneProfile = {
  primary: 'authoritative' | 'urgent' | 'consultative' | 'innovative' | 'warm';
  secondary?: 'authoritative' | 'urgent' | 'consultative' | 'innovative' | 'warm';
  confidence: number;
  markers: string[];
};

export type TypographyRecommendation = {
  headingFont: string;
  bodyFont: string;
  headingWeight: number;
  bodyWeight: number;
  reasoning: string;
};

// Tone detection patterns
const TONE_MARKERS = {
  authoritative: [
    'compliance', 'regulations', 'regulatory', 'certification', 'certified',
    'standards', 'audit', 'audits', 'HIPAA', 'SOC-2', 'ISO', 'legal',
    'requirements', 'mandated', 'policy', 'governance', 'framework'
  ],
  urgent: [
    'risk', 'threat', 'breach', 'fine', 'fines', 'penalty', 'deadline',
    'career-ending', 'losing jobs', 'fired', 'blame', 'lawsuit', 'immediately',
    'before it\'s too late', 'critical', 'urgent', 'emergency', 'crisis'
  ],
  consultative: [
    'we help', 'we guide', 'partner', 'alongside', 'advisory', 'consultant',
    'work with', 'collaborate', 'support', 'assist', 'recommend', 'suggest',
    'tailored', 'customized', 'personalized'
  ],
  innovative: [
    'AI', 'artificial intelligence', 'machine learning', 'automated',
    'revolutionary', 'disruptive', 'first to market', 'cutting-edge',
    'next-generation', 'breakthrough', 'transform', 'reimagine'
  ],
  warm: [
    'peace of mind', 'sleep better', 'trust', 'relationship', 'care',
    'understand', 'empathy', 'support', 'comfort', 'confidence', 'reassure',
    'family', 'community', 'together'
  ]
};

// Typography mappings based on research
const TYPOGRAPHY_MAPPINGS: Record<string, TypographyRecommendation> = {
  'authoritative': {
    headingFont: 'Inter',
    bodyFont: 'Inter',
    headingWeight: 700,
    bodyWeight: 400,
    reasoning: 'Geometric sans-serif conveys competence and authority (Monotype research)'
  },
  'authoritative+traditional': {
    headingFont: 'Playfair Display',
    bodyFont: 'Source Sans Pro',
    headingWeight: 700,
    bodyWeight: 400,
    reasoning: 'Serif headings increase perceived trust by ~13% (Morris/NYT study)'
  },
  'urgent': {
    headingFont: 'Space Grotesk',
    bodyFont: 'DM Sans',
    headingWeight: 700,
    bodyWeight: 400,
    reasoning: 'Geometric tension with condensed feel creates urgency without alarm'
  },
  'consultative': {
    headingFont: 'Playfair Display',
    bodyFont: 'Source Sans Pro',
    headingWeight: 600,
    bodyWeight: 400,
    reasoning: 'Humanist warmth combined with serif expertise signals advisory relationship'
  },
  'innovative': {
    headingFont: 'Space Grotesk',
    bodyFont: 'Inter',
    headingWeight: 600,
    bodyWeight: 400,
    reasoning: 'Modern geometric forms signal innovation and technical sophistication'
  },
  'warm': {
    headingFont: 'Libre Baskerville',
    bodyFont: 'Source Sans Pro',
    headingWeight: 400,
    bodyWeight: 400,
    reasoning: 'Humanist serif with high x-height balances friendliness with credibility'
  },
  'authoritative+urgent': {
    headingFont: 'Inter',
    bodyFont: 'DM Sans',
    headingWeight: 700,
    bodyWeight: 400,
    reasoning: 'Clean authority with modern urgency - compliance meets consequence'
  }
};

export function detectTone(conversationText: string): ToneProfile {
  const text = conversationText.toLowerCase();
  const scores: Record<string, { count: number; markers: string[] }> = {
    authoritative: { count: 0, markers: [] },
    urgent: { count: 0, markers: [] },
    consultative: { count: 0, markers: [] },
    innovative: { count: 0, markers: [] },
    warm: { count: 0, markers: [] }
  };

  // Count marker occurrences
  for (const [tone, markers] of Object.entries(TONE_MARKERS)) {
    for (const marker of markers) {
      const regex = new RegExp(marker.toLowerCase(), 'gi');
      const matches = text.match(regex);
      if (matches) {
        scores[tone].count += matches.length;
        if (!scores[tone].markers.includes(marker)) {
          scores[tone].markers.push(marker);
        }
      }
    }
  }

  // Sort by count
  const sorted = Object.entries(scores)
    .sort((a, b) => b[1].count - a[1].count);

  const primary = sorted[0][0] as ToneProfile['primary'];
  const secondary = sorted[1][1].count > 2 ? sorted[1][0] as ToneProfile['secondary'] : undefined;
  
  const totalMarkers = sorted.reduce((sum, [_, data]) => sum + data.count, 0);
  const confidence = totalMarkers > 0 ? Math.min(sorted[0][1].count / totalMarkers + 0.3, 1) : 0.5;

  console.log('🎨 [SDI] Tone detection:', { primary, secondary, confidence, markers: sorted[0][1].markers });

  return {
    primary,
    secondary,
    confidence,
    markers: sorted[0][1].markers.slice(0, 5)
  };
}

export function getTypographyRecommendation(tone: ToneProfile): TypographyRecommendation {
  // Check for combined tones
  if (tone.secondary && tone.confidence > 0.6) {
    const combined = `${tone.primary}+${tone.secondary}`;
    if (TYPOGRAPHY_MAPPINGS[combined]) {
      console.log('🎨 [SDI] Typography selected:', combined);
      return TYPOGRAPHY_MAPPINGS[combined];
    }
  }

  console.log('🎨 [SDI] Typography selected:', tone.primary);
  return TYPOGRAPHY_MAPPINGS[tone.primary] || TYPOGRAPHY_MAPPINGS['authoritative'];
}
