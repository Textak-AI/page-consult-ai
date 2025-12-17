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
    <section className={`py-20 md:py-28 px-4 bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800/50 dark:to-slate-900 ${isEditing ? "relative" : ""}`}>
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
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
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
            className="space-y-5 p-8 md:p-10 rounded-2xl border-2 border-red-200 dark:border-red-900/50 bg-gradient-to-br from-red-50 via-red-50/50 to-orange-50 dark:from-red-950/30 dark:via-red-950/20 dark:to-orange-950/20 shadow-lg shadow-red-100/50 dark:shadow-red-950/20"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg shadow-red-500/30">
                <AlertCircle className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-red-700 dark:text-red-400">The Challenge</h3>
            </div>
            <p 
              className={`text-lg md:text-xl text-slate-700 dark:text-slate-300 leading-relaxed ${
                isEditing ? "outline-dashed outline-2 outline-primary/30 rounded px-2" : ""
              }`}
              contentEditable={isEditing}
              suppressContentEditableWarning
              onBlur={(e) => handleBlur("problem", e)}
            >
              {content.problem}
            </p>
            
            {content.problemStat && (
              <div className="mt-6 p-5 bg-white/70 dark:bg-slate-800/50 border border-red-200 dark:border-red-900/30 rounded-xl">
                <div className="text-3xl md:text-4xl font-bold text-red-600 dark:text-red-400 mb-2">
                  {content.problemStat.statistic}
                </div>
                <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 mb-3">
                  {content.problemStat.claim}
                </p>
                <cite className="text-xs text-slate-500 not-italic block">
                  Source: {content.problemStat.fullCitation}
                </cite>
              </div>
            )}
          </motion.div>

          {/* Solution Card */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-5 p-8 md:p-10 rounded-2xl border-2 border-emerald-200 dark:border-emerald-900/50 bg-gradient-to-br from-emerald-50 via-emerald-50/50 to-teal-50 dark:from-emerald-950/30 dark:via-emerald-950/20 dark:to-teal-950/20 shadow-lg shadow-emerald-100/50 dark:shadow-emerald-950/20"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <CheckCircle className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-emerald-700 dark:text-emerald-400">Our Solution</h3>
            </div>
            <p 
              className={`text-lg md:text-xl text-slate-700 dark:text-slate-300 leading-relaxed ${
                isEditing ? "outline-dashed outline-2 outline-primary/30 rounded px-2" : ""
              }`}
              contentEditable={isEditing}
              suppressContentEditableWarning
              onBlur={(e) => handleBlur("solution", e)}
            >
              {content.solution}
            </p>
            
            {content.solutionStat && (
              <div className="mt-6 p-5 bg-white/70 dark:bg-slate-800/50 border border-emerald-200 dark:border-emerald-900/30 rounded-xl">
                <div className="text-3xl md:text-4xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
                  {content.solutionStat.statistic}
                </div>
                <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 mb-3">
                  {content.solutionStat.claim}
                </p>
                <cite className="text-xs text-slate-500 not-italic block">
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
          <div className="flex items-center gap-3 text-slate-400 bg-slate-100 dark:bg-slate-800/50 px-6 py-3 rounded-full">
            <span className="text-sm font-semibold">From Problem</span>
            <ArrowRight className="w-5 h-5" />
            <span className="text-sm font-semibold">To Solution</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
