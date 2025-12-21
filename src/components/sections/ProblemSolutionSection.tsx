import { AlertCircle, CheckCircle, ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { EyebrowBadge } from "@/components/ui/PremiumCard";
import { getTypography } from "@/lib/typographyScale";

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
    industryVariant?: string;
  };
  onUpdate: (content: any) => void;
  isEditing?: boolean;
}

export function ProblemSolutionSection({ content, onUpdate, isEditing }: ProblemSolutionSectionProps) {
  const isConsulting = content.industryVariant === 'consulting';
  const typography = getTypography(content.industryVariant);
  
  console.log('🎨 [ProblemSolutionSection] industryVariant:', content.industryVariant, 'isConsulting:', isConsulting);
  
  const handleBlur = (field: string, e: React.FocusEvent<HTMLElement>) => {
    onUpdate({
      ...content,
      [field]: e.currentTarget.textContent || content[field as keyof typeof content],
    });
  };

  // Light mode styles for consulting
  const sectionBg = isConsulting ? 'hsl(40, 30%, 97%)' : 'hsl(217, 33%, 6%)';
  const cardBg = isConsulting ? 'white' : 'hsla(0, 0%, 100%, 0.02)';
  const cardBorder = isConsulting ? 'hsl(40, 20%, 88%)' : 'hsla(0, 0%, 100%, 0.05)';
  const textPrimary = isConsulting ? 'hsl(217, 33%, 17%)' : 'hsl(210, 40%, 80%)';
  const textSecondary = isConsulting ? 'hsl(217, 20%, 40%)' : 'hsl(210, 20%, 60%)';
  const problemStatBg = isConsulting ? 'hsl(0, 60%, 97%)' : 'hsla(0, 0%, 100%, 0.03)';
  const solutionStatBg = isConsulting ? 'hsl(189, 60%, 97%)' : 'hsla(189, 95%, 43%, 0.05)';

  return (
    <section 
      className={`relative overflow-hidden ${isEditing ? "relative" : ""}`}
      style={{
        backgroundColor: sectionBg,
        padding: '120px 24px',
      }}
    >
      {/* Background Elements - only show in dark mode */}
      {!isConsulting && (
        <>
          <div className="absolute inset-0 bg-grid-pattern opacity-30" />
          <div 
            className="absolute top-1/2 left-0 w-[600px] h-[600px] rounded-full blur-[150px] -translate-y-1/2"
            style={{ backgroundColor: 'hsla(0, 70%, 50%, 0.05)' }}
          />
          <div 
            className="absolute top-1/2 right-0 w-[600px] h-[600px] rounded-full blur-[150px] -translate-y-1/2"
            style={{ backgroundColor: 'hsla(189, 95%, 43%, 0.05)' }}
          />
        </>
      )}

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
          <h2 
            className={typography.sectionTitle}
            style={{ color: textPrimary }}
          >
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
            className="relative overflow-hidden rounded-2xl p-8"
            style={{ 
              backgroundColor: cardBg, 
              border: `1px solid ${cardBorder}`,
              boxShadow: isConsulting ? '0 4px 20px -4px hsla(0, 0%, 0%, 0.08)' : 'none',
            }}
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
              <h3 className={typography.cardTitle} style={{ color: 'hsl(0, 70%, 50%)' }}>
                The Challenge
              </h3>
            </div>
            
            <p 
              className={`${typography.bodyLarge} ${
                isEditing ? "outline-dashed outline-2 outline-cyan-500/30 rounded px-2" : ""
              }`}
              style={{ color: textSecondary }}
              contentEditable={isEditing}
              suppressContentEditableWarning
              onBlur={(e) => handleBlur("problem", e)}
            >
              {content.problem}
            </p>
            
            {content.problemStat && (
              <div 
                className="mt-6 p-5 rounded-xl"
                style={{ 
                  backgroundColor: problemStatBg, 
                  border: '1px solid hsla(0, 70%, 50%, 0.2)' 
                }}
              >
                <div className={`${typography.statValue} mb-2`} style={{ color: 'hsl(0, 70%, 50%)' }}>
                  {content.problemStat.statistic}
                </div>
                <p className={typography.body} style={{ color: textSecondary }}>
                  {content.problemStat.claim}
                </p>
                <cite className={`${typography.citation} not-italic block mt-2`} style={{ color: textSecondary, opacity: 0.7 }}>
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
            className="relative overflow-hidden rounded-2xl p-8"
            style={{ 
              backgroundColor: cardBg, 
              border: `1px solid ${cardBorder}`,
              boxShadow: isConsulting ? '0 4px 20px -4px hsla(0, 0%, 0%, 0.08)' : 'none',
            }}
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
              <h3 className={typography.cardTitle} style={{ color: 'hsl(189, 95%, 35%)' }}>
                Our Solution
              </h3>
            </div>
            
            <p 
              className={`${typography.bodyLarge} ${
                isEditing ? "outline-dashed outline-2 outline-cyan-500/30 rounded px-2" : ""
              }`}
              style={{ color: textSecondary }}
              contentEditable={isEditing}
              suppressContentEditableWarning
              onBlur={(e) => handleBlur("solution", e)}
            >
              {content.solution}
            </p>
            
            {content.solutionStat && (
              <div 
                className="mt-6 p-5 rounded-xl"
                style={{ 
                  backgroundColor: solutionStatBg, 
                  border: '1px solid hsla(189, 95%, 43%, 0.2)' 
                }}
              >
                <div className={`${typography.statValue} mb-2`} style={{ color: 'hsl(189, 95%, 35%)' }}>
                  {content.solutionStat.statistic}
                </div>
                <p className={typography.body} style={{ color: textSecondary }}>
                  {content.solutionStat.claim}
                </p>
                <cite className={`${typography.citation} not-italic block mt-2`} style={{ color: textSecondary, opacity: 0.7 }}>
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
          <div 
            className="flex items-center gap-4 px-6 py-3 rounded-full backdrop-blur-sm"
            style={{ 
              backgroundColor: isConsulting ? 'white' : 'hsla(0, 0%, 100%, 0.03)',
              border: `1px solid ${isConsulting ? 'hsl(40, 20%, 88%)' : 'hsla(0, 0%, 100%, 0.08)'}`,
              boxShadow: isConsulting ? '0 2px 12px -2px hsla(0, 0%, 0%, 0.06)' : 'none',
            }}
          >
            <span className="text-sm font-semibold" style={{ color: textSecondary }}>From Problem</span>
            <div className="w-12 h-[2px] bg-gradient-to-r from-red-500 to-cyan-500" />
            <ArrowRight className="w-5 h-5" style={{ color: 'hsl(189, 95%, 35%)' }} strokeWidth={1.5} />
            <div className="w-12 h-[2px] bg-gradient-to-r from-cyan-500 to-purple-500" />
            <span className="text-sm font-semibold" style={{ color: 'hsl(189, 95%, 35%)' }}>To Solution</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
