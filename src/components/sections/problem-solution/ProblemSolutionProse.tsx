import React from 'react';
import { getSectionBackgroundStyles } from '@/lib/artDirectorBrief';
import { fontStacks } from '@/lib/design/tokens';

interface Props {
  content: Record<string, any>;
  onUpdate: (content: any) => void;
  isEditing: boolean;
}

/**
 * Prose layout (immersive register): one column you'd read with headphones on. A small
 * label, the problem in the reader's words, a rule, a small label, what this is. No cards,
 * no icons, no comparison columns.
 */
export default function ProblemSolutionProse({ content, onUpdate, isEditing }: Props) {
  const primaryColor = content.primaryColor || '#15707F';
  const bg = getSectionBackgroundStyles(content.sectionBackground || 'dark', primaryColor);
  const handleBlur = (field: string, e: React.FocusEvent<HTMLElement>) => {
    onUpdate({ ...content, [field]: e.currentTarget.textContent || content[field] });
  };
  const edit = isEditing ? 'outline-dashed outline-2 outline-cyan-500/30 rounded px-1' : '';
  const label: React.CSSProperties = { color: primaryColor, filter: 'brightness(1.5)', fontFamily: fontStacks.sans, fontSize: 12, letterSpacing: '0.22em', textTransform: 'uppercase' };
  const body: React.CSSProperties = { color: bg.text, fontFamily: fontStacks.serifDisplay, fontSize: 'clamp(1.35rem, 2.2vw, 1.8rem)', lineHeight: 1.45 };

  return (
    <section className="relative" style={{ backgroundColor: bg.bg }}>
      <div className={`mx-auto max-w-3xl px-6 py-20 md:py-28 ${content.labels === 'none' ? 'space-y-8' : 'space-y-14'}`}>
        {content.problem && (
          <div className="space-y-5">
            {content.labels !== 'none' && <p style={label}>{content.problemTitle || 'The problem'}</p>}
            <p contentEditable={isEditing} suppressContentEditableWarning onBlur={(e) => handleBlur('problem', e)} className={edit} style={body}>{content.problem}</p>
          </div>
        )}
        {content.problem && content.solution && content.labels !== 'none' && <hr className="border-0 h-px" style={{ background: `linear-gradient(90deg, ${primaryColor}, transparent)` }} />}
        {content.solution && (
          <div className="space-y-5">
            {content.labels !== 'none' && <p style={label}>{content.solutionTitle || 'What this is'}</p>}
            <p contentEditable={isEditing} suppressContentEditableWarning onBlur={(e) => handleBlur('solution', e)} className={edit} style={body}>{content.solution}</p>
          </div>
        )}
      </div>
    </section>
  );
}
