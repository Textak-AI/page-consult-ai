/**
 * FeaturesBentoGrid — Analytical Validator features layout
 * 
 * 2×2 (or 3-col) grid with hairline gaps. Monospace numbers, no icons.
 */

import React from 'react';
import { getSectionBackgroundStyles } from '@/lib/artDirectorBrief';

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

  const handleFeatureBlur = (index: number, field: string, e: React.FocusEvent<HTMLElement>) => {
    const updated = [...features];
    updated[index] = { ...updated[index], [field]: e.currentTarget.textContent || updated[index][field] };
    onUpdate({ ...content, features: updated });
  };

  return (
    <section style={{ backgroundColor: bgStyles.bg, padding: '96px clamp(24px, 6vw, 96px)' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=JetBrains+Mono:wght@400;500&display=swap');`}</style>

      {isEditing && (
        <div className="absolute inset-0 border-2 border-blue-500/50 rounded-lg pointer-events-none z-20" />
      )}

      <div style={{ maxWidth: 920, margin: '0 auto' }}>
        {/* Section label */}
        <div style={{
          fontSize: 11,
          fontWeight: 600,
          textTransform: 'uppercase' as const,
          letterSpacing: '0.2em',
          color: primaryColor,
          textAlign: 'center' as const,
          marginBottom: 16,
          fontFamily: '"DM Sans", system-ui, sans-serif',
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
            fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
            fontWeight: isSerif ? 400 : (content.headingWeight || 600),
            color: bgStyles.text,
            lineHeight: 1.2,
            fontFamily: isSerif
              ? '"Instrument Serif", Georgia, serif'
              : '"DM Sans", system-ui, sans-serif',
            letterSpacing: content.trackingStyle === 'tight' ? '-0.02em' : '0',
            textAlign: 'center' as const,
            margin: '0 auto 56px',
            maxWidth: 500,
          }}
        >
          {content.sectionTitle || content.title || content.headline || 'What sets us apart'}
        </h2>

        {/* Bento Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: '1px',
          backgroundColor: bgStyles.border,
          border: `1px solid ${bgStyles.border}`,
        }}>
          {validFeatures.map((feature: any, i: number) => (
            <div
              key={i}
              style={{
                backgroundColor: bgStyles.bg,
                padding: 'clamp(24px, 3vw, 40px)',
              }}
            >
              {useMonospace && (
                <div style={{
                  fontSize: 12,
                  fontFamily: '"JetBrains Mono", monospace',
                  color: bgStyles.textMuted,
                  marginBottom: 16,
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
                  fontSize: 17,
                  fontWeight: 600,
                  color: bgStyles.text,
                  margin: '0 0 8px',
                  letterSpacing: '-0.01em',
                  fontFamily: '"DM Sans", system-ui, sans-serif',
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
                  fontSize: 13,
                  lineHeight: 1.6,
                  color: bgStyles.textMuted,
                  margin: 0,
                  fontFamily: '"DM Sans", system-ui, sans-serif',
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
