/**
 * Artifact Detection System
 * 
 * Detects when AI generates creative artifacts (headlines, CTAs, copy)
 * and when users positively select them.
 */

// Artifact types the system can capture
export interface CreativeArtifact {
  type: 'headline' | 'cta' | 'positioning' | 'copySnippet';
  content: string;
  context?: string;  // Why this was generated
  capturedAt: string;
}

export interface ConsultationArtifacts {
  selectedHeadline: CreativeArtifact | null;
  alternativeHeadlines: CreativeArtifact[];
  selectedCTA: CreativeArtifact | null;
  alternativeCTAs: CreativeArtifact[];
  selectedPositioning: CreativeArtifact | null;
  copySnippets: CreativeArtifact[];
  userFeedback: string | null;  // Why they chose the selected option
}

// Keywords that indicate positive selection
const POSITIVE_SELECTION_PATTERNS = [
  /\b(i\s+like|i\s+love|prefer|that('s|\s+is)?\s+(good|great|perfect|it|the\s+one))\b/i,
  /\b(option\s+[1-3abc]|the\s+(first|second|third)\s+(one)?|number\s+[1-3])\b/i,
  /\b(that\s+one|this\s+one|go\s+with\s+that|use\s+that|let'?s?\s+go\s+with)\b/i,
  /\b(this\s+direction|that\s+direction|sounds?\s+good|works?\s+for\s+me)\b/i,
  /\b(yes|yeah|yep|definitely|absolutely|exactly)\s*(,|!|\.|\s+that)?/i,
  /\b(makes?\s+sense|resonates?|nailed\s+it|spot\s+on|bingo)\b/i,
];

// Patterns to detect AI-generated options in messages
const HEADLINE_PATTERNS = [
  /(?:option\s*\d?[:.]?\s*)?[""]([^""]{20,100})[""]/gi,
  /(?:headline[s]?[:.]?\s*)[""]([^""]{20,100})[""]/gi,
  /(?:\d\.\s*)[""]([^""]{20,100})[""]/gi,
  /\*\*[""]?([^*""]{20,80})[""]?\*\*/gi,  // Bold options
];

const CTA_PATTERNS = [
  /(?:CTA|button|call.to.action)[:.]?\s*[""]([^""]{5,50})[""]/gi,
  /(?:click|book|get|start|schedule|claim)[\w\s]{5,40}/gi,
];

/**
 * Check if user message indicates positive selection
 */
export function detectPositiveSelection(userMessage: string): {
  isPositive: boolean;
  selectedOption: number | null;
  feedback: string | null;
} {
  const message = userMessage.toLowerCase().trim();
  
  // Check for positive patterns
  const isPositive = POSITIVE_SELECTION_PATTERNS.some(pattern => pattern.test(message));
  
  // Detect which option was selected
  let selectedOption: number | null = null;
  
  const optionMatch = message.match(/option\s*([1-3abc])|the\s*(first|second|third)\s*one?|number\s*([1-3])/i);
  if (optionMatch) {
    const match = optionMatch[1] || optionMatch[2] || optionMatch[3];
    if (match) {
      if (/^[1a]$/i.test(match) || match === 'first') selectedOption = 1;
      else if (/^[2b]$/i.test(match) || match === 'second') selectedOption = 2;
      else if (/^[3c]$/i.test(match) || match === 'third') selectedOption = 3;
    }
  }
  
  // Extract feedback context (text after selection indicator)
  let feedback: string | null = null;
  if (isPositive && message.length > 30) {
    // Look for "because" or reasoning after selection
    const reasonMatch = message.match(/(?:because|since|as\s+it|it\s+(?:really\s+)?(?:captures?|shows?|highlights?|calls?\s+out))[\s,]+(.{10,})/i);
    if (reasonMatch) {
      feedback = reasonMatch[1].trim().slice(0, 150);
    }
  }
  
  return { isPositive, selectedOption, feedback };
}

/**
 * Extract artifact options from AI message
 */
export function extractArtifactsFromMessage(aiMessage: string): {
  headlines: string[];
  ctas: string[];
  positioning: string[];
} {
  const headlines: string[] = [];
  const ctas: string[] = [];
  const positioning: string[] = [];
  
  // Extract headlines
  for (const pattern of HEADLINE_PATTERNS) {
    pattern.lastIndex = 0; // Reset regex
    let match;
    while ((match = pattern.exec(aiMessage)) !== null) {
      const content = match[1]?.trim();
      if (content && content.length >= 20 && content.length <= 100) {
        // Avoid duplicates
        if (!headlines.includes(content)) {
          headlines.push(content);
        }
      }
    }
  }
  
  // Extract CTAs
  for (const pattern of CTA_PATTERNS) {
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(aiMessage)) !== null) {
      const content = match[1]?.trim() || match[0]?.trim();
      if (content && content.length >= 5 && content.length <= 50) {
        if (!ctas.includes(content)) {
          ctas.push(content);
        }
      }
    }
  }
  
  // Extract positioning statements (look for explicit mentions)
  const positioningMatch = aiMessage.match(/(?:positioning|tagline|value\s+prop(?:osition)?)[:\s]+[""]([^""]{15,120})[""]/gi);
  if (positioningMatch) {
    positioningMatch.forEach(m => {
      const content = m.replace(/^[^""]*[""]|[""]$/g, '').trim();
      if (content && !positioning.includes(content)) {
        positioning.push(content);
      }
    });
  }
  
  return { headlines, ctas, positioning };
}

/**
 * Create empty artifacts object
 */
export function createEmptyArtifacts(): ConsultationArtifacts {
  return {
    selectedHeadline: null,
    alternativeHeadlines: [],
    selectedCTA: null,
    alternativeCTAs: [],
    selectedPositioning: null,
    copySnippets: [],
    userFeedback: null,
  };
}

/**
 * Log artifact capture for debugging
 */
export function logArtifactCapture(
  type: 'headline' | 'cta' | 'positioning' | 'copySnippet',
  action: 'detected' | 'selected' | 'stored',
  content: string,
  context?: string
): void {
  console.log(`[Artifact ${action.toUpperCase()}]`, {
    type,
    content: content.slice(0, 60) + (content.length > 60 ? '...' : ''),
    context,
    timestamp: new Date().toISOString(),
  });
}
