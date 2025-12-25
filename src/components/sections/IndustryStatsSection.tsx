import { motion } from 'framer-motion';
import { TrendingUp, ExternalLink } from 'lucide-react';
import { getIndustryStatistics, IndustryStat } from '@/lib/industryStatistics';

interface IndustryStatsSectionProps {
  industry?: string;
  customStats?: IndustryStat[];
  title?: string;
  subtitle?: string;
}

export function IndustryStatsSection({ 
  industry = 'saas', 
  customStats,
  title = "Why This Matters",
  subtitle = "Industry Insights"
}: IndustryStatsSectionProps) {
  const stats = customStats || getIndustryStatistics(industry, 3);

  if (!stats || stats.length === 0) return null;

  return (
    <section className="py-16 bg-slate-800">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-cyan-400 font-medium mb-3">
            <TrendingUp className="w-4 h-4" />
            {subtitle}
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            {title}
          </h2>
        </motion.div>
        
        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {stats.map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center p-8 rounded-xl bg-slate-700/30 border border-slate-700 hover:border-slate-600 transition-colors group"
            >
              {/* Stat Value */}
              <div className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-3">
                {stat.value}
              </div>
              
              {/* Stat Label */}
              <p className="text-slate-300 text-sm leading-relaxed mb-4">
                {stat.label}
              </p>
              
              {/* Source Citation */}
              <cite className="flex items-center justify-center gap-1 text-xs text-slate-500 not-italic group-hover:text-slate-400 transition-colors">
                <span>— {stat.source}</span>
                {stat.sourceUrl && (
                  <a 
                    href={stat.sourceUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-cyan-400"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </cite>
            </motion.div>
          ))}
        </div>
        
        {/* Disclaimer */}
        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center text-xs text-slate-500 mt-10"
        >
          Statistics compiled from industry research. Individual results may vary.
        </motion.p>
      </div>
    </section>
  );
}
