import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Clock, Shield, Zap, CheckCircle } from "lucide-react";

interface FinalCTASectionProps {
  content: {
    headline: string;
    ctaText: string;
    ctaLink: string;
    subtext?: string;
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

  const trustIndicators = [
    { icon: Shield, text: "No commitment required" },
    { icon: Zap, text: "Free quote in 24 hours" },
    { icon: Clock, text: "Same-day response" },
  ];

  return (
    <section 
      className={`py-20 md:py-28 lg:py-32 px-4 relative overflow-hidden ${
        isEditing ? "relative" : ""
      }`}
      style={{
        background: 'linear-gradient(135deg, var(--color-background, #1e293b), var(--color-background-alt, #0f172a))',
      }}
    >
      {/* Background decorations */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-60"></div>
      <div 
        className="absolute top-1/2 left-1/4 w-[500px] h-[500px] rounded-full blur-[100px] -translate-y-1/2"
        style={{ backgroundColor: 'var(--color-primary, rgba(6, 182, 212, 0.1))' }}
      ></div>
      <div 
        className="absolute top-1/2 right-1/4 w-[500px] h-[500px] rounded-full blur-[100px] -translate-y-1/2"
        style={{ backgroundColor: 'var(--color-secondary, rgba(168, 85, 247, 0.1))' }}
      ></div>
      
      {isEditing && (
        <div className="absolute inset-0 border-2 border-secondary/80 rounded-lg pointer-events-none z-10" />
      )}
      
      <div className="container mx-auto max-w-4xl text-center space-y-10 relative z-10">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight ${
            isEditing ? "outline-dashed outline-2 outline-secondary/50 rounded px-2" : ""
          }`}
          contentEditable={isEditing}
          suppressContentEditableWarning
          onBlur={(e) => handleBlur("headline", e)}
          style={{ color: 'var(--color-text-inverse, white)' }}
        >
          {content.headline}
        </motion.h2>
        
        {content.subtext && (
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="text-lg md:text-xl max-w-2xl mx-auto"
            style={{ color: 'var(--color-text-secondary, #94a3b8)' }}
          >
            {content.subtext}
          </motion.p>
        )}
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="pt-4 space-y-8"
        >
          <Button 
            size="lg" 
            className={`text-lg md:text-xl px-12 md:px-16 py-7 md:py-8 h-auto font-semibold shadow-2xl transition-all duration-300 hover:scale-105 group ${
              isEditing ? "outline-dashed outline-2 outline-secondary/50" : ""
            }`}
            style={{
              background: `linear-gradient(135deg, var(--color-primary, #06b6d4), var(--color-primary-hover, #0891b2))`,
              color: 'var(--color-text-inverse, white)',
              boxShadow: '0 20px 40px -15px var(--color-primary, rgba(6, 182, 212, 0.4))',
              borderRadius: 'var(--radius-medium, 0.75rem)',
            }}
          >
            <span
              contentEditable={isEditing}
              suppressContentEditableWarning
              onBlur={(e) => handleBlur("ctaText", e)}
            >
              {content.ctaText}
            </span>
            <ArrowRight className="ml-3 w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-1 transition-transform" />
          </Button>
          
          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 pt-4">
            {trustIndicators.map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
                className="flex items-center gap-2 text-sm md:text-base"
                style={{ color: 'var(--color-text-secondary, #94a3b8)' }}
              >
                <CheckCircle 
                  className="w-5 h-5" 
                  style={{ color: 'var(--color-primary, #22d3ee)' }}
                />
                <span>{item.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}