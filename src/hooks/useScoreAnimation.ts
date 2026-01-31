import { useState, useEffect, useRef, useCallback } from 'react';

interface ScoreToast {
  id: string;
  delta: number;
  timestamp: number;
}

interface UseScoreAnimationReturn {
  displayScore: number;
  previousScore: number;
  isAnimating: boolean;
  scoreDelta: number;
  toasts: ScoreToast[];
  dismissToast: (id: string) => void;
  triggerMilestone: (type: 'brief_unlocked' | 'complete') => void;
  milestoneType: 'brief_unlocked' | 'complete' | null;
  clearMilestone: () => void;
}

export function useScoreAnimation(currentScore: number): UseScoreAnimationReturn {
  const [displayScore, setDisplayScore] = useState(currentScore);
  const [previousScore, setPreviousScore] = useState(currentScore);
  const [isAnimating, setIsAnimating] = useState(false);
  const [toasts, setToasts] = useState<ScoreToast[]>([]);
  const [milestoneType, setMilestoneType] = useState<'brief_unlocked' | 'complete' | null>(null);
  const lastTriggeredMilestoneRef = useRef<number>(0);
  const toastIdRef = useRef(0);

  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

  // Animate score changes
  useEffect(() => {
    if (currentScore === displayScore) return;

    const delta = currentScore - displayScore;
    
    // Add toast for score increase
    if (delta > 0) {
      const toastId = `toast-${toastIdRef.current++}`;
      setToasts(prev => [...prev, { id: toastId, delta, timestamp: Date.now() }]);
      
      // Auto-dismiss toast after 2 seconds
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== toastId));
      }, 2000);
    }

    setPreviousScore(displayScore);
    setIsAnimating(true);

    if (prefersReducedMotion) {
      // Instant update for reduced motion
      setDisplayScore(currentScore);
      setIsAnimating(false);
      return;
    }

    // Animate the score counter
    const duration = 800;
    const startTime = Date.now();
    const startScore = displayScore;
    const endScore = currentScore;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease-out curve
      const eased = 1 - Math.pow(1 - progress, 3);
      const newScore = Math.round(startScore + (endScore - startScore) * eased);
      
      setDisplayScore(newScore);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };

    requestAnimationFrame(animate);
  }, [currentScore, displayScore, prefersReducedMotion]);

  // Check for milestone triggers
  useEffect(() => {
    // Brief unlock milestone at 70 points
    if (currentScore >= 70 && lastTriggeredMilestoneRef.current < 70) {
      setMilestoneType('brief_unlocked');
      lastTriggeredMilestoneRef.current = 70;
    }
    // Complete milestone at 100 points
    else if (currentScore >= 100 && lastTriggeredMilestoneRef.current < 100) {
      setMilestoneType('complete');
      lastTriggeredMilestoneRef.current = 100;
    }
  }, [currentScore]);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const triggerMilestone = useCallback((type: 'brief_unlocked' | 'complete') => {
    setMilestoneType(type);
  }, []);

  const clearMilestone = useCallback(() => {
    setMilestoneType(null);
  }, []);

  return {
    displayScore,
    previousScore,
    isAnimating,
    scoreDelta: currentScore - previousScore,
    toasts,
    dismissToast,
    triggerMilestone,
    milestoneType,
    clearMilestone,
  };
}
