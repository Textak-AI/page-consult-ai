// Universal quality standards for ALL page generation
// Ensures professional, well-formatted content across marketing and customer pages

interface QualityCheckResult {
  passed: boolean;
  errors: string[];
  warnings: string[];
}

interface PageContent {
  headline: string;
  subheadline: string;
  features: Array<{ title: string; description: string }>;
  statistics?: Array<{ statistic: string; claim: string }>;
  problem?: string;
  solution?: string;
}

/**
 * Master quality validation - runs before ANY page is finalized
 */
export function validatePageQuality(content: PageContent): QualityCheckResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Check for raw consultation text (CRITICAL)
  const rawPatterns = [
    /they don't/i,
    /they can't/i,
    /customers don't/i,
    /clients can't/i,
    /users lack/i,
    /^we have/i,
    /^we offer/i,
    /^our\s+(system|tool|platform)\s+has/i,
  ];

  for (const pattern of rawPatterns) {
    if (pattern.test(content.headline)) {
      errors.push(`Headline contains raw consultation text: "${content.headline}". Must be transformed into compelling copy.`);
    }
    if (pattern.test(content.subheadline)) {
      errors.push(`Subheadline contains raw consultation text. Must be benefit-focused.`);
    }
  }

  // 2. Validate headline quality
  if (content.headline.length < 10) {
    errors.push('Headline too short. Must be at least 10 characters.');
  }
  if (content.headline.length > 80) {
    warnings.push('Headline is long. Consider shortening for impact.');
  }
  if (!content.headline.match(/[A-Z]/)) {
    errors.push('Headline must be capitalized properly.');
  }
  if (content.headline.includes('undefined') || content.headline.includes('[')) {
    errors.push('Headline contains placeholders or undefined values.');
  }

  // 3. Validate statistics formatting
  if (content.statistics && content.statistics.length > 0) {
    for (const stat of content.statistics) {
      // Check for incomplete numbers (missing %, $, or range completion)
      if (stat.statistic && !stat.statistic.match(/[%$]/)) {
        // If the claim mentions percent/percentage/dollar, the statistic should have the symbol
        if (stat.claim.match(/percent|%|\$|dollar|cost|price/i)) {
          warnings.push(`Statistic "${stat.statistic}" may be missing unit (%, $). Claim: "${stat.claim}"`);
        }
      }

      // Check for incomplete ranges (e.g., "60" when it should be "60-90%")
      if (stat.statistic.match(/^\d+$/) && stat.claim.match(/\d+-\d+/)) {
        warnings.push(`Statistic "${stat.statistic}" appears incomplete. Check if full range should be shown.`);
      }

      // Check for proper citation
      if (!stat.claim || stat.claim.length < 10) {
        errors.push(`Statistic "${stat.statistic}" missing proper citation or claim.`);
      }
    }
  }

  // 4. Validate features are benefit-focused
  const benefitKeywords = ['save', 'increase', 'reduce', 'improve', 'boost', 'eliminate', 'automate', 'simplify', 'accelerate', 'maximize'];
  let hasBenefitFocus = false;

  for (const feature of content.features) {
    // Check for completeness
    if (!feature.title || feature.title.length < 5) {
      errors.push('Feature title too short or missing.');
    }
    if (!feature.description || feature.description.length < 20) {
      errors.push(`Feature "${feature.title}" description too short. Must be at least 20 characters.`);
    }

    // Check for undefined or placeholder text
    if (feature.title.includes('undefined') || feature.description.includes('undefined')) {
      errors.push(`Feature "${feature.title}" contains undefined values.`);
    }

    // Check for benefit language
    const hasKeyword = benefitKeywords.some(keyword => 
      feature.title.toLowerCase().includes(keyword) || 
      feature.description.toLowerCase().includes(keyword)
    );
    if (hasKeyword) {
      hasBenefitFocus = true;
    }

    // Warn if feature is too feature-focused vs benefit-focused
    if (feature.description.match(/^(We|Our|The system|This tool|This platform)/i)) {
      warnings.push(`Feature "${feature.title}" description is feature-focused. Consider making it benefit-focused.`);
    }
  }

  if (!hasBenefitFocus && content.features.length > 0) {
    warnings.push('No features use benefit-focused language (save, increase, reduce, etc). Consider emphasizing benefits.');
  }

  // 5. Validate problem/solution statements
  if (content.problem && rawPatterns.some(p => p.test(content.problem))) {
    errors.push('Problem statement contains raw consultation text. Must be transformed.');
  }
  if (content.solution && rawPatterns.some(p => p.test(content.solution))) {
    errors.push('Solution statement contains raw consultation text. Must be transformed.');
  }

  return {
    passed: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Format statistics properly - ensures complete data with units
 */
export function formatStatistic(stat: string, claim: string): string {
  // If statistic is missing units but claim mentions them, add them
  if (!stat.match(/[%$]/)) {
    if (claim.match(/percent|percentage/i) && !stat.includes('%')) {
      return stat + '%';
    }
    if (claim.match(/dollar|cost|\$/i) && !stat.includes('$')) {
      return '$' + stat;
    }
  }

  // Ensure ranges are complete
  // If claim has "60-90" or "60 to 90" but stat only has "60"
  const rangeMatch = claim.match(/(\d+)(?:\s*-\s*|\s+to\s+)(\d+)/);
  if (rangeMatch && !stat.includes('-')) {
    const hasUnit = stat.match(/[%$]/);
    const unit = hasUnit ? hasUnit[0] : '';
    return `${rangeMatch[1]}-${rangeMatch[2]}${unit}`;
  }

  return stat;
}

/**
 * Check if text appears to be raw consultation input
 */
export function isRawConsultationText(text: string): boolean {
  const patterns = [
    /^they\s+/i,
    /^customers?\s+/i,
    /^clients?\s+/i,
    /^users?\s+/i,
    /don't have/i,
    /can't/i,
    /lack of/i,
    /^we have/i,
    /^we offer/i,
  ];

  return patterns.some(pattern => pattern.test(text.trim()));
}

/**
 * Transform raw text into professional copy if needed
 */
export function ensureProfessionalCopy(text: string, context: 'headline' | 'feature' | 'description'): string {
  if (!isRawConsultationText(text)) {
    return text;
  }

  // Basic transformations to prevent raw text from appearing
  let transformed = text
    .replace(/^they\s+(don't|can't|won't)\s+/i, '')
    .replace(/^customers?\s+(need|want|don't have)/i, '')
    .replace(/^we\s+(have|offer|provide)\s+(a|an|the)?\s*/i, '')
    .trim();

  // Capitalize first letter
  transformed = transformed.charAt(0).toUpperCase() + transformed.slice(1);

  console.warn(`⚠️ Raw consultation text detected in ${context}: "${text}". Auto-transformed to: "${transformed}"`);

  return transformed;
}

/**
 * Log quality issues for debugging
 */
export function logQualityReport(result: QualityCheckResult, context: string = 'Page') {
  if (result.passed && result.warnings.length === 0) {
    console.log(`✅ ${context} quality check passed with no issues`);
    return;
  }

  console.group(`📊 ${context} Quality Report`);
  
  if (result.errors.length > 0) {
    console.error('❌ ERRORS (must fix):');
    result.errors.forEach(error => console.error(`  - ${error}`));
  }

  if (result.warnings.length > 0) {
    console.warn('⚠️ WARNINGS (should improve):');
    result.warnings.forEach(warning => console.warn(`  - ${warning}`));
  }

  console.groupEnd();
}
