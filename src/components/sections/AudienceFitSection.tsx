import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

interface AudienceFitProps {
  content: {
    forWho: string | null;
    notForWho: string | null;
  };
  onUpdate?: (content: any) => void;
  isEditing?: boolean;
}

export function AudienceFitSection({ content, onUpdate, isEditing }: AudienceFitProps) {
  // Don't render if neither field has content
  if (!content.forWho && !content.notForWho) return null;

  return (
    <section className="relative py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-muted-foreground mb-4">
            ✓ Perfect Fit Check
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Is This Right For You?
          </h2>
        </motion.div>

        <div className={`grid gap-8 ${content.forWho && content.notForWho ? 'md:grid-cols-2' : 'max-w-xl mx-auto'}`}>
          {/* This IS For - dark theme with green accent */}
          {content.forWho && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative p-6 rounded-2xl bg-background/50 border border-emerald-500/30 backdrop-blur-sm"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                  <Check className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">This Is For You If...</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {content.forWho}
              </p>
            </motion.div>
          )}

          {/* This is NOT For - dark theme with red accent */}
          {content.notForWho && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative p-6 rounded-2xl bg-background/50 border border-rose-500/30 backdrop-blur-sm"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-rose-500/20 border border-rose-500/30 flex items-center justify-center">
                  <X className="w-5 h-5 text-rose-400" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">This Isn't For You If...</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {content.notForWho}
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
