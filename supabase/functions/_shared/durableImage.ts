/** Shared by every image generator: page data never holds an expiring provider URL. */
// Match brand scenes: return/cache the bytes, never an expiring provider URL.
export async function durableImage(url: string): Promise<string> {
  if (url.startsWith('data:image/')) return url;
  const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error(`Generated image download failed: ${response.status}`);
  const mime = (response.headers.get('content-type') || '').split(';')[0].trim();
  if (!/^image\/(png|jpeg|webp|gif|avif)$/.test(mime)) throw new Error('Generated image response is not a supported bitmap');
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (!bytes.length || bytes.length > 10 * 1024 * 1024) throw new Error('Generated image size is invalid');
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return `data:${mime};base64,${btoa(binary)}`;
}
