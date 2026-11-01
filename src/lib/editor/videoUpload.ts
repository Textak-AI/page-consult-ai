import { supabase } from '@/integrations/supabase/client';
import { VIDEO_RULES, videoFileError, type PageVideo } from '@/lib/video';

/** A frame ~1s in (or 10% of a short clip) as a JPEG, for instant first paint and the reduced-motion fallback. */
async function posterFrame(file: File): Promise<Blob | null> {
  const src = URL.createObjectURL(file);
  try {
    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';
    video.src = src;
    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new Error('unreadable'));
      setTimeout(() => reject(new Error('timeout')), 15000);
    });
    video.currentTime = Math.min(1, (video.duration || 1) * 0.1);
    await new Promise<void>((resolve, reject) => {
      video.onseeked = () => resolve();
      setTimeout(() => reject(new Error('timeout')), 15000);
    });
    const w = video.videoWidth, h = video.videoHeight;
    if (!w || !h) return null;
    const scale = Math.min(1, 1280 / w);
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(w * scale);
    canvas.height = Math.round(h * scale);
    canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);
    return await new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.82));
  } catch {
    return null; // A missing poster only means the first frame paints a moment later.
  } finally {
    URL.revokeObjectURL(src);
  }
}

/** Uploads to brand-assets `${uid}/videos/` (the storage policy requires the owner's own folder). */
export async function uploadPageVideo(file: File): Promise<Extract<PageVideo, { source: 'upload' }>> {
  const problem = videoFileError(file);
  if (problem) throw new Error(problem);
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error('Please sign in to upload a video.');
  const id = crypto.randomUUID();
  const ext = VIDEO_RULES.types[file.type];
  const storagePath = `${user.id}/videos/${id}.${ext}`;
  const { error } = await supabase.storage.from('brand-assets').upload(storagePath, file, { upsert: false, contentType: file.type });
  if (error) throw new Error(/size|large|413/i.test(error.message) ? 'That video is larger than storage accepts. Try a shorter clip or a YouTube or Vimeo link.' : 'Upload failed. Please try again.');
  const url = supabase.storage.from('brand-assets').getPublicUrl(storagePath).data.publicUrl;

  let poster: string | null = null;
  const frame = await posterFrame(file);
  if (frame) {
    const posterPath = `${user.id}/videos/${id}-poster.jpg`;
    const { error: posterError } = await supabase.storage.from('brand-assets').upload(posterPath, frame, { upsert: false, contentType: 'image/jpeg' });
    if (!posterError) poster = supabase.storage.from('brand-assets').getPublicUrl(posterPath).data.publicUrl;
  }
  return { source: 'upload', url, storagePath, mime: file.type, poster };
}
