/**
 * Video on product pages (Nov 1). Three placements share one shape:
 *  - a Video section (type 'video', content.video)
 *  - a video under any section (content.attachedVideo)
 *  - a hero background (hero content.backgroundVideo, uploads only, muted loop)
 *
 * A video is either an owner upload in their own brand-assets folder or a link
 * to a known host (YouTube, Vimeo, Loom, Wistia) turned into that host's embed
 * URL. Nothing else renders: no arbitrary URLs, no stock footage. A lower third
 * (name, role) is the owner's own words and shows on uploaded videos only.
 */

export const VIDEO_RULES = {
  maxBytes: 50 * 1024 * 1024,
  types: { 'video/mp4': 'mp4', 'video/webm': 'webm', 'video/quicktime': 'mov' } as Record<string, string>,
  /** The lower third shows before play and for this long after play starts. */
  lowerThirdSeconds: 6,
} as const;

export type VideoProvider = 'youtube' | 'vimeo' | 'loom' | 'wistia';

export interface LowerThird { name?: string; role?: string }

export type PageVideo =
  | { source: 'upload'; url: string; storagePath: string; mime: string; poster?: string | null; lowerThird?: LowerThird | null; title?: string }
  | { source: 'link'; provider: VideoProvider; url: string; embedUrl: string; title?: string };

const clean = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');
const ID = /^[A-Za-z0-9_-]{6,64}$/;

/** A pasted link from a supported host -> its embed URL. Anything else -> null. */
export function parseVideoLink(input: unknown): { provider: VideoProvider; embedUrl: string; url: string } | null {
  const raw = clean(input);
  if (!raw) return null;
  let u: URL;
  try { u = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`); } catch { return null; }
  if (u.protocol !== 'https:' && u.protocol !== 'http:') return null;
  const host = u.hostname.replace(/^www\.|^m\./, '');
  const parts = u.pathname.split('/').filter(Boolean);
  const url = u.href;

  if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    const id = u.searchParams.get('v') || (['embed', 'shorts', 'live'].includes(parts[0]) ? parts[1] : '');
    return id && ID.test(id) ? { provider: 'youtube', url, embedUrl: `https://www.youtube-nocookie.com/embed/${id}?rel=0` } : null;
  }
  if (host === 'youtu.be') {
    const id = parts[0] || '';
    return ID.test(id) ? { provider: 'youtube', url, embedUrl: `https://www.youtube-nocookie.com/embed/${id}?rel=0` } : null;
  }
  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    const id = parts.find((p) => /^\d{5,12}$/.test(p));
    return id ? { provider: 'vimeo', url, embedUrl: `https://player.vimeo.com/video/${id}?dnt=1` } : null;
  }
  if (host === 'loom.com') {
    const i = parts.findIndex((p) => p === 'share' || p === 'embed');
    const id = i >= 0 ? parts[i + 1] : '';
    return id && ID.test(id) ? { provider: 'loom', url, embedUrl: `https://www.loom.com/embed/${id}` } : null;
  }
  if (host.endsWith('wistia.com') || host.endsWith('wistia.net')) {
    const i = parts.findIndex((p) => p === 'medias' || p === 'iframe');
    const id = i >= 0 ? parts[i + 1] : '';
    return id && ID.test(id) ? { provider: 'wistia', url, embedUrl: `https://fast.wistia.net/embed/iframe/${id}` } : null;
  }
  return null;
}

/** Upload checks before any bytes leave the browser. */
export function videoFileError(file: { type: string; size: number }): string | null {
  if (!VIDEO_RULES.types[file.type]) return 'Choose an MP4, MOV or WebM video.';
  if (file.size > VIDEO_RULES.maxBytes) return 'Videos must be 50 MB or smaller. Shorter clips, or a YouTube or Vimeo link, work best.';
  return null;
}

const ownStorage = (url: string, storageOrigin?: string) =>
  !!storageOrigin && url.startsWith(`${storageOrigin.replace(/\/$/, '')}/storage/v1/object/public/brand-assets/`);

/**
 * The only videos that render: uploads in our own storage, or links that still
 * parse to a supported host (the stored embed URL is rebuilt, never trusted).
 */
export function usableVideo(value: unknown, storageOrigin?: string): PageVideo | null {
  const v = value as Partial<PageVideo> | null | undefined;
  if (!v || typeof v !== 'object') return null;
  const title = clean((v as any).title) || undefined;
  if (v.source === 'upload') {
    const url = clean((v as any).url);
    if (!url || !ownStorage(url, storageOrigin) || !VIDEO_RULES.types[clean((v as any).mime)]) return null;
    const poster = clean((v as any).poster);
    const lt = (v as any).lowerThird || {};
    const lowerThird = clean(lt.name) || clean(lt.role) ? { name: clean(lt.name) || undefined, role: clean(lt.role) || undefined } : null;
    return { source: 'upload', url, storagePath: clean((v as any).storagePath), mime: clean((v as any).mime), poster: poster && ownStorage(poster, storageOrigin) ? poster : null, lowerThird, title };
  }
  if (v.source === 'link') {
    const parsed = parseVideoLink((v as any).url);
    return parsed ? { source: 'link', ...parsed, title } : null;
  }
  return null;
}

/** Hero backgrounds are muted loops, so only uploads qualify. */
export function usableBackgroundVideo(value: unknown, storageOrigin?: string): Extract<PageVideo, { source: 'upload' }> | null {
  const v = usableVideo(value, storageOrigin);
  return v && v.source === 'upload' ? v : null;
}

/** Where a video goes. Section types that already own a video slot are excluded from "attach". */
export type VideoPlacement = 'section' | 'attach' | 'background';
export const NO_ATTACH_TYPES = new Set(['hero', 'video', 'work-samples']);

export function canAttachVideo(type: string): boolean {
  return !NO_ATTACH_TYPES.has(type);
}

export const VIDEO_SECTION_HIDDEN = 'Hidden until you add a video';
