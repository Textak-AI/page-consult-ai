import { typeScale, spacing, space, shape } from '@/lib/design/tokens';
import { accentFor } from '@/lib/design/tokens';
/**
 * FeaturesStoryBlocks — Emotional Connector features presentation
 * 
 * Accent-bar feature cards on light/tinted background.
 * Each card has a 4px neutral left bar (accent discipline).
 */

import React from 'react';
import { getSectionBackgroundStyles } from '@/lib/artDirectorBrief';
import { cleanDisplayText } from '@/lib/contentCleaner';

interface FeaturesStoryBlocksProps {
  content: Record<string, any>;
  onUpdate: (content: any) => void;
  isEditing?: boolean;
}

export default function FeaturesStoryBlocks({ content, onUpdate, isEditing }: FeaturesStoryBlocksProps) {
  const bgStyles = getSectionBackgroundStyles(content.sectionBackground || ((content as any).mode === 'dark' ? 'dark' : 'light'), content.primaryColor);
  const primaryColor = content.primaryColor || '#6366F1';
  const features = content.features || content.messagingPillars || [];

  const validFeatures = features.filter((f: any) => f.title && f.description);
  if (validFeatures.length < 3) return null;

  const cols = validFeatures.length <= 4 ? 2 : 3;

  // Clean title — reject raw audience text
  const rawTitle = content.sectionTitle || content.headline || content.title || '';
  const isRawAudience = rawTitle.length > 60 || /^the\s/i.test(rawTitle) || /directors|managers|vp\s/i.test(rawTitle);
  const displayTitle = isRawAudience ? 'How we help' : (rawTitle || 'How we help');

  const handleFeatureBlur = (index: number, field: string, e: React.FocusEvent<HTMLElement>) => {
    const updated = [...features];
    updated[index] = { ...updated[index], [field]: e.currentTarget.textContent || updated[index][field] };
    onUpdate({ ...content, features: updated });
  };

  // Calculate flex basis
  const basisPercent = cols === 2 ? 'calc(50% - 14px)' : 'calc(33.333% - 19px)';

  return (
    <section style={{ backgroundColor: bgStyles.bg, ...spacing.section }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');`}</style>

      {isEditing && (
        <div className="absolute inset-0 border-2 border-blue-500/50 rounded-lg pointer-events-none z-20" />
      )}

      <div style={{ maxWidth: 920, ...spacing.center }}>
        {/* Section label */}
        <div style={{
          ...typeScale.eyebrow,
          fontWeight: 600,
          textTransform: 'uppercase' as const,
          letterSpacing: '0.2em',
          color: accentFor('eyebrow', primaryColor),
          marginBottom: space.sm,
          textAlign: 'center' as const,
          fontFamily: '"DM Sans", "DM Sans Fallback", system-ui, sans-serif',
        }}>
          {content.sectionLabel || content.eyebrow || 'What We Offer'}
        </div>

        {/* Section title */}
        <h2
          contentEditable={isEditing}
          suppressContentEditableWarning
          onBlur={(e) => onUpdate({ ...content, sectionTitle: e.currentTarget.textContent })}
          className={isEditing ? 'outline-dashed outline-2 outline-blue-500/30 rounded px-2' : ''}
          style={{
            ...typeScale.h2,
            fontWeight: content.typographyPairing === 'serif-sans' ? 400 : 600,
            color: bgStyles.text,
            fontFamily: content.typographyPairing === 'serif-sans'
              ? '"Instrument Serif", "Instrument Serif Fallback", Georgia, serif'
              : '"DM Sans", "DM Sans Heading Fallback", system-ui, sans-serif',
            letterSpacing: content.trackingStyle === 'tight' ? '-0.02em' : '0',
            textAlign: 'center' as const,
            ...spacing.headerBlock,
            maxWidth: 500,
          }}
        >
          {displayTitle}
        </h2>

        {/* Feature cards — flex-wrap for centered incomplete rows */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap' as const,
          justifyContent: 'center',
          gap: 28,
        }}>
          {validFeatures.map((feature: any, i: number) => (
            <div
              key={i}
              style={{
                flex: `0 1 ${basisPercent}`,
                minWidth: 260,
                display: 'flex',
                backgroundColor: content.sectionBackground === 'dark' ? 'rgba(255,255,255,0.04)' : '#FFFFFF',
                borderRadius: shape.radiusCard,
                overflow: 'hidden',
                boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
              }}
            >
              {/* Accent bar */}
              <div style={{
                width: 4,
                flexShrink: 0,
                backgroundColor: bgStyles.border,
                borderRadius: '4px 0 0 4px',
              }} />

              {/* Content */}
              <div style={{ padding: space.card, flex: 1 }}>
                <h3
                  contentEditable={isEditing}
                  suppressContentEditableWarning
                  onBlur={(e) => handleFeatureBlur(i, 'title', e)}
                  className={isEditing ? 'outline-dashed outline-2 outline-blue-500/30 rounded px-1' : ''}
                  style={{
                    ...typeScale.h3,
                    fontWeight: 600,
                    color: bgStyles.text,
                    ...spacing.titleGap,
                    fontFamily: '"DM Sans", "DM Sans Fallback", system-ui, sans-serif',
                  }}
                >
                  {feature.title}
                </h3>

                <p
                  contentEditable={isEditing}
                  suppressContentEditableWarning
                  onBlur={(e) => handleFeatureBlur(i, 'description', e)}
                  className={isEditing ? 'outline-dashed outline-2 outline-blue-500/30 rounded px-1' : ''}
                  style={{
                    ...typeScale.body,
                    color: bgStyles.textMuted,
                    margin: 0,
                    fontFamily: '"DM Sans", "DM Sans Fallback", system-ui, sans-serif',
                  }}
                >
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
