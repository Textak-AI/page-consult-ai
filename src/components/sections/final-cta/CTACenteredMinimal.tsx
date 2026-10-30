import { MagneticCta } from '@/components/motion/MagneticCta';
import { typeScale, spacing, space } from '@/lib/design/tokens';
import { ChapterEyebrow } from '@/components/signature/elements';
import { accentFor } from '@/lib/design/tokens';
/**
 * CTACenteredMinimal — Analytical Validator final CTA
 * 
 * Centered, minimal. Serif headline, one sentence, one CTA button.
 * Dark background with optional accent glow.
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { getSectionBackgroundStyles } from '@/lib/artDirectorBrief';

interface CTACenteredMinimalProps {
  content: Record<string, any>;
  onUpdate: (content: any) => void;
  isEditing?: boolean;
}

export default function CTACenteredMinimal({ content, onUpdate, isEditing }: CTACenteredMinimalProps) {
  const bgStyles = getSectionBackgroundStyles(content.sectionBackground || 'dark', content.primaryColor);
  const primaryColor = content.primaryColor || '#6366F1';
  const isSerif = content.typographyPairing === 'serif-sans';

  const handleBlur = (field: string, e: React.FocusEvent<HTMLElement>) => {
    onUpdate({ ...content, [field]: e.currentTarget.textContent || content[field] });
  };

  return (
    <section
      className="relative overflow-hidden"
      style={{ backgroundColor: bgStyles.bg, ...spacing.sectionCompact }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');`}</style>

      {isEditing && (
        <div className="absolute inset-0 border-2 border-blue-500/50 rounded-lg pointer-events-none z-20" />
      )}

      {/* Optional accent glow */}

      <div className="relative z-10" style={{ maxWidth: 600, ...spacing.center, textAlign: 'center' as const }}>
        {/* Headline */}
        {content.signature?.elements.includes('chapter') && <ChapterEyebrow slot="cta" />}
        <h2
          contentEditable={isEditing}
          suppressContentEditableWarning
          onBlur={(e) => handleBlur('headline', e)}
          className={isEditing ? 'outline-dashed outline-2 outline-blue-500/30 rounded px-2' : ''}
          style={{
            ...typeScale.h2,
            fontWeight: isSerif ? 400 : 600,
            color: bgStyles.text,
            fontFamily: isSerif
              ? '"Instrument Serif", "Instrument Serif Fallback", Georgia, serif'
              : '"DM Sans", "DM Sans Heading Fallback", system-ui, sans-serif',
            letterSpacing: '-0.02em',
            marginBottom: space.sm,
          }}
        >
          {content.headline || 'Ready to get started?'}
        </h2>

        {/* Subtext */}
        {(content.subtext || content.trustText) && (
          <p
            contentEditable={isEditing}
            suppressContentEditableWarning
            onBlur={(e) => handleBlur('subtext', e)}
            className={isEditing ? 'outline-dashed outline-2 outline-blue-500/30 rounded px-2' : ''}
            style={{
              ...typeScale.lead,
              color: bgStyles.textMuted,
              fontFamily: '"DM Sans", "DM Sans Fallback", system-ui, sans-serif',
              marginBottom: space.lg,
            }}
          >
            {content.subtext || content.trustText}
          </p>
        )}

        {/* CTA Button */}
        {content.ctaText && <>
        <MagneticCta>
        <Button
          asChild
          size="lg"
          className="pc-cta-primary text-base px-8 py-6 font-medium shadow-lg transition-all duration-300 hover:scale-[1.02]"
          style={{
            backgroundColor: accentFor('cta', primaryColor),
            color: '#FFFFFF',
            borderRadius: 'var(--archetype-card-radius, 8px)',
          }}
        >
          <a href={content.ctaLink || '#contact'}>
            {content.ctaText || 'Get Started'}
          </a>
        </Button>
        </MagneticCta>
        </>}
        {content.secondaryCta && <Button asChild variant="link" className="block mx-auto mt-3 text-foreground"><a href={content.secondaryCtaLink || '#contact'}>{content.secondaryCta}</a></Button>}
      </div>
    </section>
  );
}
