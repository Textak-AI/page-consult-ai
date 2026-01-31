import { useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export type FlowStep = 'consultation' | 'brief' | 'brand' | 'strategy' | 'generate';

export interface FlowStepInfo {
  id: FlowStep;
  label: string;
  shortLabel: string;
  path: string;
  icon: string;
}

export const FLOW_STEPS: FlowStepInfo[] = [
  { id: 'consultation', label: 'Consultation', shortLabel: 'Consult', path: '/try', icon: '💬' },
  { id: 'brief', label: 'Brief', shortLabel: 'Brief', path: '/brief', icon: '📋' },
  { id: 'brand', label: 'Brand Setup', shortLabel: 'Brand', path: '/brand-setup', icon: '🎨' },
  { id: 'strategy', label: 'Strategy', shortLabel: 'Strategy', path: '/strategy-document', icon: '📋' },
  { id: 'generate', label: 'Generate', shortLabel: 'Generate', path: '/generate', icon: '🚀' },
];

export interface FlowState {
  consultationScore: number;
  briefGenerated: boolean;
  brandVisited: boolean;
  strategyVisited: boolean;
  sessionId: string | null;
  consultationId: string | null;
}

export interface StepStatus {
  completed: boolean;
  current: boolean;
  available: boolean;
  locked: boolean;
  score?: number | string;
  lockReason?: string;
}

export function useFlowNavigation(
  currentStep: FlowStep,
  flowState: FlowState
) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Get a consistent session identifier (prefer session, fallback to consultationId)
  const sessionIdentifier = useMemo(() => {
    return flowState.sessionId || 
           flowState.consultationId || 
           searchParams.get('session') || 
           searchParams.get('consultationId') ||
           searchParams.get('id');
  }, [flowState.sessionId, flowState.consultationId, searchParams]);

  // Calculate step statuses
  const stepStatuses = useMemo((): Record<FlowStep, StepStatus> => {
    const { consultationScore, briefGenerated, brandVisited, strategyVisited } = flowState;
    
    // Consultation is always available
    const consultationCompleted = consultationScore >= 70;
    
    // Brief unlocked when consultation score >= 70
    const briefUnlocked = consultationScore >= 70;
    const briefCompleted = briefGenerated;
    
    // Brand unlocked when brief is complete
    const brandUnlocked = briefCompleted;
    const brandCompleted = brandVisited;
    
    // Strategy unlocked when brand step visited
    const strategyUnlocked = brandVisited;
    const strategyCompleted = strategyVisited;
    
    // Generate unlocked when strategy step visited
    const generateUnlocked = strategyVisited;

    return {
      consultation: {
        completed: consultationCompleted,
        current: currentStep === 'consultation',
        available: true,
        locked: false,
        score: consultationScore > 0 ? `${consultationScore} pts` : undefined,
      },
      brief: {
        completed: briefCompleted,
        current: currentStep === 'brief',
        available: briefUnlocked,
        locked: !briefUnlocked,
        lockReason: 'Reach 70 pts to unlock',
      },
      brand: {
        completed: brandCompleted,
        current: currentStep === 'brand',
        available: brandUnlocked,
        locked: !brandUnlocked,
        lockReason: 'Generate brief to unlock',
      },
      strategy: {
        completed: strategyCompleted,
        current: currentStep === 'strategy',
        available: strategyUnlocked,
        locked: !strategyUnlocked,
        lockReason: 'Complete brand setup to unlock',
      },
      generate: {
        completed: false, // Generate is the final step
        current: currentStep === 'generate',
        available: generateUnlocked,
        locked: !generateUnlocked,
        lockReason: 'Complete strategy to unlock',
      },
    };
  }, [currentStep, flowState]);

  // Navigate to a step with session ID preserved
  const navigateToStep = useCallback((step: FlowStep) => {
    const stepInfo = FLOW_STEPS.find(s => s.id === step);
    if (!stepInfo) return;
    
    const status = stepStatuses[step];
    if (status.locked) {
      console.log(`[FlowNav] Step ${step} is locked: ${status.lockReason}`);
      return;
    }

    // Build URL with session ID
    let url = stepInfo.path;
    if (sessionIdentifier) {
      if (step === 'strategy') {
        // Strategy uses consultationId param
        url = `${stepInfo.path}?consultationId=${sessionIdentifier}`;
      } else if (step === 'generate') {
        // Generate uses id param
        url = `${stepInfo.path}/${sessionIdentifier}`;
      } else {
        // Others use session param
        url = `${stepInfo.path}?session=${sessionIdentifier}`;
      }
    }

    console.log(`[FlowNav] Navigating to ${step}:`, url);
    navigate(url);
  }, [navigate, stepStatuses, sessionIdentifier]);

  // Check if we can navigate back
  const canGoBack = useMemo(() => {
    const currentIndex = FLOW_STEPS.findIndex(s => s.id === currentStep);
    return currentIndex > 0;
  }, [currentStep]);

  // Navigate back to previous step
  const goBack = useCallback(() => {
    const currentIndex = FLOW_STEPS.findIndex(s => s.id === currentStep);
    if (currentIndex > 0) {
      const prevStep = FLOW_STEPS[currentIndex - 1];
      navigateToStep(prevStep.id);
    }
  }, [currentStep, navigateToStep]);

  // Get current step index
  const currentStepIndex = useMemo(() => {
    return FLOW_STEPS.findIndex(s => s.id === currentStep);
  }, [currentStep]);

  return {
    steps: FLOW_STEPS,
    stepStatuses,
    navigateToStep,
    canGoBack,
    goBack,
    currentStepIndex,
    sessionIdentifier,
  };
}
