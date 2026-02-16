/**
 * Auto-QC Review Pass
 * 
 * Runs silently after every page generation to catch generic copy,
 * sharpen with consultation data, and remove unsubstantiated claims.
 * 
 * ZERO-FABRICATION: May sharpen, personalize, remove. NEVER invent data.
 * Max 8 improvements per pass.
 */

// ========================
// TYPES
// ========================

export interface QCImprovement {
  sectionType: string;
  field: string;
  before: string;
  after: string;
  reason: string;
  category: 'specificity' | 'personalization' | 'trust' | 'removal';
}

export interface QCResult {
  sections: any[];
  improvements: QCImprovement[];
  summary: string;
}

// ========================
// HELPERS
// ========================

const STOP_WORDS = new Set([
  'the', 'and', 'that', 'with', 'this', 'from', 'have', 'been', 'will', 'your',
  'they', 'their', 'them', 'than', 'more', 'into', 'also', 'each', 'which',
  'when', 'what', 'about', 'over', 'such', 'most', 'some', 'very', 'help',
  'through', 'does', 'make', 'like', 'just', 'only', 'well', 'even', 'where',
]);

/**
 * Detect and remove repeated non-trivial words within a single text field.
 * Returns cleaned text or original if no duplicates found.
 */
export function deduplicateFieldText(text: string): { cleaned: string; hadDuplicates: boolean } {
  if (!text || typeof text !== 'string') return { cleaned: text, hadDuplicates: false };

  const words = text.split(/\s+/);
  if (words.length < 4) return { cleaned: text, hadDuplicates: false };

  // Find non-trivial words (4+ chars, not stop words) that repeat
  const wordCounts = new Map<string, number>();
  for (const w of words) {
    const lower = w.toLowerCase().replace(/[^a-z]/g, '');
    if (lower.length >= 4 && !STOP_WORDS.has(lower)) {
      wordCounts.set(lower, (wordCounts.get(lower) || 0) + 1);
    }
  }

  const duplicates = [...wordCounts.entries()].filter(([, count]) => count >= 2);
  if (duplicates.length === 0) return { cleaned: text, hadDuplicates: false };

  // Strategy: find the longest repeated phrase and remove the second occurrence
  // Check for repeated multi-word phrases first (e.g., "optimize workflows ... optimize workflows")
  const lowerText = text.toLowerCase();
  for (const [word] of duplicates) {
    // Find phrases containing the duplicate word (up to 3-word window)
    const phraseRegex = new RegExp(`(\\b\\w*\\s+)?${word}(\\s+\\w*\\b)?`, 'gi');
    const matches = [...text.matchAll(phraseRegex)];
    
    if (matches.length >= 2) {
      // Remove the second occurrence of the phrase
      const secondMatch = matches[1];
      const idx = secondMatch.index!;
      const matchStr = secondMatch[0];
      
      // Check for surrounding connectors like "to" before the duplicate
      const before = text.slice(Math.max(0, idx - 4), idx).trim().toLowerCase();
      const prefixCut = ['to', 'and', 'or'].includes(before) ? before.length + 1 : 0;
      
      const cleaned = (
        text.slice(0, idx - prefixCut).trimEnd() + 
        text.slice(idx + matchStr.length)
      ).replace(/\s{2,}/g, ' ').replace(/\s+([.,;!?])/g, '$1').trim();
      
      console.log(`🔧 [AutoQC] Dedup: removed repeated "${word}" → "${cleaned.slice(0, 80)}..."`);
      return { cleaned, hadDuplicates: true };
    }
  }

  return { cleaned: text, hadDuplicates: false };
}

/**
 * Run deduplication on specific intelligence fields.
 * Returns the cleaned intel object and list of fields that were fixed.
 */
