import { memo } from 'react';
import { cleanDisplayText } from '@/lib/contentCleaner';

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  maxSubtitleLength?: number;
  className?: string;
  /** Override text colors for light-mode sections */
  lightMode?: boolean;
  /** Brand accent color for eyebrow badge */
  accentColor?: string;
  /** Typography overrides from SDI */
  titleClassName?: string;
  subtitleClassName?: string;
  /** Inline editing support */
  isEditing?: boolean;
  onTitleBlur?: (e: React.FocusEvent<HTMLElement>) => void;
  onSubtitleBlur?: (e: React.FocusEvent<HTMLElement>) => void;
}

function SectionHeaderBase({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  maxSubtitleLength = 120,
  className = '',
  lightMode = false,
  accentColor,
  titleClassName,
  subtitleClassName,
  isEditing,
  onTitleBlur,
  onSubtitleBlur,
}: SectionHeaderProps) {
  const alignClass = align === 'center' ? 'text-center' : 'text-left';
  const titleColor = lightMode ? 'text-slate-900' : 'text-white';
  const subtitleColor = lightMode ? 'text-slate-600' : 'text-slate-300';

  const cleanedSubtitle = subtitle ? cleanDisplayText(subtitle, maxSubtitleLength) : undefined;

  const eyebrowStyle = accentColor
    ? { backgroundColor: `${accentColor}15`, color: accentColor }
    : undefined;
  const eyebrowClass = accentColor
    ? 'text-xs font-semibold tracking-[0.2em] uppercase px-4 py-1 rounded-full inline-block'
    : `text-xs font-semibold tracking-[0.2em] uppercase px-4 py-1 rounded-full inline-block ${
        lightMode ? 'bg-slate-100 text-slate-700' : 'bg-white/10 text-cyan-400'
      }`;

  return (
    <div className={`${alignClass} mb-12 ${className}`}>
      {eyebrow && (
        <span className={eyebrowClass} style={eyebrowStyle}>
          {eyebrow}
        </span>
      )}
      <h2
        className={`${titleClassName || 'text-3xl md:text-4xl font-bold leading-tight'} ${titleColor} ${eyebrow ? 'mt-3' : ''} ${
          isEditing ? 'outline-dashed outline-2 outline-blue-500/30 rounded px-2 inline-block' : ''
        }`}
        style={{ fontWeight: 'var(--archetype-heading-weight, 700)' as any, letterSpacing: 'var(--archetype-heading-tracking, -0.025em)' }}
        contentEditable={isEditing}
        suppressContentEditableWarning
        onBlur={onTitleBlur}
      >
        {title}
      </h2>
      {cleanedSubtitle && (
        <p
          className={`${subtitleClassName || 'text-base md:text-lg leading-relaxed'} ${subtitleColor} mt-4 ${
            isEditing ? 'cursor-text hover:ring-2 hover:ring-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400 rounded px-1' : ''
          }`}
          contentEditable={isEditing}
          suppressContentEditableWarning
          onBlur={onSubtitleBlur}
        >
          {cleanedSubtitle}
        </p>
      )}
    </div>
  );
}

export const SectionHeader = memo(SectionHeaderBase);
export default SectionHeader;
