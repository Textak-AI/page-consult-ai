import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Clock, Shield, Zap } from "lucide-react";

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

  const benefits = [
    { icon: Shield, text: "No commitment" },
    { icon: Zap, text: "Free quote" },
    { icon: Clock, text: "Same-day response" },
  ];

  return (
    <section className={`py-24 px-4 bg-gradient-to-br from-slate-900 via-cyan-900/20 to-slate-900 relative overflow-hidden ${
      isEditing ? "relative" : ""
    }`}>
      {/* Background decorations */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50"></div>
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      
      {isEditing && (
        <div className="absolute inset-0 border-2 border-secondary/80 rounded-lg pointer-events-none z-10" />
      )}
      
      <div className="container mx-auto max-w-4xl text-center space-y-8 relative z-10">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className={`text-4xl md:text-5xl lg:text-6xl font-bold leading-tight ${
            isEditing ? "outline-dashed outline-2 outline-secondary/50 rounded px-2" : ""
          }`}
          contentEditable={isEditing}
          suppressContentEditableWarning
          onBlur={(e) => handleBlur("headline", e)}
        >
          <span className="bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent">
            {content.headline}
          </span>
        </motion.h2>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="pt-4 space-y-6"
        >
          <Button 
            size="lg" 
            className={`text-lg px-10 py-7 h-auto bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-300 hover:scale-105 group ${
              isEditing ? "outline-dashed outline-2 outline-secondary/50" : ""
            }`}
          >
            <span
              contentEditable={isEditing}
              suppressContentEditableWarning
              onBlur={(e) => handleBlur("ctaText", e)}
            >
              {content.ctaText}
            </span>
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          
          {/* Benefits */}
          <div className="flex flex-wrap justify-center gap-6 pt-2">
            {benefits.map((benefit, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-gray-400">
                <benefit.icon className="w-4 h-4 text-cyan-500" />
                <span>{benefit.text}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
