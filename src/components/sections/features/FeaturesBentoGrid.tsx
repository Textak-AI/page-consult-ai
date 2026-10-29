import { typeScale, spacing, space, shape } from '@/lib/design/tokens';
import { accentFor } from '@/lib/design/tokens';
/**
 * FeaturesBentoGrid — Analytical Validator features layout
 * 
 * 2×2 (or 3-col) grid with hairline gaps. Monospace numbers, no icons.
 */

import React from 'react';
import { getSectionBackgroundStyles } from '@/lib/artDirectorBrief';
import { cleanDisplayText } from '@/lib/contentCleaner';

interface FeaturesBentoGridProps {
  content: Record<string, any>;
  onUpdate: (content: any) => void;
  isEditing?: boolean;
}

export default function FeaturesBentoGrid({ content, onUpdate, isEditing }: FeaturesBentoGridProps) {
  console.log('🎨 [ArtDirector] Features: bento-grid composition');
  const bgStyles = getSectionBackgroundStyles(content.sectionBackground || 'dark', content.primaryColor);
  const primaryColor = content.primaryColor || '#6366F1';
  const features = content.features || content.messagingPillars || [];
  const isSerif = content.typographyPairing === 'serif-sans';

  const validFeatures = features.filter((f: any) => f.title && f.description);
  if (validFeatures.length < 3) return null;

  const cols = validFeatures.length <= 4 ? 2 : 3;
  const useMonospace = content.numbering === 'monospace';

  // Clean title — reject raw audience text
  const rawTitle = content.sectionTitle || content.title || content.headline || '';
  const isRawAudience = rawTitle.length > 60 || /^the\s/i.test(rawTitle) || /directors|managers|vp\s/i.test(rawTitle);
  const displayTitle = isRawAudience ? 'What sets us apart' : (rawTitle || 'What sets us apart');

  const handleFeatureBlur = (index: number, field: string, e: React.FocusEvent<HTMLElement>) => {
    const updated = [...features];
    updated[index] = { ...updated[index], [field]: e.currentTarget.textContent || updated[index][field] };
    onUpdate({ ...content, features: updated });
  };

  // Calculate flex basis for each card based on columns
  const gapPx = 1;
  const basisPercent = cols === 2 ? 'calc(50% - 1px)' : 'calc(33.333% - 1px)';

  return (
    <section style={{ backgroundColor: bgStyles.bg, ...spacing.section }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=JetBrains+Mono:wght@400;500&display=swap');`}</style>

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
          textAlign: 'center' as const,
          marginBottom: space.sm,
          fontFamily: '"DM Sans", "DM Sans Fallback", system-ui, sans-serif',
        }}>
          {content.sectionLabel || content.eyebrow || 'Capabilities'}
        </div>

        {/* Section title */}
        <h2
          contentEditable={isEditing}
          suppressContentEditableWarning
          onBlur={(e) => onUpdate({ ...content, sectionTitle: e.currentTarget.textContent })}
          className={isEditing ? 'outline-dashed outline-2 outline-blue-500/30 rounded px-2' : ''}
          style={{
            ...typeScale.h2,
            fontWeight: isSerif ? 400 : (content.headingWeight || 600),
            color: bgStyles.text,
            fontFamily: isSerif
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

        {/* Bento Grid — flex-wrap for centered incomplete rows */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap' as const,
          justifyContent: 'center',
          gap: gapPx,
          backgroundColor: bgStyles.border,
          border: `${shape.hairline}px solid ${bgStyles.border}`,
        }}>
          {validFeatures.map((feature: any, i: number) => (
            <div
              key={i}
              style={{
                flex: `0 1 ${basisPercent}`,
                minWidth: 240,
                backgroundColor: bgStyles.bg,
                padding: space.card,
              }}
            >
              {useMonospace && (
                <div style={{
                  ...typeScale.indexMono,
                  fontFamily: '"JetBrains Mono", monospace',
                  color: bgStyles.textMuted,
                  marginBottom: space.sm,
                  letterSpacing: '0.05em',
                }}>
                  {String(i + 1).padStart(2, '0')}
                </div>
              )}

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
                  letterSpacing: '-0.01em',
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
          ))}
        </div>
      </div>
    </section>
  );
}
