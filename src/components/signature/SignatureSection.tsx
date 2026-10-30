import type { ReactNode } from 'react';
import type { SignaturePlan } from './selection';
import { ChapterEyebrow, ReframeColumns, GlassCardWithKicker, CtaFork, InversionStatStrip, AmbientLayer } from './elements';
import { sourced } from './selection';

/** Shared render boundary: no copy synthesis, no extra section when content is empty. */
export function SignatureSection({ type, content, children, editing = false }: { type: string; content: Record<string, any>; children: ReactNode; editing?: boolean }) {
  const plan: SignaturePlan | undefined = content.signature;
  if (!plan) return <>{children}</>;
  const has = (element: SignaturePlan['elements'][number]) => plan.elements.includes(element);
  // Only dark/brand plans are deep; 'tinted' is a light surface (it rendered
  // near-black before, turning warm pages' soft payoff into a black band).
  const bgPlan = content.sectionBackground;
  const surface = bgPlan === 'dark' || bgPlan === 'brand' ? 'deep' : bgPlan === 'tinted' ? 'tinted' : 'light';
  let body = children;
  if (!editing && type === 'problem-solution' && has('reframe') && plan.reframe) {
    body = <section className="signature-band" data-surface={surface}><div className="signature-inner"><ReframeColumns reframe={plan.reframe} />{content.problem && content.problem !== plan.reframe.refused && <div className="signature-stakes"><p>{content.problem}</p></div>}{content.solution && <div className="signature-stakes"><p>{content.solution}</p></div>}</div></section>;
  }
  if (!editing && type === 'features' && has('glass') && content.features?.length >= 3) {
    body = <section className="signature-band" data-surface={surface}><div className="signature-inner"><ChapterEyebrow slot="outcome" />{content.title && <h2>{content.title}</h2>}<div className="signature-card-grid">{content.features.map((feature: any, i: number) => <GlassCardWithKicker key={i} kicker={feature.signatureKicker}><h3>{feature.title}</h3><p>{feature.description}</p></GlassCardWithKicker>)}</div></div></section>;
  }
  if (!editing && type === 'final-cta' && has('fork') && plan.primary && plan.secondary) {
    body = <section className="signature-band signature-compact" data-surface={surface}><div className="signature-inner"><ChapterEyebrow slot="cta" />{content.headline && <h2>{content.headline}</h2>}<CtaFork plan={plan} primaryHref={content.ctaLink} secondaryHref={content.secondaryCtaLink} /></div></section>;
  }
  const ambient = has('ambient') && (type === 'differentiator-callout' || type === 'final-cta') && surface === 'deep';
  return <div className="signature-scope" data-signature={type} data-intensity={plan.intensity} data-elements={plan.elements.join(' ')}>{ambient && <AmbientLayer motif={plan.intensity === 'expressive'} />}<div className="signature-content">{body}{type === 'hero' && has('stats') && <InversionStatStrip stats={plan.stats} />}</div></div>;
}