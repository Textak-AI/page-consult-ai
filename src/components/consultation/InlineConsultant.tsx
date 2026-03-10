import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import {
  evaluateFieldCoaching,
  type WizardContext,
  type CoachingResult,
} from '@/utils/consultantCoaching';

interface Props {
  fieldKey: string;
  fieldValue: string;
  fieldLabel: string;
  context: WizardContext;
  isOptional?: boolean;
  wasSkipped?: boolean;
  skipCoaching?: CoachingResult | null;
  onBlurHandlerReady?: (handler: () => void) => void;
}

export function InlineConsultant({
  fieldKey,
  fieldValue,
  context,
  skipCoaching,
  onBlurHandlerReady,
}: Props) {
  const [coaching, setCoaching] = useState<CoachingResult | null>(null);
  const [visible, setVisible] = useState(false);
  const blurTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastEvaluatedRef = useRef<string>('');

  // Handle blur-triggered evaluation (attach to the field's parent)
  const handleBlur = useCallback(() => {
    if (!fieldValue || fieldValue.trim().length === 0) return;
    // Don't re-evaluate if value hasn't changed
    if (fieldValue === lastEvaluatedRef.current) return;
    lastEvaluatedRef.current = fieldValue;

    // Delay evaluation by 500ms
    if (blurTimerRef.current) clearTimeout(blurTimerRef.current);
    blurTimerRef.current = setTimeout(() => {
      const result = evaluateFieldCoaching(fieldKey, fieldValue, context);
      if (result) {
        setCoaching(result);
        setVisible(true);

        // Auto-dismiss acknowledgments after 3s
        if (result.type === 'acknowledgment') {
          if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
          dismissTimerRef.current = setTimeout(() => {
            setVisible(false);
          }, 3000);
        }
      } else {
        // Answer improved past the threshold — clear coaching
        setVisible(false);
      }
    }, 500);
  }, [fieldKey, fieldValue, context]);

  // Clear coaching when value changes meaningfully after a nudge
  useEffect(() => {
    if (coaching?.type === 'nudge' && fieldValue !== lastEvaluatedRef.current) {
      // Value changed, hide the nudge (will re-evaluate on next blur)
      setVisible(false);
    }
  }, [fieldValue, coaching]);

  // Show skip coaching when passed
  useEffect(() => {
    if (skipCoaching && skipCoaching.fieldKey === fieldKey) {
      setCoaching(skipCoaching);
      setVisible(true);
    }
  }, [skipCoaching, fieldKey]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (blurTimerRef.current) clearTimeout(blurTimerRef.current);
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    };
  }, []);

  // Attach blur listener to the field input
  // We listen on the wrapper div's focusout event
  console.log('🔍 [Consultant] InlineConsultant rendered for:', fieldKey);

  return (
    <div onBlur={handleBlur}>
      <AnimatePresence>
        {visible && coaching && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="mt-2 flex items-start gap-2 rounded-lg border-l-2 px-3 py-2.5 backdrop-blur-sm"
            style={{
              background: coaching.type === 'acknowledgment'
                ? 'rgba(6, 182, 212, 0.08)'
                : 'rgba(30, 41, 59, 0.6)',
              borderColor: coaching.type === 'acknowledgment'
                ? 'rgba(6, 182, 212, 0.5)'
                : 'rgba(6, 182, 212, 0.35)',
            }}
          >
            <Sparkles
              className="w-3.5 h-3.5 mt-0.5 flex-shrink-0"
              style={{
                color: coaching.type === 'acknowledgment'
                  ? 'rgb(34, 211, 238)'
                  : 'rgba(6, 182, 212, 0.7)',
              }}
            />
            <p className="text-sm leading-relaxed" style={{ color: 'rgb(203, 213, 225)' }}>
              {coaching.message}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
