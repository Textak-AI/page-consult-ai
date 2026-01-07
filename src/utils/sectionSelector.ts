/**
 * SDI-DRIVEN SECTION SELECTION
 * 
 * Dynamically selects which sections to include based on:
 * - Buyer awareness level (Schwartz framework)
 * - Proof density (sparse/moderate/rich)
 * - Emotional drivers (urgency, protection, growth, etc.)
 */

import { DesignIntelligenceOutput } from '@/lib/designIntelligence';

export type SectionType = 
  | 'hero'
  | 'hero-problem'        // Problem-focused hero for problem-aware
  | 'hero-mechanism'      // Solution-focused hero for solution-aware
  | 'hero-offer'          // Offer-focused hero for most-aware
  | 'credibility-strip'   // Logo bar, certifications
  | 'stats-bar'
  | 'stakes-amplify'      // Dramatize consequences
  | 'problem-solution'
  | 'social-proof'        // Testimonials/case studies
  | 'features'
  | 'how-it-works'
  | 'comparison'          // Us vs alternatives
  | 'faq'
  | 'risk-reversal'       // Guarantee section
  | 'final-cta'
  // Beta page sections
  | 'beta-hero-teaser'
  | 'beta-perks'
  | 'waitlist-proof'
  | 'founder';

export interface SectionSelectionResult {
  sections: SectionType[];
  heroVariant: 'default' | 'problem' | 'mechanism' | 'offer';
  reasoning: string;
}

