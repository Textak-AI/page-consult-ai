import { useState } from 'react';
import { Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getSectionBackgroundStyles } from '@/lib/artDirectorBrief';
import { spacing, signatureTokens, typeScale, space } from '@/lib/design/tokens';
import { usableVideo, type PageVideo } from '@/lib/video';
import { PageVideoPlayer } from '@/components/video/PageVideoPlayer';
import { VideoSheet } from '@/components/video/VideoSheet';

const storageOrigin = import.meta.env.VITE_SUPABASE_URL;

interface Props {
  content: { heading?: string; body?: string; video?: PageVideo | null; sectionBackground?: string; primaryColor?: string };
  onUpdate?: (content: any) => void;
  editor?: boolean;
}

/** Video section: upload or link only. Published pages render nothing until a real video is attached. */
export function VideoSection({ content, onUpdate, editor = false }: Props) {
  const [open, setOpen] = useState(false);
  const video = usableVideo(content.video, storageOrigin);
  if (!video && !editor) return null;
  const surface = getSectionBackgroundStyles(content.sectionBackground || 'light', content.primaryColor);
  const heading = typeof content.heading === 'string' ? content.heading.trim() : '';
  const body = typeof content.body === 'string' ? content.body.trim() : '';
  const PLACEHOLDER = { heading: '[What this video shows]', body: "[One line on why it's worth watching]" } as const;
  // The body line is optional: an untouched placeholder is never saved as copy.
  const edit = (field: 'heading' | 'body') => (e: React.FocusEvent<HTMLElement>) => {
    const text = e.currentTarget.textContent?.trim() || '';
    onUpdate?.({ ...content, [field]: field === 'body' && text === PLACEHOLDER.body ? '' : text });
  };

  return (
    <section data-video-section aria-label={heading || 'Video'} style={{ ...spacing.section, background: surface.bg, color: surface.text }}>
      <div className="mx-auto" style={{ maxWidth: signatureTokens.maxWidth }}>
        {(heading || editor) && (
          <h2 contentEditable={editor} suppressContentEditableWarning onBlur={edit('heading')} className="text-center" style={{ ...typeScale.h2, margin: `0 auto ${body ? space.xs : space.lg}px` }}>
            {heading || (editor ? PLACEHOLDER.heading : '')}
          </h2>
        )}
        {(body || editor) && (
          <p contentEditable={editor} suppressContentEditableWarning onBlur={edit('body')} className="text-center mx-auto" style={{ ...typeScale.lead, color: surface.textMuted, maxWidth: 640, margin: `0 auto ${space.lg}px` }}>
            {body || (editor ? PLACEHOLDER.body : '')}
          </p>
        )}
        {video ? (
          <PageVideoPlayer video={video} primaryColor={content.primaryColor} className="mx-auto max-w-4xl" />
        ) : (
          <div className="mx-auto max-w-4xl flex flex-col items-center justify-center gap-3 border border-dashed rounded-lg text-center" style={{ aspectRatio: '16 / 9', borderColor: surface.border, color: surface.textMuted }}>
            <Video className="h-8 w-8" />
            <p style={typeScale.small}>Hidden on your page until you add a video</p>
          </div>
        )}
        {editor && (
          <div className="mt-4 flex justify-center">
            <Button variant="outline" onClick={() => setOpen(true)}><Video />{video ? 'Edit video' : 'Add video'}</Button>
          </div>
        )}
      </div>
      {editor && (
        <VideoSheet open={open} onOpenChange={setOpen} placement="section" value={content.video} primaryColor={content.primaryColor}
          onChange={(v) => onUpdate?.({ ...content, video: v })} />
      )}
    </section>
  );
}
