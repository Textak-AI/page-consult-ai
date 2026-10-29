import { typeScale, spacing, space, shape, featureType, accentFor } from '@/lib/design/tokens';
import { ChapterEyebrow, ChromaticMarker } from '@/components/signature/elements';
/**
 * ProcessNumberedRows — Analytical Validator process layout
 * 
 * Vertical list with monospace step numbers, hairline dividers.
 */

import React from 'react';
import { getSectionBackgroundStyles } from '@/lib/artDirectorBrief';

interface ProcessNumberedRowsProps {
  content: Record<string, any>;
  onUpdate: (content: any) => void;
  isEditing?: boolean;
}

export default function ProcessNumberedRows({ content, onUpdate, isEditing }: ProcessNumberedRowsProps) {
  const bgStyles = getSectionBackgroundStyles(content.sectionBackground || 'light', content.primaryColor);
  const primaryColor = content.primaryColor || '#6366F1';
  const steps = content.steps || [];
  const isSerif = content.typographyPairing === 'serif-sans';
  const useMonospace = content.numbering === 'monospace';

  const validSteps = steps.filter((s: any) => s.title && s.description);
  if (validSteps.length < 3) return null;

  const handleStepBlur = (index: number, field: string, e: React.FocusEvent<HTMLElement>) => {
    const updated = [...steps];
    updated[index] = { ...updated[index], [field]: e.currentTarget.textContent || updated[index][field] };
    onUpdate({ ...content, steps: updated });
  };

  return (
    <section style={{ backgroundColor: bgStyles.bg, ...spacing.section }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=JetBrains+Mono:wght@400;500&display=swap');`}</style>

      {isEditing && (
        <div className="absolute inset-0 border-2 border-blue-500/50 rounded-lg pointer-events-none z-20" />
      )}

      <div style={{ maxWidth: 760, ...spacing.center }}>
        {/* Section label */}
        {content.signature?.elements.includes('chapter') ? <ChapterEyebrow slot="plan" className="text-center" /> : <div style={{
          ...typeScale.eyebrow,
          fontWeight: 600,
          textTransform: 'uppercase' as const,
          letterSpacing: '0.2em',
          color: accentFor('eyebrow', primaryColor),
          textAlign: 'center' as const,
          marginBottom: space.sm,
          fontFamily: '"DM Sans", "DM Sans Fallback", system-ui, sans-serif',
        }}>
          {content.sectionLabel || content.eyebrow || 'Process'}
        </div>}

        {/* Section title */}
        <h2
          contentEditable={isEditing}
          suppressContentEditableWarning
          onBlur={(e) => onUpdate({ ...content, title: e.currentTarget.textContent })}
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
          {content.title || 'How It Works'}
        </h2>

        {/* Steps — vertical timeline: oversized numeral, accent marker, connector */}
        <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {validSteps.map((step: any, i: number) => {
            const last = i === validSteps.length - 1;
            return (
              <li
                key={i}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'clamp(64px, 12vw, 112px) 1fr',
                  columnGap: 'clamp(16px, 3vw, 32px)',
                }}
              >
                <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <div
                    aria-hidden="true"
                    style={{
                      ...featureType.timelineNumeral,
                      fontFamily: useMonospace ? '"JetBrains Mono", monospace' : '"DM Sans", "DM Sans Heading Fallback", system-ui, sans-serif',
                      fontWeight: useMonospace ? 400 : 700,
                      letterSpacing: '-0.04em',
                      color: bgStyles.text,
                      opacity: 0.18,
                    }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  {/* marker sits on the connector, right edge of the gutter */}
                  {content.signature?.elements.includes('timeline') ? <ChromaticMarker index={i} total={validSteps.length} /> : <span
                    aria-hidden="true"
                    style={{
                      position: 'absolute',
                      right: -(space.sm + 6),
                      top: space.sm,
                      width: 12,
                      height: 12,
                      borderRadius: 999,
                      backgroundColor: accentFor('timelineMarker', primaryColor),
                      boxShadow: `0 0 0 4px ${bgStyles.bg}`,
                      zIndex: 1,
                    }}
                  />}
                  {!last && (
                    <span
                      aria-hidden="true"
                      style={{
                        position: 'absolute',
                        right: -(space.sm + 1),
                        top: space.sm + 12,
                        bottom: 0,
                        width: shape.hairline * 2,
                        backgroundColor: bgStyles.border,
                      }}
                    />
                  )}
                </div>
                <div style={{ paddingLeft: space.sm, paddingBottom: last ? 0 : space.lg + space.sm, paddingTop: space.xs }}>
                  <h3
                    contentEditable={isEditing}
                    suppressContentEditableWarning
                    onBlur={(e) => handleStepBlur(i, 'title', e)}
                    className={isEditing ? 'outline-dashed outline-2 outline-blue-500/30 rounded px-1' : ''}
                    style={{
                      ...typeScale.h3,
                      fontSize: 20,
                      fontWeight: 600,
                      color: bgStyles.text,
                      ...spacing.titleGap,
                      fontFamily: '"DM Sans", "DM Sans Fallback", system-ui, sans-serif',
                    }}
                  >
                    {step.title}
                  </h3>
                  <p
                    contentEditable={isEditing}
                    suppressContentEditableWarning
                    onBlur={(e) => handleStepBlur(i, 'description', e)}
                    className={isEditing ? 'outline-dashed outline-2 outline-blue-500/30 rounded px-1' : ''}
                    style={{
                      ...typeScale.lead,
                      color: bgStyles.textMuted,
                      margin: 0,
                      fontFamily: '"DM Sans", "DM Sans Fallback", system-ui, sans-serif',
                    }}
                  >
                    {step.description}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
