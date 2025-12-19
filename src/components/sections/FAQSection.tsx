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
      className={`py-16 md:py-24 px-4 relative ${isEditing ? 'relative' : ''}`}
      style={{ backgroundColor: 'var(--color-background, #0f172a)' }}
      itemScope
      itemType="https://schema.org/FAQPage"
    >
      {isEditing && (
        <div 
          className="absolute inset-0 border-2 rounded-lg pointer-events-none z-10"
          style={{ borderColor: 'var(--color-secondary, rgba(168, 85, 247, 0.8))' }}
        />
      )}

      <div className="container mx-auto max-w-3xl relative z-0">
        {/* Header */}
        <div className="text-center mb-12">
          <div 
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4"
            style={{
              backgroundColor: 'var(--color-primary-muted, rgba(6, 182, 212, 0.1))',
              borderColor: 'var(--color-primary, rgba(6, 182, 212, 0.2))',
              borderWidth: '1px',
            }}
          >
            <MessageSquare 
              className="w-4 h-4"
              style={{ color: 'var(--color-primary, #22d3ee)' }}
            />
            <span 
              className="text-sm font-medium"
              style={{ color: 'var(--color-primary, #22d3ee)' }}
            >
              Common Questions
            </span>
          </div>
          
          <h2 
            className={`text-3xl md:text-4xl font-bold ${
              isEditing ? 'outline-dashed outline-2 rounded px-2' : ''
            }`}
            style={{ 
              color: 'var(--color-text-primary, white)',
              outlineColor: isEditing ? 'var(--color-secondary, rgba(168, 85, 247, 0.5))' : undefined,
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
          className="space-y-0 rounded-2xl px-6 overflow-hidden"
          style={{
            backgroundColor: 'var(--color-surface, rgba(30, 41, 59, 0.3))',
            borderColor: 'var(--color-border, rgba(71, 85, 105, 0.5))',
            borderWidth: '1px',
          }}
        >
          {items.map((item, index) => (
            <motion.div
              key={index}
              className="last:border-b-0"
              style={{ borderBottomColor: 'var(--color-border, rgba(71, 85, 105, 0.5))', borderBottomWidth: '1px' }}
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
                      backgroundColor: 'var(--color-surface, #1e293b)',
                      borderColor: 'var(--color-primary, rgba(6, 182, 212, 0.5))',
                    }}
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <h3 
                    className="text-lg font-medium pr-4 flex-1 transition-colors"
                    style={{ color: 'var(--color-text-primary, white)' }}
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
                      style={{ color: 'var(--color-text-muted, #94a3b8)' }}
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  )}
                  <motion.div
                    animate={{ rotate: expandedIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown 
                      className="w-5 h-5"
                      style={{ color: 'var(--color-text-muted, #94a3b8)' }}
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
                            backgroundColor: 'var(--color-surface, #1e293b)',
                            borderColor: 'var(--color-primary, rgba(6, 182, 212, 0.5))',
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <p 
                          className="leading-relaxed"
                          style={{ color: 'var(--color-text-secondary, #94a3b8)' }}
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
            style={{ color: 'var(--color-text-muted, #64748b)' }}
          >
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No FAQ items available</p>
          </div>
        )}
      </div>
    </section>
  );
}
