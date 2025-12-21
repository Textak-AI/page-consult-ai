import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface DifferentiatorCalloutProps {
  content: {
    text: string;
  };
}

export function DifferentiatorCalloutSection({ content }: DifferentiatorCalloutProps) {
  if (!content.text) return null;

  return (
    <section className="relative py-8 overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-muted to-transparent" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative max-w-4xl mx-auto px-6"
      >
        <div className="flex items-center justify-center gap-3 text-center">
          <Sparkles className="w-5 h-5 text-brand flex-shrink-0" />
          <p className="text-lg md:text-xl font-medium text-foreground">
            {content.text}
          </p>
          <Sparkles className="w-5 h-5 text-brand flex-shrink-0" />
        </div>
      </motion.div>
    </section>
  );
}
