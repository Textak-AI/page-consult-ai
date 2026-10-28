import { typeScale, spacing, space } from '@/lib/design/tokens';
/**
 * ProblemSolutionReliefArc — Emotional Connector problem/solution
 * 
 * Sequential narrative: problem (muted/tense) → transition → solution (warm/bright).
 */

import React from 'react';
import { getSectionBackgroundStyles } from '@/lib/artDirectorBrief';

interface ProblemSolutionReliefArcProps {
  content: Record<string, any>;
  onUpdate: (content: any) => void;
  isEditing?: boolean;
}

export default function ProblemSolutionReliefArc({ content, onUpdate, isEditing }: ProblemSolutionReliefArcProps) {
  const primaryColor = content.primaryColor || '#6366F1';

  const handleBlur = (field: string, e: React.FocusEvent<HTMLElement>) => {
    onUpdate({ ...content, [field]: e.currentTarget.textContent || content[field] });
  };

  const labelStyle: React.CSSProperties = {
    ...typeScale.eyebrow,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.2em',
    marginBottom: space.sm,
    fontFamily: '"DM Sans", "DM Sans Fallback", system-ui, sans-serif',
  };

  const bodyStyle: React.CSSProperties = {
    ...typeScale.lead,
    fontFamily: '"DM Sans", "DM Sans Fallback", system-ui, sans-serif',
    margin: 0,
  };

  return (
    <section style={{ overflow: 'hidden' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');`}</style>

      {isEditing && (
        <div className="absolute inset-0 border-2 border-blue-500/50 rounded-lg pointer-events-none z-20" />
      )}

      {/* Problem — muted/cool */}
      <div style={{
        backgroundColor: '#F1F0EE',
        ...spacing.section,
      }}>
        <div style={{ maxWidth: 680, ...spacing.center }}>
          <div style={{ ...labelStyle, color: 'rgba(26,26,46,0.4)' }}>The Challenge</div>
          <p
            contentEditable={isEditing}
            suppressContentEditableWarning
            onBlur={(e) => handleBlur('problem', e)}
            className={isEditing ? 'outline-dashed outline-2 outline-blue-500/30 rounded px-1' : ''}
            style={{ ...bodyStyle, color: 'rgba(26,26,46,0.7)' }}
          >
            {content.problem || 'The problem your clients face.'}
          </p>
        </div>
      </div>

      {/* Gradient transition line */}
      <div style={{
        height: 3,
        background: `linear-gradient(to right, transparent, ${primaryColor}, transparent)`,
      }} />

      {/* Solution — warm/bright */}
      <div style={{
        backgroundColor: '#FFFFFF',
        ...spacing.section,
      }}>
        <div style={{ maxWidth: 680, ...spacing.center }}>
          <div style={{ ...labelStyle, color: primaryColor }}>Our Approach</div>
          <p
            contentEditable={isEditing}
            suppressContentEditableWarning
            onBlur={(e) => handleBlur('solution', e)}
            className={isEditing ? 'outline-dashed outline-2 outline-blue-500/30 rounded px-1' : ''}
            style={{ ...bodyStyle, color: '#1A1A2E' }}
          >
            {content.solution || 'How you solve it differently.'}
          </p>
        </div>
      </div>
    </section>
  );
}
