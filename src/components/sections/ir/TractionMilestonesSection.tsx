import { motion } from 'framer-motion';
import { CheckCircle2, Calendar, ArrowRight } from 'lucide-react';

interface Milestone {
  title: string;
  date: string;
  description?: string;
  completed?: boolean;
}

interface Catalyst {
  title: string;
  expectedDate: string;
}

interface TractionMilestonesSectionProps {
  milestones: Milestone[];
  catalysts: Catalyst[];
  metrics?: Array<{ label: string; value: string }>;
  styles?: {
    primaryColor?: string;
    headingFont?: string;
    bodyFont?: string;
  };
}

export function TractionMilestonesSection({ 
  milestones, 
  catalysts, 
  metrics,
  styles 
}: TractionMilestonesSectionProps) {
  return (
    <section className="py-20 px-6 bg-slate-950">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 
            className="text-3xl md:text-4xl font-bold text-white mb-4"
            style={{ fontFamily: styles?.headingFont }}
          >
            Traction & Milestones
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Our journey of achievement and what's ahead
          </p>
        </motion.div>

        {/* Key Metrics */}
        {metrics && metrics.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
            {metrics.map((metric, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center"
              >
                <div 
                  className="text-3xl font-bold mb-2"
                  style={{ color: styles?.primaryColor || '#0891b2' }}
                >
                  {metric.value}
                </div>
                <div className="text-slate-400 text-sm">{metric.label}</div>
              </motion.div>
            ))}
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Achievements Timeline */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h3 
              className="text-xl font-semibold text-white mb-6 flex items-center gap-2"
              style={{ fontFamily: styles?.headingFont }}
            >
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              Achievements
            </h3>
            <div className="space-y-4">
              {milestones.map((milestone, index) => (
                <div 
                  key={index}
                  className="flex gap-4 items-start bg-slate-800/30 rounded-lg p-4 border border-slate-700/50"
                >
                  <div className="w-3 h-3 rounded-full bg-green-400 mt-1.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium text-white">{milestone.title}</h4>
                      <span className="text-sm text-slate-500">{milestone.date}</span>
                    </div>
                    {milestone.description && (
                      <p className="text-sm text-slate-400 mt-1">{milestone.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Upcoming Catalysts */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h3 
              className="text-xl font-semibold text-white mb-6 flex items-center gap-2"
              style={{ fontFamily: styles?.headingFont }}
            >
              <Calendar className="w-5 h-5 text-cyan-400" />
              Upcoming Catalysts
            </h3>
            <div className="space-y-4">
              {catalysts.map((catalyst, index) => (
                <div 
                  key={index}
                  className="flex gap-4 items-center bg-gradient-to-r from-cyan-500/10 to-transparent rounded-lg p-4 border border-cyan-500/20"
                >
                  <ArrowRight 
                    className="w-5 h-5 flex-shrink-0"
                    style={{ color: styles?.primaryColor || '#0891b2' }}
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-white">{catalyst.title}</h4>
                  </div>
                  <span 
                    className="text-sm font-medium px-3 py-1 rounded-full"
                    style={{ 
                      backgroundColor: `${styles?.primaryColor || '#0891b2'}20`,
                      color: styles?.primaryColor || '#0891b2'
                    }}
                  >
                    {catalyst.expectedDate}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