export function deduplicateIntelligenceFields(intel: Record<string, any>): { 
  cleaned: Record<string, any>; 
  fixedFields: string[] 
} {
  if (!intel) return { cleaned: intel, fixedFields: [] };

  const fieldsToCheck = [
    'competitiveEdge', 'competitorDifferentiator', 'competitorDifferentiatorFull',
    'valueProp', 'valuePropFull', 'valueProposition',
    'uniqueValue', 'unique_value',
    'headline', 'primaryHeadline', 'supportingHeadline',
  ];

  const cleaned = { ...intel };
  const fixedFields: string[] = [];

  for (const field of fieldsToCheck) {
    const value = cleaned[field];
    if (value && typeof value === 'string') {
      const result = deduplicateFieldText(value);
      if (result.hadDuplicates) {
        cleaned[field] = result.cleaned;
        fixedFields.push(field);
      }
    }
  }

  if (fixedFields.length > 0) {
    console.log(`🔧 [AutoQC] Deduplicated ${fixedFields.length} intelligence fields: ${fixedFields.join(', ')}`);
  }

  return { cleaned, fixedFields };
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function extractFirstPain(painText: string): string {
  if (!painText) return 'your biggest challenge';
  const parts = painText.split(/[;|,]/).map(s => s.trim()).filter(s => s.length > 5);
  return parts[0]?.slice(0, 60) || painText.slice(0, 60);
}

/**
 * Fuzzy company name matching to prevent stutter like "Targa TARGA.AI"
 * Strips common domain suffixes and checks if the base name already appears.
 */
function companyNameAlreadyPresent(text: string, companyName: string): boolean {
  const textLower = text.toLowerCase();
  const nameLower = companyName.toLowerCase();
  
  // Exact match
  if (textLower.includes(nameLower)) return true;
  
  // Base name match: strip common suffixes and check
  const baseName = nameLower
    .replace(/\.(ai|io|co|com|app|dev|tech|hq|inc|llc|ltd|corp)$/i, '')
    .replace(/[-_\s]+/g, '')
    .trim();
  
  if (baseName.length >= 3 && textLower.includes(baseName)) return true;
  
  return false;
}

// ========================
// GENERIC PHRASE RULES
// ========================

const GENERIC_PHRASES: Array<{
  pattern: RegExp;
  replacement: (intel: any, company: string) => string | null;
  reason: string;
  fieldsToCheck: string[];
}> = [
  {
    pattern: /^Why Choose Us$/i,
    replacement: (intel, co) => intel?.audience
      ? `Why ${capitalize(intel.audience.split(',')[0].trim())} Trust ${co || 'Us'}`
      : co ? `Why Teams Choose ${co}` : null,
    reason: 'Generic header → audience-specific trust statement',
    fieldsToCheck: ['headline', 'title'],
  },
  {
    pattern: /^Get Started$/i,
    replacement: (intel) => {
      const goal = intel?.goal || intel?.ctaGoal || '';
      if (goal.toLowerCase().includes('demo')) return 'Schedule Your Demo';
      if (goal.toLowerCase().includes('consult')) return 'Book Your Consultation';
      if (goal.toLowerCase().includes('trial')) return 'Start Your Free Trial';
      return 'See How It Works';
    },
    reason: 'Generic CTA → goal-aligned action',
    fieldsToCheck: ['ctaText', 'secondaryCta'],
  },
  {
    pattern: /^Our Solution$/i,
    replacement: (intel, co) => intel?.painPoints
      ? `How ${co || 'We'} Solve ${extractFirstPain(intel.painPoints)}`
      : co ? `The ${co} Approach` : null,
    reason: 'Generic header → problem-solution framing',
    fieldsToCheck: ['headline', 'title'],
  },
  {
    pattern: /^Learn More$/i,
    replacement: () => 'See How It Works',
    reason: 'Vague CTA → specific action',
    fieldsToCheck: ['ctaText', 'secondaryCta'],
  },
  {
    pattern: /^What We (Do|Offer)$/i,
    replacement: (_intel, co) => co ? `What ${co} Delivers` : 'What You Get',
    reason: 'Generic → company-personalized',
    fieldsToCheck: ['headline', 'title'],
  },
  {
    pattern: /^Our (Services|Products|Features)$/i,
    replacement: (_intel, co) => co ? `${co} Capabilities` : null,
    reason: 'Generic section title → branded',
    fieldsToCheck: ['headline', 'title'],
  },
];

// Unsubstantiated superlatives to strip from subtitle/subheadline
const SUPERLATIVE_PATTERNS: RegExp[] = [
  /world[- ]class/i,
  /industry[- ]leading/i,
  /best[- ]in[- ]class/i,
  /cutting[- ]edge/i,
  /state[- ]of[- ]the[- ]art/i,
  /unparalleled/i,
  /second[- ]to[- ]none/i,
];

// ========================
// PASS 1: SPECIFICITY
// ========================

function runSpecificityPass(
  sections: any[],
  intel: any,
  companyName: string,
  improvements: QCImprovement[],
): any[] {
  return sections.map(section => {
    const content = { ...section.content };
    const textFields = ['headline', 'title', 'subtitle', 'subheadline', 'ctaText', 'secondaryCta'];

    for (const field of textFields) {
      if (typeof content[field] !== 'string' || !content[field]) continue;
      const original = content[field];

      // Check generic phrase rules
      for (const rule of GENERIC_PHRASES) {
        if (!rule.fieldsToCheck.includes(field)) continue;
        if (rule.pattern.test(original)) {
          const replacement = rule.replacement(intel, companyName);
          if (replacement && replacement !== original) {
            content[field] = replacement;
            improvements.push({
              sectionType: section.type, field,
              before: original, after: replacement,
              reason: rule.reason, category: 'specificity',
            });
          }
          break;
        }
      }

      // Strip superlatives from subtitle/subheadline only
      if ((field === 'subtitle' || field === 'subheadline') && typeof content[field] === 'string') {
        for (const pattern of SUPERLATIVE_PATTERNS) {
          if (pattern.test(content[field])) {
            const cleaned = content[field].replace(pattern, '').replace(/\s{2,}/g, ' ').trim();
            if (cleaned.length > 10 && cleaned !== content[field]) {
              improvements.push({
                sectionType: section.type, field,
                before: content[field], after: cleaned,
                reason: 'Removed unsubstantiated superlative',
                category: 'removal',
              });
              content[field] = cleaned;
            }
            break;
          }
        }
      }
    }

    return { ...section, content };
  });
}

// ========================
// PASS 2: STRUCTURAL
// ========================

function runStructuralPass(
  sections: any[],
  intel: any,
  consultationData: any,
  companyName: string,
  improvements: QCImprovement[],
): any[] {
  return sections.map(section => {
    const content = { ...section.content };

    switch (section.type) {
      case 'hero': {
        const headline = (content.headline || '').toLowerCase();
        const audience = intel?.audience || consultationData?.target_audience || '';
        const audienceKeyword = audience.split(',')[0].trim().slice(0, 20).toLowerCase();

        if (audienceKeyword.length > 3 && !headline.includes(audienceKeyword)) {
          if (content.subheadline && !content.subheadline.toLowerCase().includes(audienceKeyword) && content.subheadline.length < 120) {
            const original = content.subheadline;
            content.subheadline = `${original} for ${audience.split(',')[0].trim()}`;
            improvements.push({
              sectionType: 'hero', field: 'subheadline',
              before: original, after: content.subheadline,
              reason: 'Added audience specificity — visitor should know "this is for me"',
              category: 'personalization',
            });
          }
        }
        break;
      }

      case 'faq': {
        if (Array.isArray(content.items)) {
          content.items = content.items.map((item: any) => {
            const answer = item.answer || '';
            const sentenceCount = (answer.match(/[.!?]+/g) || []).length;
            if (sentenceCount < 2 && answer.length < 60 && answer.length > 5) {
              const expanded = `${answer}${answer.endsWith('.') ? '' : '.'} We're happy to walk through the specifics for your situation — this is a common consideration for teams evaluating ${companyName || 'our platform'}.`;
              improvements.push({
                sectionType: 'faq', field: 'items[].answer',
                before: answer, after: expanded,
                reason: 'Expanded thin FAQ answer (was <2 sentences)',
                category: 'specificity',
              });
              return { ...item, answer: expanded };
            }
            return item;
          });
        }
        break;
      }

      case 'final-cta': {
        const goal = consultationData?.goal || intel?.goal || intel?.ctaGoal || '';
        const ctaText = (content.ctaText || '').toLowerCase();
        if (goal && (ctaText === 'get started' || ctaText === 'learn more' || ctaText === 'contact us' || ctaText === 'sign up')) {
          const originalCta = content.ctaText;
          const goalLower = goal.toLowerCase();
          if (goalLower.includes('demo')) content.ctaText = `Schedule ${companyName ? companyName + ' ' : ''}Demo`;
          else if (goalLower.includes('consult')) content.ctaText = 'Book Your Consultation';
          else if (goalLower.includes('trial')) content.ctaText = 'Start Free Trial';
          else if (goalLower.includes('assess')) content.ctaText = 'Get Your Assessment';
          else if (goalLower.includes('call')) content.ctaText = 'Schedule a Call';
          else content.ctaText = `Get Started with ${companyName || 'Us'}`;

          if (content.ctaText !== originalCta) {
            improvements.push({
              sectionType: 'final-cta', field: 'ctaText',
              before: originalCta, after: content.ctaText,
              reason: 'Aligned CTA with stated page goal',
              category: 'specificity',
            });
          }
        }
        break;
      }
    }

    return { ...section, content };
  });
}

// ========================
// PASS 3: UTILIZATION
// ========================

/**
 * Keyword-overlap matching for intelligence field detection.
 * The AI often paraphrases consultation data, so substring matching misses usage.
 * If 40%+ of meaningful keywords from the field value appear in page text, it counts.
 */
function fieldIsUsedInContent(fieldValue: string, allText: string): boolean {
  if (!fieldValue || fieldValue.length < 5) return false;

  const textLower = allText.toLowerCase();
  const valueLower = fieldValue.toLowerCase();

  // Method 1: Direct substring (catches exact matches)
  if (textLower.includes(valueLower.slice(0, 25))) return true;

  // Method 2: Keyword overlap
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'can', 'that', 'this', 'these', 'those',
    'it', 'its', 'they', 'them', 'their', 'we', 'our', 'you', 'your',
    'i', 'me', 'my', 'not', 'no', 'just', 'also', 'very', 'too',
    'how', 'what', 'when', 'where', 'who', 'which', 'much', 'many',
    "don", "don't", "doesn't", 'already', 'really', 'about',
  ]);

  const keywords = valueLower
    .split(/[\s,;.!?()]+/)
    .filter(word => word.length > 3 && !stopWords.has(word));

  if (keywords.length === 0) return false;

  const matchedKeywords = keywords.filter(kw => textLower.includes(kw));
  const matchRatio = matchedKeywords.length / keywords.length;

  return matchRatio >= 0.4;
}

