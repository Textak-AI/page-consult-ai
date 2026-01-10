/**
 * Chat Navigation Handler
 * Detects navigation intent from user messages and triggers navigation
 */

// Navigation intent patterns
const NAVIGATION_PATTERNS: { pattern: RegExp; route: string; scrollTo?: string }[] = [
  // Pricing
  { pattern: /\b(pricing|prices?|cost|how much|subscription|plans?)\b/i, route: '/pricing' },
  
  // Sign up / Register
  { pattern: /\b(sign\s*up|register|create\s+account|get\s+started|start\s+free)\b/i, route: '/signup' },
  
  // Login
  { pattern: /\b(log\s*in|sign\s*in|login)\b/i, route: '/login' },
  
  // Homepage
  { pattern: /\b(home\s*page|go\s+home|back\s+to\s+home|main\s+page)\b/i, route: '/' },
  
  // Demo section
  { pattern: /\b(demo|try\s+it|show\s+me|strategy\s+session)\b/i, route: '/', scrollTo: 'demo' },
  
  // Features
  { pattern: /\b(features?|what\s+can|capabilities)\b/i, route: '/#features', scrollTo: 'features' },
  
  // Contact / Support - Disabled: /contact route does not exist
  // { pattern: /\b(contact|talk\s+to\s+someone|support|help|human|real\s+person)\b/i, route: '/contact' },
  
  // FAQ - Requires explicit FAQ reference to avoid false positives on common words like "help" or "questions"
  { pattern: /\b(faq|frequently\s+asked|q\s*&\s*a)\b/i, route: '/#faq', scrollTo: 'faq' },
  
  // Dashboard
  { pattern: /\b(dashboard|my\s+pages?|my\s+account)\b/i, route: '/dashboard' },
  
  // New consultation
  { pattern: /\b(new\s+page|create\s+page|start\s+consultation|new\s+consultation)\b/i, route: '/new' },
];

// Action verb patterns that indicate navigation intent
// These MUST be present for high-confidence navigation detection
const ACTION_VERBS = /\b(take\s+me\s+to|go\s+to|show\s+me\s+(?:the|your)|navigate\s+to|open\s+(?:the|your)|visit|check\s+out\s+(?:the|your)|i\s+want\s+to\s+(?:see|go\s+to|check))\b/i;

export interface NavigationIntent {
  detected: boolean;
  route: string | null;
  scrollTo: string | null;
  confidence: 'high' | 'medium' | 'low';
}

/**
 * Detects if a user message contains navigation intent
 */
export function detectNavigationIntent(message: string): NavigationIntent {
  const lowerMessage = message.toLowerCase().trim();
  
  // Check if message has an action verb (increases confidence)
  const hasActionVerb = ACTION_VERBS.test(lowerMessage);
  
  // Check each navigation pattern
  for (const { pattern, route, scrollTo } of NAVIGATION_PATTERNS) {
    if (pattern.test(lowerMessage)) {
      return {
        detected: true,
        route,
        scrollTo: scrollTo || null,
        confidence: hasActionVerb ? 'high' : 'medium',
      };
    }
  }
  
  return {
    detected: false,
    route: null,
    scrollTo: null,
    confidence: 'low',
  };
}

/**
 * Handles navigation based on detected intent
 * Returns true if navigation was triggered, false otherwise
 */
export function handleChatNavigation(
  message: string,
  navigate: (path: string) => void,
  options?: {
    onNavigate?: (route: string) => void;
    confirmFirst?: boolean;
  }
): { navigated: boolean; route: string | null; responseMessage: string | null } {
  const intent = detectNavigationIntent(message);
  
  if (!intent.detected || !intent.route) {
    return { navigated: false, route: null, responseMessage: null };
  }
  
  // Only auto-navigate for high confidence matches (action verb + route keyword)
  // This prevents false positives when users use words like "help" in their business descriptions
  if (intent.confidence === 'high') {
    // Handle scroll-to targets on same page
    if (intent.scrollTo && (intent.route === '/' || intent.route.startsWith('/#'))) {
      const element = document.getElementById(intent.scrollTo);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return { 
          navigated: true, 
          route: intent.route,
          responseMessage: `I'm taking you to the ${intent.scrollTo} section.`
        };
      }
    }
    
    // Navigate to the route
    navigate(intent.route);
    options?.onNavigate?.(intent.route);
    
    const routeName = getRouteName(intent.route);
    return { 
      navigated: true, 
      route: intent.route,
      responseMessage: `Taking you to ${routeName}...`
    };
  }
  
  // For medium confidence, suggest but don't auto-navigate
  if (intent.confidence === 'medium') {
    const routeName = getRouteName(intent.route);
    return {
      navigated: false,
      route: intent.route,
      responseMessage: `Would you like me to take you to ${routeName}? Just say "yes" or "take me there".`
    };
  }
  
  return { navigated: false, route: null, responseMessage: null };
}

/**
 * Get human-readable name for a route
 */
function getRouteName(route: string): string {
  const routeNames: Record<string, string> = {
    '/': 'the homepage',
    '/pricing': 'pricing',
    '/signup': 'sign up',
    '/login': 'login',
    '/dashboard': 'your dashboard',
    '/new': 'start a new consultation',
    '/contact': 'contact us',
    '/#features': 'our features',
    '/#faq': 'FAQ',
    '/#demo': 'the demo',
  };
  
  return routeNames[route] || route;
}
