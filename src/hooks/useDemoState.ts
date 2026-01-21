import { useState, useEffect, useCallback } from 'react';
import type { PersonalizedContent } from '@/components/landing/PersonalizedHero';

export type DemoState = 'idle' | 'generating' | 'completed';

const STORAGE_KEY = 'pageconsult_demo_state';
const CONTENT_KEY = 'pageconsult_personalized_content';
const SESSION_KEY = 'pageconsult_demo_session';
const COMPLETED_SESSION_KEY = 'pageconsult_demo_completed_session';
const FRESH_LOAD_KEY = 'pageconsult_fresh_load_cleared';

// Clear ALL demo state on fresh page load (before any state initialization)
// This ensures logged-out users always see the default state
// BUT: Don't clear if we're in the middle of an auth flow (coming from signup)
function clearDemoStateOnFreshLoad(): void {
  if (typeof window === 'undefined') return;
  
  // Check if we've already cleared on this page load
  if (sessionStorage.getItem(FRESH_LOAD_KEY)) return;
  
  // DON'T clear if we're in an auth flow (has session data or consultationId in URL)
  const url = new URL(window.location.href);
  const hasConsultationId = url.searchParams.has('consultationId');
  const hasFromDemo = url.searchParams.get('from') === 'demo';
  const hasDemoIntelligence = sessionStorage.getItem('demoIntelligence');
  const hasSessionId = localStorage.getItem('pageconsult_session_id');
  
  if (hasConsultationId || hasFromDemo || hasDemoIntelligence || hasSessionId) {
    console.log('🛡️ Skipping demo state clear - auth flow detected');
    sessionStorage.setItem(FRESH_LOAD_KEY, 'true');
    return;
  }
  
  // Mark that we've cleared for this page load
  sessionStorage.setItem(FRESH_LOAD_KEY, 'true');
  
  // Clear ALL demo-related localStorage
  const keysToRemove = [
    'pageconsult_demo_state',
    'pageconsult_demo_content',
    'pageconsult_personalized_content',
    'pageconsult_demo_completed_session',
    'pageconsult_demo_session_id',
    'pageconsult_demo_conversation',
    'pageconsult_demo_extracted',
    'pageconsult_demo_market',
    'pageconsult_demo_industry',
    'pageconsult_demo_timestamp',
  ];
  
  keysToRemove.forEach(key => {
    try {
      localStorage.removeItem(key);
    } catch {}
  });
  
  console.log('🧹 Demo state cleared on fresh page load');
}

// Execute immediately when module loads (before React hydrates)
clearDemoStateOnFreshLoad();

// Get or create session ID for this browser session
function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  const existing = sessionStorage.getItem(SESSION_KEY);
  if (existing) return existing;
  const newId = crypto.randomUUID();
  sessionStorage.setItem(SESSION_KEY, newId);
  return newId;
}

// Validate that a value is a valid DemoState
function isValidDemoState(value: unknown): value is DemoState {
  return value === 'idle' || value === 'generating' || value === 'completed';
}

// Validate that content has all required fields AND is not corrupted/truncated
function isValidPersonalizedContent(content: unknown): content is PersonalizedContent {
  if (!content || typeof content !== 'object') return false;
  const c = content as Record<string, unknown>;
  
  // Basic type checks
  if (typeof c.headline !== 'string' || typeof c.subhead !== 'string' || typeof c.cta_text !== 'string') {
    return false;
  }
  
  // Minimum length requirements to prevent corrupted/partial content
  if (c.headline.length < 15 || c.subhead.length < 30 || c.cta_text.length < 5) {
    console.warn('[useDemoState] Content rejected - too short:', { 
      headline: c.headline.length, 
      subhead: c.subhead.length 
    });
    return false;
  }
  
  // Check for truncation indicators (words cut off mid-word)
  const truncationPatterns = [
    /\b\w{2,}$/,    // ends with partial word (no punctuation or space)
    /turnove$/i,    // specific known truncation
    /\.\.\.$/, // ends with ellipsis (explicit truncation)
  ];
  
  // Check headline doesn't appear truncated (unless it ends with proper punctuation or complete words)
  const headlineEndsClean = /[.!?"]$/.test(c.headline) || /\w{3,}$/.test(c.headline);
  if (!headlineEndsClean) {
    console.warn('[useDemoState] Headline may be truncated:', c.headline);
    // Don't reject, but log for debugging
  }
  
  return true;
}

// Safe localStorage getters with validation
function getSavedDemoState(): DemoState {
  if (typeof window === 'undefined') return 'idle';
  try {
    // Only restore 'completed' state if it was completed in THIS session
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && isValidDemoState(saved)) {
      if (saved === 'completed') {
        const completedSession = localStorage.getItem(COMPLETED_SESSION_KEY);
        const currentSession = getSessionId();
        if (completedSession !== currentSession) {
          // Demo was completed in a different session - reset
          return 'idle';
        }
      }
      return saved;
    }
  } catch (e) {
    console.warn('Failed to read demo state from localStorage:', e);
  }
  return 'idle';
}

