/**
 * Sanitizes a complete CSS string before injection via dangerouslySetInnerHTML.
 * This provides defense-in-depth on top of per-value sanitization in designSystem.
 */
export function sanitizeFullCSS(css: string): string {
  if (!css || typeof css !== 'string') return '';

  let sanitized = css;

  // Remove dangerous patterns that could escape CSS context or exfiltrate data
  const dangerousPatterns: Array<{ pattern: RegExp; replacement: string }> = [
    // JavaScript protocol handlers
    { pattern: /javascript\s*:/gi, replacement: '/* blocked */' },
    // Expression (IE legacy)
    { pattern: /expression\s*\(/gi, replacement: '/* blocked */' },
    // url() can exfiltrate data via external requests
    { pattern: /url\s*\(\s*(['"]?)(?!data:image\/)(.*?)\1\s*\)/gi, replacement: '/* blocked-url */' },
    // @import can load external stylesheets
    { pattern: /@import\b[^;]*/gi, replacement: '/* blocked-import */' },
    // behavior (IE legacy)
    { pattern: /behavior\s*:/gi, replacement: '/* blocked */' },
    // -moz-binding (Firefox XBL)
    { pattern: /-moz-binding\s*:/gi, replacement: '/* blocked */' },
    // <script> or HTML tags embedded in CSS
    { pattern: /<\/?script[^>]*>/gi, replacement: '/* blocked */' },
    { pattern: /<\/?[a-z][^>]*>/gi, replacement: '/* blocked */' },
    // Event handlers
    { pattern: /on\w+\s*=/gi, replacement: '/* blocked */' },
  ];

  for (const { pattern, replacement } of dangerousPatterns) {
    sanitized = sanitized.replace(pattern, replacement);
  }

  return sanitized;
}
