import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, Shield } from "lucide-react";
import type { SDIPalette, SDISectionThemes, SDITypography } from '@/lib/designIntelligence/types';

interface FinalCTASectionProps {
  content: {
    headline: string;
    ctaText: string;
    ctaLink: string;
    subtext?: string;
    trustText?: string;
    trustIndicators?: Array<{ text: string }>;
    industryVariant?: string;
    mode?: 'light' | 'dark' | 'warm' | 'cold';
    secondaryCta?: string;
    urgencyText?: string;
    guaranteeText?: string;
    // SDI Design System
    primaryColor?: string;
    palette?: SDIPalette;
    sectionThemes?: SDISectionThemes;
    sdiTypography?: SDITypography;
    // Brand colors for background
    brandColors?: { primary?: string | null; secondary?: string | null };
  };
  onUpdate: (content: any) => void;
  isEditing?: boolean;
}

export function FinalCTASection({ content, onUpdate, isEditing }: FinalCTASectionProps) {
  // SDI Design System
  const theme = content.sectionThemes?.['final-cta'] || 'dark';
  const palette = content.palette;
  const typography = content.sdiTypography;

  const headline = content.headline || "Ready to Get Started?";
  const ctaText = content.ctaText || "Get Started";
  const trustIndicators = content.trustIndicators || [];
  const { urgencyText, guaranteeText, secondaryCta } = content;

  // Helper functions for SDI-driven styling
  // CTA section ALWAYS uses dark background — primary color reserved for buttons/accents
  const getSectionStyles = (): React.CSSProperties => {
    const brandColors = content.brandColors;
    // 1. SDI dark section color
    if (palette?.darkSection) {
      return { 
        background: `linear-gradient(135deg, ${palette.darkSection}, ${palette.darkSection}dd)` 
      };
    }
    // 2. Brand secondary (navy/dark) color
    if (brandColors?.secondary) {
      return { 
        background: `linear-gradient(135deg, ${brandColors.secondary}ee, ${brandColors.secondary}cc)` 
      };
    }
    // 3. Dark fallback with subtle primary tint
    if (brandColors?.primary) {
      return { 
        background: `linear-gradient(135deg, #0f172a 0%, ${brandColors.primary}15 100%)` 
      };
    }
    // 4. Pure dark fallback
    return { 
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
    };
  };

  const getTextColorClass = () => {
    return theme === 'dark' ? 'text-white' : 'text-slate-900';
  };

  const getMutedTextColorClass = () => {
    return theme === 'dark' ? 'text-white/80' : 'text-slate-600';
  };

  const getSubtleTextColorClass = () => {
    return theme === 'dark' ? 'text-white/60' : 'text-slate-500';
  };

  const getButtonStyles = (): React.CSSProperties => {
    // Use brand primary color on the button (pops against dark CTA background)
    const brandPrimary = palette?.primary || content.brandColors?.primary;
    if (brandPrimary) {
      return { 
        backgroundColor: brandPrimary, 
        color: '#ffffff',
        boxShadow: `0 10px 40px -10px ${brandPrimary}88`
      };
    }
    if (theme === 'dark') {
      return {};
    }
    return {};
  };

  const getButtonClassName = () => {
    const brandPrimary = palette?.primary || content.brandColors?.primary;
    if (brandPrimary) {
      return 'text-white hover:opacity-90';
    }
    if (theme === 'dark') {
      return 'bg-white text-slate-900 hover:bg-slate-100';
    }
    return 'text-white hover:opacity-90';
  };

  const getUrgencyBannerStyles = () => {
    if (theme === 'dark') {
      return 'bg-amber-500/20 border border-amber-500/40 text-amber-300';
    }
    return 'bg-amber-100 border border-amber-200 text-amber-700';
  };

  const getGuaranteeColorClass = () => {
    return theme === 'dark' ? 'text-green-400' : 'text-green-600';
  };

  const getCheckIconColorClass = () => {
    return theme === 'dark' ? 'text-white/60' : 'text-slate-400';
  };

  const handleBlur = (field: string, e: React.FocusEvent<HTMLElement>) => {
    onUpdate({
      ...content,
      [field]: e.currentTarget.textContent || content[field as keyof typeof content],
    });
  };

  return (
    <section 
      className={`py-24 md:py-32 relative overflow-hidden ${(content as any).patternClass || 'section-pattern-mesh'} ${(content as any).glowClass || 'section-glow-orb'}`}
      style={{
        ...getSectionStyles(),
        '--glow-color': palette?.primary ? `${palette.primary}14` : 'hsla(189, 95%, 43%, 0.08)',
        '--glow-top': '30%',
        '--glow-right': '-8%',
      } as React.CSSProperties}
    >
      {/* Decorative glow for dark sections */}
      {theme === 'dark' && (
        <div className="absolute inset-0 pointer-events-none">
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl"
            style={{ 
              backgroundColor: palette?.primary 
                ? `${palette.primary}20` 
                : 'rgba(56, 189, 248, 0.1)' 
            }}
          />
        </div>
      )}

      {isEditing && (
        <div className="absolute inset-0 border-2 border-white/30 rounded-lg pointer-events-none z-10" />
      )}
      
      <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
        {/* Badge */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-4"
        >
          <span className={`inline-block px-4 py-1 text-sm font-semibold rounded-full ${
            theme === 'dark' 
              ? 'bg-white/20 text-white' 
              : 'bg-slate-100 text-slate-700'
          }`}>
            GET STARTED
          </span>
        </motion.div>
        
        {/* Headline */}
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className={`${typography?.sectionTitle || 'text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight'} mb-4 ${getTextColorClass()} ${
            isEditing ? "outline-dashed outline-2 outline-white/30 rounded px-2" : ""
          }`}
          contentEditable={isEditing}
          suppressContentEditableWarning
          onBlur={(e) => handleBlur("headline", e)}
        >
          {headline}
        </motion.h2>
        
        {/* Subtext */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className={`${typography?.body || 'text-lg'} mb-8 ${getMutedTextColorClass()} ${
            isEditing ? 'cursor-text hover:ring-2 hover:ring-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 rounded px-1' : ''
          }`}
          contentEditable={isEditing}
          suppressContentEditableWarning
          onBlur={(e) => handleBlur("subtext", e)}
        >
          {content.subtext || "No commitment required • Response within 24 hours"}
        </motion.p>

        {/* Urgency Banner */}
        {urgencyText && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium mb-8 ${getUrgencyBannerStyles()}`}
          >
            <span>⏰</span>
            <span>{urgencyText}</span>
          </motion.div>
        )}
        
        {/* CTA Button */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button 
            size="lg" 
            className={`px-12 py-6 text-lg font-semibold rounded-lg shadow-lg transition-all ${getButtonClassName()} ${
              isEditing ? "outline-dashed outline-2 outline-white/30" : ""
            }`}
            style={getButtonStyles()}
          >
            <span
              contentEditable={isEditing}
              suppressContentEditableWarning
              onBlur={(e) => handleBlur("ctaText", e)}
            >
              {ctaText}
            </span>
            <ArrowRight className="ml-2 w-5 h-5" strokeWidth={2} />
          </Button>

          {secondaryCta && (
            <Button 
              size="lg" 
              variant="outline"
              className={`px-8 py-6 text-lg font-semibold rounded-lg ${
                theme === 'dark' 
                  ? 'border-white/30 text-white hover:bg-white/10' 
                  : 'border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {secondaryCta}
            </Button>
          )}
        </motion.div>

        {/* Guarantee */}
        {guaranteeText && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className={`flex items-center justify-center gap-2 mt-6 mb-4 ${getGuaranteeColorClass()}`}
          >
            <Shield className="w-5 h-5" />
            <span className="text-sm font-medium">{guaranteeText}</span>
          </motion.div>
        )}

        {/* Trust Indicators */}
        {trustIndicators.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="flex flex-wrap justify-center gap-6 mt-8"
          >
            {trustIndicators.map((item, i) => (
              <div key={i} className={`flex items-center gap-2 text-sm ${getSubtleTextColorClass()}`}>
                <CheckCircle className={`w-4 h-4 ${getCheckIconColorClass()}`} strokeWidth={1.5} />
                <span
                  className={isEditing ? 'cursor-text hover:ring-2 hover:ring-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 rounded px-1' : ''}
                  contentEditable={isEditing}
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    const newIndicators = [...trustIndicators];
                    newIndicators[i] = { ...newIndicators[i], text: e.currentTarget.textContent || item.text };
                    onUpdate({ ...content, trustIndicators: newIndicators });
                  }}
                >
                  {item.text}
                </span>
              </div>
            ))}
          </motion.div>
        )}

        {/* Default trust text if no indicators */}
        {trustIndicators.length === 0 && !guaranteeText && (
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className={`text-sm mt-6 ${getSubtleTextColorClass()}`}
          >
            {content.trustText || "No credit card required • 14-day trial"}
          </motion.p>
        )}
      </div>
    </section>
  );
}

export default FinalCTASection;
