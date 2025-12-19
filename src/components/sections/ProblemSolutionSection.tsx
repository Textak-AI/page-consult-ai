import { AlertCircle, CheckCircle, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface CitedStat {
  statistic: string;
  claim: string;
  source: string;
  year: number;
  fullCitation: string;
}

interface ProblemSolutionSectionProps {
  content: {
    problem: string;
    solution: string;
    problemStat?: CitedStat;
    solutionStat?: CitedStat;
  };
  onUpdate: (content: any) => void;
  isEditing?: boolean;
}

export function ProblemSolutionSection({ content, onUpdate, isEditing }: ProblemSolutionSectionProps) {
  const handleBlur = (field: string, e: React.FocusEvent<HTMLElement>) => {
    onUpdate({
      ...content,
      [field]: e.currentTarget.textContent || content[field as keyof typeof content],
    });
  };

  return (
    <section 
      className={`py-20 md:py-28 px-4 ${isEditing ? "relative" : ""}`}
      style={{
        background: 'linear-gradient(to bottom, var(--color-background-alt, #f8fafc), var(--color-surface, white), var(--color-background-alt, #f8fafc))',
      }}
    >
      {isEditing && (
        <div className="absolute inset-0 border-2 border-primary/50 rounded-lg pointer-events-none z-10" />
      )}
      <div className="container mx-auto max-w-6xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 
            className="text-3xl sm:text-4xl md:text-5xl font-bold"
            style={{ color: 'var(--color-text-primary, #0f172a)' }}
          >
            Why This Matters
          </h2>
        </motion.div>
        
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-stretch">
          {/* Problem Card */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-5 p-8 md:p-10 rounded-2xl border-2 shadow-lg"
            style={{
              backgroundColor: 'var(--color-surface, white)',
              borderColor: 'var(--color-error, #ef4444)',
              borderWidth: '2px',
              borderRadius: 'var(--radius-large, 1rem)',
            }}
          >
            <div className="flex items-center gap-4">
              <div 
                className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg"
                style={{ 
                  background: 'linear-gradient(135deg, var(--color-error, #ef4444), #f97316)',
                }}
              >
                <AlertCircle className="w-7 h-7 text-white" />
              </div>
              <h3 
                className="text-2xl md:text-3xl font-bold"
                style={{ color: 'var(--color-error, #dc2626)' }}
              >
                The Challenge
              </h3>
            </div>
            <p 
              className={`text-lg md:text-xl leading-relaxed ${
                isEditing ? "outline-dashed outline-2 outline-primary/30 rounded px-2" : ""
              }`}
              contentEditable={isEditing}
              suppressContentEditableWarning
              onBlur={(e) => handleBlur("problem", e)}
              style={{ color: 'var(--color-text-secondary, #475569)' }}
            >
              {content.problem}
            </p>
            
            {content.problemStat && (
              <div 
                className="mt-6 p-5 rounded-xl"
                style={{
                  backgroundColor: 'var(--color-background-alt, #fef2f2)',
                  borderColor: 'var(--color-error, #fecaca)',
                  borderWidth: '1px',
                }}
              >
                <div 
                  className="text-3xl md:text-4xl font-bold mb-2"
                  style={{ color: 'var(--color-error, #dc2626)' }}
                >
                  {content.problemStat.statistic}
                </div>
                <p 
                  className="text-sm md:text-base mb-3"
                  style={{ color: 'var(--color-text-secondary, #64748b)' }}
                >
                  {content.problemStat.claim}
                </p>
                <cite 
                  className="text-xs not-italic block"
                  style={{ color: 'var(--color-text-muted, #94a3b8)' }}
                >
                  Source: {content.problemStat.fullCitation}
                </cite>
              </div>
            )}
          </motion.div>

          {/* Solution Card - Use primary color from design system */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-5 p-8 md:p-10 rounded-2xl border-2 shadow-lg"
            style={{
              backgroundColor: 'var(--color-surface, white)',
              borderColor: 'var(--color-success, #22c55e)',
              borderWidth: '2px',
              borderRadius: 'var(--radius-large, 1rem)',
            }}
          >
            <div className="flex items-center gap-4">
              <div 
                className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg"
                style={{ 
                  background: 'linear-gradient(135deg, var(--color-success, #22c55e), var(--color-primary, #14b8a6))',
                }}
              >
                <CheckCircle className="w-7 h-7 text-white" />
              </div>
              <h3 
                className="text-2xl md:text-3xl font-bold"
                style={{ color: 'var(--color-success, #16a34a)' }}
              >
                Our Solution
              </h3>
            </div>
            <p 
              className={`text-lg md:text-xl leading-relaxed ${
                isEditing ? "outline-dashed outline-2 outline-primary/30 rounded px-2" : ""
              }`}
              contentEditable={isEditing}
              suppressContentEditableWarning
              onBlur={(e) => handleBlur("solution", e)}
              style={{ color: 'var(--color-text-secondary, #475569)' }}
            >
              {content.solution}
            </p>
            
            {content.solutionStat && (
              <div 
                className="mt-6 p-5 rounded-xl"
                style={{
                  backgroundColor: 'var(--color-primary-muted, #f0fdfa)',
                  borderColor: 'var(--color-success, #bbf7d0)',
                  borderWidth: '1px',
                }}
              >
                <div 
                  className="text-3xl md:text-4xl font-bold mb-2"
                  style={{ color: 'var(--color-success, #16a34a)' }}
                >
                  {content.solutionStat.statistic}
                </div>
                <p 
                  className="text-sm md:text-base mb-3"
                  style={{ color: 'var(--color-text-secondary, #64748b)' }}
                >
                  {content.solutionStat.claim}
                </p>
                <cite 
                  className="text-xs not-italic block"
                  style={{ color: 'var(--color-text-muted, #94a3b8)' }}
                >
                  Source: {content.solutionStat.fullCitation}
                </cite>
              </div>
            )}
          </motion.div>
        </div>

        {/* Arrow indicator */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="hidden md:flex justify-center mt-12"
        >
          <div 
            className="flex items-center gap-3 px-6 py-3 rounded-full"
            style={{
              backgroundColor: 'var(--color-surface, #f1f5f9)',
              color: 'var(--color-text-muted, #64748b)',
            }}
          >
            <span className="text-sm font-semibold">From Problem</span>
            <ArrowRight className="w-5 h-5" />
            <span className="text-sm font-semibold">To Solution</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
