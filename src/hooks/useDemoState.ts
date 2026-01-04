import { useState, useEffect, useCallback } from 'react';
import type { PersonalizedContent } from '@/components/landing/PersonalizedHero';

export type DemoState = 'idle' | 'generating' | 'completed';

const STORAGE_KEY = 'pageconsult_demo_state';
const CONTENT_KEY = 'pageconsult_personalized_content';

// Validate that a value is a valid DemoState
function isValidDemoState(value: unknown): value is DemoState {
  return value === 'idle' || value === 'generating' || value === 'completed';
}

// Validate that content has all required fields
function isValidPersonalizedContent(content: unknown): content is PersonalizedContent {
  if (!content || typeof content !== 'object') return false;
  const c = content as Record<string, unknown>;
  return (
    typeof c.headline === 'string' && c.headline.length > 0 &&
    typeof c.subhead === 'string' && c.subhead.length > 0 &&
    typeof c.cta_text === 'string' && c.cta_text.length > 0
  );
}

// Safe localStorage getters with validation
function getSavedDemoState(): DemoState {
  if (typeof window === 'undefined') return 'idle';
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && isValidDemoState(saved)) {
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
    if (saved) {
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
  const [demoState, setDemoStateInternal] = useState<DemoState>(getSavedDemoState);
  const [personalizedContent, setPersonalizedContentInternal] = useState<PersonalizedContent | null>(getSavedContent);

  // Validate state consistency on mount - if completed but no valid content, reset
  useEffect(() => {
    if (demoState === 'completed' && !personalizedContent) {
      console.warn('Demo state is completed but no valid content, resetting to idle');
      setDemoStateInternal('idle');
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {}
    }
    // Reset generating state on page load (shouldn't persist)
    if (demoState === 'generating') {
      console.warn('Demo was in generating state on load, resetting to idle');
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
