/**
 * The six messaging choices (from the deterministic archetype optimizer, scored
 * from the owner's own words) handed to the brief writer, so the copy follows
 * them. They steer emphasis, order and voice only: never facts, numbers,
 * guarantees, deadlines or button text. Shared by the wizard (sender), the
 * brief function (prompt) and the page's strategy trace.
 */
export interface MessagingChoices {
  archetype: string;
  evidence: 'thin' | 'some' | 'strong';
  headlineFocus: 'outcome-led' | 'problem-led';
  proofStyle: 'quantitative' | 'narrative';
  commitmentAsk: 'direct' | 'exploratory';
  voiceRegister: 'authoritative' | 'peer-relational';
  urgencySignal: 'present' | 'absent';
  socialProofType: 'authority' | 'testimonial';
}

const ARCHETYPES = ['Analytical Validator', 'Emotional Connector', 'Decisive Commander', 'Cautious Researcher'];
const ENUMS: Record<Exclude<keyof MessagingChoices, 'archetype'>, readonly string[]> = {
  evidence: ['thin', 'some', 'strong'],
  headlineFocus: ['outcome-led', 'problem-led'],
  proofStyle: ['quantitative', 'narrative'],
  commitmentAsk: ['direct', 'exploratory'],
  voiceRegister: ['authoritative', 'peer-relational'],
  urgencySignal: ['present', 'absent'],
  socialProofType: ['authority', 'testimonial'],
};

/** Client-sent choices are only labels; anything outside the known values is dropped whole. */
export function parseMessagingChoices(raw: unknown): MessagingChoices | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.archetype !== 'string' || !ARCHETYPES.includes(r.archetype)) return null;
  const out: Record<string, string> = { archetype: r.archetype };
  for (const [key, allowed] of Object.entries(ENUMS)) {
    const v = r[key] ?? (key === 'evidence' ? 'thin' : undefined);
    if (typeof v !== 'string' || !allowed.includes(v)) return null;
    out[key] = v;
  }
  return out as unknown as MessagingChoices;
}

/** Plain owner-facing wording for each choice (review page, trace, explainer). */
export const CHOICE_LABELS = {
  headlineFocus: { question: 'Lead with the result or the problem?', 'outcome-led': 'The result first', 'problem-led': 'The problem first' },
  proofStyle: { question: 'Prove it with numbers or stories?', quantitative: 'Numbers first', narrative: 'Stories first' },
  commitmentAsk: { question: 'Ask for commitment or curiosity?', direct: 'A direct next step', exploratory: 'A low-pressure next step' },
  voiceRegister: { question: 'Sound like the expert or the ally?', authoritative: 'The expert', 'peer-relational': 'The ally' },
  urgencySignal: { question: 'Create urgency or build patience?', present: 'The cost of waiting', absent: 'No urgency, trust first' },
  socialProofType: { question: 'Show credentials or people?', authority: 'Credentials first', testimonial: 'Customers’ words first' },
} as const;

/** Brief-writer instructions. Every line is about how to say stated things, never what to add. */
export function messagingChoicesPrompt(c: MessagingChoices | null): string {
  if (!c) return '';
  const lean = c.evidence === 'thin'
    ? 'The owner gave little to score, so treat these as leanings: apply them lightly and let the stated content lead.'
    : 'Follow these throughout the brief, its headlines, key points and problem/solution copy.';
  return `
## MESSAGING CHOICES (scored from the owner's own answers before this brief)
${lean}
1. Lead: ${c.headlineFocus === 'problem-led'
    ? 'open the headline options and the page with the problem the buyer has now, in their terms; the result follows.'
    : 'open the headline options and the page with the result the buyer wants; the problem follows.'}
2. Proof: ${c.proofStyle === 'narrative'
    ? 'put the stated story or customer words forward; describe results as what happened to a customer.'
    : 'put the stated numbers forward (counts, years, measured results) exactly as given.'}
3. Ask: ${c.commitmentAsk === 'exploratory'
    ? 'frame the next step as low pressure (a look, a quote, a conversation), using only the stated process.'
    : 'state the next step plainly and confidently, using only the stated process.'} Keep the owner's button text exactly.
4. Voice: ${c.voiceRegister === 'peer-relational'
    ? 'talk to the reader as "you", warm and conversational, like a peer who has seen the problem before.'
    : 'precise and composed, the confidence of an expert; plain words, no jargon.'}
5. Urgency: ${c.urgencySignal === 'absent'
    ? 'none. No time pressure, deadlines, scarcity or "act now" language.'
    : 'you may name the stated cost of leaving the problem alone; never deadlines, scarcity or countdowns.'}
6. Social proof: ${c.socialProofType === 'testimonial'
    ? 'customers’ own words come before credentials.'
    : 'stated credentials, certifications and track record come before customer quotes.'}
These choices change emphasis, order and voice only. They never add facts, numbers, guarantees, deadlines, credentials or button text that the owner did not state.`.trim();
}
