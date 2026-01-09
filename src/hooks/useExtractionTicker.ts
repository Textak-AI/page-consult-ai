import { useState, useCallback, useRef } from 'react';

interface ExtractionToast {
  id: string;
  type: 'extraction' | 'score' | 'milestone';
  category?: string;
  value?: string;
  scoreDelta?: number;
  newScore?: number;
}

export function useExtractionTicker() {
  const [toasts, setToasts] = useState<ExtractionToast[]>([]);
  const toastIdRef = useRef(0);
  
  const showExtraction = useCallback((category: string, value: string) => {
    const id = `toast-${toastIdRef.current++}`;
    const toast: ExtractionToast = {
      id,
      type: 'extraction',
      category,
      value: value.length > 40 ? value.slice(0, 40) + '...' : value,
    };
    
    setToasts(prev => [...prev, toast]);
    
    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);
  
  const showScoreChange = useCallback((delta: number, newScore: number) => {
    const id = `toast-${toastIdRef.current++}`;
    const toast: ExtractionToast = {
      id,
      type: 'score',
      scoreDelta: delta,
      newScore,
    };
    
    setToasts(prev => [...prev, toast]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);
  
  const showMilestone = useCallback((message: string) => {
    const id = `toast-${toastIdRef.current++}`;
    const toast: ExtractionToast = {
      id,
      type: 'milestone',
      value: message,
    };
    
    setToasts(prev => [...prev, toast]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);
  
  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);
  
  return {
    toasts,
    showExtraction,
    showScoreChange,
    showMilestone,
    dismissToast,
  };
}
