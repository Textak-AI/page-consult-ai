/**
 * FeaturesStoryBlocks — Emotional Connector features presentation
 * 
 * Accent-bar feature cards on light/tinted background.
 * Each card has a 4px colored left bar using primaryColor.
 */

import React from 'react';
import { getSectionBackgroundStyles } from '@/lib/artDirectorBrief';

interface FeaturesStoryBlocksProps {
  content: Record<string, any>;
  onUpdate: (content: any) => void;
  isEditing?: boolean;
}

export default function FeaturesStoryBlocks({ content, onUpdate, isEditing }: FeaturesStoryBlocksProps) {
  console.log('🎨 [ArtDirector] Features: icon-cards/story-blocks composition');
  const bgStyles = getSectionBackgroundStyles(content.sectionBackground || 'light', content.primaryColor);
  const primaryColor = content.primaryColor || '#6366F1';
  const features = content.features || content.messagingPillars || [];

  const validFeatures = features.filter((f: any) => f.title && f.description);
  if (validFeatures.length < 3) return null;

  const cols = validFeatures.length <= 4 ? 2 : 3;

  const handleFeatureBlur = (index: number, field: string, e: React.FocusEvent<HTMLElement>) => {
    const updated = [...features];
    updated[index] = { ...updated[index], [field]: e.currentTarget.textContent || updated[index][field] };
    onUpdate({ ...content, features: updated });
  };

  return (
    <section style={{ backgroundColor: bgStyles.bg, padding: '96px clamp(24px, 6vw, 96px)' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');`}</style>

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
          marginBottom: 16,
          textAlign: 'center' as const,
          fontFamily: '"DM Sans", system-ui, sans-serif',
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
            fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
            fontWeight: content.typographyPairing === 'serif-sans' ? 400 : 600,
            color: bgStyles.text,
            lineHeight: 1.2,
            fontFamily: content.typographyPairing === 'serif-sans'
              ? '"Instrument Serif", Georgia, serif'
              : '"DM Sans", system-ui, sans-serif',
            letterSpacing: content.trackingStyle === 'tight' ? '-0.02em' : '0',
            textAlign: 'center' as const,
            margin: '0 auto 56px',
            maxWidth: 500,
          }}
        >
          {content.sectionTitle || content.headline || content.title || 'How we help'}
        </h2>

        {/* Feature cards grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: 28,
        }}>
          {validFeatures.map((feature: any, i: number) => (
            <div
              key={i}
              style={{
                display: 'flex',
                backgroundColor: content.sectionBackground === 'dark' ? 'rgba(255,255,255,0.04)' : '#FFFFFF',
                borderRadius: 12,
                overflow: 'hidden',
                boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
              }}
            >
              {/* Accent bar */}
              <div style={{
                width: 4,
                flexShrink: 0,
                backgroundColor: primaryColor,
                borderRadius: '4px 0 0 4px',
              }} />

              {/* Content */}
              <div style={{ padding: 24, flex: 1 }}>
                <h3
                  contentEditable={isEditing}
                  suppressContentEditableWarning
                  onBlur={(e) => handleFeatureBlur(i, 'title', e)}
                  className={isEditing ? 'outline-dashed outline-2 outline-blue-500/30 rounded px-1' : ''}
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: bgStyles.text,
                    margin: '0 0 8px',
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
                    fontSize: 14,
                    lineHeight: 1.75,
                    color: bgStyles.textMuted,
                    margin: 0,
                    fontFamily: '"DM Sans", system-ui, sans-serif',
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
