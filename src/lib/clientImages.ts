export interface ClientImage {
  id: string; url: string; source: 'client-upload' | 'client-site' | 'brand-scene' | 'unsplash';
  width?: number; height?: number; storagePath?: string; sourcePageUrl?: string; sourceImageUrl?: string;
}
export const IMAGE_SOURCE_ORDER = ['client-upload', 'client-site', 'brand-scene', 'unsplash'] as const;
/** Explicit caller selections are preserved; automatic composition uses this one ranking. */
export function preferredImage(images: ClientImage[]): ClientImage | undefined {
  return [...images].filter(i => i.url && IMAGE_SOURCE_ORDER.includes(i.source)).sort((a, b) => IMAGE_SOURCE_ORDER.indexOf(a.source) - IMAGE_SOURCE_ORDER.indexOf(b.source))[0];
}
export function collectClientImages(...contexts: any[]): ClientImage[] {
  const found: ClientImage[] = [], seen = new Set<string>();
  const visit = (value: any, depth: number) => {
    if (!value || depth > 8) return;
    if (Array.isArray(value)) { value.forEach(v => visit(v, depth + 1)); return; }
    if (typeof value !== 'object') return;
    if (typeof value.url === 'string' && IMAGE_SOURCE_ORDER.includes(value.source) && !seen.has(value.url)) {
      // Client-site candidates must retain their own source page and durable storage provenance.
      if (value.source === 'client-site' && (!value.sourcePageUrl || !value.storagePath?.includes('/site-images/'))) return;
      seen.add(value.url); found.push(value);
    }
    for (const [key, child] of Object.entries(value)) if (['websiteIntelligence', 'website_intelligence', 'extracted_intelligence', 'consultationData', 'consultation_data', 'brandData', 'brandSettings', 'extractionResults', 'harvestedImages', 'clientImages', 'samples', 'sections', 'content', 'imageAsset', 'supportingImageAsset'].includes(key)) visit(child, depth + 1);
  };
  contexts.forEach(c => visit(c, 0));
  return found.sort((a, b) => IMAGE_SOURCE_ORDER.indexOf(a.source) - IMAGE_SOURCE_ORDER.indexOf(b.source));
}
export function composeClientImages<T extends { type: string; content: any }>(sections: T[], candidates: ClientImage[]): T[] {
  if (!candidates.length) return sections;
  const existingHero = sections.find(s => s.type === 'hero')?.content?.backgroundImage;
  const hero = candidates.find(i => i.url === existingHero) || preferredImage(candidates);
  let changed = false;
  const result = sections.map(s => {
    if (s.type !== 'hero' && s.type !== 'differentiator-callout') return s;
    const field = s.type === 'hero' ? 'backgroundImage' : 'supportingImage';
    const assetField = s.type === 'hero' ? 'imageAsset' : 'supportingImageAsset';
    const selected = s.type === 'hero' ? hero : preferredImage(candidates.filter(i => i.url !== hero?.url));
    const existing = s.content?.[field] || (s.type === 'hero' && s.content?.heroImage);
    const sameCandidates = JSON.stringify(s.content?.clientImages) === JSON.stringify(candidates);
    const existingAsset = candidates.find(i => i.url === existing);
    if (sameCandidates && (existing || !selected) && (!existingAsset || s.content?.[assetField]?.url === existingAsset.url)) return s;
    changed = true;
    return { ...s, content: { ...s.content, clientImages: candidates, ...(existingAsset ? { [assetField]: existingAsset, imageCredit: undefined, imageAttribution: undefined } : {}), ...(!existing && selected ? { [field]: selected.url, [assetField]: selected, imageCredit: undefined, imageAttribution: undefined } : {}) } };
  });
  return changed ? result : sections;
}