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
/**
 * Extract only string VALUES from intelligence object, ignoring JSON keys
 * This prevents field names like "valuePropFull" from leaking into extracted text
 */
function extractTextValuesOnly(obj: any): string[] {
  const values: string[] = [];
  
  function recurse(item: any) {
    if (typeof item === 'string') {
      // Only include substantial strings that look like real content
      if (item.length > 10 && !/^[a-z_]+$/i.test(item)) {
        values.push(item);
      }
    } else if (Array.isArray(item)) {
      item.forEach(recurse);
    } else if (item && typeof item === 'object') {
      Object.values(item).forEach(recurse);
    }
  }
  
  recurse(obj);
  return values;
}

/**
 * Clean and validate a stat label to ensure it's display-ready
 */
function cleanStatLabel(rawLabel: string): string | null {
  if (!rawLabel) return null;
  
  // Remove JSON field name patterns (camelCase, snake_case identifiers)
  let cleaned = rawLabel
    .replace(/[a-z]+[A-Z][a-zA-Z]*/g, ' ')  // Remove camelCase words
    .replace(/[a-z_]+(?:full|summary|data|info|points?|stats?|elements?)/gi, ' ') // Remove field name suffixes
    .replace(/["{}[\]:,]/g, ' ')  // Remove JSON syntax chars
    .replace(/\s+/g, ' ')  // Collapse whitespace
    .trim();
  
  // Must have at least 3 real characters and not be a field name fragment
  if (cleaned.length < 3) return null;
  if (/^(of|in|the|and|or|for|with|our|we|to|a|an)$/i.test(cleaned)) return null;
  if (/^[a-z]+$/i.test(cleaned) && cleaned.length < 6) return null;
  
  // Capitalize first letter
  cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  
  return cleaned;
}

export function extractProofPoints(intelligence: any): ProofPoints {
  const proof: ProofPoints = {};

  if (!intelligence) {
    console.log('🎨 [SDI] No intelligence data for proof extraction');
    return proof;
  }

  // Extract only text VALUES (not JSON keys) to avoid field name pollution
  const textValues = extractTextValuesOnly(intelligence);
  const text = textValues.join(' ');
  
  console.log('🎨 [SDI] Extracted text for proof analysis (length):', text.length);
  
  // Client count patterns - match from clean text
  const clientMatch = text.match(/(\d+)\+?\s*(clients?|customers?|organizations?|companies)/i);
  if (clientMatch) {
    proof.clientCount = clientMatch[0];
  }

  // Years in business
  const yearsMatch = text.match(/(\d+)\+?\s*years?/i);
  if (yearsMatch) {
    proof.yearsInBusiness = yearsMatch[0];
  }

  // Percentage stats - extract with surrounding context, then clean
  const percentMatches: string[] = [];
  const percentRegex = /(\d+%)\s+([^.!?\n]{3,50})/g;
  let match;
  while ((match = percentRegex.exec(text)) !== null) {
    const value = match[1];
    const context = match[2].trim();
    // Validate context doesn't contain field names
    const cleanContext = cleanStatLabel(context);
    if (cleanContext && cleanContext.length >= 3) {
      percentMatches.push(`${value} ${cleanContext}`);
    }
  }
  if (percentMatches.length > 0) {
    proof.percentageStats = [...new Set(percentMatches)].slice(0, 4); // Dedupe
  }

  // Dollar stats with clean context
  const dollarMatches: string[] = [];
  const dollarRegex = /(\$[\d,.]+[kmb]?)\s+([^.!?\n]{3,50})/gi;
  while ((match = dollarRegex.exec(text)) !== null) {
    const value = match[1];
    const context = match[2].trim();
    const cleanContext = cleanStatLabel(context);
    if (cleanContext && cleanContext.length >= 3) {
      dollarMatches.push(`${value} ${cleanContext}`);
    }
  }
  if (dollarMatches.length > 0) {
    proof.dollarStats = [...new Set(dollarMatches)].slice(0, 3); // Dedupe
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
