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

  return (
    <section 
      style={{ 
        backgroundColor: 'var(--color-surface)',
        padding: 'var(--spacing-section-y) var(--spacing-section-x)',
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
