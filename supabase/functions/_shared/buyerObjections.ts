/** Prompts are questions, never answers. Shared by both consultation paths and generation guards. */
export const BUYER_OBJECTION_PROMPTS = [
  { topic: 'pricing', question: 'What does it cost, or how does pricing work?' },
  { topic: 'timeline', question: 'How long does it take?' },
  { topic: 'effort', question: 'What do you need from the buyer’s team?' },
  { topic: 'fit', question: 'How does it fit with the tools or way of working they already use?' },
  { topic: 'materials', question: 'What happens to the buyer’s data or materials?' },
] as const;
export type BuyerObjectionTopic = typeof BUYER_OBJECTION_PROMPTS[number]['topic'];
export interface BuyerObjection { topic?: BuyerObjectionTopic; question: string; answer: string }
export function materialsRelevant(input: Record<string, any>): boolean {
  const business = ['industry', 'industryCategory', 'industrySubcategory', 'industryOther', 'mainOffer', 'offerIncludes', 'serviceType', 'businessType'].map(k => typeof input[k] === 'string' ? input[k] : '').join(' ');
  return /\b(software|saas|platform|data|technology|automation|consulting|consultant|agency|design|marketing|branding|brand|creative|legal|law|accounting|financial|health|medical|manufactur\w*|logistics|storage|repair|print\w*|document\w*|content|material\w*)\b/i.test(business);
}
export function answeredObjections<T extends BuyerObjection = BuyerObjection>(value: unknown): T[] {
  if (!Array.isArray(value)) return [];
  return value.filter((o): o is T => !!o && typeof o.question === 'string' && !!o.question.trim() && typeof o.answer === 'string' && !!o.answer.trim() && !/^(skip|skipped|not specified|not yet known|none provided|n\/a|unknown)$/i.test(o.answer.trim()));
}
/** No model output or market predictions can authorize an answer. */
export function consultationObjections(input: Record<string, any>): BuyerObjection[] {
  if (Array.isArray(input.objections)) return answeredObjections(input.objections).filter(o => o.topic !== 'materials' || materialsRelevant(input));
  // Chat prompts use the canonical question verbatim; take only the user's immediate response.
  const history = input.conversationHistory;
  if (!Array.isArray(history)) return [];
  return BUYER_OBJECTION_PROMPTS.flatMap(prompt => {
    if (prompt.topic === 'materials' && !materialsRelevant(input)) return [];
    for (let i = history.length - 2; i >= 0; i--) {
      if (history[i]?.role !== 'assistant' || !String(history[i].content).includes(prompt.question)) continue;
      const reply = history[i + 1];
      if (reply?.role !== 'user') return [];
      return answeredObjections([{ ...prompt, answer: reply.content }]);
    }
    return [];
  });
}
export const BUYER_OBJECTION_RULES = `BUYER OBJECTIONS: Ask these questions explicitly, each skippable; never guess answers:
${BUYER_OBJECTION_PROMPTS.map(p => `${p.topic}: ${p.question}`).join('\n')}
Ask the data/materials question only when the stated business handles buyer data, documents, creative assets, products or other materials. Ask about the current situation and practical implications, not a leading promised benefit. Use the canonical question verbatim when interviewing. A skip is final; do not ask again. Only client-answered question/answer pairs can enter objections or FAQ. Copy their answers verbatim; no default rebuttals, inferred policies, invented guarantees, pricing, timings, integrations or security claims. Do not publish unanswered questions. At least two answered pairs are needed for a FAQ section.`;

export function applyAnsweredObjections(brief: Record<string, any>, input: Record<string, any>) {
  brief.objections = consultationObjections(input);
  if (Array.isArray(brief.pageStructure)) {
    brief.pageStructure = brief.pageStructure.filter((t: string) => t !== 'faq');
    if (brief.objections.length >= 2) {
      const cta = brief.pageStructure.findIndex((t: string) => t === 'final-cta');
      brief.pageStructure.splice(cta < 0 ? brief.pageStructure.length : cta, 0, 'faq');
    }
  }
}