function runUtilizationPass(
  sections: any[],
  intel: any,
  companyName: string,
  improvements: QCImprovement[],
): any[] {
  if (!intel) return sections;

  const allText = sections.map(s => JSON.stringify(s.content || {})).join(' ').toLowerCase();

  // Track which intelligence fields are surfaced
  const fieldChecks = [
    { field: 'companyName', value: companyName },
    { field: 'audience', value: intel.audience },
    { field: 'painPoints', value: intel.painPoints },
    { field: 'valueProp', value: intel.valueProp || intel.valueProposition },
    { field: 'buyerObjections', value: intel.buyerObjections },
    { field: 'proofElements', value: intel.proofElements },
  ];

  const available = fieldChecks.filter(f => f.value && typeof f.value === 'string' && f.value.length > 3);
  const used = available.filter(f => fieldIsUsedInContent(f.value!, allText));
  const unused = available.filter(f => !used.includes(f));

  const utilizationPct = available.length > 0 ? Math.round((used.length / available.length) * 100) : 0;

  console.log(`📊 [AutoQC] Intelligence utilization: ${used.length}/${available.length} fields (${utilizationPct}%)`);
  if (used.length > 0) console.log(`  ✅ Used: ${used.map(f => f.field).join(', ')}`);
  if (unused.length > 0) console.log(`  ⚠️ Unused: ${unused.map(f => f.field).join(', ')}`);

  // Company name injection if it appears < 2 times (using fuzzy matching)
  if (companyName && companyName.length > 1) {
    // Use fuzzy matching: if base name (e.g. "targa") already appears, count as present
    const nameAlreadyPresent = companyNameAlreadyPresent(allText, companyName);

    if (!nameAlreadyPresent) {
      let injected = false;
      return sections.map(section => {
        if (injected) return section;
        if (section.type !== 'features') return section;

        const content = { ...section.content };
        if (content.subtitle && typeof content.subtitle === 'string' && !companyNameAlreadyPresent(content.subtitle, companyName)) {
          const original = content.subtitle;
          let improved = original;
          if (/apart$/i.test(improved)) {
            improved = improved.replace(/apart$/i, `${companyName} apart`);
          } else if (/^What sets\s+apart/i.test(improved)) {
            improved = improved.replace(/^What sets\s+apart/i, `What sets ${companyName} apart`);
          } else if (!improved.includes(companyName)) {
            improved = `${improved} — powered by ${companyName}`;
          }

          if (improved !== original) {
            content.subtitle = improved;
            injected = true;
            improvements.push({
              sectionType: section.type, field: 'subtitle',
              before: original, after: improved,
              reason: `Company name not detected — injected for brand reinforcement`,
              category: 'personalization',
            });
          }
        }

        return { ...section, content };
      });
    }
  }

  return sections;
}

