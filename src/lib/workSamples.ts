import { judgeLogo, loadImage, readPixels } from './logoAudit';

export const WORK_SAMPLE_RULES = { min: 2, max: 6, maxBytes: 2 * 1024 * 1024 } as const;
export interface WorkSample {
  id: string;
  source: 'client-upload';
  url: string;
  storagePath: string;
  width: number;
  height: number;
  caption?: string;
  pairId?: string;
  pairRole?: 'before' | 'after';
}
export function uploadedSamples(value: unknown, storageOrigin: string): WorkSample[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  return value.filter((s): s is WorkSample => {
    if (!s || s.source !== 'client-upload' || typeof s.id !== 'string' || seen.has(s.id) || typeof s.storagePath !== 'string') return false;
    if (!/^[\da-f-]{36}\/work-samples\/[\da-f-]{36}\.(png|jpg|webp)$/i.test(s.storagePath)) return false;
    try {
      const url = new URL(s.url);
      if (url.origin !== new URL(storageOrigin).origin || decodeURIComponent(url.pathname) !== `/storage/v1/object/public/brand-assets/${s.storagePath}`) return false;
    } catch { return false; }
    if (!judgeLogo({ url: s.url, width: s.width, height: s.height, purpose: 'work-sample' }).ok) return false;
    seen.add(s.id);
    return true;
  }).slice(0, WORK_SAMPLE_RULES.max);
}
export async function auditWorkSample(url: string) {
  const img = await loadImage(url, url.startsWith('https:'));
  if (!img) return { ok: false, reason: 'failed-to-load' as const };
  const pixels = readPixels(img);
  if (!pixels) return { ok: false, reason: 'failed-to-load' as const };
  return judgeLogo({ url, width: img.naturalWidth, height: img.naturalHeight, pixels, purpose: 'work-sample' });
}
export function moveSample(samples: WorkSample[], index: number, delta: number): WorkSample[] {
  const target = index + delta;
  if (index < 0 || index >= samples.length || target < 0 || target >= samples.length) return samples;
  const result = [...samples];
  [result[index], result[target]] = [result[target], result[index]];
  return result;
}
export function pairSamples(samples: WorkSample[], first: string, second: string, pairId: string): WorkSample[] {
  if (first === second || !samples.some(s => s.id === first) || !samples.some(s => s.id === second)) return samples;
  const replaced = new Set(samples.filter(s => s.id === first || s.id === second).map(s => s.pairId).filter(Boolean));
  return samples.map(s => {
    const clean = replaced.has(s.pairId) ? { ...s, pairId: undefined, pairRole: undefined } : s;
    if (s.id === first) return { ...clean, pairId, pairRole: 'before' };
    if (s.id === second) return { ...clean, pairId, pairRole: 'after' };
    return clean;
  });
}
export function sampleGroups(samples: WorkSample[]): WorkSample[][] {
  const used = new Set<string>();
  return samples.flatMap(s => {
    if (used.has(s.id)) return [];
    const before = s.pairId && samples.find(p => p.pairId === s.pairId && p.pairRole === 'before');
    const after = s.pairId && samples.find(p => p.pairId === s.pairId && p.pairRole === 'after');
    const group = before && after && before.id !== after.id ? [before, after] : [s];
    group.forEach(p => used.add(p.id));
    return [group];
  });
}