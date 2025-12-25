import { useState, useCallback, memo, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { ChevronDown, MessageSquare, Edit3, Trash2, GripVertical, Plus } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { EyebrowBadge } from '@/components/ui/PremiumCard';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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

// Individual FAQ item editor with LOCAL STATE to prevent re-renders
interface FAQItemEditorProps {
  item: FAQItem;
  index: number;
  isEditing: boolean;
  isExpanded: boolean;
  isEditingThis: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onUpdateItem: (field: 'question' | 'answer', value: string) => void;
  onFinishEditing: () => void;
  variant: 'dark' | 'consulting';
  isLast: boolean;
}

const FAQItemEditor = memo(function FAQItemEditor({
  item,
  index,
  isEditing,
  isExpanded,
  isEditingThis,
  onToggle,
  onEdit,
  onDelete,
  onUpdateItem,
  onFinishEditing,
  variant,
  isLast,
}: FAQItemEditorProps) {
  // LOCAL state for inputs - prevents parent re-renders on every keystroke
  const [localQuestion, setLocalQuestion] = useState(item.question);
  const [localAnswer, setLocalAnswer] = useState(item.answer);

  // Sync local state when item changes from parent (e.g., reorder)
  useEffect(() => {
    setLocalQuestion(item.question);
    setLocalAnswer(item.answer);
  }, [item.question, item.answer]);

  const handleQuestionBlur = useCallback(() => {
    if (localQuestion !== item.question) {
      onUpdateItem('question', localQuestion);
    }
    onFinishEditing();
  }, [localQuestion, item.question, onUpdateItem, onFinishEditing]);

  const handleAnswerBlur = useCallback(() => {
    if (localAnswer !== item.answer) {
      onUpdateItem('answer', localAnswer);
    }
  }, [localAnswer, item.answer, onUpdateItem]);

  const isConsulting = variant === 'consulting';

  if (isConsulting) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.05 }}
        itemScope
        itemProp="mainEntity"
        itemType="https://schema.org/Question"
        className="relative"
      >
        <div className="bg-slate-50 rounded-xl overflow-hidden flex">
          {isEditing && (
            <div className="flex items-center px-2 cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600">
              <GripVertical className="w-4 h-4" strokeWidth={1.5} />
            </div>
          )}
          
          <div className="flex-1">
            <button
              className="w-full p-6 text-left flex items-center justify-between hover:bg-slate-100 transition-colors"
              onClick={onToggle}
            >
              {isEditingThis ? (
                <Input
                  value={localQuestion}
                  onChange={(e) => setLocalQuestion(e.target.value)}
                  onBlur={handleQuestionBlur}
                  className="flex-1 mr-4 bg-white border-slate-300"
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span className="font-semibold text-slate-900 pr-4" itemProp="name">
                  {item.question}
                </span>
              )}
              
              <div className="flex items-center gap-2 flex-shrink-0">
                {isEditing && !isEditingThis && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); onEdit(); }}
                      className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                      title="Edit"
                    >
                      <Edit3 className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDelete(); }}
                      className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                  </>
                )}
                <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown className="w-5 h-5 text-slate-500" strokeWidth={1.5} />
                </motion.div>
              </div>
            </button>

            <AnimatePresence>
              {isExpanded && (
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
                  <div className="px-6 pb-6">
                    {isEditingThis ? (
                      <Textarea
                        value={localAnswer}
                        onChange={(e) => setLocalAnswer(e.target.value)}
                        onBlur={handleAnswerBlur}
                        className="w-full min-h-[100px] bg-white border-slate-300"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <p className="text-slate-600 leading-relaxed" itemProp="text">
                        {item.answer}
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    );
  }

  // Dark mode variant
  return (
    <motion.div
      className={`relative flex ${!isLast ? "border-b border-white/[0.05]" : ""}`}
      itemScope
      itemProp="mainEntity"
      itemType="https://schema.org/Question"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
    >
      {isEditing && (
        <div className="flex items-center px-3 cursor-grab active:cursor-grabbing text-slate-500 hover:text-cyan-400">
          <GripVertical className="w-4 h-4" strokeWidth={1.5} />
        </div>
      )}
      
      <div className="flex-1">
        <button
          className="w-full py-6 px-6 flex items-center justify-between text-left group hover:bg-white/[0.02] transition-colors"
          onClick={onToggle}
        >
          {isEditingThis ? (
            <Input
              value={localQuestion}
              onChange={(e) => setLocalQuestion(e.target.value)}
              onBlur={handleQuestionBlur}
              className="flex-1 mr-4 bg-slate-800 border-cyan-500"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <h3 
              className="text-lg font-medium pr-4 flex-1 text-white group-hover:text-cyan-400 transition-colors" 
              itemProp="name"
            >
              {item.question}
            </h3>
          )}
          
          <div className="flex items-center gap-2">
            {isEditing && !isEditingThis && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); onEdit(); }}
                  className="p-1 text-slate-500 hover:text-cyan-400 transition-colors"
                  title="Edit"
                >
                  <Edit3 className="w-4 h-4" strokeWidth={1.5} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(); }}
                  className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </>
            )}
            <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown className="w-5 h-5 text-slate-500" strokeWidth={1.5} />
            </motion.div>
          </div>
        </button>

        <AnimatePresence>
          {isExpanded && (
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
                {isEditingThis ? (
                  <Textarea
                    value={localAnswer}
                    onChange={(e) => setLocalAnswer(e.target.value)}
                    onBlur={handleAnswerBlur}
                    className="w-full min-h-[100px] bg-slate-800 border-cyan-500"
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <p className="text-slate-400 leading-relaxed" itemProp="text">
                    {item.answer}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
});

export function FAQSection({ content, onUpdate, isEditing }: FAQSectionProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(null);

  const headline = content.headline || 'Frequently Asked Questions';
  const eyebrow = content.eyebrow || 'Common Questions';
  const items = content.items || [];
  const isConsulting = content.industryVariant === 'consulting';

  // Don't render section at all if no FAQ items (unless editing)
  if (items.length === 0 && !isEditing) {
    return null;
  }

  const handleToggle = useCallback((index: number) => {
    setExpandedIndex(prev => prev === index ? null : index);
  }, []);

  const handleItemUpdate = useCallback((index: number, field: 'question' | 'answer', value: string) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    onUpdate({ ...content, items: updatedItems });
  }, [items, content, onUpdate]);

  const handleHeadlineUpdate = useCallback((e: React.FocusEvent<HTMLHeadingElement>) => {
    onUpdate({ ...content, headline: e.currentTarget.textContent || headline });
  }, [content, headline, onUpdate]);

  const handleAddItem = useCallback(() => {
    const newItem: FAQItem = {
      question: 'New question?',
      answer: 'Click to add your answer.',
      source: 'industry_common',
    };
    const updatedItems = [...items, newItem];
    onUpdate({ ...content, items: updatedItems });
    // Auto-expand and edit the new item
    setExpandedIndex(updatedItems.length - 1);
    setEditingItem(updatedItems.length - 1);
  }, [items, content, onUpdate]);

  const handleDeleteItem = useCallback((index: number) => {
    const updatedItems = items.filter((_, i) => i !== index);
    onUpdate({ ...content, items: updatedItems });
    setDeleteConfirmIndex(null);
    // Reset expanded/editing state if needed
    if (expandedIndex === index) setExpandedIndex(null);
    if (editingItem === index) setEditingItem(null);
  }, [items, content, onUpdate, expandedIndex, editingItem]);

  const handleReorder = useCallback((newOrder: FAQItem[]) => {
    onUpdate({ ...content, items: newOrder });
  }, [content, onUpdate]);

  // Render helper for FAQ items using memoized component
  const renderFAQItem = (item: FAQItem, index: number, variant: 'dark' | 'consulting') => (
    <FAQItemEditor
      key={`${item.question}-${index}`}
      item={item}
      index={index}
      isEditing={!!isEditing}
      isExpanded={expandedIndex === index}
      isEditingThis={editingItem === index}
      onToggle={() => handleToggle(index)}
      onEdit={() => { setEditingItem(index); setExpandedIndex(index); }}
      onDelete={() => setDeleteConfirmIndex(index)}
      onUpdateItem={(field, value) => handleItemUpdate(index, field, value)}
      onFinishEditing={() => setEditingItem(null)}
      variant={variant}
      isLast={index === items.length - 1}
    />
  );

  if (isConsulting) {
    // Consulting layout: White background, clean accordions
    return (
      <section 
        className="py-24 bg-white"
        itemScope
        itemType="https://schema.org/FAQPage"
      >
        {isEditing && (
          <div className="absolute inset-0 border-2 border-cyan-500/50 rounded-lg pointer-events-none z-10" />
        )}

        <div className="max-w-3xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1 bg-slate-200 text-slate-700 text-sm font-semibold rounded-full mb-4">
              COMMON QUESTIONS
            </span>
            <h2 
              className={`text-3xl md:text-4xl font-bold text-slate-900 ${
                isEditing ? 'outline-dashed outline-2 outline-cyan-500/30 rounded px-2' : ''
              }`}
              contentEditable={isEditing}
              suppressContentEditableWarning
              onBlur={handleHeadlineUpdate}
            >
              Questions We Often Hear
            </h2>
          </div>

          {/* FAQ Accordion with Reorder */}
          {isEditing ? (
            <Reorder.Group axis="y" values={items} onReorder={handleReorder} className="space-y-4">
              {items.map((item, index) => (
                <Reorder.Item key={`${item.question}-${index}`} value={item}>
                  {renderFAQItem(item, index, 'consulting')}
                </Reorder.Item>
              ))}
            </Reorder.Group>
          ) : (
            <div className="space-y-4">
              {items.map((item, index) => renderFAQItem(item, index, 'consulting'))}
            </div>
          )}

          {/* Add Question Button - only in edit mode */}
          {isEditing && (
            <div className="mt-6 flex justify-center">
              <Button
                variant="outline"
                onClick={handleAddItem}
                className="gap-2 border-dashed border-slate-300 text-slate-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50"
              >
                <Plus className="w-4 h-4" />
                Add Question
              </Button>
            </div>
          )}

          {items.length === 0 && isEditing && (
            <div className="text-center py-12 text-slate-400">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" strokeWidth={1.5} />
              <p>No FAQ items yet</p>
            </div>
          )}
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteConfirmIndex !== null} onOpenChange={() => setDeleteConfirmIndex(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete FAQ Item?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this question and answer. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteConfirmIndex !== null && handleDeleteItem(deleteConfirmIndex)}
                className="bg-red-500 hover:bg-red-600"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </section>
    );
  }

  // Default dark mode layout
  return (
    <section 
      className="relative overflow-hidden"
      style={{ backgroundColor: 'hsl(217, 33%, 6%)', padding: '96px 24px' }}
      itemScope
      itemType="https://schema.org/FAQPage"
    >
      <div className="absolute inset-0 bg-grid-pattern opacity-30" />
      
      {isEditing && (
        <div className="absolute inset-0 border-2 border-cyan-500/50 rounded-lg pointer-events-none z-10" />
      )}

      <div className="container mx-auto max-w-3xl relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <EyebrowBadge 
            icon={<MessageSquare className="w-4 h-4" strokeWidth={1.5} />} 
            text={eyebrow}
            className="mb-6"
          />
          
          <h2 
            className={`text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white ${
              isEditing ? 'outline-dashed outline-2 outline-cyan-500/30 rounded px-2' : ''
            }`}
            contentEditable={isEditing}
            suppressContentEditableWarning
            onBlur={handleHeadlineUpdate}
          >
            {headline}
          </h2>
        </div>

        {/* FAQ Items with Reorder */}
        <div className="rounded-2xl overflow-hidden bg-white/[0.02] backdrop-blur-xl border border-white/[0.05]">
          {isEditing ? (
            <Reorder.Group axis="y" values={items} onReorder={handleReorder}>
              {items.map((item, index) => (
                <Reorder.Item key={`${item.question}-${index}`} value={item}>
                  {renderFAQItem(item, index, 'dark')}
                </Reorder.Item>
              ))}
            </Reorder.Group>
          ) : (
            <>
              {items.map((item, index) => renderFAQItem(item, index, 'dark'))}
            </>
          )}
        </div>

        {/* Add Question Button - only in edit mode */}
        {isEditing && (
          <div className="mt-6 flex justify-center">
            <Button
              variant="outline"
              onClick={handleAddItem}
              className="gap-2 border-dashed border-slate-600 text-slate-400 hover:border-cyan-400 hover:text-cyan-400 hover:bg-cyan-400/10"
            >
              <Plus className="w-4 h-4" />
              Add Question
            </Button>
          </div>
        )}

        {items.length === 0 && isEditing && (
          <div className="text-center py-12 text-slate-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" strokeWidth={1.5} />
            <p>No FAQ items yet</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmIndex !== null} onOpenChange={() => setDeleteConfirmIndex(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete FAQ Item?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this question and answer. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirmIndex !== null && handleDeleteItem(deleteConfirmIndex)}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
