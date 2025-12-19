import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, MessageSquare, Edit3 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import type { FAQItem } from '@/services/intelligence/types';

interface FAQSectionProps {
  content: {
    headline?: string;
    items: FAQItem[];
  };
  onUpdate: (content: FAQSectionProps['content']) => void;
  isEditing?: boolean;
}

export function FAQSection({ content, onUpdate, isEditing }: FAQSectionProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<number | null>(null);

  const headline = content.headline || 'Frequently Asked Questions';
  const items = content.items || [];

  const handleToggle = (index: number) => {
    if (!isEditing || editingItem === null) {
      setExpandedIndex(expandedIndex === index ? null : index);
    }
  };

  const handleItemUpdate = (index: number, field: 'question' | 'answer', value: string) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    onUpdate({ ...content, items: updatedItems });
  };

  const handleHeadlineUpdate = (e: React.FocusEvent<HTMLHeadingElement>) => {
    onUpdate({ ...content, headline: e.currentTarget.textContent || headline });
  };

  return (
    <section 
      className={`relative ${isEditing ? 'relative' : ''}`}
      style={{ 
        backgroundColor: 'var(--color-background)',
        padding: 'var(--spacing-section-y) var(--spacing-section-x)',
      }}
      itemScope
      itemType="https://schema.org/FAQPage"
    >
      {isEditing && (
        <div 
          className="absolute inset-0 border-2 rounded-lg pointer-events-none z-10"
          style={{ borderColor: 'var(--color-secondary)' }}
        />
      )}

      <div className="container mx-auto max-w-3xl relative z-0">
        {/* Header */}
        <div className="text-center mb-12">
          <div 
            className="inline-flex items-center gap-2 px-4 py-1.5 mb-4"
            style={{
              backgroundColor: 'var(--color-primary-muted)',
              borderColor: 'var(--color-primary)',
              borderWidth: 'var(--border-width)',
              borderStyle: 'solid',
              borderRadius: 'var(--radius-large)',
            }}
          >
            <MessageSquare 
              className="w-4 h-4"
              style={{ color: 'var(--color-primary)' }}
              strokeWidth={1.5}
            />
            <span 
              className="text-sm"
              style={{ 
                color: 'var(--color-primary)',
                fontFamily: 'var(--font-body)',
                fontWeight: 'var(--font-weight-body)',
              }}
            >
              Common Questions
            </span>
          </div>
          
          <h2 
            className={`text-3xl md:text-4xl ${
              isEditing ? 'outline-dashed outline-2 rounded px-2' : ''
            }`}
            style={{ 
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-heading)',
              fontWeight: 'var(--font-weight-heading)',
              lineHeight: 'var(--line-height-heading)',
              letterSpacing: 'var(--letter-spacing-heading)',
              outlineColor: isEditing ? 'var(--color-secondary)' : undefined,
            }}
            contentEditable={isEditing}
            suppressContentEditableWarning
            onBlur={handleHeadlineUpdate}
          >
            {headline}
          </h2>
        </div>

        {/* FAQ Items */}
        <div 
          className="overflow-hidden"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
            borderWidth: 'var(--border-width)',
            borderStyle: 'solid',
            borderRadius: 'var(--radius-large)',
            padding: '0 var(--spacing-card-padding)',
          }}
        >
          {items.map((item, index) => (
            <motion.div
              key={index}
              className="last:border-b-0"
              style={{ 
                borderBottomColor: 'var(--color-border)', 
                borderBottomWidth: 'var(--border-width)',
                borderBottomStyle: 'solid',
              }}
              itemScope
              itemProp="mainEntity"
              itemType="https://schema.org/Question"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              {/* Question */}
              <button
                className="w-full py-5 px-1 flex items-center justify-between text-left group"
                onClick={() => handleToggle(index)}
                aria-expanded={expandedIndex === index}
              >
                {isEditing && editingItem === index ? (
                  <Input
                    value={item.question}
                    onChange={(e) => handleItemUpdate(index, 'question', e.target.value)}
                    onBlur={() => setEditingItem(null)}
                    className="flex-1 mr-4"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      borderColor: 'var(--color-primary)',
                    }}
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <h3 
                    className="text-lg pr-4 flex-1 transition-colors"
                    style={{ 
                      color: 'var(--color-text-primary)',
                      fontFamily: 'var(--font-heading)',
                      fontWeight: 'var(--font-weight-body)',
                    }}
                    itemProp="name"
                  >
                    {item.question}
                  </h3>
                )}
                
                <div className="flex items-center gap-2 flex-shrink-0">
                  {isEditing && editingItem !== index && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingItem(index);
                        setExpandedIndex(index);
                      }}
                      className="p-1 transition-colors"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      <Edit3 className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                  )}
                  <motion.div
                    animate={{ rotate: expandedIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown 
                      className="w-5 h-5"
                      style={{ color: 'var(--color-text-muted)' }}
                      strokeWidth={1.5}
                    />
                  </motion.div>
                </div>
              </button>

              {/* Answer */}
              <AnimatePresence>
                {expandedIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                    itemScope
                    itemProp="acceptedAnswer"
                    itemType="https://schema.org/Answer"
                  >
                    <div className="pb-5 px-1">
                      {isEditing && editingItem === index ? (
                        <Textarea
                          value={item.answer}
                          onChange={(e) => handleItemUpdate(index, 'answer', e.target.value)}
                          className="w-full min-h-[100px]"
                          style={{
                            backgroundColor: 'var(--color-surface)',
                            borderColor: 'var(--color-primary)',
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <p 
                          style={{ 
                            color: 'var(--color-text-secondary)',
                            fontFamily: 'var(--font-body)',
                            lineHeight: 'var(--line-height-body)',
                          }}
                          itemProp="text"
                        >
                          {item.answer}
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Empty state */}
        {items.length === 0 && (
          <div 
            className="text-center py-12"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" strokeWidth={1.5} />
            <p style={{ fontFamily: 'var(--font-body)' }}>No FAQ items available</p>
          </div>
        )}
      </div>
    </section>
  );
}
