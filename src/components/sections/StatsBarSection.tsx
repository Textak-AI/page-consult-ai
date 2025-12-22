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
  onUpdate?: (content: any) => void;
  isEditing?: boolean;
}

/**
 * Stats Bar Section - BRIEF-FIRST APPROACH
 * 
 * CRITICAL: Only shows statistics passed from the brief.
 * NO fallback stats, NO fabrication, NO template defaults.
 */
export function StatsBarSection({ statistics, industryVariant, onUpdate, isEditing }: StatsBarSectionProps) {
  const typography = getTypography(industryVariant);
  const isConsulting = industryVariant === 'consulting';
  
  console.log('🎨 [StatsBarSection] Props received - industryVariant:', industryVariant, 'isConsulting:', isConsulting, 'isEditing:', isEditing);
  console.log('🎨 [StatsBarSection] statistics count:', statistics?.length);

  const handleStatBlur = (index: number, field: 'value' | 'label', e: React.FocusEvent<HTMLElement>) => {
    if (!onUpdate) return;
    const updatedStats = [...statistics];
    updatedStats[index] = {
      ...updatedStats[index],
      [field]: e.currentTarget.textContent || updatedStats[index][field],
    };
    onUpdate({ statistics: updatedStats, industryVariant });
  };
  
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

  if (isConsulting) {
    // Consulting: Light slate background, prominent numbers
    return (
      <section className={`py-16 bg-slate-50 border-y border-slate-200 ${isEditing ? 'relative' : ''}`}>
        {isEditing && (
          <div className="absolute inset-0 border-2 border-cyan-500/50 rounded-lg pointer-events-none z-10" />
        )}
        <div className="max-w-5xl mx-auto px-6">
          <div className={`grid ${getGridClass()} gap-8 md:gap-12`}>
            {cleanStats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="text-center"
              >
                <div 
                  className={`text-4xl md:text-5xl font-bold text-slate-900 mb-2 ${
                    isEditing ? "outline-dashed outline-2 outline-cyan-500/30 rounded px-2 inline-block" : ""
                  }`}
                  contentEditable={isEditing}
                  suppressContentEditableWarning
                  onBlur={(e) => handleStatBlur(i, 'value', e)}
                >
                  {formatStatValue(stat.value)}
                </div>
                <div 
                  className={`text-sm md:text-base text-slate-600 font-medium ${
                    isEditing ? "outline-dashed outline-2 outline-cyan-500/30 rounded px-1" : ""
                  }`}
                  contentEditable={isEditing}
                  suppressContentEditableWarning
                  onBlur={(e) => handleStatBlur(i, 'label', e)}
                >
                  {stat.label}
                </div>
                {stat.source && (
                  <div className="text-xs text-slate-400 mt-1">
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

  // Default dark mode styling
  return (
    <section 
      className={isEditing ? 'relative' : ''}
      style={{
        backgroundColor: 'var(--color-background-alt)',
        borderTopWidth: 'var(--border-width)',
        borderBottomWidth: 'var(--border-width)',
        borderColor: 'var(--color-border)',
        borderStyle: 'solid',
        padding: '64px 24px',
      }}
    >
      {isEditing && (
        <div className="absolute inset-0 border-2 border-cyan-500/50 rounded-lg pointer-events-none z-10" />
      )}
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
                className={`${typography.statValue} ${
                  isEditing ? "outline-dashed outline-2 outline-cyan-500/30 rounded px-2 inline-block" : ""
                }`}
                style={{ 
                  color: 'var(--color-primary)',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 'var(--font-weight-heading)',
                }}
                contentEditable={isEditing}
                suppressContentEditableWarning
                onBlur={(e) => handleStatBlur(i, 'value', e)}
              >
                {formatStatValue(stat.value)}
              </div>
              <div 
                className={`${typography.statLabel} ${
                  isEditing ? "outline-dashed outline-2 outline-cyan-500/30 rounded px-1" : ""
                }`}
                style={{ 
                  color: 'var(--color-text-primary)',
                  fontFamily: 'var(--font-body)',
                  fontWeight: 'var(--font-weight-body)',
                }}
                contentEditable={isEditing}
                suppressContentEditableWarning
                onBlur={(e) => handleStatBlur(i, 'label', e)}
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