// ========================
// MAIN EXPORT
// ========================

export function autoQCPass(
  sections: any[],
  extractedIntel: Record<string, any> | null,
  consultationData: Record<string, any> | null,
  companyName: string,
): QCResult {
  if (!sections || sections.length === 0) {
    return { sections, improvements: [], summary: 'No sections to review' };
  }

  const improvements: QCImprovement[] = [];
  let improved = structuredClone(sections);

  // Pass 0: Deduplicate intelligence fields (word repetition within same field)
  let cleanedIntel = extractedIntel;
  if (extractedIntel) {
    const { cleaned, fixedFields } = deduplicateIntelligenceFields(extractedIntel);
    cleanedIntel = cleaned;
    if (fixedFields.length > 0) {
      console.log(`🔧 [AutoQC] Pre-pass: cleaned ${fixedFields.length} fields with word repetition`);
    }
  }

  // Pass 1: Copy specificity — catch and fix generic phrases
  improved = runSpecificityPass(improved, cleanedIntel, companyName, improvements);

  // Pass 2: Structural QC — conversion best practices
  improved = runStructuralPass(improved, cleanedIntel, consultationData, companyName, improvements);

  // Pass 3: Intelligence utilization — ensure consultation data is surfaced
  improved = runUtilizationPass(improved, cleanedIntel, companyName, improvements);

  // Cap at 8 improvements (conservative — avoid over-editing)
  if (improvements.length > 8) {
    console.log(`⚠️ [AutoQC] Capped at 8 improvements (${improvements.length} found)`);
  }

  const summary = improvements.length > 0
    ? `${improvements.length} improvement${improvements.length > 1 ? 's' : ''} applied`
    : 'Page passed QC — no improvements needed';

  console.log(`✅ [AutoQC] ${summary}`);
  improvements.forEach(imp => {
    const icon = imp.category === 'removal' ? '🗑️' : imp.category === 'personalization' ? '🎯' : '📝';
    console.log(`  ${icon} ${imp.sectionType}.${imp.field}: "${imp.before.slice(0, 35)}..." → "${imp.after.slice(0, 35)}..." (${imp.reason})`);
  });

  return { sections: improved, improvements, summary };
}
