import { motion } from 'framer-motion';

interface MarketOpportunitySectionProps {
  tam: string;
  sam: string;
  som: string;
  marketGrowth?: string;
  competitiveAdvantage?: string;
  styles?: {
    primaryColor?: string;
    headingFont?: string;
    bodyFont?: string;
  };
}

export function MarketOpportunitySection({ 
  tam, 
  sam, 
  som, 
  marketGrowth,
  competitiveAdvantage,
  styles 
}: MarketOpportunitySectionProps) {
  const markets = [
    { label: 'TAM', sublabel: 'Total Addressable Market', value: tam, size: 'lg' },
    { label: 'SAM', sublabel: 'Serviceable Addressable Market', value: sam, size: 'md' },
    { label: 'SOM', sublabel: 'Serviceable Obtainable Market', value: som, size: 'sm' },
  ];

  return (
    <section className="py-20 px-6 bg-slate-900">
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
            Market Opportunity
          </h2>
          {marketGrowth && (
            <p className="text-slate-400 max-w-2xl mx-auto">{marketGrowth}</p>
          )}
        </motion.div>

        {/* TAM/SAM/SOM Visualization */}
        <div className="flex flex-col items-center gap-4 mb-16">
          {markets.map((market, index) => {
            const widths = { lg: 'w-full max-w-2xl', md: 'w-full max-w-xl', sm: 'w-full max-w-md' };
            const heights = { lg: 'py-8', md: 'py-6', sm: 'py-5' };
            
            return (
              <motion.div
                key={market.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className={`${widths[market.size as keyof typeof widths]} ${heights[market.size as keyof typeof heights]} rounded-xl text-center relative overflow-hidden`}
                style={{
                  background: `linear-gradient(135deg, ${styles?.primaryColor || '#0891b2'}${30 - index * 8}, ${styles?.primaryColor || '#0891b2'}${15 - index * 4})`,
                  borderColor: `${styles?.primaryColor || '#0891b2'}${40 - index * 10}`,
                  borderWidth: '1px',
                }}
              >
                <div className="relative z-10">
                  <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                    {market.label}
                  </div>
                  <div 
                    className="text-2xl md:text-3xl font-bold text-white"
                    style={{ fontFamily: styles?.headingFont }}
                  >
                    {market.value}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">{market.sublabel}</div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Competitive Positioning */}
        {competitiveAdvantage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8"
          >
            <h3 
              className="text-xl font-semibold text-white mb-4 text-center"
              style={{ fontFamily: styles?.headingFont }}
            >
              Competitive Positioning
            </h3>
            <p 
              className="text-slate-300 text-center max-w-3xl mx-auto"
              style={{ fontFamily: styles?.bodyFont }}
            >
              {competitiveAdvantage}
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
}
