/**
 * Customer onboarding (Oct 31): one short welcome after signup, once per
 * account. It asks for the owner's name, business name and (optionally)
 * website, explains the three steps, then hands off to the wizard. When a
 * website is given, the wizard's website step starts reading it straight away.
 */

const clean = (v: unknown): string => (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim() : '');

/** "acme.com", "www.acme.com/about" -> "https://acme.com", "https://www.acme.com/about". Empty or not a web address -> null. */
export function normalizeWebsite(input: unknown): string | null {
  const t = clean(input);
  if (!t) return null;
  const withScheme = /^https?:\/\//i.test(t) ? t : `https://${t}`;
  try {
    const u = new URL(withScheme);
    if (!/^https?:$/.test(u.protocol)) return null;
    if (!u.hostname.includes('.') || /\s/.test(t)) return null;
    return u.href.replace(/\/$/, '');
  } catch {
    return null;
  }
}

/** The name to greet someone by: the first word of what they told us. Never an email prefix. */
export function firstNameOf(fullName: unknown): string {
  return clean(fullName).split(' ')[0] || '';
}

export interface OnboardingAnswers {
  name: string;
  businessName: string;
  website: string;
}

export function onboardingErrors(a: OnboardingAnswers): Partial<Record<keyof OnboardingAnswers, string>> {
  const errors: Partial<Record<keyof OnboardingAnswers, string>> = {};
  if (!clean(a.name)) errors.name = 'Add the name you go by.';
  if (!clean(a.businessName)) errors.businessName = 'Add your business name.';
  if (clean(a.website) && !normalizeWebsite(a.website)) errors.website = 'That doesn\'t look like a web address. Try yourbusiness.com, or leave it blank.';
  return errors;
}

/** Hand-off from /welcome to /wizard/form (router state, never the URL). */
export interface OnboardingHandoff {
  businessName: string;
  websiteUrl: string | null;
}

export function readOnboardingHandoff(state: unknown): OnboardingHandoff | null {
  const o = (state as { onboarding?: Partial<OnboardingHandoff> } | null)?.onboarding;
  if (!o) return null;
  const businessName = clean(o.businessName);
  const websiteUrl = normalizeWebsite(o.websiteUrl);
  return businessName || websiteUrl ? { businessName, websiteUrl } : null;
}

/** A signed-in account goes through /welcome only when onboarded_at is empty. A missing column (migration not applied) never blocks anyone. */
export function needsOnboarding(profile: { onboarded_at?: string | null } | null, queryFailed: boolean): boolean {
  if (queryFailed) return false;
  return !profile?.onboarded_at;
}

export const HOW_IT_WORKS = [
  {
    title: 'Answer questions about your business',
    body: 'Your offer, your buyers, and the proof you have. Your page is written from these answers.',
  },
  {
    title: 'Review your Strategy Brief',
    body: 'We turn your answers into a plan for the page. Check it before anything is built.',
  },
  {
    title: 'Edit and publish',
    body: 'Change any section yourself or ask Page Chat, then publish when you\'re ready.',
  },
] as const;
