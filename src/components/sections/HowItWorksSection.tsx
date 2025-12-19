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
    <section className="py-20 md:py-28 px-4 bg-white dark:bg-slate-900">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16 md:mb-20 mx-auto max-w-3xl"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-5 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            {title}
          </h2>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400">
            {subtitle}
          </p>
        </motion.div>

        <div className="relative">
          {/* Connection line (desktop only) */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500/20 via-cyan-500/40 to-cyan-500/20 transform -translate-y-1/2 z-0" />

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
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-slate-900/30 transition-all duration-300 h-full flex flex-col">
                  {/* Step number badge */}
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center mb-6 shadow-lg shadow-cyan-500/25 mx-auto md:mx-0">
                    <span className="text-xl font-bold text-white">{step.number}</span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 text-center md:text-left">
                    {step.title}
                  </h3>

                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-center md:text-left flex-grow">
                    {step.description}
                  </p>
                </div>

                {/* Arrow connector for mobile */}
                {index < steps.length - 1 && (
                  <div className="md:hidden flex justify-center my-4">
                    <div className="w-0.5 h-8 bg-gradient-to-b from-cyan-500/40 to-cyan-500/20" />
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
