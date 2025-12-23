// Trigger detection for AI Consultant suggestions

export interface RegenerationTrigger {
  type: 'differentiator' | 'proof' | 'testimonial' | 'pain' | 'outcome' | 'industry' | 'cta' | 'value_prop';
  data: unknown;
  affectedSections: string[];
  priority: 'high' | 'medium' | 'low';
}

export function detectRegenerationTriggers(
  previousData: Record<string, unknown> | null,
  currentData: Record<string, unknown>
): RegenerationTrigger[] {
  const triggers: RegenerationTrigger[] = [];
  const prev = previousData || {};

  // Differentiator added or changed
  if (
    currentData.differentiator &&
    currentData.differentiator !== prev.differentiator &&
    String(currentData.differentiator).length > 10
  ) {
    triggers.push({
      type: 'differentiator',
      data: currentData.differentiator,
      affectedSections: ['hero', 'problem-solution', 'features', 'final-cta'],
      priority: 'high',
    });
  }

  // Value proposition changed significantly
  if (
    currentData.valueProposition &&
    currentData.valueProposition !== prev.valueProposition &&
    String(currentData.valueProposition).length > 20
  ) {
    triggers.push({
      type: 'value_prop',
      data: currentData.valueProposition,
      affectedSections: ['hero', 'problem-solution', 'features'],
      priority: 'high',
    });
  }

  // New proof point with metric (contains numbers/percentages)
  const prevProofs = (prev.proofPoints as Array<{ raw?: string; number?: string }>) || [];
  const currProofs = (currentData.proofPoints as Array<{ raw?: string; number?: string }>) || [];
  const newProofPoints = currProofs.filter(
    (p) => !prevProofs.some((prevP) => prevP.raw === p.raw || prevP.number === p.number)
  );

  if (newProofPoints.some((p) => /\d+%|\d+\+|\d+x|\d+ years?/i.test(p.raw || p.number || ''))) {
    triggers.push({
      type: 'proof',
      data: newProofPoints,
      affectedSections: ['stats-bar', 'hero', 'final-cta'],
      priority: 'high',
    });
  }

  // New testimonial added
  const prevTestimonials = (prev.testimonials as Array<{ quote?: string }>) || [];
  const currTestimonials = (currentData.testimonials as Array<{ quote?: string }>) || [];
  const newTestimonials = currTestimonials.filter(
    (t) => !prevTestimonials.some((prevT) => prevT.quote === t.quote)
  );

  if (newTestimonials.length > 0) {
    triggers.push({
      type: 'testimonial',
      data: newTestimonials,
      affectedSections: ['social-proof', 'hero'],
      priority: 'medium',
    });
  }

  // Problem statement clarified
  if (
    currentData.problemStatement &&
    currentData.problemStatement !== prev.problemStatement &&
    String(currentData.problemStatement).length > 20
  ) {
    triggers.push({
      type: 'pain',
      data: currentData.problemStatement,
      affectedSections: ['problem-solution', 'hero', 'faq'],
      priority: 'medium',
    });
  }

  // Outcome/benefit changed
  if (
    currentData.desiredOutcome &&
    currentData.desiredOutcome !== prev.desiredOutcome &&
    String(currentData.desiredOutcome).length > 15
  ) {
    triggers.push({
      type: 'outcome',
      data: currentData.desiredOutcome,
      affectedSections: ['hero', 'features', 'final-cta'],
      priority: 'medium',
    });
  }

  // Industry changed (major - affects everything)
  if (currentData.industryCategory && currentData.industryCategory !== prev.industryCategory) {
    triggers.push({
      type: 'industry',
      data: {
        category: currentData.industryCategory,
        subcategory: currentData.industrySubcategory,
      },
      affectedSections: ['all'],
      priority: 'high',
    });
  }

  // CTA goal changed
  if (currentData.pageGoal && currentData.pageGoal !== prev.pageGoal) {
    triggers.push({
      type: 'cta',
      data: currentData.pageGoal,
      affectedSections: ['hero', 'final-cta'],
      priority: 'high',
    });
  }

  return triggers;
}

export function hasSignificantTriggers(triggers: RegenerationTrigger[]): boolean {
  // Significant if any high priority trigger OR 2+ triggers of any priority
  return triggers.some((t) => t.priority === 'high') || triggers.length >= 2;
}

export function getPrimaryTrigger(triggers: RegenerationTrigger[]): RegenerationTrigger | null {
  if (triggers.length === 0) return null;
  
  // Return highest priority trigger, preferring earlier types in case of tie
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return triggers.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])[0];
}
