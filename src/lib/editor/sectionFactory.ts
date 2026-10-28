// Builds content for a section added from the editor's Add Section menu.
// ZERO FABRICATION: content comes verbatim from the user's strategy brief /
// consultation, otherwise bracketed placeholders the user must replace.
// Section types whose renderers need real numbers (stats, credentials, results)
// or ship built-in claims (risk reversal, comparison) are deliberately not offered.

export interface AddableSectionType {
  type: string;
  label: string;
  description: string;
}

export const ADDABLE_SECTION_TYPES: AddableSectionType[] = [
  { type: 'problem-solution', label: 'Problem / Solution', description: 'The problem you solve and how' },
  { type: 'features', label: 'Features', description: 'Your key benefits or pillars' },
  { type: 'how-it-works', label: 'How It Works', description: 'Your process, step by step' },
  { type: 'social-proof', label: 'Testimonial', description: 'A real client quote' },
  { type: 'faq', label: 'FAQ', description: 'Questions and answers' },
  { type: 'photo-gallery', label: 'Photo Gallery', description: 'Your own photos' },
  { type: 'differentiator-callout', label: 'Differentiator', description: 'One line on what makes you different' },
  { type: 'audience-fit', label: 'Who It’s For', description: 'Who this is and isn’t for' },
  { type: 'the-real-challenge', label: 'The Real Challenge', description: 'Challenges your clients face' },
  { type: 'our-approach', label: 'Our Approach', description: 'Principles behind how you work' },
  { type: 'expertise-areas', label: 'Expertise Areas', description: 'What you specialize in' },
  { type: 'engagement-model', label: 'Engagement Model', description: 'How working with you unfolds' },
];

export interface BriefSource {
  messagingPillars?: { title?: string; description?: string; icon?: string }[];
  problemStatement?: string;
  solutionStatement?: string;
  processSteps?: { step?: number; title?: string; description?: string }[];
  objections?: { question?: string; answer?: string }[];
  testimonials?: { quote?: string; author?: string | null; title?: string | null }[];
}

const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '');
const pillars = (b: BriefSource) =>
  (b.messagingPillars || []).filter((p) => str(p.title) && str(p.description));
const steps = (b: BriefSource) =>
  (b.processSteps || []).filter((s) => str(s.title) && str(s.description));
const objections = (b: BriefSource) =>
  (b.objections || []).filter((o) => str(o.question) && str(o.answer));

const placeholderItems = (n: number, title: string, body: string) =>
  Array.from({ length: n }, (_, i) => ({ title: `[${title} ${i + 1}]`, description: `[${body}]` }));

export function buildSectionContent(
  type: string,
  brief: BriefSource | null | undefined,
  extra: { uniqueValue?: string | null } = {},
): Record<string, any> {
  const b = brief || {};
  switch (type) {
    case 'problem-solution':
      return {
        problemTitle: 'The Challenge',
        problem: str(b.problemStatement) || '[Describe the problem your client faces]',
        solutionTitle: 'Our Solution',
        solution: str(b.solutionStatement) || '[Describe how you solve it]',
      };
    case 'features': {
      const p = pillars(b);
      return {
        title: '[Section title]',
        features: p.length
          ? p.map((x) => ({ title: x.title, description: x.description, icon: x.icon }))
          : placeholderItems(3, 'Feature', 'Describe this benefit in your own words'),
      };
    }
    case 'how-it-works': {
      const s = steps(b);
      return {
        title: '[How it works]',
        steps: s.length
          ? s.map((x, i) => ({ number: x.step ?? i + 1, title: x.title, description: x.description }))
          : placeholderItems(3, 'Step', 'Describe what happens in this step').map((x, i) => ({ number: i + 1, ...x })),
      };
    }
    case 'social-proof': {
      const real = (b.testimonials || []).find((t) => str(t.quote).length > 10);
      return {
        testimonial: real
          ? { quote: real.quote, name: real.author || null, title: real.title || null, company: '' }
          : { quote: '[Paste a real client quote here, word for word]', name: null, title: null, company: '' },
      };
    }
    case 'faq': {
      const o = objections(b);
      return {
        headline: '[Frequently asked questions]',
        items: o.length
          ? o.map((x) => ({ question: x.question, answer: x.answer }))
          : Array.from({ length: 3 }, (_, i) => ({ question: `[Question ${i + 1}]`, answer: '[Your answer]' })),
      };
    }
    case 'photo-gallery':
      return { title: '[Gallery title]', images: [] };
    case 'differentiator-callout':
      return { text: str(extra.uniqueValue) || '[What makes you different, in one sentence]' };
    case 'audience-fit':
      return { forWho: '[Who this is for]', notForWho: '[Who this is not for]' };
    case 'the-real-challenge': {
      const o = objections(b);
      return {
        headline: '[The real challenge]',
        challenges: o.length
          ? o.slice(0, 3).map((x) => ({ title: x.question, description: x.answer }))
          : placeholderItems(3, 'Challenge', 'Describe this challenge'),
      };
    }
    case 'our-approach': {
      const p = pillars(b);
      return {
        headline: '[Our approach]',
        principles: p.length
          ? p.slice(0, 3).map((x) => ({ title: x.title, description: x.description, icon: x.icon }))
          : placeholderItems(3, 'Principle', 'Describe this principle'),
      };
    }
    case 'expertise-areas': {
      const p = pillars(b);
      return {
        headline: '[Areas of expertise]',
        areas: p.length
          ? p.map((x) => ({ title: x.title, description: x.description, icon: x.icon }))
          : placeholderItems(3, 'Expertise area', 'Describe this area'),
      };
    }
    case 'engagement-model': {
      const s = steps(b);
      return {
        headline: '[How we work together]',
        steps: s.length
          ? s.map((x, i) => ({ number: x.step ?? i + 1, title: x.title, description: x.description }))
          : placeholderItems(3, 'Phase', 'Describe this phase').map((x, i) => ({ number: i + 1, ...x })),
      };
    }
    default:
      return {};
  }
}
