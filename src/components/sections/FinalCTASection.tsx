import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, Shield } from "lucide-react";
import { getIndustryTokens, type IndustryVariant } from "@/config/designSystem/industryVariants";
import { getSectionHeader } from "@/lib/industrySectionHeaders";

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
    // New fields for richer CTA
    secondaryCta?: string;
    urgencyText?: string;
    guaranteeText?: string;
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
  const isHealthcare = industryVariant === 'healthcare';
  const isLocalServices = industryVariant === 'local-services';
  
  // Get industry-specific CTA headers
  const ctaHeader = getSectionHeader(industryVariant, 'cta');
  const headline = content.headline || ctaHeader.title;
  const ctaText = content.ctaText || ctaHeader.subtitle || 'Get Started';
  
  console.log('🎨 [FinalCTASection] industryVariant:', industryVariant, 'ctaHeader:', ctaHeader);
  
  const handleBlur = (field: string, e: React.FocusEvent<HTMLElement>) => {
    onUpdate({
      ...content,
      [field]: e.currentTarget.textContent || content[field as keyof typeof content],
    });
  };

  const trustIndicators = content.trustIndicators || [];
  const { urgencyText, guaranteeText, secondaryCta } = content;

  // Local Services variant - light mode with phone-prominent CTA
  if (isLocalServices) {
    return (
      <section className="py-20 bg-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-700" />
        
        {isEditing && (
          <div className="absolute inset-0 border-2 border-blue-300/50 rounded-lg pointer-events-none z-10" />
        )}
        
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            contentEditable={isEditing}
            suppressContentEditableWarning
            onBlur={(e) => handleBlur("headline", e)}
            className={`text-3xl md:text-4xl font-bold text-white mb-4 ${isEditing ? "cursor-text hover:ring-2 hover:ring-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 rounded px-2" : ""}`}
          >
            {headline}
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl text-blue-100 mb-8"
          >
            {content.subtext || "Call now for a free estimate"}
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button 
              size="lg" 
              className="px-10 py-6 text-lg font-bold bg-orange-500 text-white hover:bg-orange-600 rounded-lg shadow-lg"
            >
              <span
                contentEditable={isEditing}
                suppressContentEditableWarning
                onBlur={(e) => handleBlur("ctaText", e)}
              >
                {ctaText}
              </span>
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            
            {secondaryCta && (
              <Button 
                size="lg" 
                variant="outline"
                className="px-8 py-6 text-lg font-semibold border-2 border-white text-white hover:bg-white/10 rounded-lg"
              >
                {secondaryCta}
              </Button>
            )}
          </motion.div>
          
          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-blue-100"
          >
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-white" />
              Licensed & Insured
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-white" />
              Free Estimates
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-white" />
              Same-Day Service Available
            </span>
          </motion.div>
        </div>
      </section>
    );
  }

  // SaaS variant
  if (isSaas) {
    return (
      <section className="py-32 pb-48 bg-gradient-to-br from-purple-900 via-slate-900 to-blue-900 relative overflow-hidden">
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
            {headline}
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl text-slate-300 mb-6"
          >
            {content.subtext || "Join thousands of teams already using us"}
          </motion.p>

          {/* Urgency Banner */}
          {urgencyText && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/40 text-amber-300 px-5 py-2.5 rounded-full text-sm font-medium mb-8"
            >
              <span>⏰</span>
              <span>{urgencyText}</span>
            </motion.div>
          )}
          
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
                {ctaText}
              </span>
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>

          {/* Guarantee */}
          {guaranteeText && (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="flex items-center justify-center gap-2 text-green-400 mt-6"
            >
              <Shield className="w-5 h-5" />
              <span className="text-sm font-medium">{guaranteeText}</span>
            </motion.div>
          )}
          
          <div className="flex flex-wrap justify-center gap-6 mt-6 text-sm text-slate-400">
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              No credit card required
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              14-day free trial
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              Cancel anytime
            </span>
          </div>
        </div>
      </section>
    );
  }

  // Healthcare variant: Light mode with teal CTA
  if (isHealthcare) {
    return (
      <section className="py-32 pb-48 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 relative overflow-hidden">
        {/* Subtle teal glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-3xl" />
        
        {isEditing && (
          <div className="absolute inset-0 border-2 border-teal-500/50 rounded-lg pointer-events-none z-10" />
        )}
        
        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className={`text-3xl md:text-4xl font-bold text-white mb-6 ${
              isEditing ? "outline-dashed outline-2 outline-teal-500/30 rounded px-2" : ""
            }`}
            contentEditable={isEditing}
            suppressContentEditableWarning
            onBlur={(e) => handleBlur("headline", e)}
          >
            {headline}
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className={`text-xl text-slate-300 mb-6 ${isEditing ? 'cursor-text hover:ring-2 hover:ring-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400 rounded px-1' : ''}`}
            contentEditable={isEditing}
            suppressContentEditableWarning
            onBlur={(e) => handleBlur("subtext", e)}
          >
            {content.subtext || "Free assessment • No obligation"}
          </motion.p>

          {/* Urgency Banner */}
          {urgencyText && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/40 text-amber-300 px-5 py-2.5 rounded-full text-sm font-medium mb-8"
            >
              <span>⏰</span>
              <span>{urgencyText}</span>
            </motion.div>
          )}
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Button 
              size="lg" 
              className={`px-12 py-6 text-lg font-semibold bg-teal-600 text-white hover:bg-teal-700 rounded-xl shadow-lg shadow-teal-600/30 ${
                isEditing ? "outline-dashed outline-2 outline-teal-500/30" : ""
              }`}
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
          </motion.div>

          {/* Guarantee */}
          {guaranteeText && (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="flex items-center justify-center gap-2 text-teal-400 mt-6 mb-4"
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
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap justify-center gap-6 mt-10"
            >
              {trustIndicators.map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-slate-400">
                  <CheckCircle className="w-4 h-4 text-teal-500" strokeWidth={1.5} />
                  <span
                    className={isEditing ? 'cursor-text hover:ring-2 hover:ring-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400 rounded px-1' : ''}
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

  if (isConsulting) {
    // Consulting layout: Dark slate-900 background for contrast
    return (
      <section className="py-32 pb-48 bg-slate-900 relative overflow-hidden">
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
            {headline}
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className={`text-xl text-slate-300 mb-6 ${isEditing ? 'cursor-text hover:ring-2 hover:ring-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 rounded px-1' : ''}`}
            contentEditable={isEditing}
            suppressContentEditableWarning
            onBlur={(e) => handleBlur("subtext", e)}
          >
            {content.subtext || "Free consultation • No obligation"}
          </motion.p>

          {/* Urgency Banner */}
          {urgencyText && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/40 text-amber-300 px-5 py-2.5 rounded-full text-sm font-medium mb-8"
            >
              <span>⏰</span>
              <span>{urgencyText}</span>
            </motion.div>
          )}
          
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
                {ctaText}
              </span>
              <ArrowRight className="ml-2 w-5 h-5" strokeWidth={2} />
            </Button>
          </motion.div>

          {/* Guarantee */}
          {guaranteeText && (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="flex items-center justify-center gap-2 text-green-400 mt-6 mb-4"
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
      className="relative overflow-hidden pb-24"
      style={{
        backgroundColor: `hsl(${tokens.colors.bgDark})`,
        padding: '128px 24px',
        paddingBottom: '128px',
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
          {headline}
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

        {/* Urgency Banner */}
        {urgencyText && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="inline-block bg-amber-500/20 border border-amber-500/40 text-amber-300 px-4 py-2 rounded-full text-sm font-medium"
          >
            ⏰ {urgencyText}
          </motion.div>
        )}
        
        {/* CTA Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 pt-4"
        >
          <div className="relative group">
            <Button 
              size="lg" 
              className={`relative overflow-hidden text-lg md:text-xl px-12 md:px-16 py-7 md:py-8 h-auto font-semibold transition-all duration-300 hover:scale-[1.02] animate-pulse-glow ${
                isEditing ? "outline-dashed outline-2 outline-cyan-500/30" : ""
              }`}
              style={{
                background: content.primaryColor 
                  ? content.primaryColor 
                  : 'linear-gradient(135deg, hsl(189, 95%, 43%), hsl(200, 95%, 50%))',
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
                {ctaText}
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

          {/* Secondary CTA */}
          {secondaryCta && (
            <Button
              variant="outline"
              size="lg"
              className="text-lg px-8 py-7 md:py-8 h-auto border-white/30 text-white hover:bg-white/10"
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
            transition={{ duration: 0.5, delay: 0.25 }}
            className="flex items-center justify-center gap-2 text-green-400"
          >
            <Shield className="w-5 h-5" />
            <span>{guaranteeText}</span>
          </motion.div>
        )}

        {/* Micro-trust below CTA */}
        {!guaranteeText && trustIndicators.length > 0 ? (
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
        ) : !guaranteeText ? (
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-sm text-slate-500"
          >
            {content.trustText || tokens.sectionHeaders.cta.subtext}
          </motion.p>
        ) : null}
      </div>
    </section>
  );
}
