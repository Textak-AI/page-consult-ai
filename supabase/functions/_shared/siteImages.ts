import { IMAGE_RULES, judgeImageFacts } from './imageAudit.ts';
import { Image } from 'https://deno.land/x/imagescript@1.3.0/mod.ts';

export function publicImageUrl(value: string, base: string): string | null {
  try {
    const u = new URL(value.replace(/&amp;/g, '&'), base);
    if (!['https:', 'http:'].includes(u.protocol) || u.username || u.password) return null;
    const h = u.hostname.toLowerCase();
    if (h === 'localhost' || h.endsWith('.local') || h.endsWith('.internal') || h.includes(':') || /^\d+\./.test(h)) return null;
    return u.href;
  } catch { return null; }
}
export function siteImageCandidates(html: string, pageUrl: string, logo?: string | null): string[] {
  const candidates: string[] = [];
  const push = (raw: string) => {
    const url = publicImageUrl(raw, pageUrl);
    if (url && url !== logo && !/(logo|favicon|icon|avatar|pixel|tracking|badge|sprite)/i.test(url) && !/\.svg(?:[?#]|$)/i.test(url) && !candidates.includes(url)) candidates.push(url);
  };
  for (const tag of html.match(/<meta\b[^>]*>/gi) || []) {
    if (/og:image|twitter:image/i.test(tag)) { const content = tag.match(/content=["']([^"']+)["']/i); if (content) push(content[1]); }
  }
  for (const tag of html.match(/<img\b[^>]*>/gi) || []) {
    if (/(logo|icon|avatar|tracking|pixel)/i.test(tag)) continue;
    const src = tag.match(/(?:data-src|src)=["']([^"']+)["']/i); if (src) push(src[1]);
  }
  // Same-site compiled bundles/styles often hold a SPA's actual content images.
  for (const match of html.matchAll(/["'(`]([^"'`\s()<>]+\.(?:png|jpe?g|webp)(?:\?[^"'`\s<>]*)?)["'`)]/gi)) push(match[1]);
  return candidates.slice(0, 24);
}
async function safeFetch(url: string, pageUrl: string) {
  let current = publicImageUrl(url, pageUrl);
  for (let i = 0; current && i < 4; i++) {
    const host = new URL(current).hostname;
    const addresses = await Deno.resolveDns(host, 'A').catch(() => []);
    if (!addresses.length || addresses.some(ip => /^(0\.|10\.|127\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\.|224\.)/.test(ip))) throw new Error('Non-public host');
    const r = await fetch(current, { redirect: 'manual', signal: AbortSignal.timeout(IMAGE_RULES.timeoutMs) });
    if (r.status >= 300 && r.status < 400) { current = publicImageUrl(r.headers.get('location') || '', current); continue; }
    if (!r.ok) throw new Error(`Image fetch ${r.status}`);
    return r;
  }
  throw new Error('Unsafe image redirect');
}
async function limitedBytes(response: Response, max: number) {
  const reader = response.body?.getReader(); if (!reader) throw new Error('Missing body');
  const chunks: Uint8Array[] = []; let length = 0;
  while (true) { const { value, done } = await reader.read(); if (done) break; length += value.length; if (length > max) { await reader.cancel(); throw new Error('Image too large'); } chunks.push(value); }
  const bytes = new Uint8Array(length); let offset = 0; for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; } return bytes;
}
export async function harvestSiteImages(html: string, pageUrl: string, logo: string | null, client: any, owner: string | null) {
  // Guests retain ordinary extraction; no server-role uploads or cross-owner writes.
  if (!owner) return [];
  let markup = html;
  const base = new URL(pageUrl);
  const refs = [...html.matchAll(/(?:src|href)=["']([^"']+\.(?:js|css)(?:\?[^"']*)?)["']/gi)].slice(0, 3);
  await Promise.all(refs.map(async m => {
    const url = publicImageUrl(m[1], pageUrl);
    if (!url || new URL(url).origin !== base.origin) return;
    try { const r = await safeFetch(url, pageUrl); markup += '\n' + new TextDecoder().decode(await limitedBytes(r, 2 * 1024 * 1024)); } catch { /* optional SPA discovery */ }
  }));
  const result: any[] = [];
  const candidates = siteImageCandidates(markup, pageUrl, logo);
  for (let start = 0; start < candidates.length && result.length < IMAGE_RULES.harvestCap; start += 4) {
    const audited = await Promise.all(candidates.slice(start, start + 4).map(async sourceImageUrl => {
      try {
        const r = await safeFetch(sourceImageUrl, pageUrl);
        const bytes = await limitedBytes(r, IMAGE_RULES.maxBytes);
        const image = await Image.decode(bytes);
        const width = image.width, height = image.height;
        if (width * height > 20_000_000) return null;
        image.resize(Math.max(1, Math.round(width * Math.min(1, 64 / Math.max(width, height)))), Math.max(1, Math.round(height * Math.min(1, 64 / Math.max(width, height)))));
        const verdict = judgeImageFacts(width, height, image.bitmap);
        if (!verdict.ok) return null;
        return { bytes, width, height, sourceImageUrl, mime: r.headers.get('content-type')?.split(';')[0] };
      } catch (e) { console.info('[siteImages] rejected', sourceImageUrl, e instanceof Error ? e.message : 'decode'); return null; }
    }));
    for (const item of audited) {
      if (!item || result.length >= IMAGE_RULES.harvestCap) continue;
      const ext = item.mime === 'image/jpeg' ? 'jpg' : item.mime === 'image/png' ? 'png' : null;
      if (!ext) continue;
      const id = crypto.randomUUID(), storagePath = `${owner}/site-images/${id}.${ext}`;
      const { error } = await client.storage.from('brand-assets').upload(storagePath, item.bytes, { contentType: item.mime, upsert: false });
      if (error) { console.warn('[siteImages] owner upload rejected', error.message); continue; }
      const { data } = client.storage.from('brand-assets').getPublicUrl(storagePath);
      result.push({ id, source: 'client-site', url: data.publicUrl, storagePath, width: item.width, height: item.height, sourcePageUrl: pageUrl, sourceImageUrl: item.sourceImageUrl, pixelsChecked: true });
    }
  }
  console.info('[siteImages] harvest', { candidates: candidates.length, accepted: result.length });
  return result;
}