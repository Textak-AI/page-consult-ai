import { memo } from 'react';

interface StatDisplayProps {
  value: string;
  label: string;
  detail?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'card' | 'inline' | 'hero';
  className?: string;
  lightMode?: boolean;
  accentColor?: string;
  isEditing?: boolean;
  onValueBlur?: (e: React.FocusEvent<HTMLElement>) => void;
  onLabelBlur?: (e: React.FocusEvent<HTMLElement>) => void;
}

const CAMEL_CASE_RE = /[a-z][A-Z]/;
const ISO_RE = /\d{4}-\d{2}-\d{2}/;
const INDUSTRY_TAGS = ['saas', 'consulting', 'healthcare', 'manufacturing', 'fintech', 'ecommerce', 'education', 'default', 'local-services', 'devtools'];

const sizeMap = {
  sm: 'text-2xl',
  md: 'text-4xl',
  lg: 'text-5xl',
};

function StatDisplayBase({
  value,
  label,
  detail,
  size = 'md',
  variant = 'inline',
  className = '',
  lightMode = false,
  accentColor,
  isEditing,
  onValueBlur,
  onLabelBlur,
}: StatDisplayProps) {
  // Validation — reject bad data
  if (!value || !/\d/.test(value)) return null;
  if (!label || label.length < 5) return null;
  if (CAMEL_CASE_RE.test(label)) return null;
  if (ISO_RE.test(label)) return null;
  if (INDUSTRY_TAGS.includes(label.toLowerCase().trim())) return null;

  const valueColor = lightMode
    ? (accentColor ? '' : 'text-slate-900')
    : 'text-white';
  const labelColor = lightMode ? 'text-slate-500' : 'text-slate-400';
  const detailColor = lightMode ? 'text-slate-400' : 'text-slate-500';

  const valueStyle = accentColor && lightMode ? { color: accentColor } : undefined;

  const editClass = isEditing
    ? 'cursor-text hover:ring-2 hover:ring-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400 rounded px-1'
    : '';

  const inner = (
    <>
      <div
        className={`${sizeMap[size]} font-bold ${valueColor} ${editClass}`}
        style={{
          ...valueStyle,
          fontSize: 'var(--archetype-stat-size)',
          fontWeight: 'var(--archetype-heading-weight, 700)' as any,
        }}
        contentEditable={isEditing}
        suppressContentEditableWarning
        onBlur={onValueBlur}
      >
        {value}
      </div>
      <p
        className={`text-sm ${labelColor} mt-1 ${editClass}`}
        contentEditable={isEditing}
        suppressContentEditableWarning
        onBlur={onLabelBlur}
      >
        {label}
      </p>
      {detail && (
        <p className={`text-xs ${detailColor} mt-1`}>{detail}</p>
      )}
    </>
  );

  if (variant === 'card') {
    return (
      <div className={`border border-white/10 bg-white/5 rounded-xl p-6 ${className}`}>
        {inner}
      </div>
    );
  }

  return <div className={className}>{inner}</div>;
}

export const StatDisplay = memo(StatDisplayBase);
export default StatDisplay;
