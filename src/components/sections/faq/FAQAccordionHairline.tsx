/**
 * FAQAccordionHairline — Analytical Validator FAQ layout
 * 
 * Clean accordion with hairline dividers, chevron rotation.
 */

import React from 'react';
import { getSectionBackgroundStyles } from '@/lib/artDirectorBrief';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface FAQAccordionHairlineProps {
  content: Record<string, any>;
  onUpdate: (content: any) => void;
  isEditing?: boolean;
}

export default function FAQAccordionHairline({ content, onUpdate, isEditing }: FAQAccordionHairlineProps) {
  console.log('🎨 [ArtDirector] FAQ: accordion-hairline composition');
  const bgStyles = getSectionBackgroundStyles(content.sectionBackground || 'light', content.primaryColor);
  const primaryColor = content.primaryColor || '#6366F1';
  const items = content.items || content.faqs || [];
  const isSerif = content.typographyPairing === 'serif-sans';

  const validItems = items.filter((item: any) => item.question && item.answer);
  if (validItems.length < 3) return null;

  const handleItemBlur = (index: number, field: string, e: React.FocusEvent<HTMLElement>) => {
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

      <div style={{ maxWidth: 640, margin: '0 auto' }}>
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
          {content.sectionLabel || content.eyebrow || 'FAQ'}
        </div>

        {/* Section title */}
        <h2
          contentEditable={isEditing}
          suppressContentEditableWarning
          onBlur={(e) => onUpdate({ ...content, headline: e.currentTarget.textContent })}
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
          {content.headline || 'Frequently Asked Questions'}
        </h2>

        {/* Accordion */}
        <Accordion type="single" collapsible>
          {validItems.map((item: any, i: number) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              style={{ borderColor: bgStyles.border }}
            >
              <AccordionTrigger
                className="hover:no-underline"
                style={{
                  fontSize: 15,
                  fontWeight: 500,
                  color: bgStyles.text,
                  fontFamily: '"DM Sans", system-ui, sans-serif',
                  padding: '20px 0',
                  textAlign: 'left' as const,
                }}
              >
                <span
                  contentEditable={isEditing}
                  suppressContentEditableWarning
                  onBlur={(e) => handleItemBlur(i, 'question', e)}
                  onClick={(e) => isEditing && e.stopPropagation()}
                  className={isEditing ? 'outline-dashed outline-2 outline-blue-500/30 rounded px-1' : ''}
                >
                  {item.question}
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <p
                  contentEditable={isEditing}
                  suppressContentEditableWarning
                  onBlur={(e) => handleItemBlur(i, 'answer', e)}
                  className={isEditing ? 'outline-dashed outline-2 outline-blue-500/30 rounded px-1' : ''}
                  style={{
                    fontSize: 14,
                    lineHeight: 1.7,
                    color: bgStyles.textMuted,
                    fontFamily: '"DM Sans", system-ui, sans-serif',
                    margin: 0,
                    paddingBottom: 8,
                  }}
                >
                  {item.answer}
                </p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
