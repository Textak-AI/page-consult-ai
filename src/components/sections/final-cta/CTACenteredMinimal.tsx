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
      style={{ backgroundColor: bgStyles.bg, padding: '96px clamp(24px, 6vw, 96px)' }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');`}</style>

      {isEditing && (
        <div className="absolute inset-0 border-2 border-blue-500/50 rounded-lg pointer-events-none z-20" />
      )}

      {/* Optional accent glow */}
      {content.hasAccentGlow && (
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl pointer-events-none"
          style={{ backgroundColor: `${primaryColor}10` }}
        />
      )}

      <div className="relative z-10" style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' as const }}>
        {/* Headline */}
        <h2
          contentEditable={isEditing}
          suppressContentEditableWarning
          onBlur={(e) => handleBlur('headline', e)}
          className={isEditing ? 'outline-dashed outline-2 outline-blue-500/30 rounded px-2' : ''}
          style={{
            fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
            fontWeight: isSerif ? 400 : 600,
            color: bgStyles.text,
            lineHeight: 1.15,
            fontFamily: isSerif
              ? '"Instrument Serif", Georgia, serif'
              : '"DM Sans", system-ui, sans-serif',
            letterSpacing: '-0.02em',
            marginBottom: 16,
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
              fontSize: 16,
              lineHeight: 1.6,
              color: bgStyles.textMuted,
              fontFamily: '"DM Sans", system-ui, sans-serif',
              marginBottom: 32,
            }}
          >
            {content.subtext || content.trustText}
          </p>
        )}

        {/* CTA Button */}
        <Button
          asChild
          size="lg"
          className="text-base px-8 py-6 font-medium shadow-lg transition-all duration-300 hover:scale-[1.02]"
          style={{
            backgroundColor: primaryColor,
            color: '#FFFFFF',
            borderRadius: 'var(--archetype-card-radius, 8px)',
          }}
        >
          <a href={content.ctaLink || '#contact'}>
            {content.ctaText || 'Get Started'}
          </a>
        </Button>
      </div>
    </section>
  );
}
