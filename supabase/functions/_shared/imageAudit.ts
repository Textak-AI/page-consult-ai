/** Shared measured-image rules for logos, uploaded samples and site harvests. */
export const IMAGE_RULES = { minShortSide: 16, minLongSide: 64, visibleAlpha: 16, solidTolerance: 12, timeoutMs: 8000, sampleSide: 64, maxBytes: 2 * 1024 * 1024, harvestCap: 8 } as const;
export function judgeImageFacts(width: number, height: number, pixels?: ArrayLike<number> | null) {
  if (Math.min(width, height) < IMAGE_RULES.minShortSide || Math.max(width, height) < IMAGE_RULES.minLongSide) return { ok: false, reason: 'too-small' as const, width, height };
  if (!pixels) return { ok: true, width, height, pixelsChecked: false };
  let visible = 0;
  const min = [255, 255, 255], max = [0, 0, 0];
  for (let i = 0; i < pixels.length; i += 4) {
    if (pixels[i + 3] <= IMAGE_RULES.visibleAlpha) continue;
    visible++;
    for (let c = 0; c < 3; c++) { min[c] = Math.min(min[c], pixels[i + c]); max[c] = Math.max(max[c], pixels[i + c]); }
  }
  if (!visible) return { ok: false, reason: 'fully-transparent' as const, width, height, pixelsChecked: true };
  if (visible === pixels.length / 4 && min.every((v, c) => max[c] - v <= IMAGE_RULES.solidTolerance)) return { ok: false, reason: 'solid-color' as const, width, height, pixelsChecked: true };
  return { ok: true, width, height, pixelsChecked: true };
}