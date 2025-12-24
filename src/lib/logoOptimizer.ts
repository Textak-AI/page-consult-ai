/**
 * Logo optimization utilities for high-quality, web-optimized uploads
 * - SVGs pass through unchanged (already tiny and scalable)
 * - Raster images resized to 600px max, WebP format, 88% quality
 */

export async function optimizeLogo(file: File): Promise<{ blob: Blob; fileName: string; contentType: string }> {
  const isSvg = file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');
  const baseName = `${Date.now()}-${Math.random().toString(36).substring(7)}`;

  // SVGs: Pass through as-is (usually 5-50kb, infinitely scalable)
  if (isSvg) {
    return {
      blob: file,
      fileName: `${baseName}.svg`,
      contentType: 'image/svg+xml',
    };
  }

  // Raster images: Resize and convert to WebP
  const img = await createImageBitmap(file);
  
  const MAX_WIDTH = 600; // Sharp enough for 2x retina at 300px display
  const QUALITY = 0.88; // Good balance of quality vs size

  const scale = Math.min(1, MAX_WIDTH / img.width);
  const width = Math.round(img.width * scale);
  const height = Math.round(img.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, width, height);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Failed to create blob'))),
      'image/webp',
      QUALITY
    );
  });

  console.log(`[logoOptimizer] ${file.name}: ${(file.size / 1024).toFixed(1)}kb → ${(blob.size / 1024).toFixed(1)}kb WebP`);

  return {
    blob,
    fileName: `${baseName}.webp`,
    contentType: 'image/webp',
  };
}

/**
 * Optimize an edited logo (from data URL) to WebP
 */
export async function optimizeEditedLogo(dataUrl: string): Promise<{ blob: Blob; fileName: string; contentType: string }> {
  const response = await fetch(dataUrl);
  const originalBlob = await response.blob();
  
  const img = await createImageBitmap(originalBlob);
  
  const MAX_WIDTH = 600;
  const QUALITY = 0.88;

  const scale = Math.min(1, MAX_WIDTH / img.width);
  const width = Math.round(img.width * scale);
  const height = Math.round(img.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, width, height);

  // For edited logos (usually with transparency), use PNG if small, WebP otherwise
  const webpBlob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Failed to create blob'))),
      'image/webp',
      QUALITY
    );
  });

  const baseName = `${Date.now()}-edited-${Math.random().toString(36).substring(7)}`;

  console.log(`[logoOptimizer] Edited logo: ${(originalBlob.size / 1024).toFixed(1)}kb → ${(webpBlob.size / 1024).toFixed(1)}kb WebP`);

  return {
    blob: webpBlob,
    fileName: `${baseName}.webp`,
    contentType: 'image/webp',
  };
}
