import { memo } from 'react';
import type { ReactNode, CSSProperties } from 'react';

interface SectionWrapperProps {
  children: ReactNode;
  className?: string;
  background?: 'dark' | 'darker' | 'darkest' | 'accent' | 'transparent' | 'light';
  paddingY?: 'sm' | 'md' | 'lg';
  maxWidth?: 'narrow' | 'default' | 'wide';
  showTopDivider?: boolean;
  id?: string;
  sectionType?: string;
  style?: CSSProperties;
  isEditing?: boolean;
}

const paddingMap = {
  sm: 'py-12 md:py-16',
  md: 'py-16 md:py-20',
  lg: 'py-20 md:py-24',
};

const maxWidthMap = {
  narrow: 'max-w-3xl',
  default: 'max-w-5xl',
  wide: 'max-w-6xl',
};

const backgroundMap: Record<string, string> = {
  dark: 'bg-slate-900',
  darker: 'bg-slate-950',
  darkest: 'bg-black',
  accent: '', // handled via style prop
  transparent: 'bg-transparent',
  light: 'bg-slate-50',
};

function SectionWrapperBase({
  children,
  className = '',
  background = 'dark',
  paddingY = 'md',
  maxWidth = 'wide',
  showTopDivider = false,
  id,
  sectionType,
  style,
  isEditing,
}: SectionWrapperProps) {
  return (
    <section
      id={id}
      data-section-type={sectionType}
      className={`${paddingMap[paddingY]} ${backgroundMap[background] || ''} ${isEditing ? 'relative' : ''} ${className}`}
      style={style}
    >
      {showTopDivider && (
        <div className="border-t border-white/5 absolute top-0 left-0 right-0" />
      )}
      {isEditing && (
        <div className="absolute inset-0 border-2 border-blue-500/50 rounded-lg pointer-events-none z-10" />
      )}
      <div className={`${maxWidthMap[maxWidth]} mx-auto px-6 md:px-8`}>
        {children}
      </div>
    </section>
  );
}

export const SectionWrapper = memo(SectionWrapperBase);
export default SectionWrapper;
