/**
 * Content Cleaner — Utility functions for sanitizing AI-generated content before rendering.
 * Central place for all display-text validation and cleaning rules.
 */

const KNOWN_INDUSTRY_TAGS = [
  'saas', 'consulting', 'healthcare', 'manufacturing', 'fintech',
  'ecommerce', 'education', 'realestate', 'legal', 'insurance',
  'logistics', 'hospitality', 'construction', 'fitness', 'beauty',
  'automotive', 'nonprofit', 'agency', 'default', 'local-services',
  'devtools', 'payment', 'developer',
];

const CAMEL_CASE_RE = /\b[a-z]+[A-Z][a-zA-Z]+\b/g;
const ISO_TIMESTAMP_RE = /\d{4}-\d{2}-\d{2}T[\d:.Z+\-\s]*/g;
const JSON_QUOTED_RE = /"[^"]{0,80}"/g;
const JSON_BRACKETS_RE = /[{}\[\]]/g;
const MULTI_SPACE_RE = /\s{2,}/g;
const LEADING_TRAILING_PUNCT_RE = /^[,;:\-—–•]+|[,;:\-—–•]+$/g;

/**
 * Clean any text destined for a heading or subtitle.
 */
export function cleanDisplayText(text: string, maxLength?: number): string {
  if (!text || typeof text !== 'string') return '';

  let cleaned = text;

  // 1. Strip ISO timestamps
  cleaned = cleaned.replace(ISO_TIMESTAMP_RE, '');

  // 2. Strip industry tags at word boundaries
  for (const tag of KNOWN_INDUSTRY_TAGS) {
    cleaned = cleaned.replace(new RegExp(`\\b${tag}\\b`, 'gi'), '');
  }

  // 3. Strip camelCase tokens
  cleaned = cleaned.replace(CAMEL_CASE_RE, '');

  // 4. Strip JSON syntax
  cleaned = cleaned.replace(JSON_QUOTED_RE, '');
  cleaned = cleaned.replace(JSON_BRACKETS_RE, '');

  // 5. Collapse multiple spaces
  cleaned = cleaned.replace(MULTI_SPACE_RE, ' ').trim();

  // 6. Strip leading/trailing punctuation artifacts
  cleaned = cleaned.replace(LEADING_TRAILING_PUNCT_RE, '').trim();

  // 7. Deduplicate phrases
  cleaned = deduplicatePhrases(cleaned);

  // 8. Truncate at maxLength on word boundary
  if (maxLength && cleaned.length > maxLength) {
    const truncated = cleaned.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    cleaned = (lastSpace > maxLength * 0.5 ? truncated.substring(0, lastSpace) : truncated) + '...';
  }

  return cleaned;
}

/**
 * Remove duplicate phrases (4+ word sequences appearing twice).
 */
export function deduplicatePhrases(text: string): string {
  if (!text) return '';
  const words = text.split(/\s+/);
  if (words.length < 8) return text;

  for (let phraseLen = Math.min(8, Math.floor(words.length / 2)); phraseLen >= 4; phraseLen--) {
    for (let i = 0; i <= words.length - phraseLen * 2; i++) {
      const phrase = words.slice(i, i + phraseLen).join(' ').toLowerCase();
      for (let j = i + phraseLen; j <= words.length - phraseLen; j++) {
        const candidate = words.slice(j, j + phraseLen).join(' ').toLowerCase();
        if (phrase === candidate) {
          words.splice(j, phraseLen);
          return deduplicatePhrases(words.join(' '));
        }
      }
    }
  }

  return words.join(' ');
}

/**
 * Clean and split a stat string into value + label.
 * Returns null if the stat doesn't pass validation.
 */
export function parseStatString(raw: string): { value: string; label: string; detail?: string } | null {
  if (!raw || typeof raw !== 'string') return null;

  // Try "value — label" or "value - label" patterns
  const separators = [' — ', ' – ', ' - ', ': '];
  for (const sep of separators) {
    const idx = raw.indexOf(sep);
    if (idx > 0) {
      const value = raw.substring(0, idx).trim();
      const label = raw.substring(idx + sep.length).trim();
      if (isValidStatValue(value) && isCleanLabel(label)) {
        return { value, label: cleanDisplayText(label, 40) };
      }
    }
  }

  // Try just a number/percentage pattern
  const match = raw.match(/^([\d,.]+[%+xX]?)\s+(.+)$/);
  if (match) {
    const [, value, label] = match;
    if (isCleanLabel(label)) {
      return { value, label: cleanDisplayText(label, 40) };
    }
  }

  return null;
}

function isValidStatValue(value: string): boolean {
  return /\d/.test(value);
}

function isCleanLabel(label: string): boolean {
  if (!label || label.length < 5) return false;
  if (CAMEL_CASE_RE.test(label)) return false;
  if (ISO_TIMESTAMP_RE.test(label)) return false;
  const lowerLabel = label.toLowerCase();
  if (KNOWN_INDUSTRY_TAGS.some(tag => lowerLabel === tag)) return false;
  return true;
}

/**
 * Check if text is safe for display (no metadata leaks).
 */
export function isCleanForDisplay(text: string): boolean {
  if (!text || typeof text !== 'string') return false;
  if (CAMEL_CASE_RE.test(text)) return false;
  if (ISO_TIMESTAMP_RE.test(text)) return false;
  if (/[{}\[\]]/.test(text)) return false;
  if (text.length < 3) return false;
  return true;
}