function getSavedContent(): PersonalizedContent | null {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem(CONTENT_KEY);
    // Guard against undefined/null strings that would crash JSON.parse
    if (saved && saved !== 'undefined' && saved !== 'null') {
      const parsed = JSON.parse(saved);
      if (isValidPersonalizedContent(parsed)) {
        return parsed;
      }
      // Content is invalid - clear it
      console.warn('Invalid personalized content in localStorage, clearing');
      localStorage.removeItem(CONTENT_KEY);
    }
  } catch (e) {
    console.warn('Failed to parse personalized content from localStorage:', e);
    // Clear corrupted data
    try {
      localStorage.removeItem(CONTENT_KEY);
    } catch {}
  }
  return null;
}

interface UseDemoStateReturn {
  demoState: DemoState;
  personalizedContent: PersonalizedContent | null;
  setDemoState: (state: DemoState) => void;
  setPersonalizedContent: (content: PersonalizedContent | null) => void;
  startGenerating: () => void;
  completeDemo: (content: PersonalizedContent) => void;
  resetDemo: () => void;
}

export function useDemoState(): UseDemoStateReturn {
  // ALWAYS start fresh - never restore from localStorage
  // This ensures logged-out users see the default Hero
  const [demoState, setDemoStateInternal] = useState<DemoState>('idle');
  const [personalizedContent, setPersonalizedContentInternal] = useState<PersonalizedContent | null>(null);

  // Validate state consistency on mount - if completed but no valid content, reset
  useEffect(() => {
    // Check if content passes stricter validation
    if (demoState === 'completed') {
      if (!personalizedContent) {
        console.warn('[useDemoState] Demo completed but no content, resetting');
        setDemoStateInternal('idle');
        try {
          localStorage.removeItem(STORAGE_KEY);
          localStorage.removeItem(CONTENT_KEY);
        } catch {}
      } else {
        // Additional validation: check for truncation issues
        const hasIssues = 
          personalizedContent.headline.includes('turnove') || // Known truncation
          personalizedContent.headline.length < 15 ||
          personalizedContent.subhead.length < 30;
        
        if (hasIssues) {
          console.warn('[useDemoState] Content has quality issues, resetting:', personalizedContent);
          setDemoStateInternal('idle');
          setPersonalizedContentInternal(null);
          try {
            localStorage.removeItem(STORAGE_KEY);
            localStorage.removeItem(CONTENT_KEY);
          } catch {}
        }
      }
    }
    
    // Reset generating state on page load (shouldn't persist)
    if (demoState === 'generating') {
      console.warn('[useDemoState] Demo was in generating state on load, resetting to idle');
      setDemoStateInternal('idle');
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {}
    }
  }, []);

  // Persist state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, demoState);
    } catch (e) {
      console.warn('Failed to save demo state:', e);
    }
  }, [demoState]);

  useEffect(() => {
    try {
      if (personalizedContent) {
        localStorage.setItem(CONTENT_KEY, JSON.stringify(personalizedContent));
      } else {
        localStorage.removeItem(CONTENT_KEY);
      }
    } catch (e) {
      console.warn('Failed to save personalized content:', e);
    }
  }, [personalizedContent]);

  const setDemoState = useCallback((state: DemoState) => {
    setDemoStateInternal(state);
  }, []);

  const setPersonalizedContent = useCallback((content: PersonalizedContent | null) => {
    setPersonalizedContentInternal(content);
  }, []);

  const startGenerating = useCallback(() => {
    setDemoStateInternal('generating');
  }, []);

  const completeDemo = useCallback((content: PersonalizedContent) => {
    // Only complete if content is valid
    if (isValidPersonalizedContent(content)) {
      setPersonalizedContentInternal(content);
      setDemoStateInternal('completed');
      // Mark which session completed the demo
      try {
        localStorage.setItem(COMPLETED_SESSION_KEY, getSessionId());
      } catch {}
    } else {
      console.warn('Attempted to complete demo with invalid content');
    }
  }, []);

  const resetDemo = useCallback(() => {
    setDemoStateInternal('idle');
    setPersonalizedContentInternal(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(CONTENT_KEY);
      localStorage.removeItem(COMPLETED_SESSION_KEY);
    } catch (e) {
      console.warn('Failed to clear demo state from localStorage:', e);
    }
  }, []);

  return {
    demoState,
    personalizedContent,
    setDemoState,
    setPersonalizedContent,
    startGenerating,
    completeDemo,
    resetDemo,
  };
}
