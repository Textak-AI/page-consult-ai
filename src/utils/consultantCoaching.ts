// Rule-based coaching engine for the Strategy Consultant

export interface WizardContext {
  industry?: string;
  pageType?: string;
  pagePurpose?: string;
  businessName?: string;
  productName?: string;
  concreteProofStory?: string;
}

export type CoachingType = 'nudge' | 'acknowledgment' | 'coaching';
export type CoachingTrigger = 'thin_answer' | 'skipped' | 'strong_answer';

export interface CoachingRule {
  fieldKey: string;
  trigger: CoachingTrigger;
  condition: (value: string, context: WizardContext) => boolean;
  getMessage: (value: string, context: WizardContext) => string;
  type: CoachingType;
}

// Role/title indicators for detecting specificity
const ROLE_INDICATORS = [
  'ceo', 'cto', 'cfo', 'coo', 'vp', 'director', 'manager', 'head of',
  'founder', 'owner', 'partner', 'lead', 'senior', 'chief', 'officer',
  'specialist', 'coordinator', 'analyst', 'engineer', 'developer',
  'marketer', 'designer', 'consultant', 'advisor', 'principal',
  'surgeon', 'doctor', 'dentist', 'attorney', 'lawyer', 'architect',
  'therapist', 'coach', 'trainer', 'instructor', 'practitioner',
];

const PAIN_INDICATORS = [
  'struggle', 'frustrated', 'pain', 'problem', 'challenge', 'issue',
  'stuck', 'overwhelm', 'waste', 'lose', 'losing', 'fail', 'broken',
  'slow', 'expensive', 'complicated', 'confus', 'stress', 'burnout',
  'turnover', 'churn', 'decline', 'miss', 'lack', 'without', 'need',
  'can\'t', 'cannot', 'unable', 'difficult', 'hard to', 'tired of',
];

const hasRoleIndicator = (value: string): boolean => {
  const lower = value.toLowerCase();
  return ROLE_INDICATORS.some(r => lower.includes(r));
};

const hasPainIndicator = (value: string): boolean => {
  const lower = value.toLowerCase();
  return PAIN_INDICATORS.some(p => lower.includes(p));
};

const hasNumber = (value: string): boolean => /\d/.test(value);

const COACHING_RULES: CoachingRule[] = [
  // ===== THIN ANSWER NUDGES =====

  // idealClient
  {
    fieldKey: 'idealClient',
    trigger: 'thin_answer',
    condition: (v) => v.length > 0 && (v.length < 30 || !hasRoleIndicator(v)),
    getMessage: (_v, ctx) =>
      ctx.industry
        ? `Who specifically in ${ctx.industry.split(' → ')[0]} are you targeting? Think about their role and what they're dealing with day-to-day.`
        : "Can you be more specific? Think about the actual person — their title, what size company, and what situation they're in when they find you.",
    type: 'nudge',
  },

  // clientFrustration
  {
    fieldKey: 'clientFrustration',
    trigger: 'thin_answer',
    condition: (v) => v.length > 0 && v.length < 25,
    getMessage: () =>
      "What's the thing they complain about? Use their words if you can — that exact language makes powerful headlines.",
    type: 'nudge',
  },

  // desiredOutcome
  {
    fieldKey: 'desiredOutcome',
    trigger: 'thin_answer',
    condition: (v) => v.length > 0 && v.length < 25,
    getMessage: () =>
      "Paint the after picture. What changes for them in 30, 60, 90 days after working with you?",
    type: 'nudge',
  },

  // mainOffer
  {
    fieldKey: 'mainOffer',
    trigger: 'thin_answer',
    condition: (v) => v.length > 0 && v.length < 20,
    getMessage: () =>
      "What does someone actually get? Not just the category — the deliverables, the experience, the result.",
    type: 'nudge',
  },

  // offerIncludes
  {
    fieldKey: 'offerIncludes',
    trigger: 'thin_answer',
    condition: (v) => v.length > 0 && v.length < 30,
    getMessage: () =>
      "List the tangible things they receive. Audits, reports, workshops, calls, dashboards — specifics build perceived value.",
    type: 'nudge',
  },

  // uniqueStrength
  {
    fieldKey: 'uniqueStrength',
    trigger: 'thin_answer',
    condition: (v) => v.length > 0 && v.length < 30,
    getMessage: () =>
      "What would a competitor reluctantly admit you're better at? That's your real differentiator.",
    type: 'nudge',
  },

  // processDescription
  {
    fieldKey: 'processDescription',
    trigger: 'thin_answer',
    condition: (v) => v.length > 0 && v.length < 25,
    getMessage: () =>
      "Walk me through the first 30 days. What happens after they sign? Specifics reduce buying anxiety.",
    type: 'nudge',
  },

  // concreteProofStory
  {
    fieldKey: 'concreteProofStory',
    trigger: 'thin_answer',
    condition: (v) => v.length > 0 && v.length < 25,
    getMessage: () =>
      "Try the format: '[Client type] achieved [specific outcome] in [timeframe].' Even anonymized, specifics are powerful.",
    type: 'nudge',
  },

  // ===== SKIPPED FIELD COACHING =====

  {
    fieldKey: 'testimonialText',
    trigger: 'skipped',
    condition: (v) => !v || v.trim().length === 0,
    getMessage: () =>
      "Most people skip this on the first pass. But one real client quote does more for conversion than anything else on the page. Even a screenshot of a nice email or Slack message works.",
    type: 'coaching',
  },

  {
    fieldKey: 'concreteProofStory',
    trigger: 'skipped',
    condition: (v) => !v || v.trim().length === 0,
    getMessage: () =>
      "A single specific result — like '18% efficiency gain in 60 days' — carries more weight than generic claims. Got one you could share, even anonymized?",
    type: 'coaching',
  },

  {
    fieldKey: 'proofStoryContext',
    trigger: 'skipped',
    condition: (v, ctx) => (!v || v.trim().length === 0) && !!ctx.concreteProofStory && ctx.concreteProofStory.length > 10,
    getMessage: () =>
      "You shared the result — what made it possible? That 'how' is what separates a claim from a case study.",
    type: 'coaching',
  },

  {
    fieldKey: 'achievements',
    trigger: 'skipped',
    condition: (v) => !v || v.trim().length === 0,
    getMessage: () =>
      "Certifications, awards, notable client logos, partnerships — even small credibility markers add up. Anything come to mind?",
    type: 'coaching',
  },

  {
    fieldKey: 'objectionsToOvercome',
    trigger: 'skipped',
    condition: (v) => !v || v.trim().length === 0,
    getMessage: () =>
      "What's the real reason someone doesn't buy from you? Addressing that head-on in your FAQ section is one of the highest-converting moves.",
    type: 'coaching',
  },

  // ===== STRONG ANSWER ACKNOWLEDGMENTS =====

  {
    fieldKey: 'idealClient',
    trigger: 'strong_answer',
    condition: (v) => v.length > 80 && hasRoleIndicator(v) && hasPainIndicator(v),
    getMessage: () => "That's specific. I can work with this.",
    type: 'acknowledgment',
  },

  {
    fieldKey: 'concreteProofStory',
    trigger: 'strong_answer',
    condition: (v) => v.length > 50 && hasNumber(v),
    getMessage: () => "Strong proof point. This becomes your credibility anchor.",
    type: 'acknowledgment',
  },

  {
    fieldKey: 'uniqueStrength',
    trigger: 'strong_answer',
    condition: (v) => v.length > 60,
    getMessage: () => "Clear differentiator. Your hero section will lead with this.",
    type: 'acknowledgment',
  },

  {
    fieldKey: 'clientFrustration',
    trigger: 'strong_answer',
    condition: (v) => v.length > 60 && hasPainIndicator(v),
    getMessage: () => "Great — that emotional language will power your headlines.",
    type: 'acknowledgment',
  },

  {
    fieldKey: 'processDescription',
    trigger: 'strong_answer',
    condition: (v) => v.length > 80,
    getMessage: () => "This powers your 'How It Works' section nicely.",
    type: 'acknowledgment',
  },
];

