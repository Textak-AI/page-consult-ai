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
  console.log('🎨 [ArtDirector] Process: numbered-rows composition');
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
    <section style={{ backgroundColor: bgStyles.bg, padding: '96px clamp(24px, 6vw, 96px)' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=JetBrains+Mono:wght@400;500&display=swap');`}</style>

      {isEditing && (
        <div className="absolute inset-0 border-2 border-blue-500/50 rounded-lg pointer-events-none z-20" />
      )}

      <div style={{ maxWidth: 760, margin: '0 auto' }}>
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
          {content.sectionLabel || content.eyebrow || 'Process'}
        </div>

        {/* Section title */}
        <h2
          contentEditable={isEditing}
          suppressContentEditableWarning
          onBlur={(e) => onUpdate({ ...content, title: e.currentTarget.textContent })}
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
          {content.title || 'How It Works'}
        </h2>

        {/* Steps */}
        {validSteps.map((step: any, i: number) => (
          <div key={i}>
            {i > 0 && (
              <div style={{ borderTop: `1px solid ${bgStyles.border}` }} />
            )}
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 'clamp(16px, 3vw, 32px)',
              padding: '32px 0',
            }}>
              {/* Number */}
              <div style={{
                fontSize: useMonospace ? 14 : 24,
                fontFamily: useMonospace ? '"JetBrains Mono", monospace' : '"DM Sans", system-ui, sans-serif',
                color: useMonospace ? bgStyles.textMuted : primaryColor,
                fontWeight: useMonospace ? 400 : 600,
                minWidth: 40,
                paddingTop: useMonospace ? 4 : 0,
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
                    fontSize: 17,
                    fontWeight: 600,
                    color: bgStyles.text,
                    margin: '0 0 8px',
                    fontFamily: '"DM Sans", system-ui, sans-serif',
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
                    fontSize: 14,
                    lineHeight: 1.7,
                    color: bgStyles.textMuted,
                    margin: 0,
                    fontFamily: '"DM Sans", system-ui, sans-serif',
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
