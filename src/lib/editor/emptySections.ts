import { usableVideo, VIDEO_SECTION_HIDDEN } from '../video';
/**
 * Some sections render nothing until the owner supplies real proof (zero
 * fabrication). The sidebar says so instead of listing them as if they show.
 * Mirrors the render gates in SocialProofSection and CredentialsBarSection.
 */
export function hiddenReason(section: { type: string; content?: any } | null | undefined): string | null {
  const c = section?.content || {};
  if (section?.type === 'social-proof') {
    const quote = c.testimonial?.quote;
    return typeof quote === 'string' && quote.length > 10 ? null : 'Hidden until you add a real testimonial';
  }
  if (section?.type === 'video') {
    // Same gate as VideoSection: a real upload in our storage or a supported link.
    const storageOrigin = (import.meta as any).env?.VITE_SUPABASE_URL;
    return usableVideo(c.video, storageOrigin) ? null : VIDEO_SECTION_HIDDEN;
  }
  if (section?.type === 'credentials-bar') {
    const ok = (c.credentials || []).some((x: any) => typeof x?.value === 'string' && x.value.trim() && typeof x?.label === 'string' && x.label.trim());
    return ok ? null : 'Hidden until you add credentials';
  }
  return null;
}