// Skip coaching priority order (most impactful first)
const SKIP_PRIORITY: string[] = [
  'testimonialText',
  'concreteProofStory',
  'achievements',
  'objectionsToOvercome',
  'proofStoryContext',
];

export interface CoachingResult {
  fieldKey: string;
  message: string;
  type: CoachingType;
  trigger: CoachingTrigger;
}

/**
 * Evaluate coaching for a single field on blur (thin/strong detection)
 */
export function evaluateFieldCoaching(
  fieldKey: string,
  value: string,
  context: WizardContext
): CoachingResult | null {
  // Check strong answers first (they take priority over nudges)
  const strongRule = COACHING_RULES.find(
    r => r.fieldKey === fieldKey && r.trigger === 'strong_answer' && r.condition(value, context)
  );
  if (strongRule) {
    console.log(`✅ [Consultant] Acknowledgment: ${fieldKey}`);
    return {
      fieldKey,
      message: strongRule.getMessage(value, context),
      type: 'acknowledgment',
      trigger: 'strong_answer',
    };
  }

  // Then check thin answers
  const thinRule = COACHING_RULES.find(
    r => r.fieldKey === fieldKey && r.trigger === 'thin_answer' && r.condition(value, context)
  );
  if (thinRule) {
    console.log(`💬 [Consultant] Nudge triggered: ${fieldKey} — reason: thin_answer`);
    return {
      fieldKey,
      message: thinRule.getMessage(value, context),
      type: 'nudge',
      trigger: 'thin_answer',
    };
  }

  return null;
}

/**
 * Get the single most impactful skip coaching message for a set of skipped fields
 */
export function getSkipCoaching(
  skippedFieldKeys: string[],
  context: WizardContext
): CoachingResult | null {
  // Find the highest-priority skipped field that has a coaching rule
  for (const fieldKey of SKIP_PRIORITY) {
    if (!skippedFieldKeys.includes(fieldKey)) continue;

    const rule = COACHING_RULES.find(
      r => r.fieldKey === fieldKey && r.trigger === 'skipped' && r.condition('', context)
    );
    if (rule) {
      console.log(`📋 [Consultant] Skip coaching: ${fieldKey}`);
      return {
        fieldKey,
        message: rule.getMessage('', context),
        type: 'coaching',
        trigger: 'skipped',
      };
    }
  }
  return null;
}
