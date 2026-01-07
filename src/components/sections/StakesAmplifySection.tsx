/**
 * STAKES AMPLIFY SECTION
 * 
 * Dramatizes the consequences of inaction.
 * Used for problem-aware and urgency-driven audiences.
 */

import { motion } from 'framer-motion';
import { AlertTriangle, TrendingDown, Clock } from 'lucide-react';

interface StakesAmplifyContent {
  headline?: string;
  stakes?: string;
  consequences?: string;
  industryVariant?: string;
  mode?: 'light' | 'dark';
}

interface StakesAmplifySectionProps {
  content: StakesAmplifyContent;
  onUpdate?: (content: StakesAmplifyContent) => void;
  isEditing?: boolean;
}

export function StakesAmplifySection({ 
  content, 
  onUpdate, 
  isEditing = false 
}: StakesAmplifySectionProps) {
  const isLightMode = content.mode === 'light';
  
  const handleBlur = (field: keyof StakesAmplifyContent, value: string) => {
    if (onUpdate && isEditing) {
      onUpdate({ ...content, [field]: value });
    }
  };

  return (
    <section 
      className={`py-16 md:py-24 ${
        isLightMode 
          ? 'bg-gradient-to-b from-red-50 to-orange-50 border-y border-red-100' 
          : 'bg-gradient-to-b from-red-950/30 to-background border-y border-red-900/20'
      }`}
    >
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          {/* Warning Icon */}
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-6 ${
            isLightMode 
              ? 'bg-red-100 text-red-600' 
              : 'bg-red-900/30 text-red-400'
          }`}>
            <AlertTriangle className="w-8 h-8" />
          </div>

          {/* Headline */}
          <h2 
            className={`text-3xl md:text-4xl font-bold mb-6 ${
              isLightMode ? 'text-red-900' : 'text-red-100'
            }`}
            contentEditable={isEditing}
            suppressContentEditableWarning
            onBlur={(e) => handleBlur('headline', e.currentTarget.textContent || '')}
          >
            {content.headline || 'The Real Cost of Inaction'}
          </h2>

          {/* Stakes Description */}
          <p 
            className={`text-lg md:text-xl mb-8 leading-relaxed ${
              isLightMode ? 'text-red-800/80' : 'text-red-200/80'
            }`}
            contentEditable={isEditing}
            suppressContentEditableWarning
            onBlur={(e) => handleBlur('stakes', e.currentTarget.textContent || '')}
          >
            {content.stakes || 'Every day without a solution means more risk, more stress, and more missed opportunities.'}
          </p>

          {/* Consequences Callout */}
          {content.consequences && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className={`inline-flex items-center gap-3 px-6 py-4 rounded-xl ${
                isLightMode 
                  ? 'bg-white/80 border border-red-200 shadow-lg' 
                  : 'bg-red-900/20 border border-red-700/30'
              }`}
            >
              <Clock className={`w-5 h-5 ${isLightMode ? 'text-red-500' : 'text-red-400'}`} />
              <span 
                className={`font-medium ${isLightMode ? 'text-red-700' : 'text-red-300'}`}
                contentEditable={isEditing}
                suppressContentEditableWarning
                onBlur={(e) => handleBlur('consequences', e.currentTarget.textContent || '')}
              >
                {content.consequences}
              </span>
            </motion.div>
          )}

          {/* Visual Urgency Indicators */}
          <div className="grid grid-cols-3 gap-4 mt-12 max-w-2xl mx-auto">
            {[
              { icon: TrendingDown, label: 'Growing Risk' },
              { icon: Clock, label: 'Time Running Out' },
              { icon: AlertTriangle, label: 'Increasing Cost' }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 + index * 0.1, duration: 0.4 }}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg ${
                  isLightMode 
                    ? 'bg-white/50' 
                    : 'bg-red-900/10'
                }`}
              >
                <item.icon className={`w-6 h-6 ${isLightMode ? 'text-red-500' : 'text-red-400'}`} />
                <span className={`text-sm font-medium ${isLightMode ? 'text-red-700' : 'text-red-300'}`}>
                  {item.label}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
