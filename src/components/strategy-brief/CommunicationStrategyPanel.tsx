import type { CommunicationStrategy } from '@/lib/composition/communicationStrategy';

export function CommunicationStrategyPanel({ strategy }: { strategy?: CommunicationStrategy | null }) {
  if (!strategy) return null;
  const field = (label: string, value: string | null) => value ? <div><dt className="text-sm text-muted-foreground mb-1">{label}</dt><dd className="text-foreground leading-relaxed break-words">{value}</dd></div> : null;
  return <section aria-label="Communication Strategy" className="text-foreground border-t border-border py-6">
    <h2 className="text-xl font-semibold mb-5">Communication Strategy</h2>
    <dl className="space-y-5">
      {field('Reframe', strategy.reframe)}
      {field('Stakes', strategy.stakes)}
      {field('One-liner', strategy.oneLiner)}
      {strategy.mechanismName && field('Mechanism suggestion — awaiting approval, not used on page', strategy.mechanismName.name)}
      {field('Arc emphasis', strategy.arcEmphasis)}
      <div><dt className="text-sm text-muted-foreground mb-1">Proof plan</dt><dd>{strategy.proofPlan.length ? <ul className="space-y-3">{strategy.proofPlan.map((p, i) => <li key={i}><p>{p.evidence}</p><p className="text-sm text-muted-foreground">Attached to: {p.claim}</p></li>)}</ul> : <span className="text-muted-foreground">No matching proof supplied.</span>}</dd></div>
      {field('Primary ask', strategy.ctaLadder.primary)}
      {field('Secondary path', strategy.ctaLadder.secondary)}
      {field('Register', strategy.register)}
      {field('Visual intensity', strategy.visualIntensity)}
    </dl>
  </section>;
}