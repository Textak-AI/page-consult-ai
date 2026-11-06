import { getSectionBackgroundStyles } from '@/lib/artDirectorBrief';
import { pickEmbed } from '@/lib/design/releasePage';

interface Props {
  content: Record<string, any>;
  onUpdate: (content: any) => void;
  isEditing: boolean;
}

/**
 * The platform's own player, from a link the owner pasted. The page becomes a place to hear
 * the record rather than a place to be sent somewhere. No link, nothing rendered on the live
 * page; in the editor, a place to paste one.
 */
export default function PlayerSection({ content, onUpdate, isEditing }: Props) {
  const primaryColor = content.primaryColor || '#15707F';
  const bg = getSectionBackgroundStyles(content.sectionBackground || 'dark', primaryColor);
  const embed = pickEmbed(content.sourceUrl, content.pageLinks, primaryColor);

  if (!embed && !isEditing) return null;

  return (
    <section className="relative" style={{ backgroundColor: bg.bg, color: bg.text }} data-section="player">
      <div className="mx-auto max-w-3xl px-6 py-12 md:py-16 space-y-4">
        {embed && (
          <iframe
            title={embed.title}
            src={embed.src}
            width="100%"
            height={embed.height}
            style={{ border: 0, borderRadius: 14, background: 'rgba(255,255,255,0.04)' }}
            allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write; picture-in-picture"
            loading="lazy"
            sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms"
          />
        )}
        {isEditing && (
          <div className="rounded-lg border border-white/15 bg-black/30 p-3 text-xs space-y-2">
            <p className="opacity-70">{embed ? `Playing from ${embed.title.replace(' player', '')}. Paste a different album link to change it.` : 'Paste the album link to show its player here (Spotify, Apple Music, TIDAL, SoundCloud or YouTube). Bandcamp links can\'t be embedded from a URL.'}</p>
            <input
              type="url"
              placeholder="https://open.spotify.com/album/…"
              defaultValue={content.sourceUrl || ''}
              onBlur={(e) => onUpdate({ ...content, sourceUrl: e.currentTarget.value.trim() || null })}
              className="w-full rounded border border-white/20 bg-black/40 px-2 py-1 text-xs text-white placeholder:text-white/40"
            />
          </div>
        )}
      </div>
    </section>
  );
}
