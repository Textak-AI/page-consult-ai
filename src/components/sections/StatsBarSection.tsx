import { motion } from "framer-motion";

interface Statistic {
  value: string;
  label: string;
  source?: string;
}

interface StatsBarSectionProps {
  statistics: Statistic[];
}

export function StatsBarSection({ statistics }: StatsBarSectionProps) {
  if (!statistics || statistics.length === 0) return null;

  return (
    <section className="bg-slate-800/90 dark:bg-slate-900/90 py-10 border-y border-slate-700/50">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {statistics.slice(0, 3).map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="space-y-2"
            >
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-cyan-300 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-gray-300 font-medium">{stat.label}</div>
              {stat.source && (
                <div className="text-xs text-gray-500">
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
