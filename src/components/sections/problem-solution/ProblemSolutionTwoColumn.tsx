/**
 * ProblemSolutionTwoColumn — Two-column problem/solution layout
 * 
 * Left: "The Challenge" + problem text. Right: "Our Approach" + solution text.
 * Labels in accent color, uppercase, small.
 */

import React from 'react';
import { getSectionBackgroundStyles } from '@/lib/artDirectorBrief';

interface ProblemSolutionTwoColumnProps {
  content: Record<string, any>;
  onUpdate: (content: any) => void;
  isEditing?: boolean;
}

export default function ProblemSolutionTwoColumn({ content, onUpdate, isEditing }: ProblemSolutionTwoColumnProps) {
  console.log('🎨 [ArtDirector] Problem/Solution: two-column composition');
  const bgStyles = getSectionBackgroundStyles(content.sectionBackground || 'light', content.primaryColor);
  const primaryColor = content.primaryColor || '#6366F1';

  const handleBlur = (field: string, e: React.FocusEvent<HTMLElement>) => {
    onUpdate({ ...content, [field]: e.currentTarget.textContent || content[field] });
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.2em',
    color: primaryColor,
    marginBottom: 16,
    fontFamily: '"DM Sans", system-ui, sans-serif',
  };

  const bodyStyle: React.CSSProperties = {
    fontSize: 15,
    lineHeight: 1.7,
    color: bgStyles.textMuted,
    fontFamily: '"DM Sans", system-ui, sans-serif',
    margin: 0,
  };

  return (
    <section style={{ backgroundColor: bgStyles.bg, padding: '96px clamp(24px, 6vw, 96px)' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');`}</style>

      {isEditing && (
        <div className="absolute inset-0 border-2 border-blue-500/50 rounded-lg pointer-events-none z-20" />
      )}

      <div style={{
        maxWidth: 920,
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 'clamp(32px, 5vw, 64px)',
      }}>
        {/* Problem column */}
        <div>
          <div style={labelStyle}>The Challenge</div>
          <p
            contentEditable={isEditing}
            suppressContentEditableWarning
            onBlur={(e) => handleBlur('problem', e)}
            className={isEditing ? 'outline-dashed outline-2 outline-blue-500/30 rounded px-1' : ''}
            style={bodyStyle}
          >
            {content.problem || 'The problem your clients face.'}
          </p>
        </div>

        {/* Solution column */}
        <div>
          <div style={labelStyle}>Our Approach</div>
          <p
            contentEditable={isEditing}
            suppressContentEditableWarning
            onBlur={(e) => handleBlur('solution', e)}
            className={isEditing ? 'outline-dashed outline-2 outline-blue-500/30 rounded px-1' : ''}
            style={bodyStyle}
          >
            {content.solution || 'How you solve it differently.'}
          </p>
        </div>
      </div>
    </section>
  );
}