export function selectSectionsFromSDI(
  sdi: DesignIntelligenceOutput | null,
  options?: { isBetaPage?: boolean }
): SectionSelectionResult {
  // Beta pages have fixed structure
  if (options?.isBetaPage) {
    console.log('📋 [SectionSelector] Beta page - using fixed structure');
    return {
      sections: ['beta-hero-teaser', 'features', 'founder', 'waitlist-proof', 'final-cta'],
      heroVariant: 'default',
      reasoning: 'Beta page uses fixed structure optimized for signups'
    };
  }

  // Default fallback if no SDI
  if (!sdi) {
    console.log('📋 [SectionSelector] No SDI - using default structure');
    return {
      sections: ['hero', 'stats-bar', 'problem-solution', 'features', 'faq', 'final-cta'],
      heroVariant: 'default',
      reasoning: 'No design intelligence available - using balanced default structure'
    };
  }

  const { awarenessLevel, proofDensity, emotionalDrivers } = sdi;
  
  console.log('📋 [SectionSelector] Building structure from SDI:', {
    awarenessLevel,
    proofDensity,
    emotionalDrivers
  });

  let sections: SectionType[] = [];
  let heroVariant: 'default' | 'problem' | 'mechanism' | 'offer' = 'default';
  let reasoning = '';

  // AWARENESS-BASED STRUCTURE (Schwartz framework)
  switch (awarenessLevel) {
    case 'unaware':
      // Lead with story, hint at problem, soft CTA
      heroVariant = 'default';
      sections = [
        'hero',              // Relatable situation, not product
        'stakes-amplify',    // Dramatize the unseen issue
        'social-proof',      // "You're not alone" - industry stats
        'problem-solution',  // Hint at better way
        'features',          // Brief intro to capabilities
        'final-cta'          // Low commitment: "Learn more"
      ];
      reasoning = 'Unaware audience: leading with relatable situation before introducing problem';
      break;

    case 'problemAware':
      // Validate their pain, then show the way out
      heroVariant = 'problem';
      sections = [
        'hero',              // Articulate THEIR pain (hero-problem variant)
        'stakes-amplify',    // Consequences if they don't act
        'problem-solution',  // "We understand" + bridge to solution
        'social-proof',      // Mini case studies: problem→relief
        'features',          // What they get
        'faq',               // Address objections
        'final-cta'          // "See how others solved this"
      ];
      reasoning = 'Problem-aware: validating pain before showing solution path';
      break;

    case 'solutionAware':
      // They know solutions exist, show why YOU
      heroVariant = 'mechanism';
      sections = [
        'hero',              // Name your approach/method (hero-mechanism variant)
        'comparison',        // Old way vs your way
        'features',          // Differentiators
        'stats-bar',         // Quantified proof
        'social-proof',      // Logos, testimonials
        'faq',               // Help them evaluate
        'final-cta'          // "See how it works"
      ];
      reasoning = 'Solution-aware: differentiating approach with comparison';
      break;

    case 'productAware':
      // They know you, convince them to act
      heroVariant = 'default';
      sections = [
        'hero',              // Name + #1 differentiator
        'credibility-strip', // Logo bar prominent
        'stats-bar',         // Heavy proof
        'features',          // Why you vs alternatives
        'social-proof',      // Detailed testimonials
        'faq',               // Final objections
        'final-cta'          // "Start trial"
      ];
      reasoning = 'Product-aware: heavy proof and credibility to drive conversion';
      break;

    case 'mostAware':
      // They're ready, make it easy
      heroVariant = 'offer';
      sections = [
        'hero',              // Price, guarantee, time-bound offer (hero-offer variant)
        'risk-reversal',     // Guarantee prominent
        'social-proof',      // 1-2 best testimonials
        'final-cta'          // Dominant CTA
      ];
      reasoning = 'Most-aware: minimal friction, offer-focused with strong guarantee';
      break;

    default:
      // Default to problem-aware (most common for cold traffic)
      heroVariant = 'problem';
      sections = [
        'hero',
        'stats-bar', 
        'problem-solution',
        'features',
        'faq',
        'final-cta'
      ];
      reasoning = 'Default structure optimized for cold traffic';
  }

  // PROOF DENSITY MODIFICATIONS
  if (proofDensity === 'sparse') {
    // Remove sections that require proof
    const beforeCount = sections.length;
    sections = sections.filter(s => 
      s !== 'stats-bar' && 
      s !== 'social-proof' && 
      s !== 'credibility-strip'
    );
    if (sections.length < beforeCount) {
      console.log('📋 [SectionSelector] Proof sparse - removed stats/social proof sections');
      reasoning += '. Removed proof sections due to sparse data.';
    }
  } else if (proofDensity === 'rich') {
    // Ensure stats and social proof are included
    if (!sections.includes('stats-bar')) {
      // Add stats-bar after hero
      const heroIndex = sections.findIndex(s => s === 'hero' || s.startsWith('hero-'));
      if (heroIndex !== -1) {
        sections.splice(heroIndex + 1, 0, 'stats-bar');
        console.log('📋 [SectionSelector] Proof rich - added stats bar');
      }
    }
    if (!sections.includes('social-proof')) {
      // Add social proof before final-cta
      const ctaIndex = sections.indexOf('final-cta');
      if (ctaIndex !== -1) {
        sections.splice(ctaIndex, 0, 'social-proof');
        console.log('📋 [SectionSelector] Proof rich - added social proof');
      }
    }
    reasoning += '. Enhanced with additional proof sections.';
  }

  // EMOTIONAL DRIVER MODIFICATIONS
  if (emotionalDrivers?.includes('urgency')) {
    // Add stakes section if not present
    if (!sections.includes('stakes-amplify') && awarenessLevel !== 'mostAware') {
      const heroIndex = sections.findIndex(s => s === 'hero' || s.startsWith('hero-'));
      if (heroIndex !== -1 && heroIndex < sections.length - 1) {
        sections.splice(heroIndex + 1, 0, 'stakes-amplify');
        console.log('📋 [SectionSelector] Urgency detected - added stakes amplification');
      }
    }
  }

  if (emotionalDrivers?.includes('protection')) {
    // Add risk-reversal section
    if (!sections.includes('risk-reversal')) {
      const ctaIndex = sections.indexOf('final-cta');
      if (ctaIndex !== -1) {
        sections.splice(ctaIndex, 0, 'risk-reversal');
        console.log('📋 [SectionSelector] Protection detected - added risk reversal');
      }
    }
  }

  console.log('📋 [SectionSelector] Final structure:', sections);
  console.log('📋 [SectionSelector] Hero variant:', heroVariant);
  console.log('📋 [SectionSelector] Reasoning:', reasoning);

  return {
    sections,
    heroVariant,
    reasoning
  };
}
