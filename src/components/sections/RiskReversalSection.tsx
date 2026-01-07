/**
 * RISK REVERSAL SECTION
 * 
 * Prominent guarantee section to remove buyer hesitation.
 * Used for protection-motivated audiences and most-aware buyers.
 */

import { motion } from 'framer-motion';
import { Shield, CheckCircle2, BadgeCheck } from 'lucide-react';

interface RiskReversalContent {
  headline?: string;
  guarantee?: string;
  guaranteeDetails?: string[];
  industryVariant?: string;
  mode?: 'light' | 'dark';
}

interface RiskReversalSectionProps {
  content: RiskReversalContent;
  onUpdate?: (content: RiskReversalContent) => void;
  isEditing?: boolean;
}

export function RiskReversalSection({ 
  content, 
  onUpdate, 
  isEditing = false 
}: RiskReversalSectionProps) {
  const isLightMode = content.mode === 'light';
  
  const handleBlur = (field: keyof RiskReversalContent, value: string) => {
    if (onUpdate && isEditing) {
      onUpdate({ ...content, [field]: value });
    }
  };

  const guaranteePoints = content.guaranteeDetails || [
    'No questions asked refund policy',
    'Full support throughout the process',
    'Results-focused approach'
  ];

  return (
    <section 
      className={`py-16 md:py-24 ${
        isLightMode 
          ? 'bg-gradient-to-b from-emerald-50 to-green-50' 
          : 'bg-gradient-to-b from-emerald-950/20 to-background'
      }`}
    >
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          {/* Main Guarantee Card */}
          <div className={`relative overflow-hidden rounded-2xl p-8 md:p-12 ${
            isLightMode 
              ? 'bg-white border-2 border-emerald-200 shadow-xl' 
              : 'bg-emerald-950/30 border border-emerald-700/30'
          }`}>
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
              }} />
            </div>

            <div className="relative z-10 text-center">
              {/* Shield Icon */}
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 ${
                isLightMode 
                  ? 'bg-emerald-100 text-emerald-600' 
                  : 'bg-emerald-900/40 text-emerald-400'
              }`}>
                <Shield className="w-10 h-10" />
              </div>

              {/* Headline */}
              <h2 
                className={`text-3xl md:text-4xl font-bold mb-4 ${
                  isLightMode ? 'text-emerald-900' : 'text-emerald-100'
                }`}
                contentEditable={isEditing}
                suppressContentEditableWarning
                onBlur={(e) => handleBlur('headline', e.currentTarget.textContent || '')}
              >
                {content.headline || 'Our Iron-Clad Guarantee'}
              </h2>

              {/* Main Guarantee Text */}
              <p 
                className={`text-xl md:text-2xl mb-8 max-w-2xl mx-auto ${
                  isLightMode ? 'text-emerald-800' : 'text-emerald-200'
                }`}
                contentEditable={isEditing}
                suppressContentEditableWarning
                onBlur={(e) => handleBlur('guarantee', e.currentTarget.textContent || '')}
              >
                {content.guarantee || 'Your satisfaction is 100% guaranteed. If you\'re not completely happy, we\'ll make it right.'}
              </p>

              {/* Guarantee Points */}
              <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                {guaranteePoints.map((point, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + index * 0.1, duration: 0.4 }}
                    className={`flex items-center gap-3 p-4 rounded-xl ${
                      isLightMode 
                        ? 'bg-emerald-50 border border-emerald-100' 
                        : 'bg-emerald-900/20 border border-emerald-700/20'
                    }`}
                  >
                    <CheckCircle2 className={`w-5 h-5 flex-shrink-0 ${
                      isLightMode ? 'text-emerald-500' : 'text-emerald-400'
                    }`} />
                    <span className={`text-sm font-medium ${
                      isLightMode ? 'text-emerald-700' : 'text-emerald-300'
                    }`}>
                      {point}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* Trust Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.4 }}
                className="mt-8 inline-flex items-center gap-2"
              >
                <BadgeCheck className={`w-5 h-5 ${isLightMode ? 'text-emerald-500' : 'text-emerald-400'}`} />
                <span className={`text-sm font-medium ${isLightMode ? 'text-emerald-600' : 'text-emerald-400'}`}>
                  Trusted by thousands of satisfied clients
                </span>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
