import { motion } from "framer-motion";
import { getTypography } from "@/lib/typographyScale";

interface Step {
  number: number;
  title: string;
  description: string;
}

interface HowItWorksSectionProps {
  content: {
    title?: string;
    subtitle?: string;
    steps: Step[];
    industryVariant?: string;
  };
  onUpdate?: (content: any) => void;
}

export function HowItWorksSection({ content }: HowItWorksSectionProps) {
  const { title = "How It Works", subtitle = "Your path to results", steps } = content;
  const isConsulting = content.industryVariant === 'consulting';
  const typography = getTypography(content.industryVariant);
  
  console.log('🎨 [HowItWorksSection] industryVariant:', content.industryVariant, 'isConsulting:', isConsulting);

  // Don't render if no steps
  if (!steps || steps.length === 0) {
    return null;
  }

  if (isConsulting) {
    // Consulting layout: White background, prominent step circles, connector line
    return (
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-1 bg-purple-100 text-purple-800 text-sm font-semibold rounded-full mb-4">
              YOUR JOURNEY
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Our Process
            </h2>
            <p className="text-lg text-slate-600">
              A collaborative approach to your success
            </p>
          </motion.div>

          {/* Steps */}
          <div className="relative">
            {/* Connector Line (desktop only) */}
            <div className="hidden md:block absolute top-10 left-[10%] right-[10%] h-0.5 bg-slate-200" />
            
            <div className={`grid gap-8 md:gap-6 ${
              steps.length === 2 ? 'md:grid-cols-2' :
              steps.length === 3 ? 'md:grid-cols-3' :
              steps.length === 4 ? 'md:grid-cols-4' :
              'md:grid-cols-4'
            }`}>
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15, duration: 0.5 }}
                  className="relative text-center"
                >
                  {/* Step Number */}
                  <div className="w-20 h-20 rounded-full bg-slate-900 text-white text-2xl font-bold flex items-center justify-center mx-auto mb-6 relative z-10">
                    {step.number}
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {step.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Default dark mode layout
  return (
    <section 
      style={{ 
        backgroundColor: 'var(--color-surface)',
        padding: '96px 24px',
      }}
    >
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16 md:mb-20 mx-auto max-w-3xl"
        >
          <h2 
            className="text-3xl sm:text-4xl md:text-5xl mb-5"
            style={{ 
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-heading)',
              fontWeight: 'var(--font-weight-heading)',
              lineHeight: 'var(--line-height-heading)',
              letterSpacing: 'var(--letter-spacing-heading)',
            }}
          >
            {title}
          </h2>
          <p 
            className="text-lg md:text-xl"
            style={{ 
              color: 'var(--color-text-secondary)',
              fontFamily: 'var(--font-body)',
              lineHeight: 'var(--line-height-body)',
            }}
          >
            {subtitle}
          </p>
        </motion.div>

        <div className="relative">
          {/* Connection line (desktop only) */}
          <div 
            className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 transform -translate-y-1/2 z-0"
            style={{
              background: 'linear-gradient(to right, transparent, var(--color-primary), transparent)',
              opacity: 0.3,
            }}
          />

          <div className={`grid relative z-10 ${
            steps.length === 3 ? 'md:grid-cols-3' : 
            steps.length === 4 ? 'md:grid-cols-4' : 
            steps.length === 2 ? 'md:grid-cols-2' : 
            'md:grid-cols-3'
          }`} style={{ gap: 'var(--spacing-card-gap)' }}>
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.5 }}
                className="relative"
              >
                <div 
                  className="h-full flex flex-col"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                    borderWidth: 'var(--border-width)',
                    borderStyle: 'solid',
                    borderRadius: 'var(--radius-medium)',
                    padding: 'var(--spacing-card-padding)',
                    boxShadow: 'var(--shadow-small)',
                  }}
                >
                  {/* Step number badge */}
                  <div 
                    className="w-14 h-14 rounded-full flex items-center justify-center mb-6 mx-auto md:mx-0"
                    style={{
                      background: `linear-gradient(135deg, var(--color-primary), var(--color-primary-hover))`,
                      boxShadow: 'var(--shadow-medium)',
                    }}
                  >
                    <span 
                      className="text-xl"
                      style={{ 
                        color: 'var(--color-text-inverse)',
                        fontFamily: 'var(--font-heading)',
                        fontWeight: 'var(--font-weight-heading)',
                      }}
                    >
                      {step.number}
                    </span>
                  </div>

                  <h3 
                    className="text-xl mb-3 text-center md:text-left"
                    style={{ 
                      color: 'var(--color-text-primary)',
                      fontFamily: 'var(--font-heading)',
                      fontWeight: 'var(--font-weight-heading)',
                    }}
                  >
                    {step.title}
                  </h3>

                  <p 
                    className="text-center md:text-left flex-grow"
                    style={{ 
                      color: 'var(--color-text-secondary)',
                      fontFamily: 'var(--font-body)',
                      lineHeight: 'var(--line-height-body)',
                    }}
                  >
                    {step.description}
                  </p>
                </div>

                {/* Arrow connector for mobile */}
                {index < steps.length - 1 && (
                  <div className="md:hidden flex justify-center my-4">
                    <div 
                      className="w-0.5 h-8"
                      style={{
                        background: 'linear-gradient(to bottom, var(--color-primary), transparent)',
                        opacity: 0.4,
                      }}
                    />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
