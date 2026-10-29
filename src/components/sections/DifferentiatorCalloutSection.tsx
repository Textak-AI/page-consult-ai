import { featureType, spacing, space, typeScale, accentFor } from '@/lib/design/tokens';
import { getSectionBackgroundStyles } from '@/lib/artDirectorBrief';

interface DifferentiatorCalloutProps {
  content: {
    text: string;
    businessName?: string;
    primaryColor?: string;
    sectionBackground?: string;
  };
}

/**
 * Pull-quote: the business's own sentence about its own work, attributed to the
 * business. Deliberately not a testimonial — no quote marks, avatar or person.
 */
export function DifferentiatorCalloutSection({ content }: DifferentiatorCalloutProps) {
  if (!content?.text) return null;
  const bg = getSectionBackgroundStyles(content.sectionBackground || 'dark', content.primaryColor);
  const rule = accentFor('pullQuoteRule', content.primaryColor || '#6366F1');

  return (
    <section style={{ backgroundColor: bg.bg, ...spacing.section }}>
      <figure style={{ maxWidth: 820, ...spacing.center, margin: '0 auto' }}>
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
    </section>
  );
}
