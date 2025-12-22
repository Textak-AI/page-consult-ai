import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle } from "lucide-react";
import { getIndustryTokens, type IndustryVariant } from "@/config/designSystem/industryVariants";
import { SPACING } from "@/lib/spacingSystem";

interface FinalCTASectionProps {
  content: {
    headline: string;
    ctaText: string;
    ctaLink: string;
    subtext?: string;
    trustText?: string;
    trustIndicators?: Array<{ text: string }>;
    primaryColor?: string;
    industryVariant?: IndustryVariant;
  };
  onUpdate: (content: any) => void;
  isEditing?: boolean;
}

export function FinalCTASection({ content, onUpdate, isEditing }: FinalCTASectionProps) {
  const industryVariant = content.industryVariant || 'default';
  const tokens = getIndustryTokens(industryVariant);
  const isLightMode = tokens.mode === 'light';
  
  const handleBlur = (field: string, e: React.FocusEvent<HTMLElement>) => {
    onUpdate({
      ...content,
      [field]: e.currentTarget.textContent || content[field as keyof typeof content],
    });
  };

  const trustIndicators = content.trustIndicators || [];

  // For light mode pages (consulting), Final CTA uses dark background for contrast
  // For dark mode pages (SaaS), it uses the same dark with glows
  const sectionStyles = {
    backgroundColor: `hsl(${tokens.colors.bgDark})`,
    padding: `${SPACING.sectionY.md} 24px`,
  };

  return (
    <section 
      className="relative overflow-hidden"
      style={sectionStyles}
    >
      {/* Dramatic Background - only for dark mode SaaS */}
      <div className="absolute inset-0">
        {!isLightMode && (
          <>
            <div className="absolute inset-0 bg-grid-pattern opacity-30" />
            <div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[150px]"
              style={{ background: 'radial-gradient(circle, hsla(189, 95%, 43%, 0.15) 0%, transparent 70%)' }}
            />
            <div 
              className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px]"
              style={{ backgroundColor: 'hsla(270, 95%, 60%, 0.08)' }}
            />
          </>
        )}
      </div>
      
      {isEditing && (
        <div className="absolute inset-0 border-2 border-cyan-500/50 rounded-lg pointer-events-none z-10" />
      )}
      
      <div className="container mx-auto max-w-4xl text-center relative z-10 flex flex-col items-center gap-8">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight max-w-3xl ${
            isEditing ? "outline-dashed outline-2 outline-cyan-500/30 rounded px-2" : ""
          }`}
          style={{
            color: `hsl(${tokens.colors.textOnDark})`,
            fontFamily: isLightMode ? tokens.typography.headingFont : undefined,
          }}
          contentEditable={isEditing}
          suppressContentEditableWarning
          onBlur={(e) => handleBlur("headline", e)}
        >
          {content.headline}
        </motion.h2>
        
        {content.subtext && (
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg md:text-xl max-w-2xl leading-relaxed text-slate-400"
          >
            {content.subtext}
          </motion.p>
        )}
        
        {/* CTA Button — Maximum Impact */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="pt-4"
        >
          <div className="relative group">
            <Button 
              size="lg" 
              className={`relative overflow-hidden text-lg md:text-xl px-12 md:px-16 py-7 md:py-8 h-auto font-semibold transition-all duration-300 hover:scale-[1.02] ${
                isLightMode
                  ? 'bg-white hover:bg-slate-100 shadow-lg'
                  : 'animate-pulse-glow'
              } ${isEditing ? "outline-dashed outline-2 outline-cyan-500/30" : ""}`}
              style={{
                background: isLightMode 
                  ? undefined 
                  : 'linear-gradient(135deg, hsl(189, 95%, 43%), hsl(200, 95%, 50%))',
                color: isLightMode ? `hsl(${tokens.colors.accent})` : 'white',
                borderRadius: tokens.shape.radiusButton,
              }}
            >
              <span
                contentEditable={isEditing}
                suppressContentEditableWarning
                onBlur={(e) => handleBlur("ctaText", e)}
                className="relative z-10"
              >
                {content.ctaText}
              </span>
              <ArrowRight className="ml-3 w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-1 transition-transform relative z-10" strokeWidth={2} />
              
              {/* Animated Gradient - only for dark mode */}
              {!isLightMode && (
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: 'linear-gradient(135deg, hsl(200, 95%, 50%), hsl(270, 95%, 60%))' }}
                />
              )}
              
              {/* Shimmer - only for dark mode */}
              {!isLightMode && (
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-1000" />
              )}
            </Button>
          </div>
        </motion.div>

        {/* Micro-trust below CTA */}
        {trustIndicators.length > 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap justify-center gap-6 pt-4"
          >
            {trustIndicators.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-slate-400">
                <CheckCircle className="w-4 h-4 text-white/60" strokeWidth={1.5} />
                <span>{item.text}</span>
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-sm text-slate-500"
          >
            {content.trustText || tokens.sectionHeaders.cta.subtext}
          </motion.p>
        )}
      </div>
    </section>
  );
}
