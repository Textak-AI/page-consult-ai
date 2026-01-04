import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface GeneratingHeroProps {
  industry?: string;
}

export function GeneratingHero({ industry }: GeneratingHeroProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative"
    >
      {/* Shimmer headline placeholder */}
      <div className="mb-6">
        <div className="h-14 md:h-16 lg:h-20 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 rounded-lg mb-3 animate-shimmer bg-[length:200%_100%]" />
        <div className="h-14 md:h-16 lg:h-20 w-3/4 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 rounded-lg animate-shimmer bg-[length:200%_100%]" style={{ animationDelay: '0.1s' }} />
      </div>
      
      {/* Shimmer subheadline placeholder */}
      <div className="mb-8">
        <div className="h-6 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 rounded-lg mb-2 animate-shimmer bg-[length:200%_100%]" style={{ animationDelay: '0.2s' }} />
        <div className="h-6 w-5/6 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 rounded-lg animate-shimmer bg-[length:200%_100%]" style={{ animationDelay: '0.3s' }} />
      </div>

      {/* Status message */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/20 rounded-xl mb-8"
      >
        <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
        <div>
          <p className="text-white font-medium">
            Analyzing your business...
          </p>
          <p className="text-gray-400 text-sm">
            {industry 
              ? `Creating personalized content for ${industry}` 
              : 'Generating your custom landing page preview'
            }
          </p>
        </div>
      </motion.div>

      {/* Shimmer CTA placeholder */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="h-14 w-64 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 rounded-xl animate-shimmer bg-[length:200%_100%]" style={{ animationDelay: '0.4s' }} />
        <div className="h-14 w-48 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 rounded-xl animate-shimmer bg-[length:200%_100%]" style={{ animationDelay: '0.5s' }} />
      </div>
    </motion.div>
  );
}
