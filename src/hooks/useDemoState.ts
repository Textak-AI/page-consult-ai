import { useState, useEffect, useCallback } from 'react';
import type { PersonalizedContent } from '@/components/landing/PersonalizedHero';

export type DemoState = 'idle' | 'generating' | 'completed';

const STORAGE_KEY = 'pageconsult_demo_state';
const CONTENT_KEY = 'pageconsult_personalized_content';

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
  const [demoState, setDemoStateInternal] = useState<DemoState>(() => {
    if (typeof window === 'undefined') return 'idle';
    const saved = localStorage.getItem(STORAGE_KEY);
    return (saved as DemoState) || 'idle';
  });
  
  const [personalizedContent, setPersonalizedContentInternal] = useState<PersonalizedContent | null>(() => {
    if (typeof window === 'undefined') return null;
    const saved = localStorage.getItem(CONTENT_KEY);
    return saved ? JSON.parse(saved) : null;
  });

  // Persist state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, demoState);
  }, [demoState]);

  useEffect(() => {
    if (personalizedContent) {
      localStorage.setItem(CONTENT_KEY, JSON.stringify(personalizedContent));
    } else {
      localStorage.removeItem(CONTENT_KEY);
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
    setPersonalizedContentInternal(content);
    setDemoStateInternal('completed');
  }, []);

  const resetDemo = useCallback(() => {
    setDemoStateInternal('idle');
    setPersonalizedContentInternal(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(CONTENT_KEY);
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
