import { getSectionBackgroundStyles } from '@/lib/artDirectorBrief';
import { fontStacks } from '@/lib/design/tokens';

interface Props {
  content: Record<string, any>;
  onUpdate: (content: any) => void;
  isEditing: boolean;
}

/** The owner's tracklist, numbered, in display type. Nothing shown unless they gave one. */
export default function TracklistSection({ content, onUpdate, isEditing }: Props) {
  const primaryColor = content.primaryColor || '#15707F';
  const bg = getSectionBackgroundStyles(content.sectionBackground || 'dark', primaryColor);
  const tracks: string[] = Array.isArray(content.tracks) ? content.tracks.filter((t: unknown) => typeof t === 'string' && t.trim()) : [];
  if (!tracks.length && !isEditing) return null;
  const edit = isEditing ? 'outline-dashed outline-2 outline-cyan-500/30 rounded px-1' : '';

  return (
    <section className="relative" style={{ backgroundColor: bg.bg, color: bg.text }} data-section="tracklist">
      <div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
        <p className="mb-8" style={{ color: primaryColor, filter: 'brightness(1.5)', fontFamily: fontStacks.sans, fontSize: 12, letterSpacing: '0.22em', textTransform: 'uppercase' }}>
          {content.title || 'Tracklist'}
        </p>
        <ol className="m-0 list-none p-0">
          {tracks.map((t, i) => (
            <li key={i} className="flex items-baseline gap-5 py-3" style={{ borderTop: `1px solid ${primaryColor}33` }}>
              <span className="w-7 shrink-0 font-mono text-xs opacity-60">{String(i + 1).padStart(2, '0')}</span>
              <span
                contentEditable={isEditing}
                suppressContentEditableWarning
                onBlur={(e) => onUpdate({ ...content, tracks: tracks.map((x, j) => (j === i ? e.currentTarget.textContent || x : x)) })}
                className={edit}
                style={{ fontFamily: fontStacks.serifDisplay, fontSize: 'clamp(1.15rem, 1.6vw, 1.45rem)', lineHeight: 1.3 }}
              >
                {t}
              </span>
            </li>
          ))}
        </ol>
        {isEditing && (
          <textarea
            placeholder={'One track per line'}
            defaultValue={tracks.join('\n')}
            onBlur={(e) => onUpdate({ ...content, tracks: e.currentTarget.value.split(/\r?\n/).map((l) => l.replace(/^\s*(?:\d+[.)\-:]?|[-•*])\s*/, '').trim()).filter(Boolean) })}
            className="mt-6 w-full rounded border border-white/20 bg-black/40 p-2 text-xs text-white placeholder:text-white/40"
            rows={6}
          />
        )}
      </div>
    </section>
  );
}
