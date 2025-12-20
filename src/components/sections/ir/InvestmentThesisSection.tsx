import { motion } from 'framer-motion';
import { TrendingUp, Zap, Shield, Target } from 'lucide-react';

interface InvestmentThesisSectionProps {
  thesis: string;
  reasons: Array<{ title: string; description: string }>;
  whyNow?: string;
  styles?: {
    primaryColor?: string;
    headingFont?: string;
    bodyFont?: string;
  };
}

export function InvestmentThesisSection({ 
  thesis, 
  reasons, 
  whyNow,
  styles 
}: InvestmentThesisSectionProps) {
  const icons = [TrendingUp, Zap, Shield, Target];

  return (
    <section className="py-20 px-6 bg-slate-900">
      <div className="max-w-6xl mx-auto">
        {/* Investment Thesis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 
            className="text-3xl md:text-4xl font-bold text-white mb-6"
            style={{ fontFamily: styles?.headingFont }}
          >
            Investment Thesis
          </h2>
          <p 
            className="text-xl md:text-2xl text-cyan-400 max-w-4xl mx-auto"
            style={{ fontFamily: styles?.bodyFont }}
          >
            {thesis}
          </p>
        </motion.div>

        {/* Key Reasons to Invest */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {reasons.slice(0, 4).map((reason, index) => {
            const Icon = icons[index % icons.length];
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-slate-800/50 border border-slate-700 rounded-xl p-6"
              >
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${styles?.primaryColor || '#0891b2'}20` }}
                >
                  <Icon 
                    className="w-6 h-6"
                    style={{ color: styles?.primaryColor || '#0891b2' }}
                  />
                </div>
                <h3 
                  className="text-lg font-semibold text-white mb-2"
                  style={{ fontFamily: styles?.headingFont }}
                >
                  {reason.title}
                </h3>
                <p 
                  className="text-slate-400 text-sm"
                  style={{ fontFamily: styles?.bodyFont }}
                >
                  {reason.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Why Now */}
        {whyNow && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-2xl p-8 text-center"
          >
            <h3 
              className="text-xl font-semibold text-white mb-4"
              style={{ fontFamily: styles?.headingFont }}
            >
              Why Now?
            </h3>
            <p 
              className="text-slate-300 max-w-3xl mx-auto"
              style={{ fontFamily: styles?.bodyFont }}
            >
              {whyNow}
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
}
