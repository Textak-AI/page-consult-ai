/**
 * Audience Seniority Detection
 * 
 * Detects the seniority level of the target audience from consultation data
 * to influence layout template selection and typography weight.
 * 
 * @module audienceSeniority
 */

// =============================================================================
// TYPES
// =============================================================================

export type AudienceSeniority = 'executive' | 'manager' | 'individual' | 'unknown';

export interface AudienceSeniorityResult {
  seniority: AudienceSeniority;
  confidence: 'high' | 'medium' | 'low';
  signals: string[];
}

// =============================================================================
// SIGNAL PATTERNS
// =============================================================================

const EXECUTIVE_SIGNALS = [
  'ceo', 'cfo', 'cto', 'coo', 'cmo', 'cio', 'cpo',
  'c-suite', 'c suite', 'csuite',
  'chief', 'president', 'founder',
  'vp ', 'vice president',
  'director', 'executive',
  'board', 'leadership', 'enterprise',
  'senior leadership', 'decision maker',
  'partner', 'principal', 'managing director',
  'svp', 'evp',
];

const MANAGER_SIGNALS = [
  'manager', 'team lead', 'team leader',
  'department head', 'head of',
  'supervisor', 'coordinator',
  'operations lead', 'project lead',
  'senior manager', 'group lead',
];

const INDIVIDUAL_SIGNALS = [
  'developer', 'designer', 'marketer',
  'engineer', 'analyst', 'specialist',
  'user', 'freelancer', 'creator',
  'practitioner', 'contributor',
  'individual contributor', 'ic ',
  'startup founder', 'solopreneur',
];

// =============================================================================
// DETECTION
// =============================================================================

/**
 * Detect audience seniority from target audience descriptions and consultation data.
 */
export function detectAudienceSeniority(
  targetAudience?: string | null,
  audienceSummary?: string | null,
  additionalContext?: string | null
): AudienceSeniorityResult {
  const searchText = [targetAudience, audienceSummary, additionalContext]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (!searchText || searchText.length < 3) {
    return { seniority: 'unknown', confidence: 'low', signals: [] };
  }

  const executiveMatches = EXECUTIVE_SIGNALS.filter(s => searchText.includes(s));
  const managerMatches = MANAGER_SIGNALS.filter(s => searchText.includes(s));
  const individualMatches = INDIVIDUAL_SIGNALS.filter(s => searchText.includes(s));

  // Score by match count and specificity
  const execScore = executiveMatches.length * 2; // Executive signals weighted higher
  const mgrScore = managerMatches.length * 1.5;
  const indScore = individualMatches.length;

  if (execScore > 0 && execScore >= mgrScore && execScore >= indScore) {
    console.log(`👔 [AudienceSeniority] Executive detected:`, executiveMatches);
    return {
      seniority: 'executive',
      confidence: execScore >= 4 ? 'high' : 'medium',
      signals: executiveMatches,
    };
  }

  if (mgrScore > 0 && mgrScore >= indScore) {
    console.log(`👔 [AudienceSeniority] Manager detected:`, managerMatches);
    return {
      seniority: 'manager',
      confidence: mgrScore >= 3 ? 'high' : 'medium',
      signals: managerMatches,
    };
  }

  if (indScore > 0) {
    console.log(`👔 [AudienceSeniority] Individual detected:`, individualMatches);
    return {
      seniority: 'individual',
      confidence: indScore >= 2 ? 'high' : 'medium',
      signals: individualMatches,
    };
  }

  return { seniority: 'unknown', confidence: 'low', signals: [] };
}
