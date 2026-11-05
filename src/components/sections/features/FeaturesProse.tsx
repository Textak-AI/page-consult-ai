import React from 'react';
import { getSectionBackgroundStyles } from '@/lib/artDirectorBrief';
import { fontStacks } from '@/lib/design/tokens';

interface Feature { title: string; description: string; icon?: string }
interface Props {
  content: Record<string, any> & { features?: Feature[] };
  onUpdate: (content: any) => void;
  isEditing: boolean;
}

/**
 * Features in the immersive register: liner notes, not a product grid. The section title as a
 * line of display type, then each point as a row — its name on the left, the owner's sentence
 * on the right — separated by hairlines. No kicker, no icons, no cards.
 */
export default function FeaturesProse({ content, onUpdate, isEditing }: Props) {
  const primaryColor = content.primaryColor || '#15707F';
  const bg = getSectionBackgroundStyles(content.sectionBackground || 'dark', primaryColor);
  const features: Feature[] = Array.isArray(content.features) ? content.features.filter((f) => f && (f.title || f.description)) : [];
  if (!features.length) return null;

  const edit = isEditing ? 'outline-dashed outline-2 outline-cyan-500/30 rounded px-1' : '';
  const blurTitle = (e: React.FocusEvent<HTMLElement>) => onUpdate({ ...content, title: e.currentTarget.textContent || content.title });
  const blurFeature = (i: number, field: 'title' | 'description', e: React.FocusEvent<HTMLElement>) => {
    const next = features.map((f, j) => (j === i ? { ...f, [field]: e.currentTarget.textContent || f[field] } : f));
    onUpdate({ ...content, features: next });
  };
  // A title that is the audience answer or the product name alone reads oddly as a heading; keep it short.
  const title = typeof content.title === 'string' && content.title.trim().length <= 60 ? content.title.trim() : '';

  return (
    <section className="relative" style={{ backgroundColor: bg.bg, color: bg.text }}>
      <div className="mx-auto max-w-5xl px-6 py-20 md:py-28">
        {title && (
          <h2
            contentEditable={isEditing}
            suppressContentEditableWarning
            onBlur={blurTitle}
            className={`mb-12 md:mb-16 ${edit}`}
            style={{ fontFamily: fontStacks.serifDisplay, fontWeight: 400, fontSize: 'clamp(1.9rem, 3.4vw, 2.8rem)', lineHeight: 1.1, letterSpacing: '-0.01em' }}
          >
            {title}
          </h2>
        )}
        <ol className="m-0 list-none p-0">
          {features.map((f, i) => (
            <li
              key={i}
              className="grid gap-3 py-7 md:grid-cols-12 md:gap-10 md:py-9"
              style={{ borderTop: `1px solid ${primaryColor}40` }}
            >
              <p
                contentEditable={isEditing}
                suppressContentEditableWarning
                onBlur={(e) => blurFeature(i, 'title', e)}
                className={`md:col-span-5 ${edit}`}
                style={{ fontFamily: fontStacks.serifDisplay, fontSize: 'clamp(1.25rem, 1.8vw, 1.6rem)', lineHeight: 1.25 }}
              >
                {f.title}
              </p>
              <p
                contentEditable={isEditing}
                suppressContentEditableWarning
                onBlur={(e) => blurFeature(i, 'description', e)}
                className={`md:col-span-7 ${edit}`}
                style={{ color: bg.textMuted, fontFamily: fontStacks.sans, fontSize: '1.0625rem', lineHeight: 1.65 }}
              >
                {f.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
