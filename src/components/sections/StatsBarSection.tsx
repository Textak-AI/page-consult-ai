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
    <section 
      className="py-12 md:py-16 border-y"
      style={{
        background: 'linear-gradient(to right, var(--color-background-alt, #f1f5f9), var(--color-surface, #f8fafc), var(--color-background-alt, #f1f5f9))',
        borderColor: 'var(--color-border, #e2e8f0)',
      }}
    >
      <div className="container mx-auto max-w-6xl px-4">
        <div className={`grid ${getGridClass()} gap-6 md:gap-8`}>
          {cleanStats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="rounded-2xl p-6 md:p-8 text-center shadow-lg hover:shadow-xl transition-all duration-300"
              style={{
                backgroundColor: 'var(--color-surface, white)',
                borderColor: 'var(--color-border, #e2e8f0)',
                borderWidth: '1px',
              }}
            >
              <div 
                className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3"
                style={{ color: 'var(--color-primary, #0891b2)' }}
              >
                {stat.value}
              </div>
              <div 
                className="font-medium text-sm md:text-base mb-2"
                style={{ color: 'var(--color-text-primary, #334155)' }}
              >
                {stat.label}
              </div>
              {stat.source && (
                <div 
                  className="text-xs"
                  style={{ color: 'var(--color-text-muted, #64748b)' }}
                >
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