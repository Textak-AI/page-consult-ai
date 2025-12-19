import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Clock, Shield, Zap, CheckCircle } from "lucide-react";

const getButtonTextColor = (primaryColor: string): string => {
  const hex = primaryColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#1E293B' : '#FFFFFF';
};

interface FinalCTASectionProps {
  content: {
    headline: string;
    ctaText: string;
    ctaLink: string;
    subtext?: string;
    trustIndicators?: Array<{ text: string }>;
    primaryColor?: string;
  };
  onUpdate: (content: any) => void;
  isEditing?: boolean;
}

export function FinalCTASection({ content, onUpdate, isEditing }: FinalCTASectionProps) {
  const handleBlur = (field: string, e: React.FocusEvent<HTMLElement>) => {
    onUpdate({
      ...content,
      [field]: e.currentTarget.textContent || content[field as keyof typeof content],
    });
  };

  // Only use trust indicators if explicitly provided - NO FABRICATION
  const trustIndicators = content.trustIndicators || [];

  return (
    <section 
      className={`relative overflow-hidden ${isEditing ? "relative" : ""}`}
      style={{
        background: 'linear-gradient(135deg, var(--color-background), var(--color-background-alt))',
        padding: 'var(--spacing-section-y) var(--spacing-section-x)',
      }}
    >
      {/* Background decorations */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-60"></div>
      <div 
        className="absolute top-1/2 left-1/4 w-[500px] h-[500px] rounded-full blur-[100px] -translate-y-1/2"
        style={{ backgroundColor: 'var(--color-primary)', opacity: 0.1 }}
      ></div>
      <div 
        className="absolute top-1/2 right-1/4 w-[500px] h-[500px] rounded-full blur-[100px] -translate-y-1/2"
        style={{ backgroundColor: 'var(--color-secondary)', opacity: 0.1 }}
      ></div>
      
      {isEditing && (
        <div 
          className="absolute inset-0 border-2 rounded-lg pointer-events-none z-10"
          style={{ borderColor: 'var(--color-secondary)' }}
        />
      )}
      
      <div className="container mx-auto max-w-4xl text-center relative z-10" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-stack-gap)', alignItems: 'center' }}>
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl ${
            isEditing ? "outline-dashed outline-2 outline-secondary/50 rounded px-2" : ""
          }`}
          contentEditable={isEditing}
          suppressContentEditableWarning
          onBlur={(e) => handleBlur("headline", e)}
          style={{ 
            color: 'var(--color-text-inverse)',
            fontFamily: 'var(--font-heading)',
            fontWeight: 'var(--font-weight-heading)',
            lineHeight: 'var(--line-height-heading)',
            letterSpacing: 'var(--letter-spacing-heading)',
          }}
        >
          {content.headline}
        </motion.h2>
        
        {content.subtext && (
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="text-lg md:text-xl max-w-2xl"
            style={{ 
              color: 'var(--color-text-secondary)',
              fontFamily: 'var(--font-body)',
              lineHeight: 'var(--line-height-body)',
            }}
          >
            {content.subtext}
          </motion.p>
        )}
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="pt-4"
          style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-stack-gap)', alignItems: 'center' }}
        >
          <Button 
            size="lg" 
            className={`text-lg md:text-xl px-12 md:px-16 py-7 md:py-8 h-auto font-semibold transition-all duration-300 hover:scale-105 group ${
              isEditing ? "outline-dashed outline-2 outline-secondary/50" : ""
            }`}
            style={{
              background: `linear-gradient(135deg, var(--color-primary), var(--color-primary-hover))`,
              color: content.primaryColor ? getButtonTextColor(content.primaryColor) : 'var(--color-text-inverse)',
              boxShadow: 'var(--shadow-large)',
              borderRadius: 'var(--radius-small)',
              fontFamily: 'var(--font-body)',
            }}
          >
            <span
              contentEditable={isEditing}
              suppressContentEditableWarning
              onBlur={(e) => handleBlur("ctaText", e)}
            >
              {content.ctaText}
            </span>
            <ArrowRight className="ml-3 w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-1 transition-transform" strokeWidth={1.5} />
          </Button>
          
          {/* Trust Indicators - only shown if data exists, NO FABRICATION */}
          {trustIndicators.length > 0 && (
            <div className="flex flex-wrap justify-center pt-4" style={{ gap: 'var(--spacing-element-gap)' }}>
              {trustIndicators.map((item, i) => {
                const icons = [Shield, Zap, Clock];
                const Icon = icons[i % icons.length];
                return (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
                    className="flex items-center gap-2 text-sm md:text-base"
                    style={{ 
                      color: 'var(--color-text-secondary)',
                      fontFamily: 'var(--font-body)',
                    }}
                  >
                    <CheckCircle 
                      className="w-5 h-5" 
                      style={{ color: 'var(--color-primary)' }}
                      strokeWidth={1.5}
                    />
                    <span>{item.text}</span>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
