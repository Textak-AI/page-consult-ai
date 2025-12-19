import { motion } from "framer-motion";

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
  };
  onUpdate?: (content: any) => void;
}

export function HowItWorksSection({ content }: HowItWorksSectionProps) {
  const { title = "How It Works", subtitle = "Your path to results", steps } = content;

  // Don't render if no steps
  if (!steps || steps.length === 0) {
    return null;
  }

  return (
    <section 
      className="py-20 md:py-28 px-4"
      style={{ backgroundColor: 'var(--color-surface, white)' }}
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
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-5"
            style={{ color: 'var(--color-text-primary, #0f172a)' }}
          >
            {title}
          </h2>
          <p 
            className="text-lg md:text-xl"
            style={{ color: 'var(--color-text-secondary, #475569)' }}
          >
            {subtitle}
          </p>
        </motion.div>

        <div className="relative">
          {/* Connection line (desktop only) */}
          <div 
            className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 transform -translate-y-1/2 z-0"
            style={{
              background: 'linear-gradient(to right, transparent, var(--color-primary, #06b6d4), transparent)',
              opacity: 0.3,
            }}
          />

          <div className={`grid gap-8 md:gap-6 relative z-10 ${
            steps.length === 3 ? 'md:grid-cols-3' : 
            steps.length === 4 ? 'md:grid-cols-4' : 
            steps.length === 2 ? 'md:grid-cols-2' : 
            'md:grid-cols-3'
          }`}>
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
                  className="rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col"
                  style={{
                    backgroundColor: 'var(--color-surface, white)',
                    borderColor: 'var(--color-border, #e2e8f0)',
                    borderWidth: '1px',
                  }}
                >
                  {/* Step number badge */}
                  <div 
                    className="w-14 h-14 rounded-full flex items-center justify-center mb-6 shadow-lg mx-auto md:mx-0"
                    style={{
                      background: `linear-gradient(135deg, var(--color-primary, #06b6d4), var(--color-primary-hover, #0891b2))`,
                      boxShadow: '0 8px 20px -8px var(--color-primary, rgba(6, 182, 212, 0.4))',
                    }}
                  >
                    <span 
                      className="text-xl font-bold"
                      style={{ color: 'var(--color-text-inverse, white)' }}
                    >
                      {step.number}
                    </span>
                  </div>

                  <h3 
                    className="text-xl font-bold mb-3 text-center md:text-left"
                    style={{ color: 'var(--color-text-primary, #0f172a)' }}
                  >
                    {step.title}
                  </h3>

                  <p 
                    className="leading-relaxed text-center md:text-left flex-grow"
                    style={{ color: 'var(--color-text-secondary, #475569)' }}
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
                        background: 'linear-gradient(to bottom, var(--color-primary, rgba(6, 182, 212, 0.4)), transparent)',
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
