import { MagneticCta } from '@/components/motion/MagneticCta';
import { StatCountUp } from '@/components/motion/StatCountUp';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { signatureTokens } from '@/lib/design/tokens';
import { payoffPhrase, sourced, validStat, type SignaturePlan, type SignatureStat, type SourceText } from './selection';
import type { ArcSlot } from '@/lib/composition/arc';

export function ChapterEyebrow({ slot, className = '' }: { slot: ArcSlot; className?: string }) {
  return <p className={`signature-chapter ${className}`}>{signatureTokens.labels[slot]}</p>;
}
export function GradientPayoff({ text, phrase, enabled = true }: { text: string; phrase?: string | null; enabled?: boolean }) {
  const payoff = enabled ? payoffPhrase(text, phrase) : null;
  if (!payoff) return <>{text}</>;
  const at = text.indexOf(payoff);
  return <>{text.slice(0, at)}<span className="signature-payoff">{payoff}</span>{text.slice(at + payoff.length)}</>;
}
export function InversionStatStrip({ stats }: { stats: SignatureStat[] }) {
  const valid = stats.filter(validStat);
  if (!valid.length) return null;
  return <dl className="signature-stat-strip">{valid.map((stat, i) => <div key={i}><dt>{stat.label}</dt><dd className="signature-stat-value"><StatCountUp value={stat.value} /></dd><dd className="signature-citation" title={stat.evidence.source}>{stat.evidence.field}: {stat.evidence.text}</dd></div>)}</dl>;
}
export function GlassCardWithKicker({ children, kicker }: { children: ReactNode; kicker?: SourceText | null }) {
  // No fabricated takeaway, and numeric kickers cannot bypass citation.
  const earned = sourced(kicker);
  return <article className="signature-glass">{children}{earned && <div className="signature-kicker"><p>{kicker.text}</p>{/\d|\b(zero|one|two|three|four|five|six|seven|eight|nine|ten|fifty)\b/i.test(kicker.text) && <small className="signature-citation" title={kicker.source}>{kicker.field}: {kicker.source}</small>}</div>}</article>;
}
export function ChromaticMarker({ index, total }: { index: number; total: number }) {
  const step = total < 2 ? 0 : Math.min(4, Math.round(index / (total - 1) * 4));
  return <span aria-hidden="true" className={`signature-timeline-marker signature-step-${step}`} />;
}
export function ReframeColumns({ reframe }: { reframe: NonNullable<SignaturePlan['reframe']> }) {
  return <div className="signature-two-columns"><div className="signature-dimmed"><ChapterEyebrow slot="problem" /><p className="signature-reframe-text">{reframe.refused}</p></div><GlassCardWithKicker><ChapterEyebrow slot="guide" /><p className="signature-reframe-text">{reframe.approach}</p></GlassCardWithKicker></div>;
}
export function CtaFork({ plan, primaryHref, secondaryHref }: { plan: SignaturePlan; primaryHref?: string; secondaryHref?: string }) {
  if (!plan.primary || !plan.secondary) return null;
  return <div className="signature-two-columns">{[plan.primary, plan.secondary].map((cta, i) => <GlassCardWithKicker key={i}><h3>{cta}</h3>{plan.terms.length > 0 && <ul className="signature-checklist">{plan.terms.filter(sourced).map((term, n) => <li key={n}><Check size={16} aria-hidden="true" /><span>{term.text}</span></li>)}</ul>}{i === 0 ? <MagneticCta><Button asChild variant="default" className="signature-cta pc-cta-primary"><a href={primaryHref || '#contact'}>{cta}</a></Button></MagneticCta> : <Button asChild variant="outline" className="signature-cta"><a href={secondaryHref || '#contact'}>{cta}</a></Button>}{sourced(plan.microline) && <p className="signature-microline">{plan.microline.text}</p>}</GlassCardWithKicker>)}</div>;
}
export function AmbientLayer({ motif = false }: { motif?: boolean }) {
  return <div aria-hidden="true" className={`signature-ambient ${motif ? 'signature-motif' : ''}`} />;
}