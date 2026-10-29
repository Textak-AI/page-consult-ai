import { featureType, spacing, space, typeScale, accentFor, shape } from '@/lib/design/tokens';
import { getSectionBackgroundStyles } from '@/lib/artDirectorBrief';
import { useUsableImage } from '@/hooks/useUsableImage';
import { ChapterEyebrow } from '@/components/signature/elements';
import { TreatedImage } from './TreatedImage';
import { Button } from '@/components/ui/button';
import { ImagePlus } from 'lucide-react';
import { ImagePicker } from '@/components/editor/ImagePicker';
import { useState } from 'react';

interface DifferentiatorCalloutProps {
  content: {
    text: string;
    businessName?: string;
    primaryColor?: string;
    sectionBackground?: string;
    /** The page's one optional second image (place/mood only), from the existing image pipelines. */
    supportingImage?: string;
    imageCredit?: { name?: string; link?: string };
    signature?: { elements: string[] };
  };
}

/**
 * Pull-quote: the business's own sentence about its own work, attributed to the
 * business. Deliberately not a testimonial — no quote marks, avatar or person.
 */
export function DifferentiatorCalloutSection({ content, onUpdate, isEditing = false }: DifferentiatorCalloutProps & { onUpdate?: (content: any) => void; isEditing?: boolean }) {
  const [picker, setPicker] = useState(false);
  const image = useUsableImage(content?.supportingImage);
  if (!content?.text) return null;
  const bg = getSectionBackgroundStyles(content.sectionBackground || 'dark', content.primaryColor);
  const rule = accentFor('pullQuoteRule', content.primaryColor || '#6366F1');

  return (
    <section style={{ backgroundColor: bg.bg, ...spacing.section }}>
      <div
        className={image ? 'grid md:grid-cols-12 items-center' : undefined}
        style={{ maxWidth: image ? 1120 : 820, margin: '0 auto', gap: space.header }}
      >
      <figure className={image ? 'md:col-span-7' : undefined} style={{ margin: 0 }}>
        {content.signature?.elements.includes('chapter') && <ChapterEyebrow slot="guide" />}
        <div aria-hidden="true" style={{ width: 56, height: 3, backgroundColor: rule, marginBottom: space.lg }} />
        <blockquote
          style={{
            ...featureType.pullQuote,
            margin: 0,
            color: bg.text,
            fontFamily: '"Instrument Serif", "Instrument Serif Fallback", Georgia, serif',
            fontWeight: 400,
            letterSpacing: '-0.01em',
          }}
        >
          {content.text}
        </blockquote>
        {content.businessName && (
          <figcaption
            style={{
              ...typeScale.small,
              marginTop: space.card,
              color: bg.textMuted,
              textTransform: 'uppercase',
              letterSpacing: '0.16em',
              fontFamily: '"DM Sans", "DM Sans Fallback", system-ui, sans-serif',
            }}
          >
            {content.businessName}
          </figcaption>
        )}
      </figure>
      {image && (
        <div className="md:col-span-5">
          <TreatedImage
            src={image}
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="w-full object-cover"
          />
          {content.imageCredit?.name && (
            <a
              href={content.imageCredit.link}
              target="_blank"
              rel="noopener noreferrer"
              style={{ ...typeScale.small, display: 'block', marginTop: space.sm, color: bg.textMuted }}
            >
              Photo: {content.imageCredit.name} / Unsplash
            </a>
          )}
        </div>
      )}
      </div>
      {isEditing && onUpdate && <><Button variant="outline" onClick={() => setPicker(true)}><ImagePlus />Change supporting image</Button><ImagePicker open={picker} onClose={() => setPicker(false)} onSelect={image => onUpdate({ ...content, supportingImage: image.urls.regular, supportingImageAsset: image.asset, imageCredit: image.user ? { name: image.user.name, link: image.user.link } : undefined })} /></>}
    </section>
  );
}
