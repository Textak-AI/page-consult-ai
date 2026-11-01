/**
 * Page Score from what is actually on the page and what the owner actually
 * said. Replaces bars that were the overall score times a fixed multiplier and
 * checklist items that ticked on unrelated thresholds (a "guarantee" for having
 * a CTA, "named sources" at 60%).
 *
 * Every factor is a fact the owner can check. Nothing here asks for a
 * guarantee or urgency: those are claims the product never invents, so they
 * are never a to-do. Section gates come from the same rules the renderers use
 * (hiddenReason, sectionUnlocks).
 */
import { hiddenReason } from './editor/emptySections';
import { processStated } from './sectionUnlocks';

export type ScoreCategoryId = 'brand' | 'authority' | 'proof' | 'trust';

export interface ScoreFactor {
  id: string;
  label: string;
  complete: boolean;
  /** Section to jump to when it's missing. */
  section?: string;
}

export interface ScoreCategory { id: ScoreCategoryId; factors: ScoreFactor[]; value: number }

const text = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');

type Section = { type: string; visible?: boolean; content?: any };

function shown(sections: Section[], type: string): Section | undefined {
  return sections.find((s) => s.type === type && s.visible !== false && !hiddenReason(s));
}

export function pageScoreFactors(cd: Record<string, any> | null | undefined, sections: Section[] | null | undefined, logoUrl?: string | null): Record<ScoreCategoryId, ScoreFactor[]> {
  const d = cd || {};
  const s = sections || [];
  const hero = shown(s, 'hero')?.content || {};
  const proof = shown(s, 'social-proof')?.content;
  const quote = proof?.testimonial;
  const howItWorks = shown(s, 'how-it-works')?.content;
  const features = shown(s, 'features')?.content;
  const faq = shown(s, 'faq')?.content;
  const close = shown(s, 'final-cta')?.content;

  return {
    brand: [
      { id: 'logo', label: 'Your logo', complete: !!(logoUrl || d.logoUrl || d.brandSettings?.logoUrl), section: 'hero' },
      { id: 'colors', label: 'Your brand colors', complete: !!(d.brandColors?.primary || d.brandSettings?.primaryColor || d.primaryColor), section: 'hero' },
      { id: 'headline', label: 'A headline on the page', complete: text(hero.headline).length > 10, section: 'hero' },
      { id: 'cta', label: 'Your button text', complete: !!(text(hero.ctaText) || text(d.ctaText)), section: 'hero' },
    ],
    authority: [
      { id: 'credentials', label: 'Credentials or recognition you named', complete: !!(text(d.achievements) || text(d.credentials) || (Array.isArray(d.authorityMarkers) && d.authorityMarkers.some((m: unknown) => text(m)))) },
      { id: 'count', label: 'A client or customer count you stated', complete: !!text(d.clientCount) },
      { id: 'process', label: 'How It Works on the page', complete: Array.isArray(howItWorks?.steps) && howItWorks.steps.length >= 2, section: 'how-it-works' },
      { id: 'features', label: 'What the offer includes', complete: Array.isArray(features?.features) && features.features.length >= 2, section: 'features' },
    ],
    proof: [
      { id: 'quote', label: 'A real client quote on the page', complete: !!quote, section: 'social-proof' },
      { id: 'named', label: 'The quote says who said it', complete: !!(quote && (text(quote.author) || text(quote.role) || /\s[-–—]\s*\S/.test(text(quote.quote)))), section: 'social-proof' },
      { id: 'result', label: 'A result a client got', complete: !!text(d.concreteProofStory) },
    ],
    trust: [
      { id: 'faq', label: 'Answers to buyer questions (FAQ)', complete: Array.isArray(faq?.items) && faq.items.length >= 2, section: 'faq' },
      { id: 'next', label: 'What happens after they reach out', complete: processStated(d) || (Array.isArray(howItWorks?.steps) && howItWorks.steps.length >= 2), section: 'how-it-works' },
      { id: 'close', label: 'A closing call to action', complete: !!text(close?.ctaText), section: 'final-cta' },
    ],
  };
}

export function pageScore(cd: Record<string, any> | null | undefined, sections: Section[] | null | undefined, logoUrl?: string | null): { categories: ScoreCategory[]; overall: number } {
  const f = pageScoreFactors(cd, sections, logoUrl);
  const categories = (Object.keys(f) as ScoreCategoryId[]).map((id) => {
    const done = f[id].filter((x) => x.complete).length;
    return { id, factors: f[id], value: Math.round((done / f[id].length) * 100) };
  });
  const overall = Math.round(categories.reduce((sum, c) => sum + c.value, 0) / categories.length);
  return { categories, overall };
}

export function scoreLabel(score: number): string {
  if (score >= 90) return 'Ready to publish';
  if (score >= 75) return 'Strong';
  if (score >= 50) return 'Good start';
  if (score >= 25) return 'Needs your answers';
  return 'Getting started';
}
