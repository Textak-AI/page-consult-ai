/**
 * COMPARISON SECTION
 * 
 * Old way vs new way comparison.
 * Used for solution-aware audiences who need differentiation.
 */

import { motion } from 'framer-motion';
import { X, Check, ArrowRight } from 'lucide-react';

interface ComparisonContent {
  headline?: string;
  subheadline?: string;
  oldWay?: {
    title: string;
    points: string[];
  };
  newWay?: {
    title: string;
    points: string[];
  };
  industryVariant?: string;
  mode?: 'light' | 'dark';
}

interface ComparisonSectionProps {
  content: ComparisonContent;
  onUpdate?: (content: ComparisonContent) => void;
  isEditing?: boolean;
}

export function ComparisonSection({ 
  content, 
  onUpdate, 
  isEditing = false 
}: ComparisonSectionProps) {
  const isLightMode = content.mode === 'light';
  
  const handleBlur = (field: keyof ComparisonContent, value: string) => {
    if (onUpdate && isEditing) {
      onUpdate({ ...content, [field]: value });
    }
  };

  const oldWay = content.oldWay || {
    title: 'The Old Way',
    points: [
      'Time-consuming manual processes',
      'Inconsistent results',
      'Hidden costs and surprises',
      'Limited support when you need it'
    ]
  };

  const newWay = content.newWay || {
    title: 'Our Approach',
    points: [
      'Streamlined, efficient process',
      'Predictable, reliable outcomes',
      'Transparent pricing upfront',
      'Dedicated support every step'
    ]
  };

  return (
    <section 
      className={`py-16 md:py-24 ${
        isLightMode 
          ? 'bg-gradient-to-b from-slate-50 to-white' 
          : 'bg-gradient-to-b from-slate-900/50 to-background'
      }`}
    >
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 
            className={`text-3xl md:text-4xl font-bold mb-4 ${
              isLightMode ? 'text-slate-900' : 'text-slate-100'
            }`}
            contentEditable={isEditing}
            suppressContentEditableWarning
            onBlur={(e) => handleBlur('headline', e.currentTarget.textContent || '')}
          >
            {content.headline || 'A Better Way Forward'}
          </h2>
          {content.subheadline && (
            <p 
              className={`text-lg max-w-2xl mx-auto ${
                isLightMode ? 'text-slate-600' : 'text-slate-400'
              }`}
              contentEditable={isEditing}
              suppressContentEditableWarning
              onBlur={(e) => handleBlur('subheadline', e.currentTarget.textContent || '')}
            >
              {content.subheadline}
            </p>
          )}
        </motion.div>

        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6 md:gap-8 items-stretch">
            {/* Old Way Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className={`relative rounded-2xl p-6 md:p-8 ${
                isLightMode 
                  ? 'bg-red-50 border-2 border-red-100' 
                  : 'bg-red-950/20 border border-red-900/30'
              }`}
            >
              {/* "X" Badge */}
              <div className={`absolute -top-3 -right-3 w-10 h-10 rounded-full flex items-center justify-center ${
                isLightMode ? 'bg-red-500' : 'bg-red-600'
              }`}>
                <X className="w-5 h-5 text-white" />
              </div>

              <h3 className={`text-xl font-bold mb-6 ${
                isLightMode ? 'text-red-900' : 'text-red-200'
              }`}>
                {oldWay.title}
              </h3>

              <ul className="space-y-4">
                {oldWay.points.map((point, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + index * 0.1, duration: 0.3 }}
                    className="flex items-start gap-3"
                  >
                    <X className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                      isLightMode ? 'text-red-400' : 'text-red-500'
                    }`} />
                    <span className={`${
                      isLightMode ? 'text-red-800' : 'text-red-300'
                    }`}>
                      {point}
                    </span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Arrow (desktop) */}
            <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                isLightMode ? 'bg-primary text-white' : 'bg-primary text-white'
              }`}>
                <ArrowRight className="w-6 h-6" />
              </div>
            </div>

            {/* New Way Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className={`relative rounded-2xl p-6 md:p-8 ${
                isLightMode 
                  ? 'bg-emerald-50 border-2 border-emerald-200 shadow-lg' 
                  : 'bg-emerald-950/20 border border-emerald-700/30'
              }`}
            >
              {/* Check Badge */}
              <div className={`absolute -top-3 -right-3 w-10 h-10 rounded-full flex items-center justify-center ${
                isLightMode ? 'bg-emerald-500' : 'bg-emerald-600'
              }`}>
                <Check className="w-5 h-5 text-white" />
              </div>

              <h3 className={`text-xl font-bold mb-6 ${
                isLightMode ? 'text-emerald-900' : 'text-emerald-200'
              }`}>
                {newWay.title}
              </h3>

              <ul className="space-y-4">
                {newWay.points.map((point, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: 10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + index * 0.1, duration: 0.3 }}
                    className="flex items-start gap-3"
                  >
                    <Check className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                      isLightMode ? 'text-emerald-500' : 'text-emerald-400'
                    }`} />
                    <span className={`${
                      isLightMode ? 'text-emerald-800' : 'text-emerald-300'
                    }`}>
                      {point}
                    </span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
