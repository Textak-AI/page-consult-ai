import { getSectionBackgroundStyles } from '@/lib/artDirectorBrief';
import { space } from '@/lib/design/tokens';
import { usableVideo } from '@/lib/video';
import { PageVideoPlayer } from './PageVideoPlayer';

const storageOrigin = import.meta.env.VITE_SUPABASE_URL;

/**
 * A video the owner added under an existing section. It paints the section's
 * own surface so it reads as part of that section, not a new band.
 */
export function AttachedVideo({ content }: { content?: { attachedVideo?: unknown; sectionBackground?: string; primaryColor?: string } | null }) {
  const video = usableVideo(content?.attachedVideo, storageOrigin);
  if (!video) return null;
  const surface = getSectionBackgroundStyles(content?.sectionBackground || 'light', content?.primaryColor);
  return (
    <div data-attached-video style={{ background: surface.bg, padding: `0 ${space.gutter} ${space.sectionYCompact}px` }}>
      <PageVideoPlayer video={video} primaryColor={content?.primaryColor} className="mx-auto max-w-4xl" />
    </div>
  );
}
