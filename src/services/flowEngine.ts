import { supabase } from '@/integrations/supabase/client';

export type FlowState = 
  | 'started'
  | 'demo_complete'
  | 'signed_up'
  | 'brand_captured'
  | 'consultation_complete'
  | 'brief_generated'
  | 'page_generated'
  | 'published';

export type HuddleType = 
  | 'pre_brief'
  | 'pre_page'
  | 'strategic_pivot'
  | 'returning';

export interface FlowDecision {
  route: string;
  huddleType?: HuddleType;
  reasoning: string;
}

export async function updateFlowState(
  consultationId: string, 
  newState: FlowState, 
  trigger: string
): Promise<void> {
  const { data: consultation } = await supabase
    .from('consultations')
    .select('flow_history')
    .eq('id', consultationId)
    .single();

  const history = (consultation?.flow_history as Array<{ state: string; timestamp: string; trigger: string }>) || [];
  history.push({
    state: newState,
    timestamp: new Date().toISOString(),
    trigger
  });

  await supabase
    .from('consultations')
    .update({ 
      flow_state: newState,
      flow_history: history
    })
    .eq('id', consultationId);
}

export async function getNextStep(consultationId: string): Promise<FlowDecision> {
  const { data: consultation, error } = await supabase
    .from('consultations')
    .select('*')
    .eq('id', consultationId)
    .single();

  if (error || !consultation) {
    return {
      route: '/demo',
      reasoning: 'No consultation found, starting fresh'
    };
  }

  const state = consultation.flow_state || 'started';
  const score = consultation.readiness_score || 0;
  const intel = consultation.extracted_intelligence as Record<string, unknown> | null;
  const hasBrand = !!(intel?.colors || intel?.logoUrl);
  const hasBrief = !!consultation.strategy_brief;

  // Decision logic based on current state
  switch (state) {
    case 'started':
    case 'demo_complete':
      // After demo, go to huddle to confirm understanding
      return {
        route: '/huddle',
        huddleType: 'pre_brief',
        reasoning: `Demo complete with score ${score}, showing pre-brief huddle`
      };

    case 'signed_up':
      // After signup, if we have intelligence, show huddle
      if (score >= 50) {
        return {
          route: '/huddle',
          huddleType: 'pre_brief',
          reasoning: `Signed up with sufficient intelligence (${score}), showing huddle`
        };
      }
      // If low intelligence, need more consultation
      return {
        route: '/wizard/chat',
        reasoning: `Intelligence score ${score} too low, needs consultation`
      };

    case 'consultation_complete':
      // After consultation, check if brand is captured
      if (!hasBrand) {
        return {
          route: '/brand-setup',
          reasoning: 'Consultation complete, needs brand capture'
        };
      }
      // If brand exists, show pre-brief huddle
      return {
        route: '/huddle',
        huddleType: 'pre_brief',
        reasoning: 'Ready for brief generation'
      };

    case 'brand_captured':
      // After brand, show huddle then generate brief
      if (!hasBrief) {
        return {
          route: '/huddle',
          huddleType: 'pre_brief',
          reasoning: 'Brand captured, confirming before brief generation'
        };
      }
      return {
        route: '/strategy-brief',
        reasoning: 'Brief exists, showing for review'
      };

    case 'brief_generated':
      // After brief, show pre-page huddle
      return {
        route: '/huddle',
        huddleType: 'pre_page',
        reasoning: 'Brief complete, confirming before page generation'
      };

    case 'page_generated':
      return {
        route: '/preview',
        reasoning: 'Page generated, showing preview'
      };

    default:
      return {
        route: '/dashboard',
        reasoning: 'Unknown state, going to dashboard'
      };
  }
}
