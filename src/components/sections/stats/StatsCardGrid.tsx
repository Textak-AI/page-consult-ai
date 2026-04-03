/**
 * StatsCardGrid — Emotional Connector stats presentation
 * 
 * White stat cards on a brand-color full-bleed background.
 */

import React from 'react';
import { getSectionBackgroundStyles } from '@/lib/artDirectorBrief';

interface StatsCardGridProps {
  content: Record<string, any>;
  onUpdate: (content: any) => void;
  isEditing?: boolean;
}

export default function StatsCardGrid({ content, onUpdate, isEditing }: StatsCardGridProps) {
  const primaryColor = content.primaryColor || '#6366F1';
  const bgStyles = getSectionBackgroundStyles(content.sectionBackground || 'brand', primaryColor);
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

  // Determine if background is brand-colored
  const isBrandBg = content.sectionBackground === 'brand';
  const sectionBg = isBrandBg ? primaryColor : bgStyles.bg;

  return (
    <section style={{ backgroundColor: sectionBg, padding: '96px clamp(24px, 6vw, 96px)' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');`}</style>

      {isEditing && (
        <div className="absolute inset-0 border-2 border-blue-500/50 rounded-lg pointer-events-none z-20" />
      )}

      <div style={{
        maxWidth: 920,
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: `repeat(${Math.min(validStats.length, 4)}, 1fr)`,
        gap: 24,
      }}>
        {validStats.map((stat: any, i: number) => (
          <div
            key={i}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              padding: 28,
              textAlign: 'center' as const,
              boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
            }}
          >
            <div
              contentEditable={isEditing}
              suppressContentEditableWarning
              onBlur={(e) => handleStatBlur(i, 'value', e)}
              className={isEditing ? 'outline-dashed outline-2 outline-blue-500/30 rounded px-1' : ''}
              style={{
                fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
                fontWeight: 700,
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
                color: 'rgba(26,26,46,0.6)',
                marginTop: 8,
                lineHeight: 1.5,
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
