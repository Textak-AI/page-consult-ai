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
    <section className={`py-24 px-4 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 ${isEditing ? "relative" : ""}`}>
      {isEditing && (
        <div className="absolute inset-0 border-2 border-primary/50 rounded-lg pointer-events-none z-10" />
      )}
      <div className="container mx-auto max-w-6xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Why This Matters
          </h2>
        </motion.div>
        
        <div className="grid md:grid-cols-2 gap-8 items-stretch">
          {/* Problem Card */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-4 p-8 rounded-2xl border-2 border-red-200 dark:border-red-900/50 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/20"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-red-700 dark:text-red-400">The Challenge</h3>
            </div>
            <p 
              className={`text-lg text-slate-700 dark:text-slate-300 leading-relaxed ${
                isEditing ? "outline-dashed outline-2 outline-primary/30 rounded px-2" : ""
              }`}
              contentEditable={isEditing}
              suppressContentEditableWarning
              onBlur={(e) => handleBlur("problem", e)}
            >
              {content.problem}
            </p>
            
            {content.problemStat && (
              <div className="mt-6 p-4 bg-white/50 dark:bg-slate-800/50 border border-red-200 dark:border-red-900/30 rounded-xl">
                <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-1">
                  {content.problemStat.statistic}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
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
            className="space-y-4 p-8 rounded-2xl border-2 border-emerald-200 dark:border-emerald-900/50 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">Our Solution</h3>
            </div>
            <p 
              className={`text-lg text-slate-700 dark:text-slate-300 leading-relaxed ${
                isEditing ? "outline-dashed outline-2 outline-primary/30 rounded px-2" : ""
              }`}
              contentEditable={isEditing}
              suppressContentEditableWarning
              onBlur={(e) => handleBlur("solution", e)}
            >
              {content.solution}
            </p>
            
            {content.solutionStat && (
              <div className="mt-6 p-4 bg-white/50 dark:bg-slate-800/50 border border-emerald-200 dark:border-emerald-900/30 rounded-xl">
                <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                  {content.solutionStat.statistic}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
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
          className="hidden md:flex justify-center mt-8"
        >
          <div className="flex items-center gap-2 text-slate-400">
            <span className="text-sm font-medium">From Problem</span>
            <ArrowRight className="w-5 h-5" />
            <span className="text-sm font-medium">To Solution</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
