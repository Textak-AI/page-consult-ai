import { typeScale, spacing, space, shape } from '@/lib/design/tokens';
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
        <div style={{
          ...typeScale.eyebrow,
          fontWeight: 600,
          textTransform: 'uppercase' as const,
          letterSpacing: '0.2em',
          color: primaryColor,
          textAlign: 'center' as const,
          marginBottom: space.sm,
          fontFamily: '"DM Sans", "DM Sans Fallback", system-ui, sans-serif',
        }}>
          {content.sectionLabel || content.eyebrow || 'Process'}
        </div>

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

        {/* Steps */}
        {validSteps.map((step: any, i: number) => (
          <div key={i}>
            {i > 0 && (
              <div style={{ borderTop: `${shape.hairline}px solid ${bgStyles.border}` }} />
            )}
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 'clamp(16px, 3vw, 32px)',
              ...spacing.rowY,
            }}>
              {/* Number */}
              <div style={{
                fontSize: useMonospace ? typeScale.indexMono.fontSize : typeScale.index.fontSize,
                fontFamily: useMonospace ? '"JetBrains Mono", monospace' : '"DM Sans", "DM Sans Fallback", system-ui, sans-serif',
                color: useMonospace ? bgStyles.textMuted : primaryColor,
                fontWeight: useMonospace ? 400 : 600,
                minWidth: 40,
                paddingTop: useMonospace ? space.xxs : 0,
                letterSpacing: useMonospace ? '0.05em' : '0',
              }}>
                {useMonospace ? String(i + 1).padStart(2, '0') : String(i + 1)}
              </div>

              <div style={{ flex: 1 }}>
                <h3
                  contentEditable={isEditing}
                  suppressContentEditableWarning
                  onBlur={(e) => handleStepBlur(i, 'title', e)}
                  className={isEditing ? 'outline-dashed outline-2 outline-blue-500/30 rounded px-1' : ''}
                  style={{
                    ...typeScale.h3,
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
                    ...typeScale.body,
                    color: bgStyles.textMuted,
                    margin: 0,
                    fontFamily: '"DM Sans", "DM Sans Fallback", system-ui, sans-serif',
                  }}
                >
                  {step.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
