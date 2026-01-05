export type ScreenContext = 
  | 'landing'
  | 'consultation'
  | 'wizard'
  | 'brief-generating'
  | 'brief-view'
  | 'page-generating'
  | 'page-preview'
  | 'editor'
  | 'dashboard'
  | 'settings'
  | 'unknown';

export interface ScreenBehavior {
  allowChat: boolean;
  proactivePrompts: string[];
  inputPlaceholder: string;
}

export const SCREEN_BEHAVIORS: Record<ScreenContext, ScreenBehavior> = {
  landing: {
    allowChat: true,
    proactivePrompts: [
      "Ready to build a landing page that actually converts?",
      "Tell me about your business — I'll help you get clear on what matters."
    ],
    inputPlaceholder: "Ask me anything..."
  },
  consultation: {
    allowChat: true,
    proactivePrompts: [],
    inputPlaceholder: "Tell me more..."
  },
  wizard: {
    allowChat: true,
    proactivePrompts: [
      "Let's build something great together.",
      "I'm here to help you create a page that converts."
    ],
    inputPlaceholder: "Ask me anything..."
  },
  'brief-generating': {
    allowChat: false,
    proactivePrompts: [
      "Building your strategy brief... this takes about 20 seconds.",
      "Analyzing what you shared and crystallizing your positioning..."
    ],
    inputPlaceholder: ""
  },
  'brief-view': {
    allowChat: true,
    proactivePrompts: [
      "Here's your strategy brief. Everything we talked about, crystallized.",
      "This is the foundation. Ready to see it become a page?"
    ],
    inputPlaceholder: "Questions about your brief?"
  },
  'page-generating': {
    allowChat: false,
    proactivePrompts: [
      "Generating your landing page...",
      "Turning strategy into design..."
    ],
    inputPlaceholder: ""
  },
  'page-preview': {
    allowChat: true,
    proactivePrompts: [
      "This is your page. See how it brings your strategy to life?",
      "Ready to publish, or want to tweak something first?"
    ],
    inputPlaceholder: "Want to change something?"
  },
  editor: {
    allowChat: true,
    proactivePrompts: [
      "Editing mode. I can suggest alternatives if you're stuck.",
      "Need help with the headline? I've got variations based on your brief."
    ],
    inputPlaceholder: "Ask for suggestions..."
  },
  dashboard: {
    allowChat: true,
    proactivePrompts: [
      "Welcome back. Pick up where you left off?",
      "Your pages are waiting. Which one do you want to work on?"
    ],
    inputPlaceholder: "What would you like to do?"
  },
  settings: {
    allowChat: false,
    proactivePrompts: [],
    inputPlaceholder: ""
  },
  unknown: {
    allowChat: true,
    proactivePrompts: [],
    inputPlaceholder: "Ask me anything..."
  }
};

export function getScreenFromPath(pathname: string): ScreenContext {
  if (pathname === '/' || pathname === '/home') return 'landing';
  if (pathname.startsWith('/consultation')) return 'consultation';
  if (pathname.startsWith('/wizard')) return 'wizard';
  if (pathname.startsWith('/brief')) return 'brief-view';
  if (pathname.startsWith('/preview')) return 'page-preview';
  if (pathname.startsWith('/editor') || pathname.startsWith('/generate')) return 'editor';
  if (pathname.startsWith('/dashboard')) return 'dashboard';
  if (pathname.startsWith('/settings')) return 'settings';
  
  return 'unknown';
}

export function shouldShowProactive(): boolean {
  const lastProactive = localStorage.getItem('pageconsult_last_proactive');
  if (!lastProactive) return true;
  
  const elapsed = Date.now() - parseInt(lastProactive);
  return elapsed > 60000; // At least 1 minute between proactive messages
}

export function markProactiveShown(): void {
  localStorage.setItem('pageconsult_last_proactive', Date.now().toString());
}
