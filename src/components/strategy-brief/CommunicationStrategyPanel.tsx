import type { CommunicationStrategy } from '@/lib/composition/communicationStrategy';

/** Plain labels: owners see how the page will talk, never the composition machinery behind it. */
const OPENS_WITH: Record<string, string> = {
  'problem-led': 'The problem they have now',
  'outcome-led': 'The result they want',
};

export function CommunicationStrategyPanel({ strategy }: { strategy?: CommunicationStrategy | null }) {
  if (!strategy) return null;
  const field = (label: string, value: string | null | undefined) => value ? <div><dt className="text-sm opacity-70 mb-1">{label}</dt><dd className="leading-relaxed break-words">{value}</dd></div> : null;
  const opensWith = strategy.arcEmphasis ? OPENS_WITH[strategy.arcEmphasis] || null : null;
  return <section aria-label="How the page talks to your buyer" className="py-6">
    <h2 className="text-xl font-semibold mb-5">How the page talks to your buyer</h2>
    <dl className="space-y-5">
      {field('How we frame it', strategy.reframe)}
      {field("What's at stake for them", strategy.stakes)}
      {field('What they get', strategy.oneLiner)}
      {field('The page opens with', opensWith)}
      {strategy.proofPlan.length > 0 && <div><dt className="text-sm opacity-70 mb-1">Your proof, and what it backs up</dt><dd><ul className="space-y-3">{strategy.proofPlan.map((p, i) => <li key={i}><p>{p.evidence}</p><p className="text-sm opacity-70">Backs up: {p.claim}</p></li>)}</ul></dd></div>}
      {field('Main button', strategy.ctaLadder.primary)}
      {field('Second option', strategy.ctaLadder.secondary)}
    </dl>
  </section>;
}
