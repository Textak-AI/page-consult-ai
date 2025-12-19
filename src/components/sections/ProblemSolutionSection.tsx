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
      className={`${isEditing ? "relative" : ""}`}
      style={{
        background: 'linear-gradient(to bottom, var(--color-background-alt), var(--color-surface), var(--color-background-alt))',
        padding: 'var(--spacing-section-y) var(--spacing-section-x)',
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
            className="text-3xl sm:text-4xl md:text-5xl"
            style={{ 
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-heading)',
              fontWeight: 'var(--font-weight-heading)',
              lineHeight: 'var(--line-height-heading)',
              letterSpacing: 'var(--letter-spacing-heading)',
            }}
          >
            Why This Matters
          </h2>
        </motion.div>
        
        <div className="grid md:grid-cols-2 items-stretch" style={{ gap: 'var(--spacing-card-gap)' }}>
          {/* Problem Card */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-error)',
              borderWidth: '2px',
              borderStyle: 'solid',
              borderRadius: 'var(--radius-large)',
              padding: 'var(--spacing-card-padding)',
              boxShadow: 'var(--shadow-medium)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--spacing-element-gap)',
            }}
          >
            <div className="flex items-center gap-4">
              <div 
                className="w-14 h-14 flex items-center justify-center"
                style={{ 
                  background: 'linear-gradient(135deg, var(--color-error), #f97316)',
                  borderRadius: 'var(--radius-medium)',
                  boxShadow: 'var(--shadow-medium)',
                }}
              >
                <AlertCircle className="w-7 h-7 text-white" strokeWidth={1.5} />
              </div>
              <h3 
                className="text-2xl md:text-3xl"
                style={{ 
                  color: 'var(--color-error)',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 'var(--font-weight-heading)',
                }}
              >
                The Challenge
              </h3>
            </div>
            <p 
              className={`text-lg md:text-xl ${
                isEditing ? "outline-dashed outline-2 outline-primary/30 rounded px-2" : ""
              }`}
              contentEditable={isEditing}
              suppressContentEditableWarning
              onBlur={(e) => handleBlur("problem", e)}
              style={{ 
                color: 'var(--color-text-secondary)',
                fontFamily: 'var(--font-body)',
                lineHeight: 'var(--line-height-body)',
              }}
            >
              {content.problem}
            </p>
            
            {content.problemStat && (
              <div 
                className="mt-2"
                style={{
                  backgroundColor: 'var(--color-background-alt)',
                  borderColor: 'var(--color-error)',
                  borderWidth: 'var(--border-width)',
                  borderStyle: 'solid',
                  borderRadius: 'var(--radius-medium)',
                  padding: 'var(--spacing-card-padding)',
                }}
              >
                <div 
                  className="text-3xl md:text-4xl mb-2"
                  style={{ 
                    color: 'var(--color-error)',
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 'var(--font-weight-heading)',
                  }}
                >
                  {content.problemStat.statistic}
                </div>
                <p 
                  className="text-sm md:text-base mb-3"
                  style={{ 
                    color: 'var(--color-text-secondary)',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  {content.problemStat.claim}
                </p>
                <cite 
                  className="text-xs not-italic block"
                  style={{ color: 'var(--color-text-muted)' }}
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
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-success)',
              borderWidth: '2px',
              borderStyle: 'solid',
              borderRadius: 'var(--radius-large)',
              padding: 'var(--spacing-card-padding)',
              boxShadow: 'var(--shadow-medium)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--spacing-element-gap)',
            }}
          >
            <div className="flex items-center gap-4">
              <div 
                className="w-14 h-14 flex items-center justify-center"
                style={{ 
                  background: 'linear-gradient(135deg, var(--color-success), var(--color-primary))',
                  borderRadius: 'var(--radius-medium)',
                  boxShadow: 'var(--shadow-medium)',
                }}
              >
                <CheckCircle className="w-7 h-7 text-white" strokeWidth={1.5} />
              </div>
              <h3 
                className="text-2xl md:text-3xl"
                style={{ 
                  color: 'var(--color-success)',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 'var(--font-weight-heading)',
                }}
              >
                Our Solution
              </h3>
            </div>
            <p 
              className={`text-lg md:text-xl ${
                isEditing ? "outline-dashed outline-2 outline-primary/30 rounded px-2" : ""
              }`}
              contentEditable={isEditing}
              suppressContentEditableWarning
              onBlur={(e) => handleBlur("solution", e)}
              style={{ 
                color: 'var(--color-text-secondary)',
                fontFamily: 'var(--font-body)',
                lineHeight: 'var(--line-height-body)',
              }}
            >
              {content.solution}
            </p>
            
            {content.solutionStat && (
              <div 
                className="mt-2"
                style={{
                  backgroundColor: 'var(--color-primary-muted)',
                  borderColor: 'var(--color-success)',
                  borderWidth: 'var(--border-width)',
                  borderStyle: 'solid',
                  borderRadius: 'var(--radius-medium)',
                  padding: 'var(--spacing-card-padding)',
                }}
              >
                <div 
                  className="text-3xl md:text-4xl mb-2"
                  style={{ 
                    color: 'var(--color-success)',
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 'var(--font-weight-heading)',
                  }}
                >
                  {content.solutionStat.statistic}
                </div>
                <p 
                  className="text-sm md:text-base mb-3"
                  style={{ 
                    color: 'var(--color-text-secondary)',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  {content.solutionStat.claim}
                </p>
                <cite 
                  className="text-xs not-italic block"
                  style={{ color: 'var(--color-text-muted)' }}
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
            className="flex items-center gap-3 px-6 py-3"
            style={{
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text-muted)',
              borderRadius: 'var(--radius-large)',
              fontFamily: 'var(--font-body)',
            }}
          >
            <span className="text-sm font-semibold">From Problem</span>
            <ArrowRight className="w-5 h-5" strokeWidth={1.5} />
            <span className="text-sm font-semibold">To Solution</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
