/**
 * Image generators return bytes (data: URIs) so pages never hold expiring
 * provider links. Kept inline, though, one hero made the page JSON 3 MB and
 * every autosave, load and publish carried it. Before saving or publishing,
 * each inline image is uploaded once to the owner's storage folder and
 * replaced with its public URL. Same bytes → same file name, so retries and
 * repeated saves never duplicate uploads.
 */
import { supabase } from '@/integrations/supabase/client';

const DATA_IMAGE = /^data:image\/(png|jpeg|webp|gif|avif);base64,/;
const uploaded = new Map<string, string>();

export function isInlineImage(v: unknown): v is string {
  return typeof v === 'string' && DATA_IMAGE.test(v);
}

/** Every inline image string anywhere in a value. */
export function collectInlineImages(value: unknown, out: Set<string> = new Set()): Set<string> {
  if (isInlineImage(value)) out.add(value);
  else if (Array.isArray(value)) value.forEach((v) => collectInlineImages(v, out));
  else if (value && typeof value === 'object') Object.values(value).forEach((v) => collectInlineImages(v, out));
  return out;
}

/** Deep copy with each inline image swapped for its URL (unmapped ones stay as they are). */
export function replaceInlineImages<T>(value: T, urls: Map<string, string>): T {
  if (isInlineImage(value)) return (urls.get(value) ?? value) as T;
  if (Array.isArray(value)) return value.map((v) => replaceInlineImages(v, urls)) as T;
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, replaceInlineImages(v, urls)])) as T;
  }
  return value;
}

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
}

function toBlob(dataUri: string): { blob: Blob; ext: string; type: string } {
  const [, type, ext] = dataUri.match(/^data:(image\/(png|jpeg|webp|gif|avif));base64,/)!;
  const bin = atob(dataUri.slice(dataUri.indexOf(',') + 1));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return { blob: new Blob([bytes], { type }), ext: ext === 'jpeg' ? 'jpg' : ext, type };
}

/**
 * Uploads inline images and returns the value with URLs in their place.
 * An image that fails to upload stays inline, so a save never loses it.
 */
export async function externalizeImages<T>(value: T): Promise<T> {
  const found = collectInlineImages(value);
  if (!found.size) return value;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return value;
  const urls = new Map<string, string>();
  for (const dataUri of found) {
    const cached = uploaded.get(dataUri);
    if (cached) { urls.set(dataUri, cached); continue; }
    try {
      const { blob, ext, type } = toBlob(dataUri);
      const path = `${user.id}/generated/${await sha256(dataUri)}.${ext}`;
      const { error } = await supabase.storage.from('brand-assets').upload(path, blob, { upsert: true, contentType: type });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('brand-assets').getPublicUrl(path);
      uploaded.set(dataUri, publicUrl);
      urls.set(dataUri, publicUrl);
    } catch (e) {
      console.warn('🖼️ [externalizeImages] upload failed, keeping inline image:', e);
    }
  }
  return replaceInlineImages(value, urls);
}
