import { AlertCircle, CheckCircle, ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { EyebrowBadge } from "@/components/ui/PremiumCard";

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
      className={`relative overflow-hidden ${isEditing ? "relative" : ""}`}
      style={{
        backgroundColor: 'hsl(217, 33%, 6%)',
        padding: '120px 24px',
      }}
    >
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30" />
      <div 
        className="absolute top-1/2 left-0 w-[600px] h-[600px] rounded-full blur-[150px] -translate-y-1/2"
        style={{ backgroundColor: 'hsla(0, 70%, 50%, 0.05)' }}
      />
      <div 
        className="absolute top-1/2 right-0 w-[600px] h-[600px] rounded-full blur-[150px] -translate-y-1/2"
        style={{ backgroundColor: 'hsla(189, 95%, 43%, 0.05)' }}
      />

      {isEditing && (
        <div className="absolute inset-0 border-2 border-cyan-500/50 rounded-lg pointer-events-none z-10" />
      )}

      <div className="container mx-auto max-w-6xl relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <EyebrowBadge 
            icon={<Sparkles className="w-4 h-4" strokeWidth={1.5} />} 
            text="The Transformation" 
            className="mb-6"
          />
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
            Why This Matters
          </h2>
        </motion.div>
        
        {/* Split Cards */}
        <div className="grid md:grid-cols-2 gap-8 items-stretch">
          {/* Problem Card */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative overflow-hidden rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] p-8"
          >
            {/* Red accent gradient */}
            <div 
              className="absolute top-0 left-0 w-full h-1"
              style={{ background: 'linear-gradient(90deg, hsl(0, 70%, 50%), hsl(30, 90%, 55%))' }}
            />
            
            <div className="flex items-center gap-4 mb-6">
              <div 
                className="w-14 h-14 rounded-xl flex items-center justify-center"
                style={{ 
                  background: 'linear-gradient(135deg, hsl(0, 70%, 50%), hsl(30, 90%, 55%))',
                  boxShadow: '0 8px 20px -4px hsla(0, 70%, 50%, 0.4)',
                }}
              >
                <AlertCircle className="w-7 h-7 text-white" strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold" style={{ color: 'hsl(0, 70%, 60%)' }}>
                The Challenge
              </h3>
            </div>
            
            <p 
              className={`text-lg md:text-xl text-slate-300 leading-relaxed ${
                isEditing ? "outline-dashed outline-2 outline-cyan-500/30 rounded px-2" : ""
              }`}
              contentEditable={isEditing}
              suppressContentEditableWarning
              onBlur={(e) => handleBlur("problem", e)}
            >
              {content.problem}
            </p>
            
            {content.problemStat && (
              <div className="mt-6 p-5 rounded-xl bg-white/[0.03] border border-red-500/20">
                <div className="text-3xl md:text-4xl font-bold mb-2" style={{ color: 'hsl(0, 70%, 60%)' }}>
                  {content.problemStat.statistic}
                </div>
                <p className="text-sm md:text-base text-slate-400 mb-3">
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
            className="relative overflow-hidden rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] p-8"
          >
            {/* Cyan accent gradient */}
            <div 
              className="absolute top-0 left-0 w-full h-1"
              style={{ background: 'linear-gradient(90deg, hsl(189, 95%, 43%), hsl(270, 95%, 60%))' }}
            />
            
            <div className="flex items-center gap-4 mb-6">
              <div 
                className="w-14 h-14 rounded-xl flex items-center justify-center"
                style={{ 
                  background: 'linear-gradient(135deg, hsl(189, 95%, 43%), hsl(270, 95%, 60%))',
                  boxShadow: '0 8px 20px -4px hsla(189, 95%, 43%, 0.4)',
                }}
              >
                <CheckCircle className="w-7 h-7 text-white" strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-cyan-400">
                Our Solution
              </h3>
            </div>
            
            <p 
              className={`text-lg md:text-xl text-slate-300 leading-relaxed ${
                isEditing ? "outline-dashed outline-2 outline-cyan-500/30 rounded px-2" : ""
              }`}
              contentEditable={isEditing}
              suppressContentEditableWarning
              onBlur={(e) => handleBlur("solution", e)}
            >
              {content.solution}
            </p>
            
            {content.solutionStat && (
              <div className="mt-6 p-5 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
                <div className="text-3xl md:text-4xl font-bold mb-2 text-cyan-400">
                  {content.solutionStat.statistic}
                </div>
                <p className="text-sm md:text-base text-slate-400 mb-3">
                  {content.solutionStat.claim}
                </p>
                <cite className="text-xs text-slate-500 not-italic block">
                  Source: {content.solutionStat.fullCitation}
                </cite>
              </div>
            )}
          </motion.div>
        </div>

        {/* Transformation Arrow */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="hidden md:flex justify-center mt-12"
        >
          <div className="flex items-center gap-4 px-6 py-3 rounded-full bg-white/[0.03] backdrop-blur-sm border border-white/[0.08]">
            <span className="text-sm font-semibold text-slate-400">From Problem</span>
            <div className="w-12 h-[2px] bg-gradient-to-r from-red-500 to-cyan-400" />
            <ArrowRight className="w-5 h-5 text-cyan-400" strokeWidth={1.5} />
            <div className="w-12 h-[2px] bg-gradient-to-r from-cyan-400 to-purple-500" />
            <span className="text-sm font-semibold text-cyan-400">To Solution</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
