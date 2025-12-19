import { motion } from "framer-motion";

interface Statistic {
  value: string;
  label: string;
  source?: string;
}

interface StatsBarSectionProps {
  statistics: Statistic[];
}

/**
 * Stats Bar Section - BRIEF-FIRST APPROACH
 * 
 * CRITICAL: Only shows statistics passed from the brief.
 * NO fallback stats, NO fabrication, NO template defaults.
 */
export function StatsBarSection({ statistics }: StatsBarSectionProps) {
  // NO FABRICATION: Only render stats that actually exist
  // Don't pad with defaults, return null if no real stats
  if (!statistics || statistics.length === 0) {
    return null;
  }

  // Clean the stats (remove any that are clearly malformed)
  const cleanStats = statistics.filter(stat => {
    if (!stat.value || !stat.label) return false;
    // Value should be reasonably short (number-like)
    if (stat.value.length > 15) return false;
    // Label should be under ~50 chars
    if (stat.label.length > 50) return false;
    return true;
  });

  // Don't render if no clean stats
  if (cleanStats.length === 0) {
    return null;
  }

  // Dynamic grid based on stat count
  const getGridClass = () => {
    if (cleanStats.length === 2) return "grid-cols-2";
    if (cleanStats.length === 3) return "grid-cols-1 md:grid-cols-3";
    return "grid-cols-2 md:grid-cols-4";
  };

  return (
    <section className="py-12 md:py-16 bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 dark:from-slate-800/80 dark:via-slate-900 dark:to-slate-800/80 border-y border-slate-200 dark:border-slate-700/50">
      <div className="container mx-auto max-w-6xl px-4">
        <div className={`grid ${getGridClass()} gap-6 md:gap-8`}>
          {cleanStats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="bg-white dark:bg-slate-800/60 rounded-2xl p-6 md:p-8 text-center shadow-lg shadow-slate-200/50 dark:shadow-slate-900/30 border border-slate-200/80 dark:border-slate-700/50 hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300"
            >
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-600 to-cyan-500 dark:from-cyan-400 dark:to-cyan-300 bg-clip-text text-transparent mb-3">
                {stat.value}
              </div>
              <div className="text-slate-700 dark:text-slate-300 font-medium text-sm md:text-base mb-2">
                {stat.label}
              </div>
              {stat.source && (
                <div className="text-xs text-slate-500 dark:text-slate-500">
                  Source: {stat.source}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
