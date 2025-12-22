import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle } from "lucide-react";
import { getIndustryTokens, type IndustryVariant } from "@/config/designSystem/industryVariants";

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
  const isConsulting = industryVariant === 'consulting';
  const isSaas = industryVariant === 'saas';
  
  const handleBlur = (field: string, e: React.FocusEvent<HTMLElement>) => {
    onUpdate({
      ...content,
      [field]: e.currentTarget.textContent || content[field as keyof typeof content],
    });
  };

  const trustIndicators = content.trustIndicators || [];

  // SaaS variant
  if (isSaas) {
    return (
      <section className="py-32 bg-gradient-to-br from-purple-900 via-slate-900 to-blue-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-600/20 via-transparent to-transparent" />
        
        {isEditing && (
          <div className="absolute inset-0 border-2 border-purple-500/50 rounded-lg pointer-events-none z-10" />
        )}
        
        <div className="relative max-w-3xl mx-auto px-6 text-center z-10">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            contentEditable={isEditing}
            suppressContentEditableWarning
            onBlur={(e) => handleBlur("headline", e)}
            className={`text-3xl md:text-4xl font-bold text-white mb-6 ${isEditing ? "cursor-text hover:ring-2 hover:ring-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400 rounded px-2" : ""}`}
          >
            {content.headline || "Ready to get started?"}
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl text-slate-300 mb-10"
          >
            {content.subtext || "Join thousands of teams already using us"}
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Button 
              size="lg" 
              className="px-12 py-6 text-lg font-semibold bg-white text-slate-900 hover:bg-slate-100 rounded-xl shadow-lg"
            >
              <span
                contentEditable={isEditing}
                suppressContentEditableWarning
                onBlur={(e) => handleBlur("ctaText", e)}
              >
                {content.ctaText || "Start your free trial"}
              </span>
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>
          
          <p className="mt-6 text-sm text-slate-400">
            No credit card required • Cancel anytime
          </p>
        </div>
      </section>
    );
  }

  if (isConsulting) {
    // Consulting layout: Dark slate-900 background for contrast
    return (
      <section className="py-32 bg-slate-900 relative overflow-hidden">
        {isEditing && (
          <div className="absolute inset-0 border-2 border-cyan-500/50 rounded-lg pointer-events-none z-10" />
        )}
        
        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className={`text-3xl md:text-4xl font-bold text-white mb-6 ${
              isEditing ? "outline-dashed outline-2 outline-cyan-500/30 rounded px-2" : ""
            }`}
            contentEditable={isEditing}
            suppressContentEditableWarning
            onBlur={(e) => handleBlur("headline", e)}
          >
            Let's Start a Conversation
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className={`text-xl text-slate-300 mb-10 ${isEditing ? 'cursor-text hover:ring-2 hover:ring-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 rounded px-1' : ''}`}
            contentEditable={isEditing}
            suppressContentEditableWarning
            onBlur={(e) => handleBlur("subtext", e)}
          >
            {content.subtext || "Free consultation • No obligation"}
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Button 
              size="lg" 
              className={`px-12 py-6 text-lg font-semibold bg-white text-slate-900 hover:bg-slate-100 rounded-xl shadow-lg ${
                isEditing ? "outline-dashed outline-2 outline-cyan-500/30" : ""
              }`}
            >
              <span
                contentEditable={isEditing}
                suppressContentEditableWarning
                onBlur={(e) => handleBlur("ctaText", e)}
              >
                {content.ctaText}
              </span>
              <ArrowRight className="ml-2 w-5 h-5" strokeWidth={2} />
            </Button>
          </motion.div>

          {/* Trust Indicators */}
          {trustIndicators.length > 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap justify-center gap-6 mt-10"
            >
              {trustIndicators.map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-slate-400">
                  <CheckCircle className="w-4 h-4 text-emerald-500" strokeWidth={1.5} />
                  <span
                    className={isEditing ? 'cursor-text hover:ring-2 hover:ring-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 rounded px-1' : ''}
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
        </div>
      </section>
    );
  }

  // Default dark mode layout with glows
  return (
    <section 
      className="relative overflow-hidden"
      style={{
        backgroundColor: `hsl(${tokens.colors.bgDark})`,
        padding: '128px 24px',
      }}
    >
      {/* Dramatic Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-grid-pattern opacity-30" />
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[150px]"
          style={{ background: 'radial-gradient(circle, hsla(189, 95%, 43%, 0.15) 0%, transparent 70%)' }}
        />
        <div 
          className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px]"
          style={{ backgroundColor: 'hsla(270, 95%, 60%, 0.08)' }}
        />
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
        
        {/* CTA Button */}
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
              className={`relative overflow-hidden text-lg md:text-xl px-12 md:px-16 py-7 md:py-8 h-auto font-semibold transition-all duration-300 hover:scale-[1.02] animate-pulse-glow ${
                isEditing ? "outline-dashed outline-2 outline-cyan-500/30" : ""
              }`}
              style={{
                background: 'linear-gradient(135deg, hsl(189, 95%, 43%), hsl(200, 95%, 50%))',
                color: 'white',
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
              
              {/* Animated Gradient */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: 'linear-gradient(135deg, hsl(200, 95%, 50%), hsl(270, 95%, 60%))' }}
              />
              
              {/* Shimmer */}
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-1000" />
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
                <span
                  className={isEditing ? 'cursor-text hover:ring-2 hover:ring-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 rounded px-1' : ''}
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
