import { motion } from "framer-motion";
import { formatStatValue, getTypography } from "@/lib/typographyScale";

interface Statistic {
  value: string;
  label: string;
  source?: string;
}

interface StatsBarSectionProps {
  statistics: Statistic[];
  industryVariant?: string;
}

/**
 * Stats Bar Section - BRIEF-FIRST APPROACH
 * 
 * CRITICAL: Only shows statistics passed from the brief.
 * NO fallback stats, NO fabrication, NO template defaults.
 */
export function StatsBarSection({ statistics, industryVariant }: StatsBarSectionProps) {
  const typography = getTypography(industryVariant);
  const isConsulting = industryVariant === 'consulting';
  
  console.log('🎨 [StatsBarSection] industryVariant:', industryVariant, 'isConsulting:', isConsulting);
  
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
      style={{
        backgroundColor: 'var(--color-background-alt)',
        borderTopWidth: 'var(--border-width)',
        borderBottomWidth: 'var(--border-width)',
        borderColor: 'var(--color-border)',
        borderStyle: 'solid',
        padding: 'var(--spacing-section-y) var(--spacing-section-x)',
      }}
    >
      <div className="container mx-auto max-w-6xl">
        <div className={`grid ${getGridClass()}`} style={{ gap: 'var(--spacing-card-gap)' }}>
          {cleanStats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="text-center hover:scale-[1.02] transition-all duration-300"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                borderWidth: 'var(--border-width)',
                borderStyle: 'solid',
                borderRadius: 'var(--radius-medium)',
                padding: 'var(--spacing-card-padding)',
                boxShadow: 'var(--shadow-medium)',
              }}
            >
              <div 
                className={typography.statValue}
                style={{ 
                  color: 'var(--color-primary)',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 'var(--font-weight-heading)',
                }}
              >
                {formatStatValue(stat.value)}
              </div>
              <div 
                className={typography.statLabel}
                style={{ 
                  color: 'var(--color-text-primary)',
                  fontFamily: 'var(--font-body)',
                  fontWeight: 'var(--font-weight-body)',
                }}
              >
                {stat.label}
              </div>
              {stat.source && (
                <div 
                  className="text-xs"
                  style={{ color: 'var(--color-text-muted)' }}
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
