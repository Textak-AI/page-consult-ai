/**
 * Logo audit: decides whether an image is usable as a brand logo.
 * Used at extraction time (bad candidates are discarded, never stored), on upload,
 * and at render time (stored logos that no longer load collapse instead of breaking).
 */

import { IMAGE_RULES, judgeImageFacts } from '../../supabase/functions/_shared/imageAudit';
export const LOGO_RULES = {
  ...IMAGE_RULES,
  /** Shorter side must be at least this many natural pixels (rejects 1×1 tracking pixels and slivers). */
  /** Longer side must be at least this many natural pixels (rejects 16/32/48px favicons). */
  /** Social-preview images (OG/Twitter cards) are photos, not logos. */
  socialMinWidth: 1000,
  socialAspect: [1.85, 1.95] as const,
  /** Pixel check: a pixel is "visible" above this alpha (0–255). */
  /** Pixel check: visible pixels whose channels all stay within this range count as one solid colour. */
} as const;

const SOCIAL_URL = /(og[-_]?image|opengraph|open-graph|twitter[-_]?(card|image)|social[-_]?(share|preview|card)|share[-_]?image)/i;

export type LogoRejection =
  | 'missing'
  | 'not-an-image-url'
  | 'social-preview-image'
  | 'failed-to-load'
  | 'too-small'
  | 'fully-transparent'
  | 'solid-color';

export interface LogoVerdict {
  ok: boolean;
  reason?: LogoRejection;
  width?: number;
  height?: number;
  /** false when the host blocks pixel reads (CORS); size rules still applied. */
  pixelsChecked?: boolean;
}

/** Synchronous checks on the URL alone. */
export function judgeLogoUrl(url: string | null | undefined): LogoVerdict {
  if (!url || !url.trim()) return { ok: false, reason: 'missing' };
  const u = url.trim();
  if (!/^(https?:|data:image\/|blob:)/i.test(u)) return { ok: false, reason: 'not-an-image-url' };
  if (!u.startsWith('data:') && SOCIAL_URL.test(u)) return { ok: false, reason: 'social-preview-image' };
  return { ok: true };
}

/** Pure decision on measured facts (unit-tested). Vector images with no intrinsic size pass the size rule. */
export function judgeLogo(f: {
  url: string;
  width: number;
  height: number;
  isVector?: boolean;
  purpose?: 'logo' | 'work-sample';
  pixels?: Uint8ClampedArray | null;
}): LogoVerdict {
  const base = f.purpose === 'work-sample' ? { ok: true } : judgeLogoUrl(f.url);
  if (!base.ok) return base;
  const { width: w, height: h } = f;
  if (f.purpose === 'work-sample') return judgeImageFacts(w, h, f.pixels);
  const sized = w > 0 && h > 0;
  if (!sized && !f.isVector) return { ok: false, reason: 'too-small', width: w, height: h };
  if (sized) {
    if (Math.min(w, h) < LOGO_RULES.minShortSide || Math.max(w, h) < LOGO_RULES.minLongSide)
      return { ok: false, reason: 'too-small', width: w, height: h };
    const ratio = w / h;
    if (w >= LOGO_RULES.socialMinWidth && ratio >= LOGO_RULES.socialAspect[0] && ratio <= LOGO_RULES.socialAspect[1])
      return { ok: false, reason: 'social-preview-image', width: w, height: h };
  }
  if (f.pixels) {
    const p = f.pixels;
    let visible = 0;
    const min = [255, 255, 255];
    const max = [0, 0, 0];
    for (let i = 0; i < p.length; i += 4) {
      if (p[i + 3] <= LOGO_RULES.visibleAlpha) continue;
      visible++;
      for (let c = 0; c < 3; c++) {
        if (p[i + c] < min[c]) min[c] = p[i + c];
        if (p[i + c] > max[c]) max[c] = p[i + c];
      }
    }
    if (visible === 0) return { ok: false, reason: 'fully-transparent', width: w, height: h, pixelsChecked: true };
    // A logo with transparency has a shape even if single-coloured; only an opaque single colour is a blank box.
    const total = p.length / 4;
    const allOpaque = visible === total;
    const solid = [0, 1, 2].every((c) => max[c] - min[c] <= LOGO_RULES.solidTolerance);
    if (solid && allOpaque) return { ok: false, reason: 'solid-color', width: w, height: h, pixelsChecked: true };
    return { ok: true, width: w, height: h, pixelsChecked: true };
  }
  return { ok: true, width: w, height: h, pixelsChecked: false };
}

export function loadImage(url: string, cors: boolean): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    if (cors) img.crossOrigin = 'anonymous';
    const t = setTimeout(() => resolve(null), LOGO_RULES.timeoutMs);
    img.onload = () => {
      clearTimeout(t);
      (img.decode ? img.decode() : Promise.resolve()).then(() => resolve(img), () => resolve(null));
    };
    img.onerror = () => {
      clearTimeout(t);
      resolve(null);
    };
    img.src = url;
  });
}

export function readPixels(img: HTMLImageElement): Uint8ClampedArray | null {
  try {
    const w = img.naturalWidth || 128;
    const h = img.naturalHeight || 128;
    const scale = Math.min(1, 64 / Math.max(w, h));
    const cw = Math.max(1, Math.round(w * scale));
    const ch = Math.max(1, Math.round(h * scale));
    const canvas = document.createElement('canvas');
    canvas.width = cw;
    canvas.height = ch;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, cw, ch);
    return ctx.getImageData(0, 0, cw, ch).data;
  } catch {
    return null; // tainted canvas (host has no CORS headers)
  }
}

const cache = new Map<string, Promise<LogoVerdict>>();

/** Full audit: URL rules, loads + decodes, size rules, then pixel rules when the host allows reading pixels. */
export function auditLogo(url: string | null | undefined): Promise<LogoVerdict> {
  const quick = judgeLogoUrl(url);
  if (!quick.ok) return Promise.resolve(quick);
  const u = url!.trim();
  const hit = cache.get(u);
  if (hit) return hit;
  const run = (async (): Promise<LogoVerdict> => {
    const img = await loadImage(u, false);
    if (!img) return { ok: false, reason: 'failed-to-load' };
    const isVector = /\.svg(\?|#|$)/i.test(u) || u.startsWith('data:image/svg');
    let pixels: Uint8ClampedArray | null = null;
    if (u.startsWith('data:') || u.startsWith('blob:')) pixels = readPixels(img);
    else {
      const corsImg = await loadImage(u, true);
      if (corsImg) pixels = readPixels(corsImg);
    }
    const v = judgeLogo({ url: u, width: img.naturalWidth, height: img.naturalHeight, isVector, pixels });
    if (!v.ok) console.warn('[logoAudit] rejected logo', { url: u.slice(0, 120), reason: v.reason, width: v.width, height: v.height });
    return v;
  })();
  cache.set(u, run);
  return run;
}

/** Returns the URL if it passes the audit, otherwise null. */
export async function usableLogoOrNull(url: string | null | undefined): Promise<string | null> {
  return (await auditLogo(url)).ok ? url!.trim() : null;
}

export const LOGO_REJECTION_TEXT: Record<LogoRejection, string> = {
  missing: 'No image was provided.',
  'not-an-image-url': "That isn't an image link.",
  'social-preview-image': 'That looks like a social-sharing image, not a logo.',
  'failed-to-load': "That image couldn't be loaded.",
  'too-small': `That image is too small to use as a logo (it needs to be at least ${LOGO_RULES.minLongSide}px on its longest side).`,
  'fully-transparent': 'That image is completely transparent.',
  'solid-color': 'That image is a single solid colour.',
};
