/**
 * PROOF DENSITY ANALYZER
 * 
 * Determines visual weight distribution based on available proof points.
 * Prevents fabrication by hiding sections when data is sparse.
 */

export type ProofDensity = 'sparse' | 'moderate' | 'rich';

export type VisualWeightConfig = {
  statsBar: 'hidden' | 'standard' | 'prominent';
  testimonialStyle: 'hidden' | 'inline' | 'featured';
  caseStudyStyle: 'hidden' | 'summary' | 'detailed';
  featuresStyle: 'prominent' | 'standard' | 'compact';
  heroStyle: 'image-heavy' | 'balanced' | 'text-focused';
  reasoning: string;
};

export interface ProofPoints {
  clientCount?: string;
  yearsInBusiness?: string;
  specificResults?: string[];
  percentageStats?: string[];
  dollarStats?: string[];
  testimonials?: Array<{ quote: string; author?: string; title?: string }>;
  caseStudies?: Array<{ title: string; result: string; detail?: string }>;
  certifications?: string[];
  clientLogos?: string[];
}

export function analyzeProofDensity(proof: ProofPoints): ProofDensity {
  let score = 0;

  if (proof.clientCount) score += 2;
  if (proof.yearsInBusiness) score += 1;
  if (proof.specificResults && proof.specificResults.length > 0) score += proof.specificResults.length;
  if (proof.percentageStats && proof.percentageStats.length > 0) score += proof.percentageStats.length * 2;
  if (proof.dollarStats && proof.dollarStats.length > 0) score += proof.dollarStats.length * 2;
  if (proof.testimonials && proof.testimonials.length > 0) score += proof.testimonials.length * 2;
  if (proof.caseStudies && proof.caseStudies.length > 0) score += proof.caseStudies.length * 3;
  if (proof.certifications && proof.certifications.length > 0) score += proof.certifications.length;
  if (proof.clientLogos && proof.clientLogos.length > 0) score += Math.min(proof.clientLogos.length, 3);

  console.log('🎨 [SDI] Proof density score:', score);

  if (score >= 10) return 'rich';
  if (score >= 5) return 'moderate';
  return 'sparse';
}

export function getVisualWeightConfig(density: ProofDensity): VisualWeightConfig {
  const configs: Record<ProofDensity, VisualWeightConfig> = {
    rich: {
      statsBar: 'prominent',
      testimonialStyle: 'featured',
      caseStudyStyle: 'detailed',
      featuresStyle: 'compact',
      heroStyle: 'text-focused',
      reasoning: 'Rich proof data available - emphasize stats and testimonials, let proof carry the page'
    },
    moderate: {
      statsBar: 'standard',
      testimonialStyle: 'inline',
      caseStudyStyle: 'summary',
      featuresStyle: 'standard',
      heroStyle: 'balanced',
      reasoning: 'Moderate proof - balanced layout between features and proof points'
    },
    sparse: {
      statsBar: 'hidden',
      testimonialStyle: 'hidden',
      caseStudyStyle: 'hidden',
      featuresStyle: 'prominent',
      heroStyle: 'image-heavy',
      reasoning: 'Limited proof data - hide empty sections, emphasize features and visual interest instead'
    }
  };

  console.log('🎨 [SDI] Visual weight config:', density);
  return configs[density];
}

/**
 * Extract proof points from conversation/intelligence data
 */
export function extractProofPoints(intelligence: any): ProofPoints {
  const proof: ProofPoints = {};

  if (!intelligence) {
    console.log('🎨 [SDI] No intelligence data for proof extraction');
    return proof;
  }

  // Extract from various possible field locations
  const text = JSON.stringify(intelligence).toLowerCase();
  
  // Client count patterns
  const clientMatch = text.match(/(\d+)\+?\s*(clients?|customers?|organizations?|companies)/i);
  if (clientMatch) {
    proof.clientCount = clientMatch[0];
  }

  // Years in business
  const yearsMatch = text.match(/(\d+)\+?\s*years?/i);
  if (yearsMatch) {
    proof.yearsInBusiness = yearsMatch[0];
  }

  // Percentage stats (e.g., "94% pass rate", "70% find vulnerabilities")
  const percentMatches = text.match(/\d+%[^.]*[a-z]+/gi);
  if (percentMatches) {
    proof.percentageStats = percentMatches.slice(0, 4);
  }

  // Dollar stats (e.g., "$31K savings", "$1.5 million fines")
  const dollarMatches = text.match(/\$[\d,.]+[kmb]?\s*[^.]*[a-z]+/gi);
  if (dollarMatches) {
    proof.dollarStats = dollarMatches.slice(0, 3);
  }

  // Look for specific results in intelligence fields
  if (intelligence.results || intelligence.proofPoints?.results) {
    const results = intelligence.results || intelligence.proofPoints?.results;
    if (Array.isArray(results)) {
      proof.specificResults = results;
    } else if (typeof results === 'string') {
      proof.specificResults = [results];
    }
  }

  // Testimonials
  if (intelligence.testimonials || intelligence.socialProof) {
    const testimonials = intelligence.testimonials || intelligence.socialProof;
    if (Array.isArray(testimonials)) {
      proof.testimonials = testimonials;
    } else if (typeof testimonials === 'string') {
      proof.testimonials = [{ quote: testimonials }];
    }
  }

  // Case studies
  if (intelligence.caseStudies || intelligence.successStories) {
    proof.caseStudies = intelligence.caseStudies || intelligence.successStories;
  }

  // Certifications
  if (intelligence.certifications || intelligence.credentials) {
    const certs = intelligence.certifications || intelligence.credentials;
    if (Array.isArray(certs)) {
      proof.certifications = certs;
    } else if (typeof certs === 'string') {
      proof.certifications = certs.split(',').map((c: string) => c.trim());
    }
  }

  console.log('🎨 [SDI] Extracted proof points:', proof);
  return proof;
}
