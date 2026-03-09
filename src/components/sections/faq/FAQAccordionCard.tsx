/**
 * FAQAccordionCard — Emotional Connector FAQ presentation
 * 
 * Soft card accordion with rounded corners and warm shadows.
 * Brand color accent on expanded state.
 */

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { getSectionBackgroundStyles } from '@/lib/artDirectorBrief';

interface FAQAccordionCardProps {
  content: Record<string, any>;
  onUpdate: (content: any) => void;
  isEditing?: boolean;
}

export default function FAQAccordionCard({ content, onUpdate, isEditing }: FAQAccordionCardProps) {
  console.log('🎨 [ArtDirector] FAQ: accordion-card composition');
  const bgStyles = getSectionBackgroundStyles(content.sectionBackground || 'light', content.primaryColor);
  const primaryColor = content.primaryColor || '#6366F1';
  const items = content.items || [];
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const validItems = items.filter((item: any) => item.question && item.answer);
  if (validItems.length < 3) return null;

  const handleItemBlur = (index: number, field: 'question' | 'answer', e: React.FocusEvent<HTMLElement>) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: e.currentTarget.textContent || updated[index][field] };
    onUpdate({ ...content, items: updated });
  };

  return (
    <section style={{ backgroundColor: bgStyles.bg, padding: '96px clamp(24px, 6vw, 96px)' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');`}</style>

      {isEditing && (
        <div className="absolute inset-0 border-2 border-blue-500/50 rounded-lg pointer-events-none z-20" />
      )}

      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        {/* Section label */}
        <div style={{
          fontSize: 11,
          fontWeight: 600,
          textTransform: 'uppercase' as const,
          letterSpacing: '0.2em',
          color: primaryColor,
          marginBottom: 16,
          textAlign: 'center' as const,
          fontFamily: '"DM Sans", system-ui, sans-serif',
        }}>
          {content.eyebrow || 'FAQ'}
        </div>

        {/* Section title */}
        <h2 style={{
          fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
          fontWeight: content.typographyPairing === 'serif-sans' ? 400 : 600,
          color: bgStyles.text,
          lineHeight: 1.2,
          fontFamily: content.typographyPairing === 'serif-sans'
            ? '"Instrument Serif", Georgia, serif'
            : '"DM Sans", system-ui, sans-serif',
          textAlign: 'center' as const,
          margin: '0 auto 48px',
        }}>
          {content.headline || 'Common Questions'}
        </h2>

        {/* Accordion cards */}
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 16 }}>
          {validItems.map((item: any, i: number) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 12,
                  boxShadow: isOpen
                    ? `0 4px 24px rgba(0,0,0,0.08), 0 0 0 1px ${primaryColor}20`
                    : '0 2px 12px rgba(0,0,0,0.04)',
                  overflow: 'hidden',
                  transition: 'box-shadow 0.2s ease',
                }}
              >
                {/* Question button */}
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  style={{
                    width: '100%',
                    padding: '20px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left' as const,
                  }}
                >
                  <span
                    contentEditable={isEditing}
                    suppressContentEditableWarning
                    onBlur={(e) => handleItemBlur(i, 'question', e)}
                    onClick={(e) => isEditing && e.stopPropagation()}
                    className={isEditing ? 'outline-dashed outline-2 outline-blue-500/30 rounded px-1' : ''}
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: isOpen ? primaryColor : bgStyles.text,
                      fontFamily: '"DM Sans", system-ui, sans-serif',
                      transition: 'color 0.2s ease',
                      flex: 1,
                    }}
                  >
                    {item.question}
                  </span>
                  <ChevronDown
                    size={18}
                    style={{
                      color: isOpen ? primaryColor : bgStyles.textMuted,
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
                      transition: 'transform 0.25s ease, color 0.2s ease',
                      flexShrink: 0,
                      marginLeft: 16,
                    }}
                  />
                </button>

                {/* Answer */}
                {isOpen && (
                  <div style={{
                    padding: '0 24px 20px',
                    borderTop: `1px solid ${primaryColor}10`,
                  }}>
                    <p
                      contentEditable={isEditing}
                      suppressContentEditableWarning
                      onBlur={(e) => handleItemBlur(i, 'answer', e)}
                      className={isEditing ? 'outline-dashed outline-2 outline-blue-500/30 rounded px-1' : ''}
                      style={{
                        fontSize: 14,
                        lineHeight: 1.75,
                        color: bgStyles.textMuted,
                        margin: '12px 0 0',
                        fontFamily: '"DM Sans", system-ui, sans-serif',
                      }}
                    >
                      {item.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
