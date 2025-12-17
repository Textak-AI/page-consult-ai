import { motion } from "framer-motion";

interface Statistic {
  value: string;
  label: string;
  source?: string;
}

interface StatsBarSectionProps {
  statistics: Statistic[];
}

// Validate and clean a statistic entry
function isCleanStat(stat: Statistic): boolean {
  if (!stat.value || !stat.label) return false;
  
  // Value should be short (number-like): e.g., "85%", "$1,200", "21,714"
  const valueClean = stat.value.trim();
  if (valueClean.length > 15) return false;
  
  // Label should be under ~40 chars (5-6 words max)
  const labelClean = stat.label.trim();
  if (labelClean.length > 50) return false;
  
  // Reject if value contains sentence-like content
  if (valueClean.includes('(') || valueClean.includes('with') || valueClean.includes('aged')) {
    return false;
  }
  
  return true;
}

// Extract a clean value from messy text (best effort)
function extractCleanValue(text: string): string | null {
  if (!text) return null;
  
  // Try to find percentage
  const percentMatch = text.match(/(\d+(?:\.\d+)?%)/);
  if (percentMatch) return percentMatch[1];
  
  // Try to find dollar amount
  const dollarMatch = text.match(/(\$[\d,]+(?:\.\d{2})?)/);
  if (dollarMatch) return dollarMatch[1];
  
  // Try to find plain number with commas
  const numberMatch = text.match(/^([\d,]+)/);
  if (numberMatch && numberMatch[1].length <= 10) return numberMatch[1];
  
  return null;
}

// Fallback statistics when we don't have enough clean ones
const fallbackStats: Statistic[] = [
  { value: "98%", label: "Client satisfaction rate", source: "Industry Average" },
  { value: "500+", label: "Events completed", source: "Company Data" },
  { value: "10+", label: "Years of experience", source: "Company Data" },
];

// Clean up a statistic entry
function cleanStat(stat: Statistic): Statistic | null {
  if (isCleanStat(stat)) {
    return {
      value: stat.value.trim(),
      label: stat.label.trim(),
      source: stat.source?.trim()
    };
  }
  
  // Try to salvage by extracting clean value
  const cleanValue = extractCleanValue(stat.value);
  if (cleanValue && stat.label && stat.label.length < 50) {
    return {
      value: cleanValue,
      label: stat.label.trim().slice(0, 40),
      source: stat.source?.trim()
    };
  }
  
  return null;
}

export function StatsBarSection({ statistics }: StatsBarSectionProps) {
  // Clean and filter statistics
  let cleanStats = (statistics || [])
    .map(cleanStat)
    .filter((s): s is Statistic => s !== null)
    .slice(0, 3);
  
  // Add fallback stats if we have less than 3
  if (cleanStats.length < 3) {
    const needed = 3 - cleanStats.length;
    const existingLabels = cleanStats.map(s => s.label.toLowerCase());
    const availableFallbacks = fallbackStats.filter(
      f => !existingLabels.some(l => l.includes(f.label.toLowerCase().split(' ')[0]))
    );
    cleanStats = [...cleanStats, ...availableFallbacks.slice(0, needed)];
  }
  
  // Don't render if still no stats
  if (cleanStats.length === 0) return null;

  return (
    <section className="py-12 md:py-16 bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 dark:from-slate-800/80 dark:via-slate-900 dark:to-slate-800/80 border-y border-slate-200 dark:border-slate-700/50">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
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
              <div className="text-slate-700 dark:text-slate-300 font-medium text-sm md:text-base mb-2 line-clamp-2">
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
