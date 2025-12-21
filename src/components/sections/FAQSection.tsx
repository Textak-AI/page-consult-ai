import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, MessageSquare, Edit3, Sparkles } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { EyebrowBadge } from '@/components/ui/PremiumCard';
import type { FAQItem } from '@/services/intelligence/types';

import type { IndustryVariant } from '@/config/designSystem/industryVariants';

interface FAQSectionProps {
  content: {
    headline?: string;
    eyebrow?: string;
    items: FAQItem[];
    industryVariant?: IndustryVariant;
  };
  onUpdate: (content: FAQSectionProps['content']) => void;
  isEditing?: boolean;
}

export function FAQSection({ content, onUpdate, isEditing }: FAQSectionProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<number | null>(null);

  const headline = content.headline || 'Frequently Asked Questions';
  const eyebrow = content.eyebrow || 'Common Questions';
  const items = content.items || [];
  const isConsulting = content.industryVariant === 'consulting';

  // Don't render section at all if no FAQ items (unless editing)
  if (items.length === 0 && !isEditing) {
    return null;
  }

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

  // Consulting: Light mode with warm backgrounds
  const sectionStyles = isConsulting
    ? { backgroundColor: '#fafaf9', padding: '96px 24px' }
    : { backgroundColor: 'hsl(217, 33%, 6%)', padding: '120px 24px' };

  return (
    <section 
      className="relative overflow-hidden"
      style={sectionStyles}
      itemScope
      itemType="https://schema.org/FAQPage"
    >
      {!isConsulting && <div className="absolute inset-0 bg-grid-pattern opacity-30" />}
      
      {isEditing && (
        <div className="absolute inset-0 border-2 border-cyan-500/50 rounded-lg pointer-events-none z-10" />
      )}

      <div className="container mx-auto max-w-3xl relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <EyebrowBadge 
            icon={<MessageSquare className="w-4 h-4" strokeWidth={1.5} />} 
            text={eyebrow}
            className={`mb-6 ${isConsulting ? 'bg-teal-50 border-teal-200 text-teal-700' : ''}`}
          />
          
          <h2 
            className={`text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight ${
              isEditing ? 'outline-dashed outline-2 outline-cyan-500/30 rounded px-2' : ''
            }`}
            style={{
              color: isConsulting ? '#1c1917' : 'white',
              fontFamily: isConsulting ? '"Source Serif 4", Georgia, serif' : undefined,
            }}
            contentEditable={isEditing}
            suppressContentEditableWarning
            onBlur={handleHeadlineUpdate}
          >
            {headline}
          </h2>
        </div>

        {/* FAQ Items */}
        <div className={`rounded-2xl overflow-hidden ${
          isConsulting 
            ? 'bg-white border border-stone-200 shadow-sm' 
            : 'bg-white/[0.02] backdrop-blur-xl border border-white/[0.05]'
        }`}>
          {items.map((item, index) => (
            <motion.div
              key={index}
              className={index !== items.length - 1 
                ? `border-b ${isConsulting ? 'border-stone-200' : 'border-white/[0.05]'}`
                : ""
              }
              itemScope
              itemProp="mainEntity"
              itemType="https://schema.org/Question"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <button
                className={`w-full py-6 px-6 flex items-center justify-between text-left group transition-colors ${
                  isConsulting ? 'hover:bg-stone-50' : 'hover:bg-white/[0.02]'
                }`}
                onClick={() => handleToggle(index)}
              >
                {isEditing && editingItem === index ? (
                  <Input
                    value={item.question}
                    onChange={(e) => handleItemUpdate(index, 'question', e.target.value)}
                    onBlur={() => setEditingItem(null)}
                    className={`flex-1 mr-4 ${isConsulting ? 'bg-stone-100 border-teal-500' : 'bg-slate-800 border-cyan-500'}`}
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <h3 
                    className={`text-lg font-medium pr-4 flex-1 transition-colors ${
                      isConsulting 
                        ? 'text-stone-900 group-hover:text-teal-600' 
                        : 'text-white group-hover:text-cyan-400'
                    }`} 
                    itemProp="name"
                  >
                    {item.question}
                  </h3>
                )}
                
                <div className="flex items-center gap-2">
                  {isEditing && editingItem !== index && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditingItem(index); setExpandedIndex(index); }}
                      className={`p-1 transition-colors ${
                        isConsulting ? 'text-stone-400 hover:text-teal-600' : 'text-slate-500 hover:text-cyan-400'
                      }`}
                    >
                      <Edit3 className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                  )}
                  <motion.div animate={{ rotate: expandedIndex === index ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className={`w-5 h-5 ${isConsulting ? 'text-stone-400' : 'text-slate-500'}`} strokeWidth={1.5} />
                  </motion.div>
                </div>
              </button>

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
                    <div className="pb-6 px-6">
                      {isEditing && editingItem === index ? (
                        <Textarea
                          value={item.answer}
                          onChange={(e) => handleItemUpdate(index, 'answer', e.target.value)}
                          className={`w-full min-h-[100px] ${
                            isConsulting ? 'bg-stone-100 border-teal-500' : 'bg-slate-800 border-cyan-500'
                          }`}
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <p className={`leading-relaxed ${isConsulting ? 'text-stone-600' : 'text-slate-400'}`} itemProp="text">
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

        {items.length === 0 && isEditing && (
          <div className={`text-center py-12 ${isConsulting ? 'text-stone-400' : 'text-slate-500'}`}>
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" strokeWidth={1.5} />
            <p>No FAQ items - add questions in edit mode</p>
          </div>
        )}
      </div>
    </section>
  );
}
