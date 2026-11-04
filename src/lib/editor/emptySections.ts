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
  if (section?.type === 'client-results') {
    // Same quality floor as LivePreview / PublicPageRenderer: at least two real numbers with a label.
    const results = c.results || c.statistics || c.stats || [];
    const valid = (Array.isArray(results) ? results : []).filter((s: any) => {
      const value = String(s?.metric || s?.value || '');
      const label = String(s?.description || s?.label || '');
      return /\d/.test(value) && label.length >= 5 && label.trim().split(/\s+/).length <= 8;
    });
    return valid.length >= 2 ? null : 'Hidden until you add two real results with numbers';
  }
  if (section?.type === 'credentials-bar') {
    const ok = (c.credentials || []).some((x: any) => typeof x?.value === 'string' && x.value.trim() && typeof x?.label === 'string' && x.label.trim());
    return ok ? null : 'Hidden until you add credentials';
  }
  return null;
}
