/**
 * StatsHairlineSeparated — Analytical Validator stats presentation
 * 
 * Stats in a row separated by vertical hairlines.
 * Numbers in brand accent color, labels muted below.
 */

import React from 'react';
import { getSectionBackgroundStyles } from '@/lib/artDirectorBrief';

interface StatsHairlineSeparatedProps {
  content: Record<string, any>;
  onUpdate: (content: any) => void;
  isEditing?: boolean;
}

export default function StatsHairlineSeparated({ content, onUpdate, isEditing }: StatsHairlineSeparatedProps) {
  const bgStyles = getSectionBackgroundStyles(content.sectionBackground || 'dark', content.primaryColor);
  const primaryColor = content.primaryColor || '#6366F1';
  const stats = content.statistics || [];

  const validStats = stats.filter((s: any) => {
    if (!s.value || !s.label) return false;
    if (!/\d/.test(s.value)) return false;
    const genericLabels = ['consulting', 'services', 'business', 'growth', 'company', 'industry'];
    if (genericLabels.includes(String(s.label).toLowerCase().trim())) return false;
    return true;
  });

  if (validStats.length < 2) return null;

  const handleStatBlur = (index: number, field: 'value' | 'label', e: React.FocusEvent<HTMLElement>) => {
    if (!onUpdate) return;
    const updatedStats = [...stats];
    updatedStats[index] = { ...updatedStats[index], [field]: e.currentTarget.textContent || updatedStats[index][field] };
    onUpdate({ ...content, statistics: updatedStats });
  };

  return (
    <section style={{ backgroundColor: bgStyles.bg, padding: '96px clamp(24px, 6vw, 96px)' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');`}</style>

      {isEditing && (
        <div className="absolute inset-0 border-2 border-blue-500/50 rounded-lg pointer-events-none z-20" />
      )}

      <div
        style={{
          maxWidth: 920,
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          gap: 0,
        }}
      >
        {validStats.map((stat: any, i: number) => (
          <div
            key={i}
            style={{
              flex: 1,
              textAlign: 'center',
              padding: '0 clamp(16px, 3vw, 48px)',
              borderLeft: i > 0 ? `1px solid ${bgStyles.border}` : 'none',
            }}
          >
            <div
              contentEditable={isEditing}
              suppressContentEditableWarning
              onBlur={(e) => handleStatBlur(i, 'value', e)}
              className={isEditing ? 'outline-dashed outline-2 outline-blue-500/30 rounded px-1' : ''}
              style={{
                fontSize: 'clamp(2rem, 3.5vw, 2.75rem)',
                fontWeight: 600,
                color: primaryColor,
                letterSpacing: '-0.02em',
                fontFamily: '"DM Sans", system-ui, sans-serif',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {stat.value}
            </div>

            <div
              contentEditable={isEditing}
              suppressContentEditableWarning
              onBlur={(e) => handleStatBlur(i, 'label', e)}
              className={isEditing ? 'outline-dashed outline-2 outline-blue-500/30 rounded px-1' : ''}
              style={{
                fontSize: 13,
                color: bgStyles.textMuted,
                marginTop: 8,
                lineHeight: 1.4,
                fontFamily: '"DM Sans", system-ui, sans-serif',
              }}
            >
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
